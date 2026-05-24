"use client";

import { useEffect, useState } from "react";
import type { Messages } from "../lib/i18n/messages";

type Props = {
  messages: Messages["instagramWarning"];
};

type Phase =
  | "hidden"
  | "android-redirecting"
  | "android-failed"
  | "ios";

export default function InstagramWarningBanner({ messages }: Props) {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isInstagram = /Instagram/.test(ua) && /iPhone|iPad|Android/.test(ua);
    if (!isInstagram) return;

    const isAndroid = /Android/.test(ua);

    if (isAndroid) {
      setPhase("android-redirecting");
      // Attempt to open the current URL in Chrome via Android intent scheme.
      const { host, pathname, search, hash } = window.location;
      window.location.href =
        `intent://${host}${pathname}${search}${hash}#Intent;scheme=https;package=com.android.chrome;end`;
      // If the user is still here after 1.5s the redirect didn't work.
      const t = setTimeout(() => setPhase("android-failed"), 1500);
      return () => clearTimeout(t);
    }

    // iOS / iPadOS — no programmatic escape; guide the user to the ··· menu.
    setPhase("ios");
  }, []);

  if (phase === "hidden") return null;

  async function copyLink() {
    setIsLoading(true);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Clipboard write failed:", err);
      setCopied(false);
    } finally {
      setIsLoading(false);
    }
  }

  const bannerText =
    phase === "ios"
      ? (messages?.textIos ?? messages?.text ?? "")
      : phase === "android-redirecting"
      ? (messages?.textAndroid ?? messages?.text ?? "")
      : (messages?.textAndroidFailed ?? messages?.text ?? "");

  // During the redirect attempt, only show the status message — no buttons needed.
  const showActions = phase !== "android-redirecting";

  return (
    <div className="instagram-warning-banner" role="alert">
      <div className="instagram-warning-content">
        <svg className="instagram-warning-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2L2 20h20L12 2z" />
          <path d="M12 9v5M12 16.5v.5" />
        </svg>
        <p className="instagram-warning-text">{bannerText}</p>
      </div>
      {showActions && (
        <div className="instagram-warning-actions">
          <button
            className="instagram-warning-copy"
            onClick={copyLink}
            type="button"
            disabled={isLoading}
          >
            {copied ? (messages?.copied ?? "") : (messages?.copy ?? "")}
          </button>
          <button
            className="instagram-warning-dismiss"
            onClick={() => setPhase("hidden")}
            type="button"
            aria-label={messages?.dismiss ?? ""}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
