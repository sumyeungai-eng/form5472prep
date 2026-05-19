// Server component that emits a JSON-LD <script> tag. Schema.org structured
// data is consumed by Google, Bing, and the answer-engine crawlers (Perplexity,
// ChatGPT search, etc.) to populate rich results and direct-answer features.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // dangerouslySetInnerHTML is the standard pattern for JSON-LD: Next won't
      // re-render this block and the JSON is server-generated, so injection risk
      // is bounded by what we pass in (which is hard-coded site data).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
