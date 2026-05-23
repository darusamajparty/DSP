import LanguageSwitcher from "./language-switcher";
import type { Locale } from "../lib/i18n/locales";

type LegalPageProps = {
  backHref: string;
  backLabel: string;
  currentLocale: Locale;
  currentPath: string;
  languageLabel: string;
  sectionLabel: string;
  title: string;
  intro: string;
  ariaLabel: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

export default function LegalPage({
  backHref,
  backLabel,
  currentLocale,
  currentPath,
  languageLabel,
  sectionLabel,
  title,
  intro,
  ariaLabel,
  sections,
}: LegalPageProps) {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <div className="legal-topbar">
          <a className="legal-back-link" href={backHref}>
            {backLabel}
          </a>
          <LanguageSwitcher
            currentLocale={currentLocale}
            currentPath={currentPath}
            label={languageLabel}
          />
        </div>
        <p className="section-label">{sectionLabel}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>

      <section className="legal-content" aria-label={ariaLabel}>
        {sections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            <p>
              {section.body.includes("darusamajparty@gmail.com") ? (
                <>
                  {section.body.replace("darusamajparty@gmail.com.", "")}
                  <a href="mailto:darusamajparty@gmail.com">darusamajparty@gmail.com</a>.
                </>
              ) : (
                section.body
              )}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
