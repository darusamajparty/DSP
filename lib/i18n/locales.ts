export const defaultLocale = "en" as const;

export const locales = [
  "en",
  "hi",
  "mr",
  "bn",
  "gu",
  "pa",
  "ta",
  "te",
  "kn",
  "ml",
  "ur",
] as const;

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  bn: "Bengali",
  gu: "Gujarati",
  pa: "Punjabi",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  ur: "Urdu",
};

export const localeNativeLabels: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  mr: "मराठी",
  bn: "বাংলা",
  gu: "ગુજરાતી",
  pa: "ਪੰਜਾਬੀ",
  ta: "தமிழ்",
  te: "తెలుగు",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  ur: "اردو",
};

export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  hi: "ltr",
  mr: "ltr",
  bn: "ltr",
  gu: "ltr",
  pa: "ltr",
  ta: "ltr",
  te: "ltr",
  kn: "ltr",
  ml: "ltr",
  ur: "rtl",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function localizedPath(locale: Locale, path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return normalizedPath;
  return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}

export function stripLocaleFromPath(path: string) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length > 0 && isLocale(parts[0])) {
    return `/${parts.slice(1).join("/")}` || "/";
  }
  return path || "/";
}
