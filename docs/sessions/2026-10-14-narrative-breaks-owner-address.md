# 2026-10-14 — Admin narrative paragraph breaks + editable owner address

Follow-up to `2026-10-14-preflight-generator-spec.md`, found while entering a live late order's data from the owner's corrected PDF.

## Ownership
Worktree `~/Developer/f5472-wt/a26-fix` (branch `fix/a26-newline-address` from origin/main), pushed to `main`. Touched: `src/lib/admin/filingActions.ts` (+ test), `src/app/admin/filings/[id]/{page.tsx,EditFieldsCard.tsx}`, `src/lib/pdf/generatePackage.test.ts`.

## What shipped
- `rcsAdminNarrative` saves with line breaks: CR/CRLF → LF, line breaks exempt from the WinAnsi check (generator `narrativeParagraphs` splits on blank lines; no raw newline reaches pdf-lib). Before: any multi-paragraph narrative was rejected with "Use English letters only".
- Structured owner address (`ownerAddressStreet/City/State/Postal/Country`) admin-editable. Form 5472 line 4a prints the structured address when present, so pre-flight W39 "correct it by hand" was impossible before.
- Evidence: new tests (paragraph breaks kept, non-encodable still rejected, street editable, two-paragraph narrative renders + passes A26/A32/A33); 576 admin/pdf/admin-UI tests pass; tsc 0; eslint 0; next build 0; Codex "ship it".

## Contracts
- A26 is intentionally strict per the spec ("does not support OR contradicts"): e.g. "no business activity" in a narrative fails even with Part V costs, because no order field supports it. Escape hatch = "Approve despite pre-flight failures" with a reason, or reword. Not weakened.
- Editing structured address parts does not rewrite the single-line `ownerAddress` (fallback only).

## Open
- Owner-gated: whether to override A26 on the live order or reword its narrative.

## Addendum — override button hint
- Owner reported "Approve despite pre-flight failures doesn't work": the button is disabled until the reason has ≥10 non-space characters and nothing said so. `AdminActions.tsx` now shows "Type a reason above to enable this button (N more characters needed)." (+ test). Agents may type the reason but the approval click is the owner's (auto-mode classifier blocks it).
