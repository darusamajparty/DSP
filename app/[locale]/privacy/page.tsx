import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalPage from "../../../components/legal-page";
import { defaultLocale, isLocale, locales, localizedPath } from "../../../lib/i18n/locales";
import { getMessages } from "../../../lib/i18n/messages";

type LocaleLegalPageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.filter((locale) => locale !== defaultLocale).map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLegalPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === defaultLocale) return {};
  const messages = getMessages(locale);
  return {
    title: messages.legal.privacy.metaTitle,
    description: messages.legal.privacy.metaDescription,
  };
}

export default async function PrivacyPage({ params }: LocaleLegalPageProps) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === defaultLocale) notFound();

  const messages = getMessages(locale);

  return (
    <LegalPage
      backHref={localizedPath(locale)}
      backLabel={messages.legal.back}
      currentLocale={locale}
      currentPath="/privacy"
      languageLabel={messages.navigation.language}
      sectionLabel={messages.legal.privacy.sectionLabel}
      title={messages.legal.privacy.title}
      intro={messages.legal.privacy.intro}
      ariaLabel={messages.legal.privacy.ariaLabel}
      sections={messages.legal.privacy.sections}
    />
  );
}
