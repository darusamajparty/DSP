import type { Metadata } from "next";
import LegalPage from "../../components/legal-page";
import { defaultLocale, localizedPath } from "../../lib/i18n/locales";
import { getMessages } from "../../lib/i18n/messages";

const messages = getMessages(defaultLocale);

export const metadata: Metadata = {
  title: messages.legal.privacy.metaTitle,
  description: messages.legal.privacy.metaDescription,
};

export default function PrivacyPage() {
  return (
    <LegalPage
      backHref={localizedPath(defaultLocale)}
      backLabel={messages.legal.back}
      currentLocale={defaultLocale}
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
