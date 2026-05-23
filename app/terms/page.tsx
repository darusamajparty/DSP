import type { Metadata } from "next";
import LegalPage from "../../components/legal-page";
import { defaultLocale, localizedPath } from "../../lib/i18n/locales";
import { getMessages } from "../../lib/i18n/messages";

const messages = getMessages(defaultLocale);

export const metadata: Metadata = {
  title: messages.legal.terms.metaTitle,
  description: messages.legal.terms.metaDescription,
};

export default function TermsPage() {
  return (
    <LegalPage
      backHref={localizedPath(defaultLocale)}
      backLabel={messages.legal.back}
      currentLocale={defaultLocale}
      currentPath="/terms"
      languageLabel={messages.navigation.language}
      sectionLabel={messages.legal.terms.sectionLabel}
      title={messages.legal.terms.title}
      intro={messages.legal.terms.intro}
      ariaLabel={messages.legal.terms.ariaLabel}
      sections={messages.legal.terms.sections}
    />
  );
}
