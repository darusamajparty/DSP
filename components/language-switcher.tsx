"use client";

import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
  const router = useRouter();
  const pathWithoutLocale = stripLocaleFromPath(pathname || currentPath);

  return (
    <label className="language-switcher">
      <select
        aria-label={label}
        value={currentLocale}
        onChange={(event) => {
          router.push(localizedPath(event.target.value as Locale, pathWithoutLocale));
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
