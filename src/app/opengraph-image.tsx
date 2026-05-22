import { ImageResponse } from "next/og";

// Social-card OG image. Rendered at the edge with Satori — which supports
// SVG <path> but NOT SVG <text>, so the "5472" label is overlaid as HTML.

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(180deg, #eff3fb 0%, #ffffff 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Document mark — SVG path for shape, HTML overlay for "5472" */}
          <div
            style={{
              position: "relative",
              width: 80,
              height: 80,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: 14,
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 64 64"
              style={{ position: "absolute", inset: 0 }}
            >
              <path d="M10 6 H42 L58 22 V58 H10 Z" fill="#1e3a8a" />
              <path
                d="M42 6 V22 H58"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinejoin="round"
                opacity="0.55"
              />
            </svg>
            <span
              style={{
                position: "relative",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: 20,
                letterSpacing: 0.5,
              }}
            >
              5472
            </span>
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            <span style={{ color: "#0f172a" }}>Form</span>
            <span style={{ color: "#1e3a8a" }}>5472</span>
            <span style={{ color: "#0f172a" }}> Prep</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            marginTop: 64,
            fontSize: 72,
            fontWeight: 600,
            color: "#0f172a",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>File IRS Form 5472</span>
          <span>and pro forma Form 1120</span>
          <span style={{ color: "#1e3a8a" }}>in 15 minutes.</span>
        </div>

        {/* Subline */}
        <div
          style={{
            marginTop: 32,
            fontSize: 28,
            color: "#475569",
            display: "flex",
          }}
        >
          From $79 plus a flat $19 · We fax to the IRS · 100% money-back guarantee
        </div>
      </div>
    ),
    { ...size },
  );
}
