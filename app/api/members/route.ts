import { createHash, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type MemberPayload = {
  membershipId: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  instagram: string;
  photoUrl: string;
};

function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

function cleanInstagram(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

function makeMembershipId(state: string, district: string) {
  const stateCode = state
    .trim()
    .slice(0, 2)
    .toUpperCase()
    .replace(/[^A-Z]/g, "X")
    .padEnd(2, "X");
  const districtCode = district
    .trim()
    .slice(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "X")
    .padEnd(3, "X");
  const random = randomUUID().replace(/[^0-9]/g, "").slice(0, 5).padEnd(5, "0");
  return `DSP-${stateCode}-${districtCode}-${random}`;
}

function readField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateForm(form: Omit<MemberPayload, "membershipId" | "photoUrl">, photo: File | null) {
  if (!form.name) return "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    return "Enter a valid email address.";
  }
  if (!/^[+()\-\s\d]{8,18}$/.test(form.phone)) {
    return "Enter a valid phone number.";
  }
  if (!form.state) return "Enter your state.";
  if (!form.district) return "Enter your district.";
  if (!/^@?[A-Za-z0-9._]{2,30}$/.test(form.instagram)) {
    return "Enter a valid Instagram handle.";
  }
  if (!photo) return "Upload your photo.";
  if (!IMAGE_TYPES.has(photo.type)) return "Upload a JPG, PNG, or WebP photo.";
  if (photo.size > MAX_PHOTO_BYTES) return "Photo must be 5MB or smaller.";
  return "";
}

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    forwarded ||
    "local-dev"
  );
}

function hashIp(ip: string, salt: string) {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseAdmin();

  if (!supabase) {
    return jsonError("Supabase server configuration is missing.", 503);
  }

  const formData = await request.formData();
  const photoValue = formData.get("photo");
  const photo = photoValue instanceof File ? photoValue : null;
  const memberInput = {
    name: readField(formData, "name"),
    email: readField(formData, "email"),
    phone: readField(formData, "phone"),
    state: readField(formData, "state"),
    district: readField(formData, "district"),
    instagram: readField(formData, "instagram"),
  };

  const validation = validateForm(memberInput, photo);
  if (validation) return jsonError(validation, 400);

  const ip = getClientIp(request);
  const salt = process.env.RATE_LIMIT_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const ipHash = hashIp(ip, salt);
  const rateLimit = await supabase.rpc("reserve_member_submission", {
    p_ip_hash: ipHash,
    p_window: "1 minute",
  });

  if (rateLimit.error) {
    return jsonError("Could not check the submission limit.", 500);
  }

  const reservation = Array.isArray(rateLimit.data) ? rateLimit.data[0] : rateLimit.data;

  if (!reservation?.allowed) {
    return jsonError("Only one membership submission is allowed per minute.", 429, {
      retryAfterSeconds: reservation?.retry_after_seconds || 60,
    });
  }

  const membershipId = makeMembershipId(memberInput.state, memberInput.district);
  const extension = photo?.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `members/${membershipId}/${randomUUID()}.${extension}`;

  try {
    const upload = await supabase.storage.from("member-photos").upload(path, photo as File, {
      contentType: photo?.type,
      upsert: false,
    });

    if (upload.error) throw upload.error;

    const photoUrl = supabase.storage.from("member-photos").getPublicUrl(upload.data.path).data
      .publicUrl;

    const record: MemberPayload = {
      membershipId,
      name: memberInput.name,
      email: memberInput.email,
      phone: memberInput.phone,
      state: memberInput.state,
      district: memberInput.district,
      instagram: cleanInstagram(memberInput.instagram),
      photoUrl,
    };

    const insert = await supabase.from("members").insert({
      membership_id: record.membershipId,
      name: record.name,
      email: record.email,
      phone: record.phone,
      state: record.state,
      district: record.district,
      instagram: record.instagram,
      photo_url: record.photoUrl,
    });

    if (insert.error) throw insert.error;

    return NextResponse.json({ member: record }, { status: 201 });
  } catch (error) {
    await supabase.from("member_submission_rate_limits").delete().eq("ip_hash", ipHash);

    const message =
      error instanceof Error
        ? error.message
        : "Could not save the membership. Check Supabase setup.";
    return jsonError(message, 500);
  }
}
