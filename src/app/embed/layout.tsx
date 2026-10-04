import type { Metadata } from "next";

// Minimal-chrome shell for the iframe-embeddable tools. Nested inside the root
// layout (an App Router layout cannot opt out of its parent), so the root's
// floating widgets are hidden with CSS below. `body > .fixed` matches exactly
// the root-level floating UI — the "Ask a question" chat button and the
// Meta-cookie consent banner — neither of which belongs inside a third-party
// page. The consent banner staying hidden also means `consent` is never
// granted here, so the Meta Pixel never initialises inside an embed.
export const metadata: Metadata = {
  // Never an index target (the canonical tool page is); `follow` so the
  // powered-by link still passes value when crawlers do fetch the frame.
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* dangerouslySetInnerHTML: React escapes ">" in a <style> child to "&gt;",
          which would break the child combinator. Static literal, no user input. */}
      <style dangerouslySetInnerHTML={{ __html: "body > .fixed { display: none !important; }" }} />
      {children}
    </>
  );
}
