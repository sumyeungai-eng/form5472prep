# 2026-09-29 — Follow-ups: older tools upgraded, blog BOI facts, Search Console

## Ownership
- `feat/older-tools` (worktree `~/Developer/f5472-wt/older-tools`, opus lane) → main: the three
  older tools (`do-i-need-to-file-form-5472`, `form-5472-deadline-calculator`,
  `form-5472-penalty-calculator`) + `src/lib/tools/{filing-checker,deadline,penalty}/**` +
  `docs/research/{filing-checker,deadline-calculator,penalty-calculator}.md`.
  (`checkerTree.ts` moved to `src/lib/tools/filing-checker/tree.ts`.)
- `feat/blog-facts` (sonnet lane) → main as b877313: six `content/blog/*.md` posts now cite FinCEN's
  final rule (issued 11 Aug 2026, effective 14 Aug 2026) making the US-company BOI exemption
  permanent. Delaware $400 was already correct everywhere.

## What shipped
- Shareable result URLs on all three older tools (history.replaceState, same as the new tools),
  "How we calculate / How we decide" sections with primary sources + "Last reviewed 29 September 2026",
  JSON-LD citation/lastReviewed. Claims softened to match sources (CP15 → CP 215, "effectively no
  statute of limitations" → §6501(c)(8) wording, DIIRSP described with its conditions, deadline
  roll rule = weekend or DC legal holiday → next business day).
- Evidence: vitest 1215/1215, tsc 0, eslint 0, production build 0; lane browser-checked 375px +
  desktop on the prod build.

## Open (owner-gated)
- Deadline calculator: for a short year ending in JUNE of a tax year beginning before 2026, the Form
  1120 instructions' June-30 rule gives the 15th day of the 3rd month; shared `deadline` code uses the
  4th month. Now shows a warning on that result instead of changing the shared date code — decide
  whether the June rule applies to a pro forma 1120 short year (only affects already-past 2025-and-
  earlier dissolutions). The compliance calendar already applies the June-30 FYE rule.
- Google Search Console: request indexing for the new tool URLs (Chrome extension blocked
  search.google.com for the agent: "could not verify this site's safety category").
