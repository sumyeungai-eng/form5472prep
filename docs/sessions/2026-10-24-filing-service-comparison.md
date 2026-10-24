# 2026-10-24 — three-way filing-service comparison post

**Checkout/branch:** durable worktree `~/Developer/f5472-wt/compare`, branch `blog-compare-1024`.
Owned: `content/blog/form-5472-filing-service-comparison.md`, its `.webp`, the
`POSTS`/`ARTWORK_ALTS` entries, `docs/reviews/compare-post-spec-1024.md`, this log.

## What it is
A deliberately commercial comparison of three Form 5472 services, published immediately
(**no `publishAt`** — it has no deadline and the drip queue would delay it).

Price ladder, every figure read off the provider's own page on 24 October 2026:

| Service | Price | Who reviews |
|---|---|---|
| snapfile.tax (**ours**) | $79 AI review; +$69 per extra year | Snapfile's AI system |
| Form5472 Prep (**us**) | Standard, Express, +per extra year (price tokens) | Tax accountant holding an IRS PTIN |
| form5472.online | $399, +$49 submission = "$448 (All-In)"; "$547 (All-In Active)" | Its page claims "CPA-prepared … U.S.-licensed CPA (verified)" |

## Positioning rule that makes this post survivable
**We are not the cheapest and the post says so outright.** Snapfile at $79 undercuts us
and a reader verifies that in one click, so the post claims *best value* — a human
review at roughly a third of form5472.online's all-in price — and states plainly that
this is a different claim from being the lowest number. It also recommends Snapfile's
$79 tier for one straightforward year.

**Snapfile's affiliation is disclosed three times**, including inside the table row,
quoting snapfile.tax's own sentence: *"Offered and fulfilled by Form5472Prep.com. You'll
continue on their website."* A three-way comparison with two of our own brands reads as
independent otherwise.

**Competitor handling:** figures and claims quoted and attributed, never endorsed, never
disparaged; we state we have not used the service and have not verified the credentials.
**The competitor link was deliberately removed** — attribution by name and date is
enough for verification, and there is no reason to pass link equity to the most
expensive option in a post built to win that comparison. Their turnaround cell reads
"Not stated in the figures quoted here" rather than importing a number from elsewhere.

## Codex review — two rounds, standing rule earned its keep
Round 1 returned **FIX** with six findings, all valid, all applied:
1. "paying us more buys a review you do not need" — told readers professional review was
   unnecessary. Rewritten; whether they want a person reviewing their records is their call.
2. "a reviewing tax accountant is the credential that fits" and "a CPA premium buys a
   credential" — overstated what a PTIN means. A PTIN permits paid preparation; it does
   not establish expertise, and the post now says exactly that.
3. "what their page offers is a CPA's preparation and signature" — adopted the
   competitor's claim as fact. Now attributed throughout.
4. The meta description omitted our own price and read two competitor tiers as two
   services.
5. **A real misstatement about our own pricing:** the "what does the extra buy" section
   listed Express, EIN and ITIN as things the Standard price difference buys. They are
   charged separately. The section now says so explicitly.
6. "the part most self-serve tools leave to you" — unsupported market-wide claim; removed.

Round 2 confirmed 4, 5 and 6 resolved and pressed further on 1, 2 and 3. **One taken,
two declined, deliberately:**
- *Taken:* "all-in CPA price" and the description's "CPA-prepared" still adopted the
  competitor's characterisation in our own voice. Now "form5472.online's all-in price"
  and "advertised as CPA-prepared".
- *Declined:* that recommending "take the $79 tier for one straightforward year" tells
  readers professional review is unnecessary. Recommending between **our own two
  products** is not advice about a reader's tax position, and the post separately says
  the choice is theirs. A comparison post that recommends nothing is useless.
- *Declined as written:* that naming what a CPA/EA is worth paying for "prescribes
  credentials". That sentence is the post's fairness ballast and removing it would make
  the post less balanced. Reframed to what those credentials *permit* — notably
  representation rights a PTIN-only preparer does not have — rather than what is "worth" it.

## Verified evidence
- Prices re-fetched from snapfile.tax/pricing and form5472.online during writing; both
  still matched the spec block.
- IRS preparer-credentials page quoted for the PTIN point; Form 5472 instructions for the
  house facts. All external links 200.
- Guards: `seo-title`, `blog`, `provider-prices` → **246 pass**. The seo-title guard
  caught a 176-character rendered description (limit 160); trimmed to 138.
- Gate: utm 0 · no H1 · 5 table rows · 7 FAQs, none over 50 words · 2,384 words ·
  `/start` ×2 · no `publishAt` · no dangling internal links.
- `tsc` clean apart from the pre-existing `imapflow`/`mailparser` errors.
- Our prices are `{{price.*}}` tokens, never literals — a repo guard forbids hard-coded
  own-prices in content.

## Open
- **Stale repo comment, not ours to fix:** `src/lib/provider-prices.ts` excludes Snapfile
  for "possible affiliation, unconfirmed", and `provider-prices.test.ts` asserts
  `/compare` "never lists Snapfile". The affiliation is now confirmed publicly on
  snapfile.tax. `/compare` deliberately lists competitors only, so nothing contradicts —
  but the comment should be updated by whoever owns those files.
- **No `rehype-raw` in the blog renderer**, so markdown links cannot carry
  `rel="nofollow"`. Handled here by not linking the competitor at all; a future
  comparison post wanting a nofollow citation needs the renderer changed first.
- **`imapflow` and `mailparser` are declared in `package.json` but not installed** in the
  shared `node_modules` — still true, still three typecheck errors in
  `src/lib/supportMail/imap.ts` in every worktree. Needs `npm install` in the main checkout.
- A post with no `publishAt` is **skipped by the `blog-release` cron's IndexNow step**
  (it requires a truthy `publishAt`). Submitted by hand again here. Same follow-up as
  2026-10-13 stands.
