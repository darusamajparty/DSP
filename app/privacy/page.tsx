import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Daru Samaj Party",
  description:
    "Privacy policy for the Daru Samaj Party website, membership form, and membership-card experience.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <a className="legal-back-link" href="/">
          Back to home
        </a>
        <p className="section-label">Privacy Policy</p>
        <h1>Privacy Policy</h1>
        <p>
          This policy explains what information the Daru Samaj Party website may
          collect and how it is used for the membership experience.
        </p>
      </section>

      <section className="legal-content" aria-label="Privacy policy">
        <article>
          <h2>Information We Collect</h2>
          <p>
            If you use the membership form, we may collect the details you
            provide, such as name, social handle, city, state, and uploaded
            photo. We may also collect basic technical information needed to
            operate, secure, and improve the site.
          </p>
        </article>

        <article>
          <h2>How We Use Information</h2>
          <p>
            Submitted information is used to provide the membership experience,
            generate a membership card, respond to contact requests, prevent
            spam or abuse, and maintain site reliability.
          </p>
        </article>

        <article>
          <h2>Sharing</h2>
          <p>
            We do not sell personal information. Information may be processed by
            hosting, database, analytics, email, or security providers that help
            operate the website. We may also disclose information if required by
            law or to protect the site and its users.
          </p>
        </article>

        <article>
          <h2>Your Choices</h2>
          <p>
            You can choose not to submit the membership form. To request removal
            or correction of submitted information, contact us using the email
            below and include enough detail for us to identify the submission.
          </p>
        </article>

        <article>
          <h2>Data Security</h2>
          <p>
            We use reasonable operational safeguards, but no website or internet
            transmission can be guaranteed fully secure. Avoid submitting
            sensitive personal, financial, health, or identity-document
            information through the website.
          </p>
        </article>

        <article>
          <h2>Contact</h2>
          <p>
            For privacy questions or data requests, contact{" "}
            <a href="mailto:darusamajparty@gmail.com">
              darusamajparty@gmail.com
            </a>
            .
          </p>
        </article>
      </section>
    </main>
  );
}
