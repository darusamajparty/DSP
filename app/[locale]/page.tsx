import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomePage from "../../components/home-page";
import { defaultLocale, isLocale, localeDirections, locales } from "../../lib/i18n/locales";
import { getMessages } from "../../lib/i18n/messages";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.filter((locale) => locale !== defaultLocale).map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === defaultLocale) return {};
  const messages = getMessages(locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://darusamajparty.online";

  return {
    metadataBase: new URL(siteUrl),
    title: messages.meta.title,
    description: messages.meta.description,
    alternates: {
      canonical: `/${locale}`,
    },
    openGraph: {
      title: messages.meta.title,
      description: messages.meta.ogDescription,
      url: `${siteUrl}/${locale}`,
      siteName: "Daru Samaj Party",
      images: [
        {
          url: "/assets/dsp-rally-poster.jpeg",
          width: 1200,
          height: 630,
          alt: messages.meta.imageAlt,
        },
      ],
      locale: `${locale}_IN`,
      type: "website",
    },
  };
}

export default async function LocaleHomePage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === defaultLocale) notFound();

  return (
    <div dir={localeDirections[locale]}>
      <HomePage locale={locale} messages={getMessages(locale)} />
    </div>
  );
}
