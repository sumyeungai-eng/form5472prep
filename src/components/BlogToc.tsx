type BlogTocProps = {
  headings: { text: string; id: string }[];
};

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
