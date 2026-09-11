# AEO baseline audit — question-form headings & HowTo candidates
Date: 2026-09-11 · Scope: read-only audit ahead of a content rewrite wave.

Two note-worthy corrections to the brief before the data:
- `src/lib/landing-pages.ts` has **27** entries, not 28 (verified by counting `slug:` keys).
- `content/blog/*.md` has **129** files, not 110.
- Part C.1 assumption "expect none" is **wrong** — HowTo JSON-LD already exists in two places (see Part C.1).

---

## Part A.1 — Marketing page headings (`src/app/(marketing)/*/page.tsx`)

Method: every literal `<h2>`/`<h3>` in JSX, plus `title:`/`heading:`/`q:` values from arrays that render inside an `<h2>`/`<h3>` in that same file. FAQ blocks that render as `<details><summary>` or `<dt>` (pricing, do-i-need, deadline-calculator, penalty-calculator, contact, form-5472-filing) are **not** headings and are excluded. FAQ blocks that render as literal `<h3>{q}</h3>` (ein, itin, partners) **are** included, per the "parse actual DOM h2/h3" instruction.

| Page | Total h2+h3 | Question | % | Statement headings (verbatim) |
|---|---|---|---|---|
| `/` (home) | 22 | 4 | 18.2% | EIN and ITIN, handled too. · Six steps. About fifteen minutes. · A complete, IRS-ready package. · Why not a CPA, why not DIY. · Free tools and guides · Common questions. · Stop worrying about the $25,000 penalty. · Enter your LLC info · Enter your owner info · Add your numbers · We generate the package · You sign it · We fax to the IRS · Deadline calculator · Penalty calculator · You own a US LLC · You're not a US person · You moved money in or out |
| `/ein` | 25 | 18 | 72.0% | How it works · The IRS online EIN tool is closed to foreign founders · Frequently asked questions · Complete the intake form · We prepare your Form SS-4 · We contact the IRS · EIN delivered to you |
| `/itin` | 17 | 9 | 52.9% | How it works · Choose the document route that fits your case · Frequently asked questions · Get help with your ITIN application · Eligibility check · CAA document review · Package preparation · IRS processing |
| `/pricing` | 6 | 1 | 16.7% | Pricing FAQ · EIN for your LLC · ITIN for yourself · Standard filing · Express filing |
| `/about` | 8 | 1 | 12.5% | Why we built this · Four steps, about fifteen minutes of your time · What we are — and what we're not · You complete the intake · We prepare the package · Review and resolve signing · We fax and document transmission |
| `/form-5472-filing` | 20 | **0** | **0.0%** | Complete filing, one flat price · What your $149 includes · Choose your turnaround · per form, per year under IRC § 6038A · From your answers to the IRS in four steps · Foreign owners, late filers, and the advisers helping them · Common filing questions · Start your Form 5472 filing — $149. · Nothing to assemble yourself · Reviewed by a qualified tax accountant · Proof of filing, stored for you · Standard filing · Express filing · Answer 12 questions · Accountant review · Sign once on screen · We fax and store proof · Never filed · Filed 5472 without the pro forma 1120 · Filed, but incomplete |
| `/do-i-need-to-file-form-5472` | 3 | 1 | 33.3% | Form 5472 depends on ownership, tax classification, and transactions. · Frequently asked questions |
| `/form-5472-deadline-calculator` | 7 | **0** | **0.0%** | One rule, adjusted for timing facts · Deadline questions · File Form 5472 with the deadline handled. · April 15 rule · Weekend roll · Dissolution short year · Form 7004 extension |
| `/form-5472-penalty-calculator` | 7 | 1 | 14.3% | The rule is mechanical, but the response should be measured. · Frequently asked questions · Initial penalty · After a notice · Common triggers · Relief path |
| `/contact` | 5 | 2 | 40.0% | Send us a question · What we can help with · Common questions |
| `/partners` | 13 | 7 | 53.8% | How the partner flow works · Partner FAQ · Get approved · Prepare client filings · Client signs via link · Track everything in one place |
| `/blog` (index, static headings only — post-title h2/h3 cards excluded to avoid double-counting Part A.3) | 2 | 0 | 0.0% | More practical guides · Turn what you learned into a complete filing package. |
| **Content-page subtotal (12 pages)** | **135** | **44** | **32.6%** | **91 statement headings** |
| Legal/utility pages (privacy, terms, security, data-retention, editorial-policy) — numbered legal sections, out of AEO rewrite scope | 49 | 0 | 0.0% | all 49 (numbered legal clauses) |
| `/sign-in`, `/start` | 0 | — | — | no h2/h3 (forms only) |
| **All marketing page.tsx combined** | **184** | **44** | **23.9%** | **140** |

---

## Part A.2 — Landing pages (`src/lib/landing-pages.ts`, 27 entries, rendered by `src/app/(marketing)/[seoSlug]/page.tsx`)

`page.sections[].heading` → real `<h2 id="step-N">` (page.tsx:238). `page.faqs[].q` → `<dt>`, **not** a heading — counted separately below.

| Slug | Sections | Question | % | Statement section headings |
|---|---|---|---|---|
| file-form-5472 | 10 | 9 | 90% | Skip the work — file in 15 minutes |
| form-5472-penalty | 10 | 8 | 80% | We handle the whole DIIRSP process · Bottom line |
| diirsp | 10 | 9 | 90% | Catch up with our accountant-reviewed DIIRSP filer |
| form-5472-instructions | 10 | 2 | 20% | Top of the form — header items · Part I — Reporting Corporation · Part II — 25% Foreign Shareholder · Part III — Related Party · Part IV — Monetary Transactions Between Reporting Corporation and Foreign Related Party · Part V — Reportable Transactions of a Reporting Corporation That Is a Foreign-Owned U.S. DE · Part VII — Additional Information for FDE · Signing the form |
| late-form-5472 | 10 | 9 | 90% | Get caught up in 15 minutes |
| form-5472-vs-1120 | 10 | 8 | 80% | What's NOT involved · Pricing |
| wyoming-llc-form-5472 | 10 | 8 | 80% | Wyoming registered agent address — what to use · Bottom line for Wyoming LLC owners |
| delaware-llc-form-5472 | 10 | 8 | 80% | Stripe Atlas + Mercury + Form 5472 — the typical stack · Bottom line for Delaware LLC owners |
| form-5472-germany | 8 | 7 | 88% | Bottom line for German-resident LLC owners |
| form-5472-uae | 8 | 6 | 75% | UAE Corporate Tax — a separate question from Form 5472 · Bottom line for UAE-resident LLC owners |
| pro-forma-1120 | 10 | 9 | 90% | Use our pre-filled pro forma 1120 |
| form-1120-foreign-owned-llc | 10 | 9 | 90% | Get it done in 15 minutes |
| form-1120-disregarded-entity | 10 | 9 | 90% | Skip the paperwork — 15-minute filing |
| 1120-pro-forma-instructions | 10 | 9 | 90% | Use our pre-filled pro forma 1120 |
| irs-form-5472 | 10 | 7 | 70% | What's in the filing package · DIIRSP — catching up if you've missed prior years · Pricing |
| form-5472-deadline | 10 | 9 | 90% | Missed the deadline? Use DIIRSP |
| form-5472-fax-number | 10 | 7 | 70% | IRS fax delivery — included in every plan · Common fax mistakes to avoid · Your annual fax routine |
| single-member-llc-foreign-owner | 10 | 7 | 70% | What's in the federal filing package · Common scenarios we don't cover · The fastest way to file |
| stripe-atlas-form-5472 | 10 | 5 | 50% | The Stripe Atlas typical compliance stack · Common Stripe Atlas LLC scenarios · The Stripe Atlas + Mercury banking dimension · Common Stripe Atlas + Form 5472 mistakes · Bottom line for Stripe Atlas LLC owners |
| form-5472-reasonable-cause-statement | 10 | 7 | 70% | Common reasonable cause narratives that work · Pricing for catch-up filings · Bottom line |
| pro-form-5472 | 8 | 3 | 38% | What's included on either tier · The $25,000 reason to get this right · Pricing · Confidentiality and data handling · Get started |
| doola-form-5472 | 6 | 3 | 50% | doola's bundle includes it, but only at the tax-plan level · Your first-year timeline · Multi-year catch-up |
| firstbase-form-5472 | 6 | 3 | 50% | Firstbase One covers one 5472 inside a larger bundle · Your first-year timeline · Multi-year catch-up |
| clemta-form-5472 | 6 | 3 | 50% | Clemta's public pages do not itemize the 5472 package · Your first-year timeline · Multi-year catch-up |
| startglobal-form-5472 | 6 | 3 | 50% | StartGlobal names Federal Tax Filing, not Form 5472 · Your first-year timeline · Multi-year catch-up |
| zenind-form-5472 | 6 | 3 | 50% | Zenind teaches the process but does not file it · Your first-year timeline · Multi-year catch-up |
| northwest-registered-agent-form-5472 | 6 | 3 | 50% | Northwest points readers to a CPA instead of filing it · Your first-year timeline · Multi-year catch-up |
| **TOTAL (27 pages)** | **240** | **173** | **72.1%** | **67 statement headings** |

FAQ questions on landing pages (rendered as `<dt>`, not a heading): **230** across 27 pages, all question-form by construction (100%).

---

## Part A.3 — Blog (`content/blog/*.md`, 129 files)

`## ` / `### ` lines counted (excluding fenced code blocks). Classification: QUESTION = ends with `?` or first word ∈ {What, Why, How, When, Which, Who, Do, Does, Is, Can, Should}.

**Aggregate: 1,685 headings, 1,300 question-form → 77.2%.** (385 statement headings — mostly boilerplate like "Frequently asked questions", "Bottom line", partner-program section titles.)

**15 posts with the lowest question share:**

| Slug | Total | Question | % |
|---|---|---|---|
| form-5472-partner-program-registered-agents | 8 | 0 | 0.0% |
| form-5472-partner-program-company-formation-agents | 6 | 1 | 16.7% |
| form-5472-partner-program-how-it-works | 6 | 1 | 16.7% |
| form-5472-white-label-vs-standard-partner | 6 | 1 | 16.7% |
| white-label-form-5472-filing-accounting-firms | 11 | 2 | 18.2% |
| new-ein-llc-ownership-structure-change | 12 | 3 | 25.0% |
| ein-application-checklist-foreign-owned-llc | 6 | 2 | 33.3% |
| oregon-llc-foreign-owner-tax-filing | 11 | 4 | 36.4% |
| washington-llc-foreign-owner-tax-filing | 11 | 4 | 36.4% |
| itin-name-change-marriage-passport | 8 | 3 | 37.5% |
| itin-nonresident-spouse-joint-return-w7 | 8 | 3 | 37.5% |
| form-5472-noncash-property-transfers | 10 | 4 | 40.0% |
| itin-application-checklist-nonresidents | 5 | 2 | 40.0% |
| form-5472-reasonable-estimates-small-amounts | 12 | 5 | 41.7% |
| ein-responsible-party-foreign-owned-llc | 7 | 3 | 42.9% |

**Blog ownership (who owns this content right now):**
- `git log --since=2026-09-08 --name-only --pretty=format:%h -- content/blog | sort -u | wc -l` → **38** (unique commit-hash + touched-file lines since 2026-09-08 — the corpus is actively being edited this week).
- Last 3 commits touching `content/blog`: `947c667` "Refresh filing guidance and publish four specialist blog articles" · `6b32a6e` "Publish five evidence-led Form 5472 filing guides" · `aa9c996` "content: publish five overlooked Form 5472 and ITIN guides" — all 3 by **sumyeungai-eng**, all dated 2026-09-11 (today).
- Last 3 commits touching `src/app/(marketing)/blog/[slug]/page.tsx`: `40d2566` "Keep blog comparison tables readable within mobile screens" (2026-09-11) · `0ae617a` "Blog audit fixes: unpublished-link guard, dead citations, metadata rewrites" (2026-08-19) · `8facd95` "Publish 15 GEO-optimized Form 5472 guides" (2026-08-19) — also all by **sumyeungai-eng**.
- **One person (sumyeungai-eng) currently owns both the blog content and the blog template** — no separate content/engineering ownership split to coordinate with.

---

## Part A.4 — `/faq` (`src/lib/faq.ts`)

51 `question:` entries, all end in "?" — **100% question-form, confirmed** (`grep -c "question:" src/lib/faq.ts` = 52 incl. the type declaration; 51 real entries; zero non-`?`-terminated found programmatically).

---

## Part B — Direct-answer-first sample (10 QUESTION headings, landing + marketing)

| # | Source | Heading | First sentence under it | Verdict |
|---|---|---|---|---|
| 1 | landing:file-form-5472 | Who has to file Form 5472? | "You must file Form 5472 if all three are true:" (leads into the 3-item list) | **YES** |
| 2 | landing:file-form-5472 | What forms do you actually file? | "Form 5472 by itself is not enough." | **NO** — preamble, doesn't name the forms yet |
| 3 | landing:form-5472-penalty | How is the penalty calculated? | "$25,000 per Form 5472, per tax year." | **YES** — number, immediate |
| 4 | landing:form-5472-penalty | What is the continuation penalty? | "If you receive an IRS notice... an additional $25,000 penalty is assessed for each 30-day period..." | **YES** |
| 5 | landing:diirsp | What is DIIRSP, really? | "DIIRSP ... is an IRS-published voluntary disclosure path specifically for international information returns..." | **YES** — definition |
| 6 | landing:form-5472-instructions | What do you need to gather before you start? | "Gather these before you open Form 5472:" (leads into a bullet list) | **NO** — restates the question, no content yet |
| 7 | landing:pro-forma-1120 | What does 'pro forma' mean here? | "Pro forma means \"as a matter of form\" — you file the form for procedural compliance, not to calculate tax." | **YES** — definition |
| 8 | landing:pro-forma-1120 | Which fields do you fill in on the pro forma 1120? | "The special IRS Form 5472 instructions require only the foreign-owned U.S. [DE fields]..." | **NO** — cites the authority before naming the fields |
| 9 | marketing:/ein | What is an EIN? | "An Employer Identification Number (EIN) is a nine-digit number... assigned by the IRS to identify a business entity..." | **YES** — definition |
| 10 | marketing:/itin | What is an ITIN? | "An Individual Taxpayer Identification Number (ITIN) is a tax processing number issued by the IRS to individuals who need a US taxpayer ID..." | **YES** — definition |

**Score: 7/10 YES (70%).** The 3 NO cases share a pattern: "how do you do X" / "what do you need before X" headings that open with a transitional sentence ("Gather these before...", "X is not enough...") instead of the first list item or the answer itself.

---

## Part C — HowTo candidates

### C.1 — Existing "HowTo" / "HowToStep" usage (contradicts the brief's "expect none")

`grep -rn "HowTo\|HowToStep" src/` hits:
- **`src/app/(marketing)/[seoSlug]/page.tsx:722-755`** — every landing page with `page.sections.length >= 3` (i.e. **all 27** — minimum is 6 sections) auto-emits a `HowTo` node: `name`=page.h1, `totalTime`="PT15M" (hardcoded, same for every page regardless of actual section count/complexity), `estimatedCost`, `supply`/`tool` arrays (also identical on every page), and one `HowToStep` per **section** (not per numbered sub-step inside a section) with `url` anchored to `#step-N` (page.tsx:238-250 renders the matching `id`).
- **`src/app/(marketing)/blog/[slug]/page.tsx:102,115-127`** + **`src/lib/blog.ts:436` (`extractHowTo`)** — a blog post gets a `HowTo` node only if it has an `## How...` H2 immediately followed by a `1. 2. 3.` numbered list (≥2 items); `name`=stripped heading text, steps = each numbered line's first sentence (name) + full line (text). No `totalTime`, no `url`/anchor per step, no `estimatedCost`. Spot-checked live: `content/blog/how-to-fax-form-5472-irs.md` under "## How do you send Form 5472 correctly?" (8 numbered steps, step 8 = "Save the exact PDF, timestamp... receipt" — a genuine verify/confirm final step) — this post **does** get HowTo schema today.

**Gap**: two independent, differently-shaped HowTo builders (no shared `howTo()` helper in `src/lib/seo.ts`), and the landing-page version treats a whole page *section* as one step even when that section's body contains its own fine-grained numbered process (see table below) — so AI engines get a coarse step list, not the granular one a user would actually follow.

### C.2 — Numbered/ordered PROCESS content inventory

| Location | path:line | Steps (verbatim titles) | Currently in HowTo? |
|---|---|---|---|
| Homepage "How it works" | `src/app/(marketing)/page.tsx:419-482` (steps array `:420-451`) | Enter your LLC info · Enter your owner info · Add your numbers · We generate the package · You sign it · We fax to the IRS | No |
| `/ein` "How it works" | `src/app/(marketing)/ein/page.tsx:175-189` (steps `:69-86`) | Complete the intake form · We prepare your Form SS-4 · We contact the IRS · EIN delivered to you | No |
| `/itin` "How it works" | `src/app/(marketing)/itin/page.tsx:178-189` (steps `:69-90`) | Eligibility check · CAA document review · Package preparation · IRS processing | No |
| `/about` "How we work" | `src/app/(marketing)/about/page.tsx:97-113` (steps `:22-26`) | You complete the intake · We prepare the package · Review and resolve signing · We fax and document transmission | No |
| `/partners` "How the partner flow works" | `src/app/(marketing)/partners/page.tsx:169-189` (steps `:57-76`) | Get approved · Prepare client filings · Client signs via link · Track everything in one place | No |
| `/form-5472-filing` "From your answers to the IRS in four steps" | `src/app/(marketing)/form-5472-filing/page.tsx:472-492` (steps `:449-464`) | Answer 12 questions · Accountant review · Sign once on screen · We fax and store proof | No |
| `/pricing` | — | no ordered process on this page | n/a |
| `1120-pro-forma-instructions` landing | `src/lib/landing-pages.ts:1450` | 10 sections incl. "What is the correct assembly order for the filing package?" (4-item numbered list inside) | **Yes** (auto, via C.1) |
| `file-form-5472` landing, section "How do you file Form 5472 step by step?" | `src/lib/landing-pages.ts:67` | 7 numbered sub-steps inside the section body | Partially — whole section is 1 HowToStep, sub-steps aren't broken out |
| `diirsp` landing, section "How does DIIRSP work — step by step?" | `src/lib/landing-pages.ts:269` | 6 numbered sub-steps inside the section body | Partially, same issue |
| 26 more landing sections with ≥3 numbered items | see full list generated during audit (delaware, wyoming, germany, uae, fax-number, deadline, etc.) | — | Partially, same issue — every landing page already gets a coarse HowTo |
| Blog posts titled "How to ..." (title starts with the phrase) | 6 slugs: `amended-form-5472-correcting-errors`, `ein-for-foreign-owned-llc-without-ssn`, `how-to-fax-form-5472-irs`, `how-to-fill-out-form-ss-4-foreign-owned-llc`, `how-to-fill-out-form-w-7-nonresident-llc-owner`, `itin-refund-30-percent-withholding-1042-s` | — | Live only where the post also has an `## How...` H2 + numbered list matching `extractHowTo` (confirmed live on `how-to-fax-form-5472-irs`); the other 5 need spot-checking individually |

### C.3 — What each candidate needs: content vs. markup-only

| Candidate | Name | Body ≥ 40 words/step | Anchor id on heading | Stated total time | Verify/confirm final step | Verdict |
|---|---|---|---|---|---|---|
| Landing pages (all 27, via `[seoSlug]`) | Yes (heading) | Yes (section bodies are long-form) | Yes (`id="step-N"`) | Yes, but **hardcoded "PT15M" for every page** — wrong for the 6-section partner-comparison pages vs. the 10-section deep guides | Not tagged; last section is often "Bottom line" / pricing, not an explicit verify step | **Markup refinement only** — already live, but totalTime and per-step granularity are data-quality bugs, not missing content |
| Blog "How to..." posts w/ matching `## How` + numbered list | Yes | Text = full numbered line (varies, often <40 words) | No (no `id`/`url` in blog HowTo step) | No `totalTime` field at all | Sometimes yes by luck (e.g. fax post step 8), not guaranteed | **Both** — needs a `totalTime` + anchor id added to the builder, and per-post content review for a verify step |
| Homepage "How it works" (6 steps) | Yes | **No** — bodies are ~13-20 words, well under 40 | No `id` per step (only the section has `id="how-it-works"`) | No structured `totalTime` (only prose "about fifteen minutes" in the subtitle) | No — last step is "We fax to the IRS" (our action, not user confirmation) | **Needs content** (word count) **+ markup** |
| `/ein`, `/itin` "How it works" (4 steps each) | Yes | **No** — bodies ~20-31 words | No | No | No — last step is a delivery statement, not a user-facing verify step | **Needs content + markup** |
| `/about`, `/partners`, `/form-5472-filing` 4-step blocks | Yes | Short bodies, similar gap | No | No | No | **Needs content + markup** |

### C.4 — JSON-LD emission pattern for a shared `howTo()` helper

- `src/components/JsonLd.tsx:4-14` — generic `JsonLd({ data })` server component, just serializes any schema.org object into a `<script type="application/ld+json">`. Every page's structured-data function builds its own plain object(s) and passes them here (e.g. homepage `src/app/(marketing)/page.tsx:825-951`).
- `src/lib/seo.ts:45` — `breadcrumbList(items)` — the closest existing precedent for a small, typed, reusable schema-builder function (`Array<{name, path}>` → `BreadcrumbList`).
- `src/lib/seo.ts:60` — `organizationNode(extra)` — same pattern, single source of truth for one schema.org type, merged with page-specific overrides.
- `src/lib/seo.ts:83` — `SPEAKABLE` — a shared constant (not a function) reused across pages' `webPage.speakable`.
- **No FAQ helper exists** — every page (`page.tsx`, `[seoSlug]/page.tsx`, `ein/page.tsx`, etc.) hand-rolls its own `FAQPage`/`mainEntity` mapping inline.
- **No `howTo()` helper exists either** — the two HowTo builders (C.1) are both inlined in their respective page files, not in `seo.ts`. A `howTo()` helper following the `breadcrumbList` pattern (typed input: `{ name, totalTime?, steps: {name, text, url?}[] }` → `HowTo` object) would let the landing-page and blog builders — and the still-unwired homepage/ein/itin/about/partners/form-5472-filing step blocks — share one implementation.
- `LandingPage` type (`src/lib/landing-pages.ts:11-35`) optional fields today: `sources?`, `updated?`, `relatedSlugs?`, `noindex?`, `pricingMode?`, `startSrc?`. **No `howTo` field** — not strictly needed since HowTo is auto-derived from `sections`, but an optional `howToOverride?: { totalTime?: string; supply?: string[] }` would fix the hardcoded-"PT15M"-for-every-page bug in C.1 without a bigger refactor.

