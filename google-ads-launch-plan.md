# Google Ads Launch Plan — form5472prep.com

**Date:** July 5, 2026 · **Owner:** Sum · **Account:** sumyeungus@gmail.com → "LuxuryAscent" (205-421-5211)
**Budget:** $20/day start → scale to $50/day · **Geo:** 16 countries · **Goal:** paid Form 5472 filings ($199–$449 + $149/extra year)

This plan supersedes `form5472_setup_checklist.md` (May 2026). It reuses the ad copy in `form5472_ad_copy.md` and the keyword set from `form5472_campaign_build.csv`, with the corrections listed in Appendix C. Everything below is written against the site as deployed today and Google Ads as of July 2026.

---

## Current state (verified July 5, 2026)

| Item | Status |
|---|---|
| Google tag `AW-18127544007` | ✅ Installed site-wide (`src/app/layout.tsx`) |
| "Form 5472 Lead" conversion (`…/TFriCN3piLEcEMe98cNd`) | ✅ Fires on `/start` form submit — **verify it shows "Recording conversions" in the UI (Step 2.1)** |
| Purchase conversion | 🔶 Code shipped today (see Step 2.2) — you must create the action in Google Ads, paste the label, deploy |
| Ad copy (4 ad groups × 15 headlines × 4 descriptions) | ✅ Ready in `form5472_ad_copy.md` — 3 headline swaps recommended (Step 3.6) |
| Campaign CSV for Ads Editor | ⚠️ Usable but has 6 outdated settings (Appendix C) — UI build recommended instead |
| Sitelink pages | ⚠️ Old plan pointed to pages that don't exist. Real pages: `/pricing`, `/start`, `/blog/*` |
| Site pricing | Standard $199 (3–5 days) / Rush $279 (24h) / Premium $449 (same-day) / +$149 per extra past year |

**Why now is a good time to launch:** people who missed the April 15, 2026 deadline are searching for late-filing help year-round (your highest-intent segment), and the October 15, 2026 extension deadline creates a demand ramp from September. Main season peak is January–April 2027.

---

# PART 1 — Account pre-flight (Day 1, ~30 min)

### 1.1 Sign in and confirm the account
1. Go to https://ads.google.com and sign in with **sumyeungus@gmail.com**.
2. Top-right, confirm the account is **LuxuryAscent (205-421-5211)**. If you land in another account, use the account switcher.
3. We're deliberately staying in this account: the site's tag `AW-18127544007` and the Lead conversion already belong to it. Moving to a new account would mean re-tagging the site — not worth it.

### 1.2 Check advertiser verification
1. Click the **Admin (gear/wrench)** icon → look for **Advertiser verification**.
2. If status is "Verified" — done. If Google asks you to verify (ID + business docs), start it now; unverified accounts get paused eventually. This account has been running ads for LuxuryAscent, so it is likely already verified — just confirm.
3. Note: Google's new financial-services verification (June/July 2026, EEA markets) lists banking, credit, loans, investment, insurance — **tax preparation is not in scope**. No action needed unless Google notifies you in-account.

### 1.3 Billing
1. **Billing → Summary** — confirm a valid payment method exists (it should, since LuxuryAscent campaigns run here).
2. Note: both businesses' spend lands on this card and one invoice. If you later want clean books per business, fix it with bookkeeping tags, not a second account.

### 1.4 Kill auto-apply recommendations (important)
1. Go to **Recommendations** → **Auto-apply** (or Admin → Recommendations settings).
2. **Turn OFF everything**, especially "Add new keywords," "Use broad match," "Add responsive search ads," and bid-strategy changes. On a $20/day niche account, Google's auto-changes destroy precision targeting.

### 1.5 Confirm auto-tagging is on
Admin → **Account settings** → Auto-tagging → "Tag the URL that people click through from my ad" = **Yes**. (Needed for conversion attribution.)

### 1.6 Don't touch the existing LuxuryAscent campaign
Everything below creates a **new, separate campaign**. Note the existing campaign's name and leave it alone.

---

# PART 2 — Conversion tracking (Day 1–2; campaign stays paused until this works)

You cannot optimize what you don't measure. Do not enable ads until 2.1 and 2.2 are done.

### 2.1 Verify the Lead conversion is recording
1. **Goals → Conversions → Summary**.
2. Find **"Form 5472 Lead"**. Status must be **"Recording conversions"** (not "Unverified"/"Inactive").
3. Live test: open form5472prep.com in a private window → submit the `/start` form with a test email → within ~24h a conversion should appear (Diagnostics tab shows tag activity sooner).
4. While you're here, set its settings: Category **Submit lead form**, Count **One**, Click-through window **90 days** (long research cycles for tax decisions), Attribution **Data-driven**.

### 2.2 Create the Purchase conversion (the code is already on your side)
Code shipped today in the repo — safe to deploy immediately (it no-ops until you paste the label):

- `src/lib/analytics/googleAds.ts` — added `GOOGLE_ADS_CONVERSION_PURCHASE` (empty placeholder) + `firePurchaseConversion()` with `transaction_id` dedupe
- `src/app/(app)/filings/[id]/PurchaseConversionPing.tsx` — new client component
- `src/app/(app)/filings/[id]/page.tsx` — renders the ping only after the server verifies the Stripe payment (never trusts `?paid=1` alone), with real `amountPaid` value

Steps:
1. In Google Ads: **Goals → Conversions → Summary → + New conversion action → Website** → enter `form5472prep.com` → scan → **add a conversion action manually**:
   - Category: **Purchase** · Name: **Form 5472 Purchase**
   - Value: "Use different values for each conversion", **default value $199** (fallback if the webhook race leaves value empty)
   - Count: **One** · Click-through window: **90 days** · Attribution: **Data-driven**
2. On the tag setup screen choose **"Use Google tag manager or code"** → you only need the **event snippet's `send_to` label**, the string that looks like `AW-18127544007/AbCdEfGhIjKl`.
3. Paste that full string into `GOOGLE_ADS_CONVERSION_PURCHASE` in `src/lib/analytics/googleAds.ts` → commit → deploy to Vercel.
4. Test: run an admin test order via `/admin/test-order` and land on the filing page with `?paid=1` (fires with the $199 default value since test orders record $0), or verify the tag fires with Google Tag Assistant (tagassistant.google.com) on that page.
5. Wait until status shows "Recording conversions."

### 2.3 Set which conversion the campaign bids toward
- **Form 5472 Lead → Primary** (used for bidding). It has enough volume to teach smart bidding later.
- **Form 5472 Purchase → Secondary** (observed, reported, not bid on) for now. Flip Purchase to Primary with target CPA once you have ~30 purchases recorded (roughly month 3+). This avoids double-counting a buyer (who fires both) in the bidding signal.
- Set this at account level under each action's "Action optimization" setting; we'll also scope goals per-campaign in Step 3.2.

---

# PART 3 — Build the campaign (Day 2, ~60–90 min, build it PAUSED)

Build in the web UI (recommended — the old CSV needs 6 corrections and the UI forces you through every setting once). If you prefer Google Ads Editor, apply Appendix C to the CSV first.

### 3.1 Create the campaign shell
1. **Campaigns → + → New campaign**.
2. Objective: **Create a campaign without a goal's guidance** (avoids Google's automation defaults).
3. Type: **Search**.
4. Name: `F5472 - Search - Core - Global`.

### 3.2 Campaign settings — exact values

| Setting | Value | Why |
|---|---|---|
| Networks | **Google Search only.** Untick "Search partners" AND "Display Network" | Partners/Display = junk clicks at this budget |
| Locations | The 16 countries in §3.3 | Decision made |
| Location options → Target | **"Presence: people in or regularly in"** — NOT "Presence or interest" | Critical. "Interest" would show ads to Americans reading about India |
| Languages | **All languages** | Foreign founders search in English from browsers set to Hindi/German/Portuguese. Language targeting reads the browser UI language — English-only would miss your core buyers. The keywords themselves are the language filter |
| Audience segments | Skip (add "observation" segments later if curious) | Volume too small to slice |
| **AI Max** | **Toggle OFF** (it's ON by default for new campaigns since Apr 2026) | AI Max expands you beyond your keywords and rewrites URLs/assets. On a $20/day ultra-niche account you want exact control first. Revisit at $50/day+ with 30+ conversions |
| Broad-match keywords campaign setting | OFF | Same reason |
| Bidding | **Manual CPC**. Untick "Help increase conversions with Enhanced CPC" if offered | Smart bidding starves without ~15–30 conversions; manual keeps CPCs honest while learning |
| Daily budget | **$20** | Decision made; scale gates in Part 6 |
| Ad rotation | Optimize | Default is fine |
| Start/end dates | Start = launch day; no end date | — |
| Ad schedule | 24/7 (default) | Buyers are in every timezone |
| Ad extensions/assets | Added in §3.7 | — |

### 3.3 Location list (16)
United States, India, United Kingdom, United Arab Emirates, Canada, Germany, Pakistan, Brazil, Turkey, Nigeria, Singapore, Australia, Philippines, Netherlands, Hong Kong, Mexico.

Notes:
- US is included because many foreign owners are physically in the US (visa holders) and some buyers are their US-based bookkeepers. Expect US clicks to be the most expensive; §5 watches this.
- Germany + Netherlands are EEA: Google's EU user-consent policy technically expects a consent banner (Consent Mode) on your site for personalized ads/measurement. Short-term this mostly means slightly under-reported conversions from those two countries. Action item (not blocking): add a lightweight CMP later; if Google ever flags the account, drop DE/NL until the banner ships.

### 3.4 Ad groups & keywords (from the existing build, bids updated for $20/day)

Old CSV used $8 max CPC — at $20/day that's 2–3 clicks and done. Start lower; raise only where you lose impression share on converting terms.

**AG1 — Filing Service** (default max CPC **$5.00**)

| Keyword | Match |
|---|---|
| [form 5472 filing service] | Exact |
| "form 5472 filing service" | Phrase |
| [file form 5472] | Exact |
| "file form 5472" | Phrase |
| [form 5472 preparation service] | Exact |
| "form 5472 preparation service" | Phrase |
| [form 5472 preparation] | Exact |
| "5472 filing service" | Phrase |
| "form 5472 filing help" | Phrase |

**AG2 — Foreign-Owned LLC** (default max CPC **$4.00**)

| Keyword | Match |
|---|---|
| [foreign owned llc form 5472] | Exact |
| "foreign owned llc form 5472" | Phrase |
| "form 5472 single member llc" | Phrase |
| "form 5472 foreign owned llc filing" | Phrase |
| "non resident llc form 5472" | Phrase |
| "file 5472 foreign owned llc" | Phrase |

**AG3 — CPA / Hire Help** (default max CPC **$4.00**)

| Keyword | Match |
|---|---|
| "form 5472 cpa" | Phrase |
| "form 5472 accountant" | Phrase |
| "form 5472 help" | Phrase |
| "hire someone to file form 5472" | Phrase |
| "form 5472 pro forma 1120 filing" | Phrase |

**AG4 — Late / Penalty / Catch-Up** (default max CPC **$6.00** — highest intent, worth paying up)

| Keyword | Match |
|---|---|
| "form 5472 late filing" | Phrase |
| "form 5472 late filing help" | Phrase |
| "form 5472 penalty" | Phrase |
| "form 5472 penalty help" | Phrase |
| "form 5472 catch up filing" | Phrase |
| "late form 5472 foreign owned llc" | Phrase |

### 3.5 Negative keywords (campaign level)
Add as one shared list: **Tools & Settings → Negative keyword lists → new list "F5472 negatives"**, attach to the campaign.

Keep from the old build: `free`, `template`, `templates`, `sample`, `example`, `examples`, `pdf`, `instructions`, `"how to fill"`, `"what is"`, `definition`, `meaning`, `explained`, `irs.gov`, `course`, `courses`, `tutorial`, `study`, `salary`, `job`, `jobs`, `software`, `turbotax`, `5471`, `"form 5471"`, `fbar`, `fincen`, `boi`, `"beneficial ownership"`, `8938`, `5471 vs 5472`.

Decisions now resolved (they were flagged "DECIDE" in May):
- `deadline`, `due date` — **NOT negatives.** Deadline searchers are buyers on a clock, especially Aug–Oct 15.
- `5471`/`fbar`/`fincen`/`boi` — **keep as negatives.** You don't sell these as standalone products (Premium's BOI *review* isn't what a "boi filing" searcher wants). Revisit if you launch those services.
- `ein`, `itin` — **do NOT add as negatives** (you sell EIN/ITIN help at `/ein` and `/itin`, and phrases like "form 5472 without ein" are real buyer queries). They're future campaigns of their own.

### 3.6 Ads — one RSA per ad group
Copy headlines/descriptions from **`form5472_ad_copy.md`** (they respect the 30/90-char limits, H1 pinned to position 1). Make these three swaps in every ad group to add price + proof, replacing the weakest generic lines ("Stay Compliant Worldwide", "Built for Global Founders", one duplicate):

| New headline | Chars | Why |
|---|---|---|
| Flat-Fee Filing From $199 | 25 | Price qualifies clicks — at $20/day you can't afford window shoppers |
| 24-Hour Rush Available | 22 | Matches your Rush tier; urgency segment |
| Reviewed by Tax Accountants | 27 | Trust; mirrors the site's promise |

**Final URLs:**
- AG1, AG2, AG3 → `https://form5472prep.com/` (homepage has proof-of-fax, pricing, FAQ — your best converter)
- AG4 → `https://form5472prep.com/` at launch. Week 4 experiment: switch to `/blog/form-5472-filed-late-never-filed` (speaks directly to panic searchers, mentions penalty relief) and compare.
- Display path (the green URL cosmetic): `form5472prep.com/filing-service` style is fine, e.g. path1 `filing`, path2 `service` (AG4: `late`/`filing`).

Ad strength "Average" is acceptable — do not unpin H1 just to please the meter.

### 3.7 Assets (extensions) — campaign level

**Sitelinks (4) — corrected to pages that actually exist:**

| Text | Desc 1 | Desc 2 | URL |
|---|---|---|---|
| Pricing | Flat fees from $199 | Rush & same-day available | https://form5472prep.com/pricing |
| Start Your Filing | 10-minute intake form | Accountant-reviewed | https://form5472prep.com/start |
| Late or Never Filed? | Fix past years | Penalty-relief letter included | https://form5472prep.com/blog/form-5472-filed-late-never-filed |
| What Does It Cost? | $199 flat, fax included | Extra years $149 each | https://form5472prep.com/blog/form-5472-cost |

**Callouts (6):** Fixed Pricing · Includes Pro Forma 1120 · Avoid $25K IRS Penalty · Fax Filing Included · 24h Rush Available · All Countries Served

**Structured snippet:** Header "Services": Form 5472 Prep, Pro Forma 1120, Late Filing, Penalty Help, Catch-Up Filing

**Skip:** call asset (no staffed phone line), lead-form asset (your `/start` form IS the funnel — don't fork it), image assets (optional later).

### 3.8 Save everything with the campaign **Paused**.

---

# PART 4 — Pre-launch QA (Day 2–3, 15 min)

Go live only when every box is checked:

- [ ] "Form 5472 Lead" shows **Recording conversions**
- [ ] "Form 5472 Purchase" created; label pasted into `googleAds.ts`; deployed; test order verified
- [ ] Campaign: Search only, partners OFF, Display OFF
- [ ] AI Max OFF; auto-apply recommendations OFF (account level)
- [ ] 16 locations; location option = **Presence** (not "Presence or interest")
- [ ] Languages = All
- [ ] Budget $20/day; Manual CPC; bids $4–6 per §3.4
- [ ] 4 ad groups, keywords exact/phrase only, zero broad match
- [ ] Negative list attached
- [ ] 4 RSAs saved, H1 pinned, no disapprovals pending
- [ ] Sitelinks point to live URLs (click each one)
- [ ] Existing LuxuryAscent campaign untouched
- [ ] Billing valid

**Launch:** flip campaign status to **Enabled**. Note the date. Ads typically start serving within hours; policy review can take up to 1 business day.

---

# PART 5 — First 2 weeks: monitoring protocol

### First 72 hours (check twice daily, 5 min)
| Check | Where | Act if wrong |
|---|---|---|
| Ads approved? | Ads & assets tab | "Limited" or "Disapproved" → read reason; usual culprits: capitalization, trademark. Fix & resubmit |
| Any impressions? | Campaign overview | Zero after 24h → bids too low for the auction; raise AG1/AG4 max CPC by $1 steps |
| What queries matched? | Insights & reports → **Search terms** | Irrelevant query → add negative immediately. This is the highest-value 5 minutes of the whole plan |
| Budget burning too fast? | Overview | Spent by noon → lower bids $1; don't raise budget yet |
| Clicks but 0 page activity | Compare with Vercel Analytics | Broken tracking or bot clicks → check tag, check click quality by country |

### Daily (min 1–2, weeks 1–2): Search terms report triage
For each new search term:
- Clearly a buyer ("form 5472 filing service price") → if not already a keyword, **add as exact** to the right ad group
- Research/DIY ("form 5472 instructions 2025") → **add negative**
- Ambiguous → leave, judge after 10+ impressions

### End of week 1 & 2 review (30 min each)
1. **By country:** Campaigns → Locations. Any country with >$15 spend, 0 leads AND trash search terms → bid-adjust −50% (don't remove yet; sample sizes are tiny).
2. **By keyword:** any keyword with >$20 spend and 0 leads → bid −30%; >$35 and 0 leads → pause.
3. **By device:** mobile vs desktop lead rate; adjust −20% on the loser only if the gap is >2×.
4. **CTR sanity:** these hyper-specific terms should see CTR ≥ 5%. Below 3% → your ad isn't matching intent; check which RSA combos serve (Ads → view asset details).
5. Log spend / clicks / CPC / leads / lead CPA in a simple sheet (or ask me to build a tracking spreadsheet).

---

# PART 6 — Scaling gates & bidding evolution

### Budget gates (move only when the gate passes)
| Stage | Daily budget | Gate to advance |
|---|---|---|
| Launch | $20 | — |
| Stage 2 | $35 | ≥2 leads/week for 2 consecutive weeks AND search-term waste <25% of spend, OR you're consistently "Limited by budget" with lead CPA <$40 |
| Stage 3 | $50 | Lead CPA holding <$40 at $35/day, OR calendar hits **Sept 1** (pre-Oct-15 ramp — go to $50 regardless if CPA is anywhere reasonable, this is your season) |
| Peak season | $50+ (your call) | Jan–Apr 2027: expect your best CPAs of the year near Apr 15 |

### Bidding evolution
| Phase | Strategy | When |
|---|---|---|
| Now | Manual CPC | Launch → ~15–30 recorded Lead conversions (expect 4–8 weeks) |
| Phase 2 | **Maximize Conversions** (no target at first) | At 15–30 lead conversions. Watch CPCs for 2 weeks — smart bidding sometimes spikes them |
| Phase 3 | Max Conversions **+ Target CPA** (~your observed lead CPA × 1.1) | After 2–4 stable weeks on Phase 2 |
| Phase 4 | Flip **Purchase to primary**, tCPA on purchase (≤$120) or tROAS | At ~30 recorded purchases (likely month 3–5) |

### Seasonal calendar
- **Jul–Aug 2026:** validation period. Late/DIIRSP filers are the steady base demand.
- **Sept 1 – Oct 15, 2026:** extension-deadline ramp → $50/day, consider +$2 bids on AG1/AG4, add "Oct 15 Deadline" headline (17 chars, seasonal swap).
- **Oct 16 – Dec:** demand dips; drop to $20–35/day, keep AG4 (late filers) funded.
- **Jan – Apr 15, 2027:** main season. Budget as high as CPA justifies.

---

# PART 7 — Budget math & KPI targets (estimates, not guarantees)

Assumptions from industry benchmarks (US tax-prep CPCs $4.50–15; your non-US target geos typically $0.50–4 for identical English keywords):

| Metric | Conservative | Expected | Good |
|---|---|---|---|
| Blended CPC | $4.00 | $2.50 | $1.50 |
| Clicks/day @ $20 | 5 | 8 | 13 |
| Click → Lead (/start submit) | 3% | 5% | 8% |
| Leads/week | ~1 | ~3 | ~7 |
| Lead → Paid | 25% | 35% | 50% |
| Purchases/month | ~1 | ~4 | ~12 |
| Purchase CPA | ~$500 ❌ | ~$150 ✅ | ~$50 ✅✅ |

- Average order ≈ $220–260 (tier mix + $149 multi-year add-ons). At ~$150 CPA you're roughly break-even on first purchase and profitable on multi-year/repeat/referral value; at ~$100 CPA comfortably profitable.
- **Kill / fix criteria:** if after ~$600 total spend (≈1 month) you have zero purchases and <8 leads, stop scaling and fix the funnel (landing page, pricing display, form friction) before spending more. The keywords are not the problem in this niche — the query IS the need.
- **KPIs to log weekly:** spend, clicks, CPC, CTR, leads, lead CPA, purchases, purchase CPA, search-term waste %.

---

# PART 8 — Policy & risk notes

1. **No implied IRS affiliation.** Never use "IRS" as if you are the IRS ("IRS Form 5472 Specialists" describes the form — fine; "Official IRS Filing Portal" — never). Google's Government documents & official services policy allows professional preparation services; misrepresentation is what gets accounts suspended.
2. **Trademarks:** don't put competitor names (doola, Bizee, etc.) in ad text. Bidding on their keywords is allowed — but that's a later experiment, not launch.
3. **Superlatives/claims:** "$25,000 penalty" is factual (IRC §6038A) — keep. Avoid "guaranteed," "100% success."
4. **EEA consent (DE/NL):** see §3.3 note. Non-blocking; add a CMP banner when convenient.
5. **Click quality:** with global targeting, watch for click farms (spikes of clicks, 0 engagement, one geo). Bid-adjust the geo down and report invalid clicks if egregious; Google auto-credits most invalid traffic.
6. **AI Max / broad match upsells:** Google's UI and reps will repeatedly suggest enabling them. Decline until you have conversion volume (Part 6 Phase 4+).

---

# PART 9 — After validation: growth levers (do NOT do these at launch)

1. **Microsoft Ads import** (~1 hour): Bing clicks in this niche are often 30–50% cheaper; one-click import of this exact campaign. First thing to try once Google converts.
2. **AG4 landing page test:** `/blog/form-5472-filed-late-never-filed` vs homepage (Week 4+).
3. **Competitor ad group:** bid on "doola tax filing", "bizee form 5472" etc. — own comparison landing page recommended first.
4. **EIN / ITIN campaigns:** you already sell these (`/ein`, `/itin`) — separate campaigns, separate budgets, same playbook.
5. **Remarketing:** your traffic is likely too small for search RLSA/display lists (needs 100–1,000 users); revisit at scale.
6. **Seasonal headline swaps:** "Oct 15 Deadline Is Coming" (25), "File Before April 15" (20).
7. **A dashboard:** ask me to build a weekly performance tracking sheet or a live artifact once data flows.

---

# Appendix A — Launch-day run sheet (condensed)

1. ☐ 2.1 Lead conversion = "Recording conversions"
2. ☐ 2.2 Purchase action created → label into `googleAds.ts` → deploy → test
3. ☐ 1.4 Auto-apply OFF · 1.2 verification OK · 1.3 billing OK
4. ☐ 3.1–3.8 Campaign built paused (settings table §3.2)
5. ☐ Part 4 QA checklist all green
6. ☐ Enable campaign · calendar reminders: +24h, +72h, +7d reviews
7. ☐ Day 3: first search-terms triage · Day 7: week-1 review (Part 5)

# Appendix B — What changed vs. the May 2026 CSV build

| # | Old (CSV/checklist) | New (this plan) | Reason |
|---|---|---|---|
| 1 | Budget $50/day | $20/day + scaling gates | Your decision; safer validation |
| 2 | Language: English | All languages | Browser-language ≠ search language for foreign founders |
| 3 | Sitelinks → /how-it-works, /late-filing, /get-started | /pricing, /start, 2 blog posts | Those pages don't exist; these do |
| 4 | Max CPC $8 all groups | $4–6 by ad group | $8 = 2.5 clicks/day at $20 budget |
| 5 | (predates AI Max GA) | Explicit AI Max opt-out | ON by default for new campaigns since Apr 2026 |
| 6 | Location: all countries (default) | 16 named countries, Presence-only | Your decision |
| 7 | "DECIDE" items unresolved | All resolved (§3.5) | deadline/due-date allowed; 5471/fbar/boi negative; ein/itin NOT negative |
| 8 | Lead conversion only | + Purchase conversion w/ value & dedupe | Code shipped Jul 5, 2026 |

# Appendix C — If you prefer the Ads Editor CSV import path

Apply Appendix B rows 1–4 as edits to `form5472_campaign_build.csv` (budget cell, Language cell, 4 sitelink URL rows, 4 ad-group Max CPC cells), import per the instructions in `form5472_setup_checklist.md` §1.1–1.3, then do §3.2's UI-only settings (locations/presence, AI Max off, goal scoping) manually afterward. The pure-UI path in Part 3 avoids this two-step dance — that's why it's recommended.

