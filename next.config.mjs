/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Service-page slugs renamed on 2026-10-01 so the URL holds the keyword
      // in typed word order (Moz "keyword in URL" factor).
      {
        source: "/services/dormant-llc-form-5472-filing",
        destination: "/services/form-5472-filing-for-dormant-llc",
        permanent: true,
      },
      {
        source: "/services/final-form-5472-dissolved-llc",
        destination: "/services/final-form-5472-for-dissolved-llc",
        permanent: true,
      },
      {
        source: "/form-5472-50-off",
        destination: "/form-5472-filing",
        permanent: true,
      },
      // Tag-slug aliases — keep in sync with TAG_SLUG_ALIASES in
      // src/lib/blog-tags.ts (the variant slug no longer renders its own page).
      {
        source: "/blog/topics/nonresident",
        destination: "/blog/topics/non-resident",
        permanent: true,
      },
      {
        source: "/blog/topics/digital-nomads",
        destination: "/blog/topics/digital-nomad",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Every path EXCEPT /embed/*. Next.js merges matching header entries
        // and a same-key later entry does not reliably replace
        // X-Frame-Options, so the framing-locked rule must not match /embed at all.
        source: "/((?!embed(?:/|$)).*)",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // SAMEORIGIN, not DENY: /admin/filings/[id]/place-signature previews the
          // signed PDF in a same-origin <iframe>; DENY made Chrome show
          // "www.form5472prep.com refused to connect" inside it. Third-party framing
          // stays blocked by both headers.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
        ],
      },
      {
        // The embeddable free tools (src/app/embed) exist to be iframed by
        // third-party sites. No X-Frame-Options here (it has no "allow any
        // origin" value); CSP frame-ancestors * governs. Nothing else is framable.
        source: "/embed/:path*",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
    ];
  },
};

export default nextConfig;
