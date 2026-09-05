/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static site: every route prerenders, no server runtime, no API routes.
  // `out/` can be dropped onto any static host (Hostinger, Netlify, S3, nginx).
  output: "export",
  // Directory-style URLs (/wizard/index.html) so Apache-style hosts serve them
  // without rewrite rules.
  trailingSlash: true,
  // The Next image optimizer needs a server; images are pre-optimized WebP.
  images: { unoptimized: true },
};

export default nextConfig;
