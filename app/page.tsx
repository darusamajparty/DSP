import JoinExperience from "../components/join-experience";

const manifesto = [
  {
    title: "Dignity for Responsible Drinkers",
    body: "Responsible adult drinkers deserve dignity, not shame. Drinking responsibly is a personal choice, not a character certificate.",
  },
  {
    title: "Alcohol Is Not the Root of All Evil",
    body: "Violence, addiction, unsafe behaviour, poverty, unemployment, and family conflict are serious issues, but blaming alcohol for everything hides the real causes.",
  },
  {
    title: "Voice Against Unnecessary Alcohol Bans",
    body: "DSP stands against sudden, impractical bans that create black markets, unsafe illegal liquor, corruption, smuggling, and harassment.",
  },
  {
    title: "Responsible Drinking, Not Reckless Drinking",
    body: "DSP does not support drunk driving, underage drinking, violence, addiction, or public nuisance. Irresponsible behaviour must be handled firmly and fairly.",
  },
  {
    title: "Safe Home Delivery with Strict Age Verification",
    body: "Regulated alcohol delivery can reduce drunk driving, crowding, harassment, and street nuisance when paired with legal-age verification and quantity limits.",
  },
  {
    title: "No Harassment, No Moral Policing",
    body: "Responsible drinkers should not be treated like criminals. Law should target actual offences, not personal choices.",
  },
  {
    title: "Respect at Home and in Society",
    body: "A person who works hard, pays taxes, supports businesses, and drinks responsibly deserves basic respect. Friday night should mean peace, not interrogation.",
  },
  {
    title: "Employment and Local Economy",
    body: "Alcohol, hospitality, retail, logistics, food, and nightlife support lakhs of jobs and local businesses. Policy must recognise this economic reality.",
  },
  {
    title: "Use Alcohol Taxes Transparently",
    body: "A fair share of alcohol revenue should support healthcare, de-addiction, road safety, public transport, mental health, and awareness programs.",
  },
  {
    title: "Support for People Struggling with Addiction",
    body: "Addiction should be treated as a health and social issue. People need counselling, treatment access, family support, and rehabilitation, not public shame.",
  },
  {
    title: "Safer Public Policy, Not Hypocrisy",
    body: "Regulate alcohol, educate people, prevent misuse, punish dangerous behaviour, but do not criminalise responsible adults.",
  },
];

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

export default function Home() {
  return (
    <>
      <div className="page-texture" aria-hidden="true" />
      <div className="social-dock" aria-label="Social media links">
        {socialLinks.map((link) => (
          <a
            className={`social-link ${link.className}`}
            href={link.href}
            key={link.name}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open Daru Samaj Party on ${link.name}`}
            title={link.name}
          >
            <SocialIcon icon={link.icon} />
          </a>
        ))}
      </div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Daru Samaj Party home">
          <span className="brand-mark">
            <img src="/assets/dsp-logo.jpeg" alt="" />
          </span>
          <span className="brand-copy">
            <span className="brand-kicker">Official Movement</span>
            <span className="brand-name">Daru Samaj Party</span>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#about">About</a>
          <a href="#manifesto">Manifesto</a>
          <a href="#vision">Vision</a>
          <a href="#join">Join</a>
        </nav>
        <div className="header-actions">
          <a className="header-email" href="mailto:darusamajparty@gmail.com">
            darusamajparty@gmail.com
          </a>
          <a className="header-cta" href="#join">
            Join
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <h1>Daru Samaj Party (DSP)</h1>
            <p>
              The voice of ACPs(Alcohol Consuming Persons), the fight for respect. No shame, no
              discrimination: responsible drinkers deserve rights, safety, and
              convenience.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#join">
                Join The Party
              </a>
              <a className="button button-ghost" href="#manifesto">
                Read Manifesto
              </a>
            </div>
          </div>

          <div className="hero-card" aria-label="DSP campaign artwork preview">
            <img
              src="/assets/dsp-rally-poster.jpeg"
              alt="Daru Samaj Party campaign poster"
            />
            <div className="hero-card-caption">
              <strong>Founding membership drive</strong>
              <span>Join, generate your card, and post the movement.</span>
            </div>
          </div>
        </section>

        <section className="ticker" aria-label="Campaign highlights">
          <div className="ticker-track">
            <span>Join form live</span>
            <span>Instagram-ready membership card</span>
            <span>State and district chapters</span>
            <span>Satirical community movement</span>
            <span>Join form live</span>
            <span>Instagram-ready membership card</span>
            <span>State and district chapters</span>
            <span>Satirical community movement</span>
          </div>
        </section>

        <section className="section about-section" id="about">
          <div className="section-label">About Daru Samaj Party</div>
          <div className="about-layout">
            <div className="about-lead">
              <h2>Responsible drinkers deserve dignity, safety, and basic social respect.</h2>
              <p>
                Daru Samaj Party is a satirical social movement built around one
                simple idea: adults who drink responsibly should be treated like
                adults.
              </p>
            </div>

            <div className="about-story">
              <article>
                <span>Why DSP exists</span>
                <p>
                  For too long, people who drink responsibly have been treated
                  with unnecessary judgement, moral policing, and social
                  hypocrisy. The same society that benefits from alcohol taxes,
                  hospitality jobs, nightlife revenue, and local business
                  activity often refuses to acknowledge the people who contribute
                  to that ecosystem.
                </p>
              </article>
              <article>
                <span>What DSP stands for</span>
                <p>
                  We do not promote irresponsible drinking. We stand for
                  responsible choice, safe behaviour, fair treatment, and
                  practical reforms, from peaceful Friday nights and safer
                  alternatives to drunk driving to home delivery with age
                  verification and freedom from unnecessary harassment.
                </p>
              </article>
            </div>

            <div className="about-belief">
              <p>Drinking is not a crime.</p>
              <strong>Irresponsibility is the problem.</strong>
            </div>

            <div className="about-closing">
              <p>
                DSP speaks for the common person who works hard all week, pays
                taxes, supports local businesses, and simply wants to enjoy
                personal time without shame, drama, or interrogation.
              </p>
              <p>
                Daru Samaj Party stands for a society where responsible drinkers
                are not mocked, harassed, or treated as second-class citizens,
                but are recognised as people with rights, choices, and dignity.
              </p>
              <strong>DSP — The Voice of Responsible Drinkers.</strong>
            </div>
          </div>
        </section>

        <section className="section manifesto-section" id="manifesto">
          <div className="manifesto-header">
            <div>
              <div className="section-label">Manifesto of Daru Samaj Party</div>
              <h2>Dignity. Safety. Responsibility. Freedom.</h2>
            </div>
            <p>
              A humorous movement with a serious demand: treat responsible adults
              fairly, regulate with evidence, and stop confusing personal choice
              with public disorder.
            </p>
          </div>

          <div className="manifesto-grid">
            {manifesto.map((item, index) => (
              <article className="manifesto-item" key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>

          <div className="manifesto-slogan">
            <p>Our Core Slogan</p>
            <h3>
              We are not slaves of alcohol. We are responsible citizens with
              personal choice, dignity, and rights.
            </h3>
            <strong>Daru Samaj Party — The Voice of Responsible Drinkers.</strong>
          </div>
        </section>

        <section className="vision-band" id="vision">
          <div>
            <div className="section-label">Vision</div>
            <h2>A society where responsible adults are treated with dignity.</h2>
          </div>
          <p>
            To build a society where responsible adult drinkers are treated with
            dignity, fairness, and respect — without unnecessary shame,
            harassment, or moral policing.
          </p>
        </section>

        <section className="section mission-section" id="mission">
          <div className="section-label">Mission</div>
          <div className="mission-statement">
            <h2>The voice of responsible drinkers.</h2>
            <p>
              Daru Samaj Party works to become the voice of responsible drinkers
              by demanding practical alcohol policies, safer choices like home
              delivery, protection from unnecessary harassment, and social
              acceptance for adults who drink responsibly.
            </p>
          </div>
        </section>

        <JoinExperience />
      </main>

      <footer className="site-footer">
        <strong>Daru Samaj Party</strong>
        <span>
          Satirical community project. Not a real political party. No alcohol
          sale or promotion.
        </span>
        <div className="footer-links">
          <a href="mailto:darusamajparty@gmail.com">darusamajparty@gmail.com</a>
          <a href="#join">Become a member</a>
        </div>
      </footer>
    </>
  );
}
