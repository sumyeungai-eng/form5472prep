# Brand Authority Playbook — Reddit + YouTube

Owner-executed only. Every fact below traces to `src/lib/faq.ts` (51 Q&As, last reviewed 2026-09-06). No tax claims beyond that file. Brand name is exactly **Form5472 Prep**. Not a CPA firm, no tax advice, not a CAA — the company forwards ITIN work to an IRS-authorized Certifying Acceptance Agent.

## IMPORTANT — a research limitation you need to know before using Part 1

This session tried to pull real Reddit thread titles/URLs/dates via `WebSearch` and `WebFetch` (including `site:reddit.com` queries, Reddit's own `.json` search endpoint, Google, Bing, DuckDuckGo, and the Wayback Machine as a fallback). **Every route to reddit.com and to web.archive.org returned a hard block** ("Claude Code is unable to fetch from www.reddit.com" / same for `old.reddit.com` and `web.archive.org`), and general web search never surfaced a single actual reddit.com URL even without the `site:` filter — the search backend appears not to index or return Reddit at all in this environment. `subredditstats.com` loaded, but its subscriber numbers are rendered by JavaScript the fetch tool doesn't execute, so no live counts came through either.

Given the explicit constraint not to invent URLs, subscriber counts, or thread titles, I did not fabricate any of the three. What follows is: (a) a subreddit shortlist built from stable, well-documented community knowledge — each one flagged as unverified-this-session and worth a quick reread before you post — and (b) a 15-minute manual protocol so *you*, with a normal logged-in browser, can find the real threads this session could not reach. Part 2's answers are written as ready-to-paste templates keyed to the five recurring question patterns, not to a specific verified thread — none exists yet in this file. Paste the real thread URL into each template's `[TARGET]` line once you've run the protocol below.

## Part 1 — Subreddit shortlist (verify before posting)

All subscriber sizes below are rough order-of-magnitude, unverified this session — check the live sidebar count before you plan volume around it. Self-promotion rules are the well-known, stable norm for each community as of recent years; subreddit rules change, so reread the actual sidebar/wiki immediately before your first post in each one.

| Subreddit | Approx. size (unverified) | Self-promo rule (reconfirm live) |
|---|---|---|
| r/tax | Large (several hundred thousand) | Strict — no soliciting or offering paid services; comments that read as service ads get removed. |
| r/smallbusiness | Very large (1M+) | Strict — explicit no-self-promotion rule; a disclosed personal anecdote is tolerated more than a pitch, but any link is risky. |
| r/llc | Small/niche (likely under ~50k) | Moderate — a disclosed "I run X" aside is generally tolerated if the comment answers the actual question first. |
| r/Entrepreneur | Very large (multi-million) | Strict-ish — self-promotion rule exists; substance-first comments survive, pure plugs get removed. |
| r/USExpatTaxes | Small/niche (likely under ~20k) | Moderate — community includes working preparers who disclose their firm; disclosed bias is the norm here, not the exception. |
| r/digitalnomad | Large (several hundred thousand+) | Moderate — general anti-spam rule; occasional disclosed mention inside a substantive answer is common. |

Two candidates from the brief were *not* added: r/nonresidentalien could not be confirmed to exist as an active subreddit in this session, and r/Fire is a FIRE/early-retirement community with no clear pattern of Form 5472 questions — don't spend time there without checking first.

### 15-minute manual protocol to find real threads

Run these from your own logged-in browser (Reddit blocks this session's tools, not yours):
1. On Reddit's own search, run each of, filtered to "Past year": `form 5472`, `5472 penalty`, `$25,000 penalty LLC`, `foreign owned LLC tax filing`, `EIN without SSN LLC`, `ITIN LLC owner`. Repeat restricted to each subreddit above (`subreddit:tax form 5472`, etc.).
2. On Google, run `site:reddit.com "form 5472"` and `site:reddit.com "5472 penalty"` — Reddit is normally indexed by Google even though it blocked this session's crawler.
3. For each real thread you find, log it in this table (copy into your own tracker — see Part 3's template): `date found · subreddit · thread title · URL · has an accepted answer (y/n) · self-promo rule confirmed (y/n)`.
4. Sort by: unanswered or thinly-answered threads first, then by recency (last ~18 months per the brief).
5. Pick the best-fit thread for each of the five patterns in Part 2 and drop its URL into that template's `[TARGET]` line before you post.

## Part 2 — Five answer templates (paste real thread URL into `[TARGET]`)

Rules applied throughout: helpful first, 120–220 words, plain English, one brand mention at most, phrased as disclosure, never "DM me," no link unless the subreddit allows it, close with a deadline pointer, not a sales line.

### Template 1 — "Do I need to file if my LLC made no money?" (fits r/tax)

`[TARGET]`: paste the r/tax thread URL here once found.

r/tax forbids self-promotion outright, so this is **no-brand only** — use it as posted, no second variant needed for this sub. If you reuse this same answer body on a more permissive sub later, see the disclosed variant below.

> No income and no reportable transaction are two different things, and that's the trap here. Form 5472 (with a pro forma Form 1120 attached) is triggered by *reportable transactions* — capital contributions, owner distributions, loans, reimbursements, even the money you wired in to open the LLC's bank account counts. So "we made $0" doesn't get you out of it if any of that happened during the year.
>
> If your LLC is a single-member LLC owned by a non-US person and it's treated as a disregarded entity, and any of those transactions occurred, you're filing Form 5472 + pro forma 1120, due the 15th day of the 4th month after year end (April 15 for calendar-year filers). It can't be e-filed for this filer type — fax or mail to the IRS only.
>
> If you skipped it in a prior year, the fix is filing under the delinquent international information return procedures (DIIRSP) with a reasonable cause statement, not just filing late and hoping. File before the deadline if you're still in time — that's the cheapest version of this problem.

Disclosed variant (for a sub where a service aside is tolerated, e.g. r/llc): add, right after the DIIRSP sentence: *"I run Form5472 Prep, a filing service — saying that so you can weigh the bias — but the DIIRSP route above is the standard remedy regardless of who prepares it."*

### Template 2 — "$25,000 penalty, just found out I never filed" (fits r/llc or r/USExpatTaxes)

`[TARGET]`: paste the thread URL here.

> The $25,000 number is real and it's not discretionary on the IRS's side — IRC §6038A(d) makes the initial penalty automatic when a reporting corporation doesn't furnish the required Form 5472 information on time or files an incomplete return. There's also effectively no statute of limitations until a complete or substantially complete return is filed — filing, even late, is what starts the clock.
>
> The standard remedy for a first-time miss is filing under DIIRSP (delinquent international information return procedures) with a reasonable cause statement attached. First-time late filers are frequently successful with reasonable-cause abatement when the facts support it, but there's no guarantee — it depends on your specific facts.
>
> If you've missed more than one year, you can catch up on all of them at once; each additional past year is priced separately by any preparer you use, so ask for that up front. I run Form5472 Prep, a filing service — flagging that so you can weigh the bias. Either way, the sooner the complete return goes in, the sooner that open-ended exposure closes.

### Template 3 — "How do I get an EIN with no SSN/ITIN?" (fits r/smallbusiness — strict, no-brand)

`[TARGET]`: paste the thread URL here.

No-brand version (required for r/smallbusiness):

> The IRS's online EIN tool only works if the responsible party already has a US SSN or ITIN — so if you're a non-resident without either, that tool is a dead end and it's not you doing anything wrong. The actual route is Form SS-4 filed by fax or phone, marking the responsible party's tax ID field "Foreign." It goes to the IRS's international unit rather than the general queue.
>
> You do not need an SSN or ITIN to get the EIN itself — plenty of foreign-owned single-member LLCs operate for years on just the EIN and never need an ITIN at all (ITIN is a separate, personal tax ID, only relevant if you personally have a US filing requirement beyond the LLC). Typical turnaround once documents are in order is 1–5 business days, though more complex cases take longer.
>
> One thing the EIN doesn't get you out of: if the LLC has reportable transactions, you'll still need it in hand before you can file Form 5472, since the EIN goes in that form's header. File that before its deadline once the EIN lands.

Disclosed variant (for r/USExpatTaxes or similar): after "never need an ITIN at all," add: *"I run Form5472 Prep and handle both EIN and Form 5472 filings — mentioning that so you know where the bias is — but the SS-4 route above is the same no matter who files it for you."*

### Template 4 — "ITIN vs EIN, do I need both?" (fits r/USExpatTaxes or r/digitalnomad)

`[TARGET]`: paste the thread URL here.

> Short version: your LLC has an EIN, you as a person would have an ITIN (or SSN). They're not interchangeable and getting one doesn't require or guarantee the other. Most foreign-owned single-member LLC owners need the EIN — it's required for Form 5472's header, for opening a US bank account, for Stripe/PayPal, for hiring US contractors. Many of them never need an ITIN at all, because an ITIN only matters if you personally have to file or be identified on a US return for some other reason.
>
> If you do need one, a Certifying Acceptance Agent (CAA) can authenticate your identity documents so you're not mailing an original passport to the IRS — but a CAA review doesn't guarantee ITIN eligibility or approval, and a plain uploaded copy isn't itself sufficient certification. The IRS's own estimate is about 7 weeks for a status notice, or 9–11 weeks if you're applying from overseas or during Jan 15–Apr 30 — treat that as an estimate, not a guaranteed date, since requests for more information can push it out.
>
> I run Form5472 Prep and coordinate both applications when people actually need both — disclosing that so you can weigh it — but figure out first whether you actually need the ITIN before you start either process.

### Template 5 — "Missed April 15, what now / does Form 7004 still work?" (fits r/Entrepreneur or r/expats)

`[TARGET]`: paste the thread URL here.

> Two different situations here. If you're not past April 15 yet: Form 7004 filed by the original deadline extends the Form 5472 package (it's attached to the pro forma 1120) out to October 15 — that's a real, useful lever if you're not ready.
>
> If April 15 already passed with no extension filed: the standard route is filing the actual return now under DIIRSP with a reasonable cause statement, rather than waiting for a "better" time to file. No income and no transactions during the year doesn't change the deadline calculus either — the trigger is reportable transactions, not income, so check whether any occurred (contributions, distributions, loans, reimbursements — even the initial bank-account funding counts) before assuming you're clear.
>
> If you've already gotten an IRS notice like a CP-15, that changes the urgency but not the basic path — send the notice number and the tax year it covers to whoever you use for the late filing so they can scope it correctly before you pay for anything. File the complete package as soon as you can; the exposure stays open until you do.

## Part 3 — Reddit operating rules

**The 9:1 norm.** For every comment that even discloses the brand, post nine that don't. That means roughly 18–27 genuine comments across all six subreddits before the tenth carries a disclosure — track it with the table below so it isn't a guess.

**Disclosure wording.** Use exactly one phrasing, verbatim, every time: *"I run Form5472 Prep, a filing service — saying that so you can weigh the bias."* Never vary it into something softer or more sales-flavored. Only say it where the thread is actually asking about services/options — not as a signature line on unrelated answers.

**What gets accounts shadowbanned or comments removed, in practice:**
- Posting a link in a comment on a sub that disallows links (r/tax, r/smallbusiness) — assume no links anywhere unless you've reconfirmed the sidebar allows them.
- Multiple near-identical comments across threads/subs in a short window — reads as copy-paste spam even if each answer is individually accurate.
- A new or low-karma account whose first several posts all mention the same business — build a normal comment history first.
- Any reply that leads with the brand instead of the answer.
- Getting a comment removed and reposting it unchanged instead of asking a mod or dropping it.

**Cadence.** 2–3 genuine comments per week, total, across all subreddits — not per subreddit. At most one of those per week carries a disclosure, and only when the thread's own question calls for it.

**Tracking table** — keep this as a running log (spreadsheet or a markdown file next to this one):

| Date | Subreddit | Thread (title + URL) | Brand mentioned (y/n) | Upvotes | Notes |
|---|---|---|---|---|---|
| | | | | | |

## Part 4 — YouTube plan (5 videos, 3–6 min each)

Shared rule: the brand name is spoken exactly once near the start and once at the end, never in between. Upload an SRT for every video — without captions, "Form5472 Prep" never enters the transcript that AI answer engines and YouTube search actually index.

**Opening spoken sentence for all five (verbatim, near the start):** *"I'm Sum, and I run Form5472 Prep — a filing service for exactly this form — so here's what's actually true about it."*

**Closing spoken sentence for all five (verbatim):** *"If you'd rather have this filed for you, that's what Form5472 Prep does — otherwise, just make sure it's in before the deadline."*

### Video 1 — "Form 5472 Penalty: The Real $25,000 Fine, Explained" (52 chars)
Description: Why the Form 5472 penalty is automatic under IRC §6038A(d), and what reasonable-cause abatement actually requires. Form5472 Prep — form5472prep.com.
Talking points (faq.ts only): (1) What Form 5472 reports and who it applies to (foreign-owned SMLLC, disregarded entity). (2) The $25,000 figure and that it's for a missing or incomplete return. (3) IRC §6038A(d) — the penalty is automatic, not discretionary. (4) What a CP15 notice is and when it shows up. (5) Continuation penalties after a CP15 if nothing is corrected. (6) No effective statute of limitations until a complete return is filed. (7) DIIRSP as the standard route for a late filer. (8) Reasonable cause — frequently successful for first-time late filers, never guaranteed. (9) Multiple missed years can be caught up together. (10) Fax-only filing to the IRS Ogden PIN Unit — no e-file for this filer type.
Chapters: 0:00 Intro · 0:30 What triggers Form 5472 · 1:30 The $25,000 penalty & §6038A · 3:00 CP15 and continuation penalties · 4:00 Fixing a miss (DIIRSP) · 5:15 Close.

### Video 2 — "Do You Need Form 5472 With Zero LLC Income?" (44 chars)
Description: No income and no reportable transaction are different things — what actually triggers Form 5472. Form5472 Prep — form5472prep.com.
Talking points: (1) Form 5472 + pro forma 1120 basics for a foreign-owned disregarded entity. (2) Why "no income" doesn't mean "no filing requirement." (3) What counts as a reportable transaction (contributions, distributions, loans, reimbursements, payments). (4) The bank-account funding wire counts as a reportable transaction. (5) First-year LLCs follow the same deadline rules if they had reportable transactions. (6) A dissolved LLC still files for its partial final year. (7) What information to have ready (EIN, formation date, NAICS, owner details, assets). (8) Fax/mail-only filing, no e-file for this filer type. (9) The April 15 deadline for calendar-year filers.
Chapters: 0:00 Intro · 0:30 Income vs. reportable transactions · 2:00 What counts · 3:30 First-year and final-year LLCs · 4:30 What to have ready · 5:15 Close.

### Video 3 — "Form 5472 Deadline: April 15 and the 7004 Extension" (54 chars)
Description: How the Form 5472 deadline works, and how Form 7004 pushes it to October 15. Form5472 Prep — form5472prep.com.
Talking points: (1) Base deadline: 15th day of the 4th month after year end (April 15 for calendar-year LLCs). (2) Form 5472 is attached to the pro forma 1120 — it inherits that form's deadline logic. (3) Form 7004 must be filed by the original April 15 deadline to work. (4) A timely 7004 extends the package to October 15. (5) No income/no transactions doesn't change the deadline. (6) What to do if April 15 already passed without an extension (DIIRSP). (7) Dissolved-LLC short years use the same 4-months-after logic. (8) Multi-year catch-up filings if more than one year was missed. (9) Fax delivery to the Ogden PIN Unit either way.
Chapters: 0:00 Intro · 0:30 The base deadline · 1:30 How Form 7004 extends it · 3:00 If you already missed it · 4:30 Close.

### Video 4 — "EIN Without an SSN: Form 5472's First Requirement" (51 chars)
Description: How a non-resident LLC owner gets an EIN with no SSN or ITIN — and why Form 5472 needs it first. Form5472 Prep — form5472prep.com.
Talking points: (1) Why the LLC needs an EIN (bank account, Stripe/PayPal, contractors, Form 5472's header, contracts). (2) The IRS online EIN tool requires an existing SSN or ITIN — a dead end for many non-residents. (3) Form SS-4 by fax or phone is the actual route, marking the responsible party "Foreign." (4) It routes to the IRS international unit, not the general queue. (5) No SSN or ITIN is required to obtain the EIN itself. (6) Typical timing: 1–5 business days once documents are ready. (7) What to do if the LLC already has an EIN (skip this, or recover a lost one). (8) The EIN has to be in hand before Form 5472 can be filed — it goes in the header.
Chapters: 0:00 Intro · 0:30 Why you need an EIN · 1:30 Why the online tool fails you · 2:30 The SS-4 route · 4:00 Timing · 4:45 Close.

### Video 5 — "ITIN vs EIN: What Form 5472 Really Requires" (45 chars)
Description: An EIN belongs to your LLC, an ITIN belongs to you — what each one is actually for. Form5472 Prep — form5472prep.com.
Talking points: (1) EIN = the business's tax ID; ITIN = the individual's tax ID. (2) Form 5472 needs the LLC's EIN, not the owner's personal ID. (3) Many foreign-owned SMLLC owners run for years on just the EIN. (4) When an ITIN actually becomes necessary (a personal US filing requirement). (5) What a Certifying Acceptance Agent (CAA) does — authenticates ID documents. (6) A CAA review avoids mailing an original passport, but doesn't guarantee approval. (7) A plain uploaded document copy isn't sufficient certification on its own. (8) IRS timing estimate: ~7 weeks, or 9–11 weeks overseas or in the Jan 15–Apr 30 window. (9) EIN and ITIN applications can run in parallel when both are genuinely needed.
Chapters: 0:00 Intro · 0:30 EIN vs. ITIN, the core distinction · 1:45 When you actually need an ITIN · 2:45 How the CAA process works · 4:15 Timing · 5:00 Close.

## Part 5 — Wikipedia / Wikidata verdict

**English Wikipedia: not viable now.** Notability on English Wikipedia turns on significant coverage in independent, reliable secondary sources — not on being accurate, useful, or even widely cited by AI answer engines. Perplexity citing the site in Form 5472 answers is a search-relevance signal, not editorial coverage, and it carries zero weight toward WP:NCORP. Right now there is no independent press profile, no podcast feature, no industry analyst mention of Form5472 Prep specifically — a draft would be speedy-deleted or rejected at AfC as promotional/non-notable, and re-attempting it before that changes tends to burn the topic (repeated deletion makes a future legitimate article harder, not easier).

What would have to be true first: at least 2–3 pieces of substantial, independent coverage that discuss the company itself (not just Form 5472 generically). Realistic targets in the expat-founder / non-resident-LLC space, found via search this session and not yet contacted: **The Tax-Savvy Expat Podcast** (Stewart Patton, a US tax attorney who interviews expat entrepreneurs); **Business Anywhere's** podcast/blog presence (Bobby Casey, who was recently interviewed on LLC structuring for non-residents and digital nomads); **Online Taxman** (Vincenzo Villamena's content and webinars for expat business owners); **Greenback Expat Tax Services'** knowledge-center/blog, which regularly features guest and comparison content on foreign-business tax reporting; and **MyExpatTaxes** (Vienna-based, runs its own content program for expat filers and occasionally profiles adjacent services). None of these have covered Form5472 Prep yet — this is a pitch list, not existing coverage.

**Wikidata: not worth it yet, and be honest about the risk.** Wikidata's bar is lower than English Wikipedia's (no prose, just structured claims), but items for non-notable companies are routinely nominated for deletion once someone notices there's no qualifying source to back the claims — "it's on Wikidata" isn't a stable win if it gets deleted a month later, and a deletion log is worse for the brand than no item at all. Revisit this only after two or more of the coverage targets above have actually run something.

## Part 6 — Skip list

- **Stack Overflow** — a Q&A site for programming problems; Form 5472 is a tax-filing question, categorically off-topic and would be closed/removed on sight.
- **GitHub** — a code-hosting and collaboration platform; there is no code artifact here for Form5472 Prep to attach to, so there's no natural, non-spammy way to appear on it.
