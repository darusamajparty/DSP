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
const WHISKEY_BOTTLE_SRC = "/assets/whiskey-bottle.svg";
const DSP_WEBSITE_QR_SRC = "/assets/dsp-website-qr.svg";

function cleanInstagram(value: string) {
  return value.trim();
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
  if (!/^@[A-Za-z0-9._]{1,30}$/.test(form.instagram.trim())) {
    return "Enter a valid Instagram handle starting with @.";
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
  minSize = 44,
) {
  let size = startSize;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 4;
  } while (size >= minSize);
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
      const [image, logo, bottle, websiteQr] = await Promise.all([
        loadCanvasImage(previewMember.photoUrl),
        loadCanvasImage(DSP_LOGO_SRC),
        loadCanvasImage(WHISKEY_BOTTLE_SRC),
        loadCanvasImage(DSP_WEBSITE_QR_SRC),
      ]);
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not prepare the card canvas.");

      // ── BACKGROUND ─────────────────────────────────────────────────────
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
      gradient.addColorStop(0, "#83191b");
      gradient.addColorStop(0.52, "#3a0c10");
      gradient.addColorStop(1, "#120e0b");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1350);

      const glow = ctx.createRadialGradient(820, 180, 20, 820, 180, 440);
      glow.addColorStop(0, "rgba(255, 212, 59, 0.42)");
      glow.addColorStop(1, "rgba(255, 212, 59, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1080, 1350);

      // Watermark "DSP" ghost text
      ctx.fillStyle = "rgba(255, 243, 212, 0.065)";
      ctx.font = "400 320px Impact, Arial Black, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("DSP", 1054, 880);
      ctx.textAlign = "left";

      // ── BORDERS ────────────────────────────────────────────────────────
      ctx.strokeStyle = "#d7aa37";
      ctx.lineWidth = 5;
      ctx.strokeRect(34, 34, 1012, 1282);
      ctx.strokeStyle = "rgba(255, 212, 59, 0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(52, 52, 976, 1246);

      // ── HEADER ─────────────────────────────────────────────────────────
      // Logo centred at y=92 → top=46, bottom=138 — clear of borders, clear of content
      ctx.save();
      ctx.beginPath();
      ctx.arc(108, 92, 46, 0, Math.PI * 2);
      ctx.clip();
      drawCoverImage(ctx, logo, 62, 46, 92, 92);
      ctx.restore();
      ctx.strokeStyle = "#ffd43b";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(108, 92, 46, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#fff3d4";
      ctx.font = "900 28px Arial, sans-serif";
      ctx.fillText("DARU SAMAJ PARTY", 172, 100);
      ctx.fillStyle = "#c8ff43";
      ctx.textAlign = "right";
      ctx.fillText("FOUNDING MEMBER", 1026, 92);
      ctx.textAlign = "left";

      // Header divider — leaves 30px breathing room before content
      ctx.strokeStyle = "rgba(255, 212, 59, 0.68)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(172, 134);
      ctx.lineTo(920, 134);
      ctx.stroke();

      // ── LAYOUT CONSTANTS ───────────────────────────────────────────────
      //   CT   = content top Y  (header divider + 34px gap)
      //   CH   = content height (photo and info panel share identical value)
      //   Content bottom = CT + CH
      //   ID panel starts 20px below content bottom
      //   Footer starts 22px below ID panel bottom
      //   Footer runs to inner border (y=1298), leaving ~60px of quiet margin
      const CT = 168;   // content top Y
      const CH = 760;   // content height  → bottom = 928
      const PW = 440;   // photo frame width
      const IX = 60 + PW + 20;        // info panel left X  = 520
      const IW = 1080 - 60 - IX;      // info panel width   = 500
      const IPX = IX + 32;             // info text left X   = 552
      const IPR = IX + IW - 32;        // info text right X  = 988

      // ── PHOTO ──────────────────────────────────────────────────────────
      ctx.fillStyle = "#fff3d4";
      ctx.fillRect(60, CT, PW, CH);
      drawCoverImage(ctx, image, 76, CT + 16, PW - 32, CH - 32);

      // DSP logo watermark — very light, bottom-centre of photo
      ctx.save();
      ctx.globalAlpha = 0.13;
      const wmS = 100;
      ctx.drawImage(logo, 60 + PW / 2 - wmS / 2, CT + CH - wmS - 20, wmS, wmS);
      ctx.restore();

      ctx.strokeStyle = "#d7aa37";
      ctx.lineWidth = 8;
      ctx.strokeRect(60, CT, PW, CH);
      ctx.strokeStyle = "#15110d";
      ctx.lineWidth = 3;
      ctx.strokeRect(76, CT + 16, PW - 32, CH - 32);

      // ── INFO PANEL ─────────────────────────────────────────────────────
      ctx.fillStyle = "rgba(21, 17, 13, 0.66)";
      ctx.fillRect(IX, CT, IW, CH);

      // Thin gold divider helper
      const drawDiv = (y: number) => {
        ctx.strokeStyle = "rgba(255, 212, 59, 0.38)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(IPX, y);
        ctx.lineTo(IPR, y);
        ctx.stroke();
      };

      // Row spacing is derived so all 5 data rows + 4 dividers fill CH evenly:
      //   top-pad=80, row-gap=136 each (name→handle→state→district→status)
      //   dividers sit 28px below each row baseline

      // Name
      const nameSize = fitText(ctx, previewMember.name.toUpperCase(), IW - 64, 60, "Impact, Arial Black, sans-serif", "400", 22);
      ctx.fillStyle = "#fff3d4";
      ctx.font = `400 ${nameSize}px Impact, Arial Black, sans-serif`;
      ctx.fillText(previewMember.name.toUpperCase(), IPX, CT + 80);
      drawDiv(CT + 116);

      // Instagram handle
      const handleSize = fitText(ctx, previewMember.instagram.toUpperCase(), IW - 64, 48, "Impact, Arial Black, sans-serif", "400", 26);
      ctx.fillStyle = "#c8ff43";
      ctx.font = `400 ${handleSize}px Impact, Arial Black, sans-serif`;
      ctx.fillText(previewMember.instagram.toUpperCase(), IPX, CT + 206);
      drawDiv(CT + 244);

      // State
      ctx.fillStyle = "rgba(255, 243, 212, 0.62)";
      ctx.font = "900 22px Arial, sans-serif";
      ctx.fillText("STATE", IPX, CT + 306);
      const stateSize = fitText(ctx, previewMember.state.toUpperCase(), IW - 64, 50, "Arial, sans-serif", "900", 22);
      ctx.fillStyle = "#fff3d4";
      ctx.font = `900 ${stateSize}px Arial, sans-serif`;
      ctx.fillText(previewMember.state.toUpperCase(), IPX, CT + 368);
      drawDiv(CT + 408);

      // District
      ctx.fillStyle = "rgba(255, 243, 212, 0.62)";
      ctx.font = "900 22px Arial, sans-serif";
      ctx.fillText("DISTRICT", IPX, CT + 470);
      const districtSize = fitText(ctx, previewMember.district.toUpperCase(), IW - 64, 50, "Arial, sans-serif", "900", 22);
      ctx.fillStyle = "#fff3d4";
      ctx.font = `900 ${districtSize}px Arial, sans-serif`;
      ctx.fillText(previewMember.district.toUpperCase(), IPX, CT + 532);
      drawDiv(CT + 572);

      // Status
      ctx.fillStyle = "rgba(255, 243, 212, 0.62)";
      ctx.font = "900 22px Arial, sans-serif";
      ctx.fillText("STATUS", IPX, CT + 634);
      ctx.fillStyle = "#c8ff43";
      ctx.font = "900 44px Arial, sans-serif";
      ctx.fillText("ACTIVE", IPX, CT + 706);
      // CT + 706 = 874 → panel bottom = CT+CH = 928 → 54px quiet margin ✓

      // ── WHISKEY BOTTLE (drawn over info panel, top-right corner) ───────
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.translate(IX + IW - 50, CT + 124);
      ctx.rotate(0.08);
      ctx.drawImage(bottle, -26, -26, 52, 148);
      ctx.restore();

      // ── MEMBERSHIP ID PANEL ────────────────────────────────────────────
      //   IDY = CT + CH + 20  = 948
      //   IDH = 176
      //   ID bottom            = 1124
      const IDY = CT + CH + 20;        // = 948
      const IDH = 176;
      const QRS = 146;
      const QRX = 1080 - 60 - QRS - 14;  // = 860
      const QRY = IDY + (IDH - QRS) / 2; // vertically centred

      ctx.fillStyle = "#fff3d4";
      ctx.fillRect(60, IDY, 960, IDH);
      ctx.strokeStyle = "#d7aa37";
      ctx.lineWidth = 5;
      ctx.strokeRect(60, IDY, 960, IDH);

      const idCX = Math.round((60 + QRX) / 2);  // centre of left portion

      ctx.fillStyle = "#7b1719";
      ctx.font = "900 20px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("MEMBERSHIP ID", idCX, IDY + 34);

      const idBoxW = QRX - 92;
      ctx.fillStyle = "#7b1719";
      ctx.fillRect(76, IDY + 48, idBoxW, 78);

      const idSize = fitText(ctx, previewMember.membershipId, idBoxW - 20, 52, "Impact, Arial Black, sans-serif", "400");
      ctx.fillStyle = "#ffd43b";
      ctx.font = `400 ${idSize}px Impact, Arial Black, sans-serif`;
      ctx.fillText(previewMember.membershipId, idCX, IDY + 104);
      ctx.textAlign = "left";

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(QRX, QRY, QRS, QRS);
      ctx.drawImage(websiteQr, QRX + 6, QRY + 6, QRS - 12, QRS - 12);
      ctx.strokeStyle = "#d7aa37";
      ctx.lineWidth = 5;
      ctx.strokeRect(QRX, QRY, QRS, QRS);

      // ── FOOTER BAND ────────────────────────────────────────────────────
      //   FDY = IDY + IDH + 26  = 1150
      //   Inner border           = 1298
      //   Footer zone            = 148px → two text lines + closing stripe
      const FDY = IDY + IDH + 26;   // = 1150

      ctx.strokeStyle = "rgba(255, 212, 59, 0.66)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(84, FDY);
      ctx.lineTo(996, FDY);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 243, 212, 0.5)";
      ctx.font = "700 23px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("darusamajparty.info", 540, FDY + 50);

      ctx.fillStyle = "rgba(200, 255, 67, 0.68)";
      ctx.font = "900 21px Arial, sans-serif";
      ctx.fillText("#DARUSAMAJPARTY", 540, FDY + 94);

      // Closing decorative stripe
      ctx.strokeStyle = "rgba(255, 212, 59, 0.32)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(220, FDY + 126);
      ctx.lineTo(860, FDY + 126);
      ctx.stroke();

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
              <div className="card-premium-shell" aria-hidden="true" />
              <img className="card-whiskey-bottle" src={WHISKEY_BOTTLE_SRC} alt="" />
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
                <h3>{previewMember.name}</h3>
                <div className="card-identity-divider" aria-hidden="true" />
                <span>{previewMember.instagram}</span>
                <div className="card-location">
                  <div className="card-data-row">
                    <span>State</span>
                    <strong>{previewMember.state}</strong>
                  </div>
                  <div className="card-data-row">
                    <span>District</span>
                    <strong>{previewMember.district}</strong>
                  </div>
                  <div className="card-data-row">
                    <span>Status</span>
                    <strong style={{ color: "var(--green)" }}>Active</strong>
                  </div>
                </div>
              </div>
              <div className="card-footer" aria-hidden="true">
                <span>darusamajparty.online</span>
                <strong>#DARUSAMAJPARTY</strong>
              </div>
              <div className="card-id-panel">
                <div className="card-id-copy">
                  <span>Membership ID</span>
                  <strong>{previewMember.membershipId}</strong>
                </div>
                <a
                  className="card-qr-mark"
                  href="https://darusamajparty.info"
                  aria-label="Open Daru Samaj Party website"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={DSP_WEBSITE_QR_SRC} alt="" />
                </a>
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
