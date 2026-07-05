import { ImageResponse } from "next/og";
import { getPost, formatPostDate } from "@/lib/blog";

// Per-post social card. Renders the post title in the brand's navy "filing
// house" style so every shared blog link gets a specific preview instead of the
// generic site card. nodejs runtime because it reads the post from the filesystem.
export const runtime = "nodejs";
export const alt = "Form5472 Prep — guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  const title = post?.title ?? "Form5472 Prep — Guides";
  const dateLine = post
    ? `Updated ${formatPostDate(post.updated ?? post.date)}`
    : "Guides for foreign-owned US LLCs";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#0e1b33",
          backgroundImage:
            "radial-gradient(60% 55% at 20% 0%, rgba(30,58,138,0.55) 0%, rgba(14,27,51,0) 70%)",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              backgroundColor: "#1e3a8a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 18,
              fontWeight: 800,
              fontFamily: "monospace",
            }}
          >
            5472
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#ffffff" }}>
            <span>Form</span>
            <span style={{ color: "#dbe4f5" }}>5472</span>
            <span>&nbsp;Prep</span>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: title.length > 60 ? 52 : 62,
            fontWeight: 600,
            lineHeight: 1.12,
            color: "#ffffff",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        {/* Footer meta line, monospace = "document" accent */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: "monospace",
            fontSize: 22,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          <span>form5472prep.com</span>
          <span>·</span>
          <span>{dateLine}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
