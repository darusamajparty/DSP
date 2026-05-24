"use client";

import { useEffect, useState } from "react";
import type { Messages } from "../lib/i18n/messages";

type Props = {
  messages: Messages["instagramWarning"];
};

export default function InstagramWarningBanner({ messages }: Props) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isInstagram = /Instagram/.test(ua) && /iPhone|iPad|Android/.test(ua);
    if (isInstagram) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

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

  return (
    <div className="instagram-warning-banner" role="alert">
      <div className="instagram-warning-content">
        <svg className="instagram-warning-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2L2 20h20L12 2z" />
          <path d="M12 9v5M12 16.5v.5" />
        </svg>
        <p className="instagram-warning-text">{messages?.text ?? ""}</p>
      </div>
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
          onClick={() => setShow(false)}
          type="button"
          aria-label={messages?.dismiss ?? ""}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
