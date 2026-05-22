"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

type MemberRecord = {
  membershipId: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  instagram: string;
  photoUrl: string;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  instagram: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  state: "",
  district: "",
  instagram: "",
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DSP_LOGO_SRC = "/assets/dsp-logo.jpeg";

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
  const random = crypto.getRandomValues(new Uint32Array(1))[0] % 100000;
  return `DSP-${stateCode}-${districtCode}-${String(random).padStart(5, "0")}`;
}

function validateForm(form: FormState, photo: File | null) {
  if (!form.name.trim()) return "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return "Enter a valid email address.";
  }
  if (!/^[+()\-\s\d]{8,18}$/.test(form.phone.trim())) {
    return "Enter a valid phone number.";
  }
  if (!form.state.trim()) return "Enter your state.";
  if (!form.district.trim()) return "Enter your district.";
  if (!/^@?[A-Za-z0-9._]{2,30}$/.test(form.instagram.trim())) {
    return "Enter a valid Instagram handle.";
  }
  if (!photo) return "Upload your photo.";
  if (!IMAGE_TYPES.has(photo.type)) return "Upload a JPG, PNG, or WebP photo.";
  if (photo.size > MAX_PHOTO_BYTES) return "Photo must be 5MB or smaller.";
  return "";
}

function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the member photo."));
    image.src = src;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imageRatio = image.width / image.height;
  const boxRatio = width / height;
  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > boxRatio) {
    sourceWidth = image.height * boxRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / boxRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  family: string,
  weight = "900",
) {
  let size = startSize;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 4;
  } while (size >= 44);
  return size;
}

export default function JoinExperience() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [member, setMember] = useState<MemberRecord | null>(null);
  const [status, setStatus] = useState(
    "Fill the form to generate your official DSP membership card.",
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const previewMember = useMemo<MemberRecord>(
    () =>
      member || {
        membershipId: "DSP-XX-NEW-00001",
        name: form.name || "Your Name",
        email: form.email || "member@example.com",
        phone: form.phone || "+91 00000 00000",
        state: form.state || "State",
        district: form.district || "District",
        instagram: form.instagram ? cleanInstagram(form.instagram) : "@handle",
        photoUrl: photoPreview,
      },
    [form, member, photoPreview],
  );

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const onPhotoChange = (file: File | null) => {
    setPhoto(file);
    setError("");
    if (!file) {
      setPhotoPreview("");
      return;
    }
    if (!IMAGE_TYPES.has(file.type)) {
      setPhotoPreview("");
      setError("Upload a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoPreview("");
      setError("Photo must be 5MB or smaller.");
      return;
    }
    setPhotoPreview(URL.createObjectURL(file));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const validation = validateForm(form, photo);
    if (validation) {
      setError(validation);
      return;
    }

    const safePhoto = photo as File;
    setIsSubmitting(true);
    setStatus("Creating membership...");

    try {
      const payload = new FormData();
      payload.set("name", form.name.trim());
      payload.set("email", form.email.trim());
      payload.set("phone", form.phone.trim());
      payload.set("state", form.state.trim());
      payload.set("district", form.district.trim());
      payload.set("instagram", form.instagram.trim());
      payload.set("photo", safePhoto);

      const response = await fetch("/api/members", {
        method: "POST",
        body: payload,
      });
      const data = await response.json();

      if (!response.ok) {
        const retryAfter =
          response.status === 429 && data.retryAfterSeconds
            ? ` Try again in ${Math.ceil(Number(data.retryAfterSeconds) / 60)} minutes.`
            : "";
        throw new Error(`${data.error || "Could not save the membership."}${retryAfter}`);
      }

      const record = data.member as MemberRecord;

      setMember(record);
      setStatus(`Membership generated and saved: ${record.membershipId}`);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Could not save the membership. Check Supabase setup.";
      setError(message);
      setStatus("Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadCard = async () => {
    if (!previewMember.photoUrl) {
      setError("Upload a photo before downloading the JPG card.");
      return;
    }
    setIsDownloading(true);
    setError("");
    try {
      const [image, logo] = await Promise.all([
        loadCanvasImage(previewMember.photoUrl),
        loadCanvasImage(DSP_LOGO_SRC),
      ]);
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not prepare the card canvas.");

      const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
      gradient.addColorStop(0, "#83191b");
      gradient.addColorStop(0.52, "#3a0c10");
      gradient.addColorStop(1, "#120e0b");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1350);

      const glow = ctx.createRadialGradient(810, 160, 20, 810, 160, 390);
      glow.addColorStop(0, "rgba(255, 212, 59, 0.46)");
      glow.addColorStop(1, "rgba(255, 212, 59, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1080, 1350);

      ctx.fillStyle = "rgba(255, 243, 212, 0.07)";
      ctx.font = "400 330px Impact, Arial Black, sans-serif";
      ctx.fillText("DSP", 420, 860);

      ctx.fillStyle = "#fff3d4";
      ctx.font = "900 28px Arial, sans-serif";
      ctx.save();
      ctx.beginPath();
      ctx.arc(92, 58, 34, 0, Math.PI * 2);
      ctx.clip();
      drawCoverImage(ctx, logo, 58, 24, 68, 68);
      ctx.restore();
      ctx.strokeStyle = "#ffd43b";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(92, 58, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillText("DARU SAMAJ PARTY", 144, 72);
      ctx.fillStyle = "#c8ff43";
      ctx.textAlign = "right";
      ctx.fillText("FOUNDING MEMBER", 1016, 72);
      ctx.textAlign = "left";

      ctx.fillStyle = "#fff3d4";
      ctx.fillRect(64, 120, 952, 690);
      drawCoverImage(ctx, image, 78, 134, 924, 662);

      ctx.strokeStyle = "#15110d";
      ctx.lineWidth = 8;
      ctx.strokeRect(64, 120, 952, 690);

      ctx.fillStyle = "rgba(21, 17, 13, 0.72)";
      ctx.fillRect(78, 610, 924, 186);
      ctx.fillStyle = "#fff3d4";
      const nameSize = fitText(
        ctx,
        previewMember.name.toUpperCase(),
        884,
        84,
        "Impact, Arial Black, sans-serif",
        "400",
      );
      ctx.font = `400 ${nameSize}px Impact, Arial Black, sans-serif`;
      ctx.fillText(previewMember.name.toUpperCase(), 98, 688);
      const handleSize = fitText(
        ctx,
        previewMember.instagram.toUpperCase(),
        884,
        58,
        "Impact, Arial Black, sans-serif",
        "400",
      );
      ctx.font = `400 ${handleSize}px Impact, Arial Black, sans-serif`;
      ctx.fillText(previewMember.instagram.toUpperCase(), 98, 752);

      ctx.fillStyle = "#ffd43b";
      ctx.font = "900 22px Arial, sans-serif";
      ctx.fillText(previewMember.membershipId, 64, 860);

      ctx.strokeStyle = "rgba(255, 243, 212, 0.32)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(64, 900);
      ctx.lineTo(1016, 900);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 243, 212, 0.68)";
      ctx.font = "900 24px Arial, sans-serif";
      ctx.fillText("STATE", 64, 960);
      ctx.fillText("DISTRICT", 586, 960);

      ctx.fillStyle = "#fff3d4";
      const stateSize = fitText(ctx, previewMember.state, 420, 46, "Georgia, serif", "900");
      ctx.font = `900 ${stateSize}px Georgia, serif`;
      ctx.fillText(previewMember.state, 64, 1016);
      const districtSize = fitText(ctx, previewMember.district, 420, 46, "Georgia, serif", "900");
      ctx.font = `900 ${districtSize}px Georgia, serif`;
      ctx.fillText(previewMember.district, 586, 1016);

      ctx.fillStyle = "rgba(255, 243, 212, 0.72)";
      ctx.font = "900 22px Arial, sans-serif";
      ctx.fillText("SATIRICAL COMMUNITY MEMBERSHIP", 64, 1070);
      ctx.fillStyle = "#c8ff43";
      ctx.textAlign = "right";
      ctx.fillText("1080 x 1350 JPG", 1016, 1070);
      ctx.textAlign = "left";

      ctx.fillStyle = "#c8ff43";
      ctx.fillRect(64, 1180, 952, 48);
      ctx.fillStyle = "#15110d";
      ctx.font = "900 22px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("FOLLOW. POST. BUILD THE MOVEMENT.", 540, 1212);
      ctx.textAlign = "left";

      const dataUrl = canvas.toDataURL("image/jpeg", 0.96);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${previewMember.membershipId}-dsp-card.jpg`;
      link.click();
    } catch {
      setError("Could not export the JPG card. Try again after the photo loads.");
    } finally {
      setIsDownloading(false);
    }
  };

  const regenerateCard = () => {
    setMember((current) =>
      current
        ? {
            ...current,
            membershipId: makeMembershipId(current.state, current.district),
          }
        : null,
    );
  };

  return (
    <section className="join-section" id="join">
      <div className="join-copy">
        <div className="section-label">Join</div>
        <h2>Become a founding member and get your Instagram-ready card.</h2>
        <p>
          Submit your details, upload a clean photo, and generate a portrait JPG
          designed for a feed post.
        </p>
      </div>

      <div className="join-layout">
        <form className="member-form" onSubmit={submit} noValidate>
          <div className="form-grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                required
              />
            </label>
            <label>
              Email
              <input
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                required
              />
            </label>
            <label>
              Instagram handle
              <input
                value={form.instagram}
                onChange={(event) => updateField("instagram", event.target.value)}
                name="instagram"
                type="text"
                placeholder="@username"
                required
              />
            </label>
            <label>
              State
              <input
                value={form.state}
                onChange={(event) => updateField("state", event.target.value)}
                name="state"
                type="text"
                placeholder="Maharashtra"
                required
              />
            </label>
            <label>
              District
              <input
                value={form.district}
                onChange={(event) => updateField("district", event.target.value)}
                name="district"
                type="text"
                placeholder="Mumbai Suburban"
                required
              />
            </label>
          </div>

          <label className="photo-input">
            Photo
            <input
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => onPhotoChange(event.target.files?.[0] || null)}
              required
            />
            <span>JPG, PNG, or WebP. Maximum 5MB.</span>
          </label>

          <button className="button button-primary submit-button" disabled={isSubmitting}>
            {isSubmitting ? "Generating..." : "Generate Membership Card"}
          </button>
          <p className="form-status" aria-live="polite">
            {error || status}
          </p>
        </form>

        <div className="card-workbench">
          <div className="membership-card-shell" aria-label="Membership card preview">
            <div className="membership-card" ref={cardRef}>
              <div className="card-topline">
                <span className="card-brand">
                  <img src={DSP_LOGO_SRC} alt="" />
                  Daru Samaj Party
                </span>
                <strong>Founding Member</strong>
              </div>
              <div className="card-photo">
                {previewMember.photoUrl ? (
                  <img src={previewMember.photoUrl} alt="Uploaded member photo" />
                ) : (
                  <span>Upload Photo</span>
                )}
              </div>
              <div className="card-identity">
                <p>{previewMember.membershipId}</p>
                <h3>{previewMember.name}</h3>
                <span>{previewMember.instagram}</span>
              </div>
              <div className="card-location">
                <div>
                  <span>State</span>
                  <strong>{previewMember.state}</strong>
                </div>
                <div>
                  <span>District</span>
                  <strong>{previewMember.district}</strong>
                </div>
              </div>
              <div className="card-footer">
                <span>Satirical community membership</span>
                <strong>1080 x 1350 JPG</strong>
              </div>
            </div>
          </div>

          <div className="card-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={downloadCard}
              disabled={isDownloading}
            >
              {isDownloading ? "Preparing JPG..." : "Download JPG"}
            </button>
            <button
              className="button button-ghost-dark"
              type="button"
              onClick={regenerateCard}
              disabled={!member}
            >
              Regenerate Card
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
