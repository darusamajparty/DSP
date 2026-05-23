"use client";

import {
  localeNativeLabels,
  locales,
  localizedPath,
  stripLocaleFromPath,
  type Locale,
} from "../lib/i18n/locales";

type LanguageSwitcherProps = {
  currentLocale: Locale;
  currentPath?: string;
  label: string;
};

export default function LanguageSwitcher({
  currentLocale,
  currentPath = "/",
  label,
}: LanguageSwitcherProps) {
  const pathWithoutLocale = stripLocaleFromPath(currentPath);

  return (
    <label className="language-switcher">
      <span>{label}</span>
      <select
        value={currentLocale}
        onChange={(event) => {
          window.location.href = localizedPath(event.target.value as Locale, pathWithoutLocale);
        }}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {localeNativeLabels[locale]}
          </option>
        ))}
      </select>
    </label>
  );
}
