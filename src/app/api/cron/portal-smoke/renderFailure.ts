export function renderFailureReason(html: string): string | null {
  if (html.includes("__next_error__")) return "__next_error__";
  if (/:E\{/.test(html)) return "rsc-error";
  // Match HTML attributes, not marker properties in serialized RSC JSON.
  if (html.includes('data-smoke="filing-locked"')) return "filing-locked";
  if (html.includes('data-smoke="app-error"')) return "app-error";
  if (!html.includes("</html>")) return "truncated";
  return null;
}
