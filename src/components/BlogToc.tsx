import GithubSlugger from "github-slugger";

type BlogTocProps = {
  headings: { text: string; id: string }[];
};

export function extractH2Headings(body: string): { text: string; id: string }[] {
  const slugger = new GithubSlugger();
  const headings: { text: string; id: string }[] = [];
  let inFence = false;

  for (const line of body.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) continue;

    const level = match[1];
    const markdownText = match[2].replace(/\s+#+\s*$/, "").trim();
    const text = markdownText
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/[*_~`]/g, "")
      .trim();
    const id = slugger.slug(text);

    if (level === "##") {
      headings.push({ text, id });
    }
  }

  return headings;
}

export function BlogToc({ headings }: BlogTocProps) {
  if (headings.length < 3) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="mb-8 rounded-lg border border-slate-200 bg-slate-50 p-5"
    >
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-slate-500">
        In this guide
      </p>
      <ol className="mt-3 space-y-1.5 text-sm">
        {headings.map((heading, index) => (
          <li key={heading.id} className="flex gap-2">
            <span className="w-5 shrink-0 text-right tabular-nums text-slate-400">
              {index + 1}.
            </span>
            <a
              href={`#${heading.id}`}
              className="text-slate-700 hover:text-accent hover:underline"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
