import type { MetadataRoute } from "next";
import { defaultLocale, locales, localizedPath } from "../lib/i18n/locales";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://darusamajparty.info";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paths = ["/", "/terms", "/privacy"];

  return locales.flatMap((locale) =>
    paths.map((path) => {
      const localized = localizedPath(locale, path);
      const isHome = path === "/";
      return {
        url: `${siteUrl}${localized === "/" ? "" : localized}`,
        lastModified,
        changeFrequency: isHome ? "weekly" : "yearly",
        priority: isHome && locale === defaultLocale ? 1 : isHome ? 0.8 : 0.4,
      } satisfies MetadataRoute.Sitemap[number];
    }),
  );
}
