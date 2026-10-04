import { SITE_URL } from "@/lib/seo";
import { EmbedSnippetBox } from "./EmbedSnippetBox";

// "Embed this calculator" block for the free-tool pages. The snippet carries a
// visible attribution link back to the tool page (the point of the widget).
export function EmbedThisCalculator({
  embedPath,
  toolPath,
  title,
  linkText,
  height,
}: {
  embedPath: string;
  toolPath: string;
  title: string;
  linkText: string;
  height: number;
}) {
  const snippet =
    `<iframe src="${SITE_URL}${embedPath}" width="100%" height="${height}" ` +
    `style="border:0;max-width:640px" title="${title}" loading="lazy"></iframe>\n` +
    `<p style="font-size:13px"><a href="${SITE_URL}${toolPath}">${linkText}</a> by Form5472 Prep</p>`;

  return (
    <section
      aria-labelledby="embed-heading"
      className="border-b border-slate-100 bg-white py-12"
    >
      <div className="mx-auto max-w-3xl px-6">
        <h2
          id="embed-heading"
          className="font-serif text-2xl font-semibold text-ink sm:text-3xl"
        >
          Embed this calculator on your site
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Free to use on your blog, firm site or formation-service page. Paste the code below
          where you want the calculator to appear; the link back to this page stays with it.
        </p>
        <div className="mt-5">
          <EmbedSnippetBox text={snippet} />
        </div>
      </div>
    </section>
  );
}
