/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
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
        source: "/:path*",
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
    ];
  },
};

export default nextConfig;
