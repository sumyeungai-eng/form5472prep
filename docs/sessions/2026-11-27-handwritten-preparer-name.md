# 2026-11-27: Handwritten preparer name on the admin place-signature page

**Owner request:** "one more box … preparer write his name instead of typing". The preparer's name on the pro forma 1120 "Paid Preparer Use Only" block is now handwritten (drawn), like the preparer signature, which already existed (2026-10-08, `748da38`).

## Ownership
| Worktree | Branch | State |
|---|---|---|
| `~/Developer/f5472-wt/prep-name` | `feat/handwritten-preparer-name` | merged to main |

The main checkout `~/Documents/Claude work/form5472` belongs to another session and was not touched.

## What shipped (`a581b2f`…`45bb74d`)
**Place-signature page**
- New placement kind `preparerName`: a "Preparer name" toolbar button with its own drawing pad (green box, default 200×32).
- The name can be remembered on the admin's own account via `Admin.preparerNameKey`, added by migration `20261127120000_admin_preparer_name`, which only adds a nullable column. Shared-password sessions can draw a name but cannot save or reuse one.
- The saved name is fetched or deleted through `GET/DELETE /api/admin/preparer-signature?kind=name`. An unknown `kind` returns 400; a missing blob returns 404.

**Image handling**
- The three images (client signature, preparer signature, preparer name) are never interchangeable.
- All three are fully pixel-decoded before stamping, so a truncated PNG returns 400.

**Save warning**
- Saving a preparer signature without a name shows a warn-only confirm. It does not block.

**Generator 2.5.2**
- In house mode, the 1120 "Print/type preparer's name" is left blank in every year map. PTIN, firm, address and EIN stay typed.
- Preflight A35 now expects that field to be blank. `HOUSE_PREPARER_NAME` is unchanged for email and partner uses.

**Legacy guard**
- The guard judges the exact PDF being stamped (`generatedPdfKey` bytes, version read from the Producer/Creator/Keywords metadata):
  - known version below 2.5.2: 409, and the button is disabled ("still has the typed preparer name");
  - version 2.5.2 or later: allowed;
  - unknown version (e.g. a reviewed PDF edited elsewhere): allowed, with a warning to check that the line is empty.

**Verification**
- Full vitest: 5215 passed. `tsc` clean. `next build` exit 0.
- Two independent reviews (Codex + Opus) over three rounds. Final verdict from both: SHIP.

## Contracts
- Never type the house preparer name into the 1120 again. It is handwritten at place-signature (`docs/filing-package-rules.md`).
- The image kinds are never interchangeable. Each placement kind uses only its own image.
- The version guard must read the PDF actually being stamped, not `Filing.generatorVersion` (reviewed uploads change the PDF without changing that field).

## Open
**Owner:**
- Packages generated before 2.5.2 keep the typed name. To handwrite on one, press **Regenerate PDF** first, if its status allows.

**Follow-ups (P3 from the reviews):**
- PDFs from before about version 2.3 that also lost their metadata show as "unknown" (warning only).
- The page now loads the PDF server-side, so a missing PDF blob shows an error page instead of a notice.
- The customer sign route has no upper size limit on its PNG.
- The audit item "admin place-signature has no status/hash guard" (2026-11-26 report, P3-18) is still open.

## Lane notes
- Codex sandbox: `prisma generate` and `tsc` fail with EPERM on the symlinked `node_modules`, so the wrapper ran them.
- Capture `next build`'s exit code explicitly. A background run lost it once.
