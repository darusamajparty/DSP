"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import type { Messages } from "../lib/i18n/messages";

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

type PreviewMember = Omit<MemberRecord, "membershipId">;
type SaveCardResult =
  | { kind: "downloaded" }
  | { kind: "preview"; url: string };

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
const MIN_FONT_SIZE = 8;
const DSP_LOGO_SRC = "/assets/dsp-logo.jpeg";
const WHISKEY_BOTTLE_SRC = "/assets/whiskey-bottle.svg";
const DSP_WEBSITE_QR_SRC = "/assets/dsp-website-qr.svg";

function cleanInstagram(value: string) {
  return value.trim();
}

function isInstagramInAppBrowser() {
  return /Instagram/i.test(navigator.userAgent);
}

function canvasToJpegBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Could not export the card image."));
      },
      "image/jpeg",
      0.96,
    );
  });
}

async function saveCardImage(canvas: HTMLCanvasElement, fileName: string): Promise<SaveCardResult> {
  const blob = await canvasToJpegBlob(canvas);
  const file = new File([blob], fileName, { type: "image/jpeg" });

  if (isInstagramInAppBrowser()) {
    if (
      typeof navigator.canShare === "function" &&
      typeof navigator.share === "function" &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          files: [file],
          title: "DSP Membership Card",
        });
        return { kind: "downloaded" };
      } catch {
        // Instagram webviews vary by OS/version. If sharing fails, keep the image in-page.
      }
    }

    return { kind: "preview", url: URL.createObjectURL(blob) };
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { kind: "downloaded" };
}


type JoinExperienceProps = {
  messages: Messages["join"];
};

function validateForm(form: FormState, photo: File | null, messages: Messages["join"]) {
  if (!form.name.trim()) return messages.validation.name;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return messages.validation.email;
  }
  if (!/^[+()\-\s\d]{8,18}$/.test(form.phone.trim())) {
    return messages.validation.phone;
  }
  if (!form.state.trim()) return messages.validation.state;
  if (!form.district.trim()) return messages.validation.district;
  if (!/^@[A-Za-z0-9._]{1,30}$/.test(form.instagram.trim())) {
    return messages.validation.instagram;
  }
  if (!photo) return messages.validation.photo;
  if (!IMAGE_TYPES.has(photo.type)) return messages.validation.photoType;
  if (photo.size > MAX_PHOTO_BYTES) return messages.validation.photoSize;
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

export default function JoinExperience({ messages }: JoinExperienceProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [member, setMember] = useState<MemberRecord | null>(null);
  const [status, setStatus] = useState(
    messages.statusInitial,
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cardSavePreviewUrl, setCardSavePreviewUrl] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const previewMember = useMemo<PreviewMember>(
    () =>
      member || {
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
      setError(messages.validation.photoType);
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoPreview("");
      setError(messages.validation.photoSize);
      return;
    }
    setPhotoPreview(URL.createObjectURL(file));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const validation = validateForm(form, photo, messages);
    if (validation) {
      setError(validation);
      return;
    }

    const safePhoto = photo as File;
    setIsSubmitting(true);
    setStatus(messages.statusCreating);

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
            ? ` ${messages.retryAfter} ${Math.ceil(Number(data.retryAfterSeconds) / 60)} ${messages.minutes}`
            : "";
        throw new Error(`${data.error || messages.saveFallback}${retryAfter}`);
      }

      const record = data.member as MemberRecord;

      setMember(record);
      setStatus(`${messages.statusGenerated} ${record.membershipId}`);
      try {
        await downloadCard(record, photoPreview);
      } catch (downloadErr) {
        console.error('Download failed:', downloadErr);
        // Card was saved; only the download step failed — surface a non-fatal message.
        setError(messages.downloadFallback);
      }
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : messages.supabaseFallback;
      setError(message);
      setStatus(messages.statusFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadCard = async (overrideMember?: MemberRecord, overridePhotoUrl?: string) => {
    const activeMember = overrideMember ?? member;
    if (!activeMember) {
      return;
    }
    const cardPhotoUrl = overridePhotoUrl ?? previewMember.photoUrl;
    if (!cardPhotoUrl || typeof cardPhotoUrl !== 'string' || cardPhotoUrl.trim() === '') {
      setError(messages.downloadPhotoRequired);
      return;
    }
    const generatedMembershipId = activeMember.membershipId;
    setIsDownloading(true);
    setError("");
    // Capture and clear the previous preview URL; revoke it in finally so it always runs.
    let previousPreviewUrl = "";
    setCardSavePreviewUrl((currentUrl) => {
      previousPreviewUrl = currentUrl;
      return "";
    });
    try {
      const [imageResult, logoResult, bottleResult, websiteQrResult] = await Promise.allSettled([
        loadCanvasImage(cardPhotoUrl),
        loadCanvasImage(DSP_LOGO_SRC),
        loadCanvasImage(WHISKEY_BOTTLE_SRC),
        loadCanvasImage(DSP_WEBSITE_QR_SRC),
      ]);

      // Member photo is required — fail fast if it could not be loaded.
      if (imageResult.status === 'rejected') {
        throw new Error(`Could not load member photo: ${imageResult.reason}`);
      }
      const image = imageResult.value;

      // Static assets (logo, bottle, QR) are optional — log failures but continue.
      if (logoResult.status === 'rejected') {
        console.error('Could not load DSP logo:', logoResult.reason);
      }
      if (bottleResult.status === 'rejected') {
        console.error('Could not load whiskey bottle asset:', bottleResult.reason);
      }
      if (websiteQrResult.status === 'rejected') {
        console.error('Could not load website QR asset:', websiteQrResult.reason);
      }

      // Use a transparent 1×1 canvas image as a safe no-op fallback for optional assets.
      const createFallbackImage = () => {
        const fb = document.createElement('canvas');
        fb.width = 1; fb.height = 1;
        const fi = new window.Image();
        fi.src = fb.toDataURL();
        return fi;
      };
      const logo = logoResult.status === 'fulfilled' ? logoResult.value : createFallbackImage();
      const bottle = bottleResult.status === 'fulfilled' ? bottleResult.value : createFallbackImage();
      const websiteQr = websiteQrResult.status === 'fulfilled' ? websiteQrResult.value : createFallbackImage();
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
      ctx.fillText(messages.card.brand.toUpperCase(), 172, 100);
      ctx.fillStyle = "#c8ff43";
      ctx.textAlign = "right";
      ctx.fillText(messages.card.foundingMember.toUpperCase(), 1026, 92);
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
      const nameSize = Math.max(fitText(ctx, previewMember.name.toUpperCase(), IW - 64, 60, "Impact, Arial Black, sans-serif", "400", 22), MIN_FONT_SIZE);
      ctx.fillStyle = "#fff3d4";
      ctx.font = `400 ${nameSize}px Impact, Arial Black, sans-serif`;
      ctx.fillText(previewMember.name.toUpperCase(), IPX, CT + 80);
      drawDiv(CT + 116);

      // Instagram handle
      const handleSize = Math.max(fitText(ctx, previewMember.instagram.toUpperCase(), IW - 64, 48, "Impact, Arial Black, sans-serif", "400", 26), MIN_FONT_SIZE);
      ctx.fillStyle = "#c8ff43";
      ctx.font = `400 ${handleSize}px Impact, Arial Black, sans-serif`;
      ctx.fillText(previewMember.instagram.toUpperCase(), IPX, CT + 206);
      drawDiv(CT + 244);

      // State
      ctx.fillStyle = "rgba(255, 243, 212, 0.62)";
      ctx.font = "900 22px Arial, sans-serif";
      ctx.fillText(messages.card.state.toUpperCase(), IPX, CT + 306);
      const stateSize = Math.max(fitText(ctx, previewMember.state.toUpperCase(), IW - 64, 50, "Arial, sans-serif", "900", 22), MIN_FONT_SIZE);
      ctx.fillStyle = "#fff3d4";
      ctx.font = `900 ${stateSize}px Arial, sans-serif`;
      ctx.fillText(previewMember.state.toUpperCase(), IPX, CT + 368);
      drawDiv(CT + 408);

      // District
      ctx.fillStyle = "rgba(255, 243, 212, 0.62)";
      ctx.font = "900 22px Arial, sans-serif";
      ctx.fillText(messages.card.district.toUpperCase(), IPX, CT + 470);
      const districtSize = Math.max(fitText(ctx, previewMember.district.toUpperCase(), IW - 64, 50, "Arial, sans-serif", "900", 22), MIN_FONT_SIZE);
      ctx.fillStyle = "#fff3d4";
      ctx.font = `900 ${districtSize}px Arial, sans-serif`;
      ctx.fillText(previewMember.district.toUpperCase(), IPX, CT + 532);
      drawDiv(CT + 572);

      // Status
      ctx.fillStyle = "rgba(255, 243, 212, 0.62)";
      ctx.font = "900 22px Arial, sans-serif";
      ctx.fillText(messages.card.status.toUpperCase(), IPX, CT + 634);
      ctx.fillStyle = "#c8ff43";
      ctx.font = "900 44px Arial, sans-serif";
      ctx.fillText(messages.card.active.toUpperCase(), IPX, CT + 706);
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
      ctx.fillText(messages.card.membershipId.toUpperCase(), idCX, IDY + 34);

      const idBoxW = QRX - 92;
      ctx.fillStyle = "#7b1719";
      ctx.fillRect(76, IDY + 48, idBoxW, 78);

      const idSize = Math.max(fitText(ctx, generatedMembershipId, idBoxW - 20, 52, "Impact, Arial Black, sans-serif", "400"), MIN_FONT_SIZE);
      ctx.fillStyle = "#ffd43b";
      ctx.font = `400 ${idSize}px Impact, Arial Black, sans-serif`;
      ctx.fillText(generatedMembershipId, idCX, IDY + 104);
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
      ctx.fillText(messages.card.website, 540, FDY + 50);

      ctx.fillStyle = "rgba(200, 255, 67, 0.68)";
      ctx.font = "900 21px Arial, sans-serif";
      ctx.fillText(messages.card.hashtag, 540, FDY + 94);

      // Closing decorative stripe
      ctx.strokeStyle = "rgba(255, 212, 59, 0.32)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(220, FDY + 126);
      ctx.lineTo(860, FDY + 126);
      ctx.stroke();

      ctx.textAlign = "left";

      const result = await saveCardImage(canvas, `${generatedMembershipId}-dsp-card.jpg`);
      if (result.kind === "preview") {
        setCardSavePreviewUrl(result.url);
        setStatus(messages.downloadInstagramFallback);
      }
    } catch (err) {
      console.error('Card generation failed:', err);
      setError(messages.downloadFallback);
    } finally {
      if (previousPreviewUrl) URL.revokeObjectURL(previousPreviewUrl);
      setIsDownloading(false);
    }
  };


  const isLoading = isSubmitting || isDownloading;

  return (
    <section className="join-section" id="join">
      <div className="join-copy">
        <div className="section-label">{messages.sectionLabel}</div>
        <h2>{messages.title}</h2>
        <p>{messages.body}</p>
      </div>

      <div className="join-layout">
        <form className="member-form" onSubmit={submit} noValidate>
          <div className="form-grid">
            <label>
              {messages.form.name}
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                name="name"
                type="text"
                autoComplete="name"
                placeholder={messages.placeholders.name}
                required
              />
            </label>
            <label>
              {messages.form.email}
              <input
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                name="email"
                type="email"
                autoComplete="email"
                placeholder={messages.placeholders.email}
                required
              />
            </label>
            <label>
              {messages.form.phone}
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder={messages.placeholders.phone}
                required
              />
            </label>
            <label>
              {messages.form.instagram}
              <input
                value={form.instagram}
                onChange={(event) => updateField("instagram", event.target.value)}
                name="instagram"
                type="text"
                placeholder={messages.placeholders.instagram}
                required
              />
            </label>
            <label>
              {messages.form.state}
              <input
                value={form.state}
                onChange={(event) => updateField("state", event.target.value)}
                name="state"
                type="text"
                placeholder={messages.placeholders.state}
                required
              />
            </label>
            <label>
              {messages.form.district}
              <input
                value={form.district}
                onChange={(event) => updateField("district", event.target.value)}
                name="district"
                type="text"
                placeholder={messages.placeholders.district}
                required
              />
            </label>
          </div>

          <label className="photo-input">
            {messages.form.photo}
            <input
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => onPhotoChange(event.target.files?.[0] || null)}
              required
            />
            <span>{messages.form.photoHelp}</span>
          </label>

          {!member && (
            <button className="button button-primary submit-button" disabled={isSubmitting}>
              {isSubmitting ? messages.form.submitting : messages.form.submit}
            </button>
          )}
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
                  {messages.card.brand}
                </span>
                <strong>{messages.card.foundingMember}</strong>
              </div>
              <div className="card-photo">
                {previewMember.photoUrl ? (
                  <img src={previewMember.photoUrl} alt="Uploaded member photo" />
                ) : (
                  <span>{messages.card.uploadPhoto}</span>
                )}
              </div>
              <div className="card-identity">
                <h3>{previewMember.name}</h3>
                <div className="card-identity-divider" aria-hidden="true" />
                <span>{previewMember.instagram}</span>
                <div className="card-location">
                  <div className="card-data-row">
                    <span>{messages.card.state}</span>
                    <strong>{previewMember.state}</strong>
                  </div>
                  <div className="card-data-row">
                    <span>{messages.card.district}</span>
                    <strong>{previewMember.district}</strong>
                  </div>
                  <div className="card-data-row">
                    <span>{messages.card.status}</span>
                    <strong style={{ color: "var(--green)" }}>{messages.card.active}</strong>
                  </div>
                </div>
              </div>
              <div className="card-footer" aria-hidden="true">
                <span>{messages.card.website}</span>
                <strong>{messages.card.hashtag}</strong>
              </div>
              {member ? (
                <div className="card-id-panel">
                  <div className="card-id-copy">
                    <span>{messages.card.membershipId}</span>
                    <strong>{member.membershipId}</strong>
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
              ) : null}
            </div>

            {isLoading && (
              <div
                className="card-loading-overlay"
                role="status"
                aria-live="polite"
                aria-label={isSubmitting ? messages.loading.submitting : messages.loading.downloading}
              >
                <div className="card-loading-scanner" aria-hidden="true" />
                <div className="card-loading-badge" aria-hidden="true">
                  <span className="card-loading-dot" />
                  <span className="card-loading-dot" />
                  <span className="card-loading-dot" />
                </div>
                <p className="card-loading-text">
                  {isSubmitting ? messages.loading.submitting : messages.loading.downloading}
                </p>
              </div>
            )}
          </div>

          <div className="card-actions">
            {member && (
              <button
                className="button button-primary"
                type="button"
                onClick={() => downloadCard()}
                disabled={isDownloading}
              >
                {isDownloading ? messages.form.downloading : messages.form.download}
              </button>
            )}
          </div>

          {cardSavePreviewUrl && (
            <div className="card-save-fallback" role="status" aria-live="polite">
              <p>{messages.downloadInstagramFallback}</p>
              <img src={cardSavePreviewUrl} alt="Generated DSP membership card JPG" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
