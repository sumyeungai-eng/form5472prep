import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { parseLandingBody } from "@/lib/landing-body";

// Renders the small markup used in src/lib/services-pages.ts: blocks from
// parseLandingBody (paragraphs, "- " bullets, "1. " steps) plus inline
// **bold** and [label](/internal-path) links. Server component, no client JS.

const INLINE_RE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((\/[^)\s]*)\)/g;

type Tone = "light" | "dark";

function renderInline(text: string, tone: Tone, keyPrefix: string): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${match.index}`;
    if (match[1] !== undefined) {
      parts.push(
        <strong key={key} className={tone === "dark" ? "font-semibold text-white" : "font-semibold text-ink"}>
          {match[1]}
        </strong>,
      );
    } else {
      parts.push(
        <Link
          key={key}
          href={match[3]}
          className={
            tone === "dark"
              ? "font-medium text-accent-100 underline underline-offset-2 hover:text-white"
              : "font-medium text-accent hover:underline"
          }
        >
          {match[2]}
        </Link>,
      );
    }
    last = match.index + match[0].length;
  }
  if (parts.length === 0) return text;
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function ServiceRichText({
  body,
  tone = "light",
  firstParagraphClassName,
}: {
  body: string;
  tone?: Tone;
  /** Extra class on the first paragraph (e.g. "lead" for Speakable). */
  firstParagraphClassName?: string;
}) {
  return (
    <>
      {parseLandingBody(body).map((block, i) => {
        if (block.type === "p") {
          return (
            <p key={i} className={i === 0 ? firstParagraphClassName : undefined}>
              {block.text.split("\n").map((line, j) => (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  {renderInline(line, tone, `${i}-${j}`)}
                </Fragment>
              ))}
            </p>
          );
        }
        const ListTag = block.type === "ol" ? "ol" : "ul";
        return (
          <ListTag
            key={i}
            className={`${block.type === "ol" ? "list-decimal" : "list-disc"} space-y-2 pl-5 marker:text-slate-400`}
          >
            {block.items.map((item, j) => (
              <li key={j} className="pl-1">
                {renderInline(item, tone, `${i}-${j}`)}
              </li>
            ))}
          </ListTag>
        );
      })}
    </>
  );
}
