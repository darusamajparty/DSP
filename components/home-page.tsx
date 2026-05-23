import JoinExperience from "./join-experience";
import LanguageSwitcher from "./language-switcher";
import { localizedPath, localeDirections, type Locale } from "../lib/i18n/locales";
import type { Messages } from "../lib/i18n/messages";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/darusamajparty/",
    className: "social-instagram",
    icon: "instagram",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61590468261418",
    className: "social-facebook",
    icon: "facebook",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@darusamajparty",
    className: "social-youtube",
    icon: "youtube",
  },
];

function SocialIcon({ icon }: { icon: string }) {
  if (icon === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17" cy="7" r="1.2" />
      </svg>
    );
  }

  if (icon === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.4 8.2H17V4.4c-.5-.1-2-.2-3.6-.2-3.5 0-5.8 2.1-5.8 6v3.3H4v4.3h3.6V24h4.5v-6.2h3.7l.6-4.3h-4.3v-2.9c0-1.2.4-2.4 2.3-2.4Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="4" />
      <path d="M10 9.2v5.6l5.2-2.8L10 9.2Z" />
    </svg>
  );
}

type HomePageProps = {
  locale: Locale;
  messages: Messages;
};

export default function HomePage({ locale, messages }: HomePageProps) {
  const homePath = localizedPath(locale);
  const termsPath = localizedPath(locale, "/terms");
  const privacyPath = localizedPath(locale, "/privacy");

  return (
    <div lang={locale} dir={localeDirections[locale]}>
      <div className="page-texture" aria-hidden="true" />
      <div className="social-dock" aria-label="Social media links">
        {socialLinks.map((link) => (
          <a
            className={`social-link ${link.className}`}
            href={link.href}
            key={link.name}
            target="_blank"
            rel="noreferrer"
            aria-label={`${messages.social.openLabel} ${link.name}`}
            title={link.name}
          >
            <SocialIcon icon={link.icon} />
          </a>
        ))}
      </div>
      <header className="site-header">
        <a className="brand" href={`${homePath}#top`} aria-label="Daru Samaj Party home">
          <span className="brand-mark">
            <img src="/assets/dsp-logo.jpeg" alt="" />
          </span>
          <span className="brand-copy">
            <span className="brand-kicker">{messages.navigation.brandKicker}</span>
            <span className="brand-name">{messages.navigation.brandName}</span>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#about">{messages.navigation.about}</a>
          <a href="#manifesto">{messages.navigation.manifesto}</a>
          <a href="#vision">{messages.navigation.vision}</a>
          <a href="#join">{messages.navigation.join}</a>
        </nav>
        <div className="header-actions">
          <LanguageSwitcher
            currentLocale={locale}
            currentPath="/"
            label={messages.navigation.language}
          />
          <a className="header-email" href="mailto:darusamajparty@gmail.com">
            darusamajparty@gmail.com
          </a>
          <a className="header-cta" href="#join">
            {messages.navigation.join}
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <h1>{messages.hero.title}</h1>
            <p>{messages.hero.body}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#join">
                {messages.hero.primaryCta}
              </a>
              <a className="button button-ghost" href="#manifesto">
                {messages.hero.secondaryCta}
              </a>
            </div>
          </div>

          <div className="hero-card" aria-label="DSP campaign artwork preview">
            <img src="/assets/dsp-rally-poster.jpeg" alt={messages.hero.artworkAlt} />
            <div className="hero-card-caption">
              <strong>{messages.hero.captionTitle}</strong>
              <span>{messages.hero.captionBody}</span>
            </div>
          </div>
        </section>

        <section className="ticker" aria-label="Campaign highlights">
          <div className="ticker-track">
            {[...messages.ticker, ...messages.ticker].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </section>

        <section className="section about-section" id="about">
          <div className="section-label">{messages.about.sectionLabel}</div>
          <div className="about-layout">
            <div className="about-lead">
              <h2>{messages.about.title}</h2>
              <p>{messages.about.lead}</p>
            </div>

            <div className="about-story">
              <article>
                <span>{messages.about.whyTitle}</span>
                <p>{messages.about.whyBody}</p>
              </article>
              <article>
                <span>{messages.about.standsTitle}</span>
                <p>{messages.about.standsBody}</p>
              </article>
            </div>

            <div className="about-belief">
              <p>{messages.about.beliefLineOne}</p>
              <strong>{messages.about.beliefLineTwo}</strong>
            </div>

            <div className="about-closing">
              <p>{messages.about.closingOne}</p>
              <p>{messages.about.closingTwo}</p>
              <strong>{messages.about.closingStrong}</strong>
            </div>
          </div>
        </section>

        <section className="section manifesto-section" id="manifesto">
          <div className="manifesto-header">
            <div>
              <div className="section-label">{messages.manifesto.sectionLabel}</div>
              <h2>{messages.manifesto.title}</h2>
            </div>
            <p>{messages.manifesto.intro}</p>
          </div>

          <div className="manifesto-grid">
            {messages.manifesto.items.map((item, index) => (
              <article className="manifesto-item" key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>

          <div className="manifesto-slogan">
            <p>{messages.manifesto.sloganLabel}</p>
            <h3>{messages.manifesto.slogan}</h3>
            <strong>{messages.manifesto.sloganStrong}</strong>
          </div>
        </section>

        <section className="vision-band" id="vision">
          <div>
            <div className="section-label">{messages.vision.sectionLabel}</div>
            <h2>{messages.vision.title}</h2>
          </div>
          <p>{messages.vision.body}</p>
        </section>

        <section className="section mission-section" id="mission">
          <div className="section-label">{messages.mission.sectionLabel}</div>
          <div className="mission-statement">
            <h2>{messages.mission.title}</h2>
            <p>{messages.mission.body}</p>
          </div>
        </section>

        <JoinExperience messages={messages.join} />
      </main>

      <footer className="site-footer">
        <strong>{messages.footer.copyright}</strong>
        <span>{messages.footer.body}</span>
        <div className="footer-links">
          <a href={termsPath}>{messages.footer.terms}</a>
          <a href={privacyPath}>{messages.footer.privacy}</a>
          <a href="mailto:darusamajparty@gmail.com">darusamajparty@gmail.com</a>
          <a href="#join">{messages.footer.join}</a>
        </div>
      </footer>
    </div>
  );
}
