import en from "./dictionaries/en.json";
import hi from "./dictionaries/hi.json";
import mr from "./dictionaries/mr.json";
import bn from "./dictionaries/bn.json";
import gu from "./dictionaries/gu.json";
import pa from "./dictionaries/pa.json";
import ta from "./dictionaries/ta.json";
import te from "./dictionaries/te.json";
import kn from "./dictionaries/kn.json";
import ml from "./dictionaries/ml.json";
import ur from "./dictionaries/ur.json";
import { defaultLocale, isLocale, type Locale } from "./locales";

export type Messages = typeof en;
type MessageValue = string | number | boolean | null | MessageValue[] | { [key: string]: MessageValue };
type MessageOverlay = { [key: string]: MessageValue };

const overlays: Record<Locale, MessageOverlay> = {
  en: {},
  hi,
  mr,
  bn,
  gu,
  pa,
  ta,
  te,
  kn,
  ml,
  ur,
};

function isObject(value: MessageValue): value is MessageOverlay {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeMessages(base: MessageValue, overlay: MessageValue): MessageValue {
  if (Array.isArray(base)) {
    return Array.isArray(overlay) ? overlay : base;
  }

  if (!isObject(base)) {
    return overlay ?? base;
  }

  if (!isObject(overlay)) return base;

  return Object.fromEntries(
    Object.entries(base).map(([key, value]) => [
      key,
      key in overlay ? mergeMessages(value, overlay[key]) : value,
    ]),
  );
}

export function getMessages(locale: string): Messages {
  const safeLocale = isLocale(locale) ? locale : defaultLocale;
  return mergeMessages(en, overlays[safeLocale]) as Messages;
}
