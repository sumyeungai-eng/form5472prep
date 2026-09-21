import { LegalLayout } from "@/components/LegalLayout";
import { SITE_URL } from "@/lib/seo";

export const metadata = {
  title: "Cookies",
  description:
    "How Form5472 Prep uses strictly necessary cookies, first-party measurement cookies, Google Ads, and the Meta pixel.",
  alternates: {
    canonical: "/cookies",
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookies" lastUpdated="2026-09-21">
      <p>
        This page explains the cookies and similar browser storage Form5472 Prep sets today.
        We use cookies to keep the Service working, understand how people find the site, and
        measure advertising performance. See our <a href="/privacy">Privacy Policy</a> for
        more about how we handle personal information.
      </p>

      <h2>1. Strictly necessary</h2>
      <p>
        These cookies are needed for the Service to work. There is nothing optional in this
        group.
      </p>
      <ul>
        <li>
          <strong>fs_session:</strong> keeps an anonymous customer filing linked to the same
          browser before sign-in so the filing wizard can continue across page loads.
        </li>
        <li>
          <strong>fs_user:</strong> keeps a signed-in customer connected to their account after
          they use a magic link or Google sign-in.
        </li>
      </ul>

      <h2>2. Measurement</h2>
      <ul>
        <li>
          <strong>fs_visitor:</strong> a first-party cookie used by our own visit logging to
          count page views, recognize returning visits, and help protect the site from abuse.
        </li>
        <li>
          <strong>f5472_attr:</strong> a first-party attribution cookie that records how a
          visitor first reached the site, such as Google Ads, Meta ads, organic search, a
          referral, or direct traffic.
        </li>
        <li>
          <strong>Vercel Analytics and Speed Insights:</strong> collect aggregate site
          performance and page-event data through Vercel tools. See Vercel&apos;s{" "}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          .
        </li>
      </ul>
      <p>
        Google Analytics and Microsoft Clarity are not integrated in the codebase today, so we
        do not name them as cookies set by this site.
      </p>

      <h2>3. Advertising</h2>
      <ul>
        <li>
          <strong>Google Ads:</strong> the Google Ads conversion tag may set Google advertising
          cookies such as <code>_gcl_*</code> to measure ad clicks and conversions. See
          Google&apos;s{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="https://business.safety.google/privacy/" target="_blank" rel="noopener noreferrer">
            Business Data Responsibility Site
          </a>
          .
        </li>
        <li>
          <strong>Meta pixel:</strong> when Meta advertising cookies are allowed, the Meta
          pixel measures page views and campaign events and may set Meta cookies. See Meta&apos;s{" "}
          <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="https://www.facebook.com/policies/cookies/" target="_blank" rel="noopener noreferrer">
            Cookie Policy
          </a>
          .
        </li>
        <li>
          <strong>form5472_marketing_consent:</strong> records the browser&apos;s Meta
          advertising cookie choice so the site knows whether to load the Meta pixel.
        </li>
      </ul>

      <h2>4. How to refuse cookies</h2>
      <p>
        You can block or delete cookies in your browser settings. If you block strictly
        necessary cookies, parts of the Service may not work, including sign-in and keeping a
        filing linked to your browser. You can also use Google and Meta account or browser
        controls to limit advertising measurement.
      </p>

      <h2>5. Contact</h2>
      <p>
        Questions about cookies can be sent to{" "}
        <a href="mailto:support@form5472prep.com">support@form5472prep.com</a>.
      </p>
    </LegalLayout>
  );
}
