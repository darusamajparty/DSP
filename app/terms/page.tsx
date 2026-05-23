import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Daru Samaj Party",
  description:
    "Terms and conditions for using the Daru Samaj Party website and membership experience.",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <a className="legal-back-link" href="/">
          Back to home
        </a>
        <p className="section-label">Terms & Conditions</p>
        <h1>Website Terms</h1>
        <p>
          These terms explain how visitors may use the Daru Samaj Party website,
          membership form, downloadable membership card, and related public
          pages.
        </p>
      </section>

      <section className="legal-content" aria-label="Terms and conditions">
        <article>
          <h2>Use of the Website</h2>
          <p>
            You may use this website for lawful, personal, and non-commercial
            purposes. Do not misuse the site, interfere with its operation,
            attempt unauthorized access, submit false or harmful data, or use the
            site in a way that violates applicable law.
          </p>
        </article>

        <article>
          <h2>Membership Submissions</h2>
          <p>
            If you submit details through the membership form, you are
            responsible for the accuracy of the information and for ensuring you
            have permission to upload any photo or content you provide. We may
            reject, remove, or moderate submissions that are abusive, illegal,
            misleading, or otherwise unsuitable.
          </p>
        </article>

        <article>
          <h2>Responsible Conduct</h2>
          <p>
            Daru Samaj Party supports responsible adult choice and does not
            encourage underage drinking, drunk driving, unsafe behavior,
            harassment, violence, addiction, or public nuisance. Visitors must
            follow all local alcohol, safety, and public-order laws.
          </p>
        </article>

        <article>
          <h2>Intellectual Property</h2>
          <p>
            Site text, branding, images, generated membership-card layouts, and
            design assets are owned by or licensed to Daru Samaj Party unless
            otherwise stated. You may share public website pages and your own
            generated membership card, but you may not copy, resell, or
            misrepresent the site assets.
          </p>
        </article>

        <article>
          <h2>No Alcohol Sales</h2>
          <p>
            This website does not sell alcohol, process alcohol orders, provide
            delivery services, or verify eligibility for alcohol purchase. Any
            references to policy, delivery, taxation, or regulation are public
            discussion points only.
          </p>
        </article>

        <article>
          <h2>Third-Party Links</h2>
          <p>
            The website may link to social networks, email providers, and other
            third-party services. Those services are governed by their own terms
            and privacy policies, and we are not responsible for their content,
            availability, or practices.
          </p>
        </article>

        <article>
          <h2>Changes</h2>
          <p>
            We may update these terms when the website changes or when legal,
            operational, or policy requirements change. Continued use of the site
            after updates means you accept the revised terms.
          </p>
        </article>

        <article>
          <h2>Contact</h2>
          <p>
            For questions about these terms, contact{" "}
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
