# Session log — 2026-09-01 → 2026-09-06: premium redesign, bilingual copy audit, calculation review

Written 2026-09-06 (late — should have been written before the final message of each work
session; see lessons). Repo is shared with a concurrent blog/EIN workstream that cannot see
this session's context. READ THE OWNERSHIP SECTION BEFORE TOUCHING THE CHECKOUT.

## Ownership — who owns which files and which checkout

| Owner | Branch | Files |
|---|---|---|
| hktax website (this log) | `claude/hk-tax-filing-website-m97q8g` | `hktax/**` only |
| form5472 / blog / EIN workstream | `main` | repo-root `src/`, `public/email/`, `docs/plans/`, root `CLAUDE.md`, everything outside `hktax/` |

**`hktax/` does not exist on `main`.** The other workstream keeps the shared checkout on
`main` and has switched it back there at least twice while hktax work was in flight (reflog
2026-09-03/04). Rules for any future hktax session:

1. **Never `git checkout` in the shared checkout at `~/Documents/Codex/form5472`.** Use
   `git worktree add <dir> claude/hk-tax-filing-website-m97q8g`, work there, push, then
   `git worktree remove <dir>`. This log was committed exactly that way.
2. The feature branch's tip may carry the other workstream's commits (e.g. `94263a0` "Blog:
   5 EIN guides") layered on top of hktax commits. That is expected; do not rebase them away.
3. `main` may hold their unpushed commits (e.g. `123fb74`). Not ours; never push `main`.
4. Untracked files at the repo root (`public/email/*`, `docs/plans/*`, loose PNGs) are theirs.
   Report, never touch, never `git add -A`.

## What shipped (hktax, commit range 7020df3 → 541ac17)

| Commit | What | Verified by |
|---|---|---|
| 7020df3 | 12 tax-saving hints in the wizard, inline explainers | 178 tests, browser |
| a10536c | motion layer; CountUp that cannot show a wrong number (HK$0 bug) | Lighthouse perf 98, CLS 0 |
| 531aa29 | mobile optimisation (header 271→65px, 16px inputs, 44px targets) | measured at 375×812 |
| a6752e2 | 新增 button / explainer overlap | browser |
| dfc534f, edac04e | contact + private feedback form (PHP mail), updates & articles section | local PHP 8.4 runs |
| 833ecea | 合作／業務洽談 subject; **fixed mail() 500-ing every valid submission** (list headers → assoc) | local PHP: ok:true, injection test clean |
| 0207711 | design foundation: Inter via next/font (self-hosted, no runtime fetch), tokens, editorial hero | real static build; Lighthouse home 96/100/CLS 0 |
| 99bbc2c, a4ce2f0 | design language propagated to wizard/results/calculators and guides/posts/contact | guide page Lighthouse 99/100/CLS 0 |
| 3f4918b | 兩房酒店 mistranslation + accommodation block terminology; id-as-label bug in defaultItems | browser, 375px wrap check |
| 541ac17 | site-wide bilingual copy audit (29 files, 360 lines, copy only) | set-diff proves no number/ref/{token} changed; golden suite green |

All: `npx tsc --noEmit && npm run lint && npm run test` → 178 passed; `npm run build` succeeds.

**NOT DEPLOYED.** Everything from 0207711 onward is on the branch but not on
https://red-eland-359073.hostingersite.com — the Hostinger session expired at the upload step
and credentials are the owner's to enter. Live site is still the pre-redesign build with the
broken mail() handler (833ecea IS deployed; the redesign and copy fixes are not). Rebuild before
deploying: `NEXT_PUBLIC_SITE_URL=https://red-eland-359073.hostingersite.com npm run build`,
zip `out/`, hPanel File Manager → upload via hidden file input → Extract, folder name
`public_html`, destination navigated up to `/files/`, Overwrite ticked.

## Contracts a future editor must respect

- **contact-handler.php**: `RECIPIENT` is never echoed; user text never enters a mail header;
  headers MUST be an associative array (a list throws "Header name cannot be numeric" on PHP 8
  and 500s every valid submission — shipped that way once). Subject `value`s are a server-side
  allow-list mirrored in `src/lib/contact/contactDictionary.ts` — add a subject in BOTH places
  or every submission with it fails as `invalid`. `FROM_ADDRESS` must be a real host domain (SPF).
- **CJK typography**: never apply `tracking-*` / letter-spacing to Chinese. Eyebrow tracking is
  gated `lang === "en" ? "tracking-[…] uppercase" : ""`. Headings are forced `letter-spacing:
  normal` in globals.css. Inter carries Latin, Noto Sans TC carries CJK via the font stack.
- **Locked terms**: `納稅人甲/乙` (Person A/B) recur across many files — change everywhere or
  nowhere. Terminology anchors now in code: 聚合組 (NOT 聚合組別 — IRD DIPN 7), 遞減價值,
  每年免稅額, 有關連實體, 同意釋款書 (IR607), 整筆款項, 支出及開支, 應評稅利潤, 未抵銷,
  有關 not 相關, 合併評稅, 法定修葺及支出免稅額, 附頁 (not 附加頁), 稅務局 (never 稅局),
  個別人士報稅表, 股份認購權. Employer accommodation: 居所類型 / 酒店／旅舍（兩個房間）/
  （一個房間） / 未計居所租值的僱主入息 / 與受僱工作有關的開支 / 選用應課差餉租值（如較低）.
- **BIR60 replica** (`src/lib/bir60/structure.ts`, `src/components/bir60/**`): labels reproduce
  official BIR60 wording — do not "improve" them. Box 7 zh/en asymmetry (zh asks for English
  form, en asks for Chinese) is CORRECT: two monolingual forms each offering the other. IRD
  logo/barcode/TIN stay grey placeholders. Not-for-submission banners stay.
- **`{token}` placeholders** in guides/deductions/posts interpolate live tax parameters. Never
  alter, never hardcode the figure beside them.
- **defaultItems.ts**: every money-item prefix needs a zh AND en default label; never use the
  key as a label (that put "accommodation-1" in front of filers).
- **IRO s.41(4)** temporary resident = MORE THAN 180 days / more than 300 across two years.
  The wizard wording is correct; a review lane wrongly claimed "not less than". Do not change.
- **Hostinger**: WAF returns random 403s / "Bot Verification" to automated probing. Verify
  deploys with one real browser pass; never bypass the challenge; scripted curl sweeps are
  unreliable on this host.

## Open — owner-gated decisions (do not act without the owner)

1. Deploy (needs Hostinger login) — see above.
2. `慳稅` register (慳稅檢查, 慳稅建議, posts): authentic HK usage but informal for compliance
   copy; site-wide or nothing.
3. Home hero headline is now 輕鬆算清你的香港稅款 (個人稅 is not a HK tax); owner sign-off.
4. `額外賞賜` (statutory "perquisite") reads archaic; 非現金利益 is the alternative.
5. 項目代碼 / 中文名稱 / 英文名稱 fields are developer plumbing exposed to taxpayers.
6. Codex calculation review (docs/reviews/2026-09-04-codex-calculation-review.md): 14
   unadjudicated findings, several plausibly real money. Owner decides whether to fund the
   verification + fix wave.

## Open — follow-ups (no decision needed, just work)

- Verify against statute, then fix if real: MPF autofill below HK$7,100; elderly-care cap per
  dependant (s.26D); joint-assessment donations cap (DIPN 37); PA permanent-resident route
  (DIPN 18, lapsed after 2017/18?); parent age from birth year vs 31 March; PA single-parent
  allowance without a child; lease-premium spreading ≤1-year leases; holdover grounds per tax
  head; per-business rounding.
- Nested `<main>` landmarks: 14 pages wrap `<main>` inside layout's `<main>`.
- Send one live test message from /contact — shared-host mail() to Gmail is unverified.
- salaries-tax guide simplifies the s.9(2) base (pre-existing); structure.ts:251 PA election
  wording unverified against the form.

## Lane notes

- codex/grok implementer lanes verify analytically only — they cannot use a browser. Every
  visual/runtime defect this session (HK$0 CountUp, mobile truncation, button overlap, 403s)
  was caught by the architect in a real browser. Budget that.
- One codex lane strayed into the other lane's `guides/**` files mid-wave despite an explicit
  exclusion; contained by committing only uncontended files and letting the owner-lane win.
- Three Claude (opus) audit lanes on disjoint file sets for Chinese copy worked well; one
  self-caught four wrong "corrections" against BIR60 specimens. Chinese-language judgment was
  deliberately routed to Claude rather than codex/grok.
- Codex adversarial calculation review: 17 findings; 3 judged false/known by the architect
  (corporate 8.25/16.5 rates = the architect's own prompt error, site is individuals-only;
  cross-trade loss set-off contradicts IRO s.19C(1) primary-source check; provisional-tax
  allowances = documented v1 limitation, golden G24). Remaining 14 unverified.
