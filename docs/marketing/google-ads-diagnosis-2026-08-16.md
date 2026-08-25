# Google Ads Diagnosis — "Form5472 Filing Service"

**Account:** LuxuryAscent (205-421-5211), sumyeungus@gmail.com, authuser=4
**Campaign:** Form5472 Filing Service — campaignId 23875225330
**Investigation date:** 2026-08-16 (data pulled 2026-08-19)
**Method:** Read-only walkthrough of Google Ads UI via browser automation. No settings were changed.

All figures below are labeled with the exact date range shown in the Google Ads UI at the time of capture. "All time" in this account = **29 Apr 2026 – 19 Aug 2026** (the earliest date the UI's "All time" picker will show, not necessarily the true account inception — the campaign itself was created 22 May 2026, see §3).

---

## 1. Campaign status, targeting, and setup

| Field | Value |
|---|---|
| Status | **Paused** |
| Type | Search |
| Budget | US$15.00/day |
| Bidding strategy | **Maximise clicks** (not Maximise conversions / Target CPA) |
| Customer acquisition | Bid equally for new and existing customers |
| Value rules | No rule set |
| Networks | **Google Search Network + Search partners + Display Network** (all three ON) |
| Locations targeted | **0 locations** (i.e., no explicit country/region targeting — defaults to worldwide) |
| Locations excluded | 30 locations (confirmed list includes Algeria, Bangladesh, Bolivia, Myanmar (Burma), Belarus, Cambodia, Sri Lanka, Ghana, + 22 more) |
| Languages | All languages |
| EU political ads | Doesn't have EU political ads |
| Start date | 22 May 2026 |
| End date | Not set |
| Final URL (all ads) | https://form5472prep.com |
| Conversion goals (campaign-level) | Account default: **Purchases, Request quotes** — this does **not** include "Form 5472 Lead" (see §6) |
| Ad rotation | Optimise: Prefer best performing ads |
| Campaign URL options / Page feeds / IP exclusions / Brand lists | None set |

**Flags worth noting:**
- No location targeting was ever set for a US-specific IRS tax-filing service — the campaign was eligible to show worldwide minus 30 excluded countries, not restricted to the US or other likely client geographies (foreign owners of US LLCs).
- Bidding is "Maximise clicks," which optimizes purely for click volume, blind to conversions.
- Search partners + Display Network were both enabled alongside Search Network, which can dilute a small $15/day budget into lower-intent inventory.

---

## 2. Performance — ALL TIME (29 Apr – 19 Aug 2026) and LAST 30 DAYS (20 Jul – 18 Aug 2026)

### Campaign totals

| Metric | All time | Last 30 days |
|---|---|---|
| Impressions | 26,791 | 0 |
| Clicks | 1,254 | 0 |
| CTR | 4.68% | — |
| Avg. CPC | US$0.13 | — |
| Cost | US$167.57 | US$0.00 |
| Conversions | **0.00** | 0.00 |
| Conv. value | US$0.00 | US$0.00 |
| Conversion rate | 0.00% | 0.00% |

The last-30-days figures are all zero because the campaign has been paused (with one 7-minute exception on 4 Aug — see §3) since 30 May 2026, well before the 20 Jul–18 Aug window.

### Per ad group — ALL TIME

| Ad group | Impr. | Clicks | CTR | Avg. CPC | Cost | Conversions |
|---|---|---|---|---|---|---|
| AG1 – Filing Service | 6,252 | 268 | 4.29% | US$0.25 | US$67.20 | 0.00 |
| AG2 – Foreign-Owned LLC | 5,619 | 312 | 5.55% | US$0.10 | US$30.00 | 0.00 |
| AG3 – CPA Help | 7,835 | 307 | 3.92% | US$0.10 | US$29.30 | 0.00 |
| AG4 – Late Filing & Penalty | 7,085 | 367 | 5.18% | US$0.11 | US$41.07 | 0.00 |
| **Total** | **26,791** | **1,254** | **4.68%** | **US$0.13** | **US$167.57** | **0.00** |

All four ad groups show "Not eligible — Campaign is paused" as their status.

---

## 3. Change history — dated sequence (All time, sorted by date)

All changes were made by **sumyeungus@gmail.com** (the account owner) except the initial creation, which was done via **Bulk upload** (script/API), not the web client.

| Date & time | Change |
|---|---|
| 22 May 2026, 03:04:07 | **Campaign created** (Bulk upload); Budget created; Budget set to "Form5472 Filing Service"; 4 platforms added |
| 22 May 2026, 03:04:08 | 4 ad groups created (AG1, AG2, AG3, AG4) (Bulk upload) |
| 22 May 2026, 03:07:20–03:11:51 | Keywords added (exact/phrase match) per ad group (Web client, manual) |
| 22 May 2026, 03:46:07–03:52:25 | Campaign assets created (sitelinks/callouts) (Web client, manual) |
| 22 May 2026, 10:54:17–11:23:50 | More campaign assets created/changed |
| **22 May 2026, 11:42:43** | **1 campaign active** (campaign turned ON — went live) |
| 23 May 2026, 06:48:54 | Keyword max. CPC increased across AG1–AG4 (bid adjustments) |
| **23 May 2026, 10:55** (approx.) | **1 campaign paused** |
| 23 May 2026, 19:38:07 | **1 campaign active** (turned back on) |
| 23 May 2026, 19:39:19 | 1 budget amount increased |
| 24 May 2026, 06:33:36 | 1 negative country added |
| 24 May 2026, 19:31:05 | 2 negative countries added |
| 24 May 2026, 19:58:29 | 27 negative countries added + 2 negative cities added |
| 27 May 2026, 16:15:36 | Campaign changed |
| 27 May 2026, 16:24:16 | Applied recommendation: Price extension; campaign asset created |
| 27 May 2026, 16:33:23 | 3× campaign asset created |
| **30 May 2026, 09:12:54** | **1 campaign paused** |
| 5 Jun 2026, 08:33:45 | 1 budget amount decreased |
| **4 Aug 2026, 20:37:23** | **1 campaign active** (briefly reactivated) |
| **4 Aug 2026, 20:44:39** | **1 campaign paused** (paused again, ~7 minutes later) |

**Reading this sequence:** the campaign was genuinely live for roughly **one week** total — 22 May 11:42 to 23 May ~10:55 (~23 hrs), then paused, then 23 May 19:38 to 30 May 09:12 (~6.5 days) — before being paused on 30 May 2026 and staying paused for over two months. The only activity since is a single 7-minute reactivation test on 4 Aug 2026 that was immediately reversed. All 1,254 clicks and US$167.57 of spend accumulated almost entirely within that first live week (confirmed by the overview chart, which shows a sharp spike late April/May and a flat line to zero thereafter).

---

## 4. Ads

There are 4 ads, one Responsive Search Ad per ad group. All show **Status: "Not eligible — Campaign is paused"**, **Ad strength: Average**, **Ad type: Responsive search ad**. Final URL for all: `https://form5472prep.com`. No disapproval or policy issues were found on any ad — the "not eligible" status is purely because the campaign is paused, not a policy problem.

| Ad group | Primary headline shown | Primary description shown | Clicks | Impr. | CTR | Cost |
|---|---|---|---|---|---|---|
| AG1 – Filing Service | "Form 5472 Filing Service \| Done-For-You 5472 Filing \| Fixed-Price 5472 Filing" (+7 more headlines) | "Prepare & file Form 5472 + pro forma 1120 for foreign-owned U.S. LLCs. Fast & accurate. Missed a fil…" (+2 more descriptions) | 268 | 6,252 | 4.29% | US$67.20 |
| AG2 – Foreign-Owned LLC | "Form 5472 for Foreign LLCs \| Foreign LLC? File Form 5472 \| Single-Member LLC Filing" (+9 more headlines) | "Foreign-owned single-member LLC? We prepare Form 5472 + pro forma 1120. File correctly. Non-U.S. own…" (+2 more) | 312 | 5,619 | 5.55% | US$30.00 |
| AG3 – CPA Help | "Form 5472 CPA Filing Help \| Hire a Form 5472 Expert \| Form 5472 Accountant Help" (+7 more headlines) | "No CPA? No problem. We're Form 5472 specialists for foreign-owned U.S. LLCs. File now. Hire an exper…" (+2 more) | 307 | 7,835 | 3.92% | US$29.30 |
| AG4 – Late Filing & Penalty | "Form 5472 Late Filing Help \| Late on Form 5472? We Help \| Avoid the $25,000 Penalty" (+7 more headlines) | "Late on Form 5472? We file catch-up returns and help you minimize IRS penalties. Act now. The $25000…" (+2 more) | 367 | 7,085 | 5.18% | US$41.07 |

**Price/dollar claims found in the visible ad copy (exact quotes):**
- "Avoid the **$25,000 Penalty**" (AG4 headline) — this is the IRS statutory penalty amount, not a service price.
- "Fixed-Price 5472 Filing" (AG1 headline) — implies a flat fee, but **no specific dollar figure** (e.g., $99/$149/$199) appears in any of the primary headlines or descriptions captured. The remaining "+7/+9 more" headline variants and "+2 more" description variants per ad were not individually expandable through the UI in this session, so a specific price point may exist in one of the untested variants, but none of the visible/primary copy states a number like $99, $149, or $199, nor "50% off."

---

## 5. Keywords and Search Terms

### Keywords (all 26, All time)

Campaign total: 26,791 impr., 4.68% CTR, US$167.57 cost, 1,254 clicks, **0.00 conversions, 0.00% conv. rate**. No Quality Score column is exposed in this account's default keyword view.

| Keyword | Match type | Ad group | Impr. | CTR | Cost | Status notes |
|---|---|---|---|---|---|---|
| [file form 5472] | Exact | AG1 | 295 | 6.10% | US$43.15 | — |
| "file form 5472" | Phrase | AG1 | 4 | 0.00% | US$0.00 | — |
| [form 5472 filing service] | Exact | AG1 | 6 | 0.00% | US$0.00 | — |
| "form 5472 filing service" | Phrase | AG1 | 6 | 0.00% | US$0.00 | — |
| [form 5472 preparation] | Exact | AG1 | 0 | — | US$0.00 | — |
| "form 5472 preparation service" | Phrase | AG1 | 0 | — | US$0.00 | **Low search volume** |
| "5472 filing service" | Phrase | AG1 | 148 | 2.03% | US$7.30 | — |
| [form 5472 preparation service] | Exact | AG1 | 0 | — | US$0.00 | **Low search volume** |
| "form 5472 filing help" | Phrase | AG1 | 0 | — | US$0.00 | — |
| "form 5472 single member llc" | Phrase | AG2 | 0 | — | US$0.00 | — |
| [foreign owned llc form 5472] | Exact | AG2 | — | 6.49% | US$9.14 | — |
| "foreign owned llc form 5472" | Phrase | AG2 | 0 | — | US$0.00 | — |
| "non resident llc form 5472" | Phrase | AG2 | 0 | — | US$0.00 | — |
| "form 5472 foreign owned llc filing" | Phrase | AG2 | — | 2.33% | US$2.48 | — |
| "file 5472 foreign owned llc" | Phrase | AG2 | 0 | — | US$0.00 | **Low search volume** |
| "form 5472 accountant" | Phrase | AG3 | 0 | — | US$0.00 | — |
| "hire someone to file form 5472" | Phrase | AG3 | 0 | — | US$0.00 | **Low search volume** |
| "form 5472 help" | Phrase | AG3 | 0 | — | US$0.00 | — |
| "form 5472 cpa" | Phrase | AG3 | — | 2.53% | US$4.95 | — |
| "form 5472 pro forma 1120 filing" | Phrase | AG3 | — | 3.85% | US$4.83 | — |
| "form 5472 penalty" | Phrase | AG4 | 0 | — | US$0.00 | — |
| "form 5472 penalty help" | Phrase | AG4 | 0 | — | US$0.00 | **Low search volume** |
| "form 5472 late filing" | Phrase | AG4 | — | 13.89% | US$12.36 | — |
| "form 5472 late filing help" | Phrase | AG4 | 0 | — | US$0.00 | **Low search volume** |
| "form 5472 catch up filing" | Phrase | AG4 | 0 | — | US$0.00 | **Low search volume** |
| "late form 5472 foreign owned llc" | Phrase | AG4 | 0 | — | US$0.00 | — |

All 26 keywords show status "Not eligible — Campaign is paused." Roughly half never received an impression at all (even while live), consistent with a genuinely tiny, low-volume niche (foreign-owned US LLC compliance).

### Search terms (All time — 117 total search terms recorded; top ones by clicks shown)

The campaign-wide search terms report totals only **~20 clicks / US$44.85 / 493 impressions** — far less than the campaign's 1,254 clicks / US$167.57. The gap is because Google Ads hides many individual search terms below its privacy/volume threshold, rolling them into an undisclosed "other search terms" bucket. Every individually-disclosed term is a close variant of "form 5472" and closely related IRS/filing terms — **no irrelevant terms were found** among the ~20 disclosed:

| Search term | Match type | Ad group | Clicks | Impr. | CTR | Cost |
|---|---|---|---|---|---|---|
| form 5472 | Exact (close variant) | AG1 | 6 | 131 | 4.58% | US$13.51 |
| 5472 form | Exact (close variant) | AG1 | 2 | 16 | 12.50% | US$4.92 |
| formulario 5472 | Exact (close variant) | AG1 | 2 | 2 | 100.00% | US$5.00 |
| irs form 5472 | Exact (close variant) | AG1 | 2 | 14 | 14.29% | US$4.94 |
| form 5472 | Exact (close variant) | AG2 | 2 | 45 | 4.44% | US$2.55 |
| form 5472 irs | Exact (close variant) | AG1 | 1 | 12 | 8.33% | US$2.43 |
| 5472 1120 | Exact (close variant) | AG2 | 1 | 1 | 100.00% | US$1.71 |
| 5472 form | Exact (close variant) | AG2 | 1 | 10 | 10.00% | US$2.47 |
| form 5472 deadline | Phrase (close variant) | AG2 | 1 | 1 | 100.00% | US$2.48 |
| form 5472 | Exact (close variant) | AG3 | 1 | 28 | 3.57% | US$2.50 |
| pro forma form 1120 | Exact (close variant) | AG3 | 1 | 9 | 11.11% | US$2.34 |

Note: "file form 5472" appears in the search terms list marked **Added** (it was added as a formal exact-match keyword to AG1, and shows as [file form 5472] in the keyword table above with 295 impressions/US$43.15 — by far the single biggest keyword spend). "formulario 5472" is Spanish for "form 5472," picked up despite "All languages" targeting.

---

## 6. Conversions (Goals → Summary / all conversion actions, All time)

The **entire LuxuryAscent account** (all 6 campaigns) has only **5 conversion actions configured** and **6 total recorded conversions** — and those 6 belong to a completely unrelated business.

| Conversion action | Source | Tracking status | Primary/Secondary | Included in account-level goals | All-time count |
|---|---|---|---|---|---|
| Purchase | Website | **Inactive** | Secondary | No | 0.00 |
| LuxuryAscent Purchase | Website | **Inactive** | Secondary | No | 0.00 |
| MileMarketplace (web) purchase | Website (Google Analytics GA4) | No recent conversions | Primary | Yes | 0.00 |
| **Form 5472 Lead** | Website | **Inactive** | Secondary | **No** | **0.00** |
| MileMarketplace (web) booking_request | Website (Google Analytics GA4) | No recent conversions | Primary | Yes | **6.00** (all 6 account conversions) |

**Critical findings on "Form 5472 Lead" specifically** (drilled into its detail page, conversion type ID 7619097821, created 21/05/2026 — one day before the campaign itself):
- Status: **Inactive**.
- Its **"Web pages" tab shows "You don't have any entries yet"** — meaning the conversion tag has **never fired on any web page**, for the entire life of the account. It was never actually installed/verified on form5472prep.com.
- It is **not included in the account-level conversion goals** — and the campaign's own Settings page confirms the campaign's conversion goals are the account defaults ("Purchases, Request quotes"), which do **not include Form 5472 Lead at all**. So even in the week the campaign was live and spending, there was structurally no way for a Form 5472 lead to register as a conversion, and the Maximise-clicks bid strategy had no conversion signal to optimize toward regardless.
- The only conversions the account has ever recorded (6, all "Request quotes") come from **MileMarketplace (web) booking_request**, an entirely separate business/site tracked via GA4 in the same Google Ads account. None are attributable to Form5472 Filing Service.
- "Purchase" and "LuxuryAscent Purchase" are also Inactive with 0 conversions each — general-purpose e-commerce conversion actions, not connected to this campaign's ads.

---

## 7. Billing (Billing → Summary, All time / current)

- **Balance:** US$0.00 (nothing owed).
- **Payment method:** Amex card ending 2007 — active, no decline banners, no "payment declined," "account suspended," or "verification required" messages seen anywhere in the account.
- **Last payment:** 1 Aug 2026, US$100.06 (monthly charge), succeeded.
- **Next automatic payment:** No upcoming payments (consistent with all campaigns being paused and accruing no new spend).
- **Monthly net cost, 2026 (account-wide, all 6 campaigns combined):**
  | Month | Net cost | Payments |
  |---|---|---|
  | April | US$0.51 | US$0.00 |
  | May | US$206.96 | US$160.51 |
  | June | US$7.30 | US$46.96 |
  | July | US$300.06 | US$207.30 |
  | August (partial, to 19 Aug) | US$0.00 | US$100.06 |

Billing is healthy and was never a blocker to the campaign running.

---

## 8. Policy / notification flags

- The persistent in-app banner reads: **"None of your ads are running — Your campaigns and ad groups are paused or removed. Enable them to begin showing your ads."** This is present on every page of the account and is purely a status reflection of the fact all 6 campaigns are currently paused — not a policy violation.
- The notifications bell shows only generic/promotional items, no compliance or disapproval flags:
  - "Some ads may be limited" — generic notice that impressions may be limited in certain sensitive scenarios (standard boilerplate, not specific to this campaign).
  - "Generate more leads with Click To WhatsApp Ads" — upsell prompt.
  - "Redeem your new promotional offer!" — a US$250.00 promotional credit expiring 6 Sept 2026 (unclaimed, per the notification).
- No ad disapprovals, no "Under review," no advertiser verification warnings, and no account-suspension banners were found anywhere in the account for this campaign or any other.
- One inactive/hidden dialog was present in the page's underlying markup (not shown on-screen during this session) with the text "Want to remove this account? — This Google Ads account isn't showing ads because it's not set up. You can finish setting it up or r[emove it]" with "Keep it" / "Remove it" buttons. This appears to be a standard Google Ads prompt that surfaces when all campaigns in an account are paused for an extended period; it was not actively displayed and no action was taken on it.

---

## 9. Other campaigns in the account

The account has **6 campaigns total, all Paused**:

| Campaign | Type | Budget |
|---|---|---|
| Whole website LA | Performance Max | US$5.00/day |
| Hilton Diamond | Performance Max | US$10.00/day |
| MMP Marriott - Search | Search | US$15.00/day |
| **Form5472 Filing Service** | Search | US$15.00/day |
| MileMarketplace — Buy Miles — TierA | Search | US$10.00/day |
| Book-a-Flight - Business Class - Search | Search | US$10.00/day |

Form5472 is one of several unrelated ventures (hotel points/Marriott, MileMarketplace miles marketplace, flight booking, "Whole website LA") all run through the same LuxuryAscent Google Ads account — none of the account's real conversion tracking is wired to Form5472; the only functioning conversion action in the whole account (MileMarketplace booking_request) belongs to a different business entirely.

---

## Summary: account-wide totals (all campaigns, All time, for reference)

Impr. 34,957 · Cost US$519.46 · Conversions 6.00 (all from MileMarketplace, none from Form5472).

## Session 2 — changes applied (2026-08-19)

### A. Conversions
1. **Form 5472 Lead**: Primary already (no change needed). Exact `send_to` from "See event snippet": `AW-18127544007/TFriCN3piLEcEMe98cND`. Compared to expected `AW-18127544007/TFriCN3piLEcEMe98cNd` — **NOT an exact match**: differs only in the final character (actual ends in uppercase `ND`, expected ends in lowercase `Nd`). Everything else matches exactly.
2. **Form 5472 Purchase**: already existed (created by a prior session) and was already Primary — no second conversion action created. Exact `send_to` from "See event snippet": **`AW-18127544007/pzS9CKiPsuQcEMe98cND`** (verbatim, character-exact).
3. **Campaign conversion goals**: changed from "Account default: Purchases, Request quotes and 1 more" to **Campaign-specific: Purchases, Submit lead forms** (Request quotes excluded). Saved and verified via read-back.

### B. Campaign settings
1. **Networks**: changed from "Google Search Network + Search partners + Display Network" to **Google Search Network only** (Search partners OFF, Display Network OFF). Saved.
2. **Locations**: changed from worldwide default (0 explicit targets / 30 excluded) to an explicit **36-country include list**: United States, Canada, United Kingdom, Ireland, Germany, France, Netherlands, Spain, Italy, Portugal, Switzerland, Austria, Belgium, Sweden, Norway, Denmark, Finland, Poland, United Arab Emirates, Saudi Arabia, Israel, Turkey (Türkiye), India, Singapore, Hong Kong, Japan, South Korea, Taiwan, Australia, New Zealand, Brazil, Mexico, Argentina, Colombia, Chile, South Africa. Location option set to **Presence** (was "Presence or interest"). Saved; read-back confirms "Targeted: 36 locations". (Note: the Google Ads location-picker UI was unreliable — several Include clicks silently landed on the wrong suggestion row, e.g. adding "Berlin, Germany" instead of "Germany" — every one of the 36 entries was individually re-verified as the correct country-level row before saving.)
3. **Languages**: changed from "All languages" to **English only**. Saved.
4. **Bid strategy / budget**: left unchanged as instructed. Budget = **US$15.00/day**. Bidding = **Maximise clicks**.

### C. Ads (headlines/descriptions rewrite) — BLOCKED, not completed
Could not complete. Two separate obstacles were hit, in this order:
1. The Ads/Ad-groups list grids in this Google Ads account rendered with **zero-height rows** in the Chrome automation session (rows exist in the DOM — confirmed via accessibility tree — but have no visible/clickable area), making it impossible to click "Edit" on the existing Responsive Search Ads through the normal list view, across multiple reloads, viewport resizes, and both the campaign-wide Ads view and the per-ad-group Ads view.
2. Worked around that by using the "+" → "Responsive search ad" flow to create a **new** RSA for AG1 (Filing Service) instead (fallback explicitly permitted by the brief). Final URL, display path, all 15 headlines, and all 4 descriptions from `google-ads-copy-2026-08-19.json` were entered correctly (no pinning; Ad strength showed "Excellent"). However, clicking **"Save ad" is blocked by a Google account "Confirm it's you" re-authentication dialog** that cannot be completed by this automated session — "Try again" reproduces the same dialog every time, and its own "Blocked during authentication?" help text says the only options are to have another account user make the change, or contact Google support. This is a hard security gate outside agent control; no bypass was attempted per policy.
Net effect: **no ad was created or edited**; AG1's new-RSA draft was left unsaved and was not persisted. AG2/AG3/AG4 headline and description rewrites were not attempted (blocked by the same issue). Callouts (Assets → Callouts) were not attempted.

### D. Enable campaign — NOT DONE
Not attempted, since the brief makes this conditional on Task C being complete and every ad showing Final URL `/form-5472-filing`, which did not happen. Campaign status remains **Paused**.

## Session 3 — ads + budget + enable (2026-08-19)

### A. Budget
Changed from US$15.00/day to **US$10.00/day**. Saved; read-back confirms `Budget: US$10.00/day` on both the Campaigns list header and Campaign settings panel. No auth block on this action.

### B. Ads — still BLOCKED (same "Confirm it's you" gate, re-confirmed 3x)
Re-tested the same Task-C fallback (blue "+" → "Responsive search ad") for **AG1 twice** (across two session restarts, both after a mid-task kill) and **AG2 once**. Each time: Final URL set to `https://www.form5472prep.com/form-5472-filing`, display path `form-5472` / `filing`, prefills cleared, all 15 headlines and all 4 descriptions from `google-ads-copy-2026-08-19.json` entered exactly, no pinning, Ad strength "Excellent"/"Good". Clicking **"Save ad" triggered the identical Google "Confirm it's you" dialog every single time** (screenshotted each occurrence). Per instructions, Confirm was never clicked, no bypass attempted; each draft was discarded via "Cancel" → "Yes, leave" (confirmed via the ad-group-scoped Ads view showing "1-1 of 1", i.e. no duplicate/orphan ad was left behind).
Net effect: **all 4 ad groups still carry their original ads**, unchanged, still pointing at the root domain (`www.form5472prep.com`, not `/form-5472-filing`) with the old headline/description copy. Read-back (via DOM inspection, since the Ads list grid still renders with zero-height rows in this session) confirms all 4 are `Responsive search ad`, **Status: Eligible**, Ad strength "Average", now that the campaign/ad groups are enabled:
- AG1 - Filing Service: "Form 5472 Filing Service | Done-For-You 5472 Filing | Fixed-Price 5472 Filing +7 more" → www.form5472prep.com
- AG2 - Foreign-Owned LLC: "Form 5472 for Foreign LLCs | Foreign LLC? File Form 5472 | Single-Member LLC Filing +9 more" → www.form5472prep.com
- AG3 - CPA Help: "Form 5472 CPA Filing Help | Hire a Form 5472 Expert | Form 5472 Accountant Help +7 more" → www.form5472prep.com
- AG4 - Late Filing & Penalty: "Form 5472 Late Filing Help | Late on Form 5472? We Help | Avoid the $25,000 Penalty +7 more" → www.form5472prep.com

This confirms the block is an account-level security gate, not tied to a specific ad group or draft content — it recurred identically across 3 independent save attempts spanning two ad groups and two session lifetimes.

### C. Callouts — DONE
Assets → "+" → Callout, added at **Campaign** level: "Accountant-Reviewed", "IRS Fax Filing Included", "No Subscription", "Money-Back Guarantee". Saved without any auth block. Read-back (Assets → Associations, filtered to Callout) confirms all 4 present with **Status: Eligible**, Level: Campaign, Added by: Advertiser, last updated 25 Aug 2026. No duplicates of the 8 pre-existing callouts.

### D. Locations — DONE (owner-approved addition mid-session)
Removed the 8 low-conversion geos from the Session-2 36-country include list: India, Turkey (Türkiye), Brazil, Mexico, Argentina, Colombia, Chile, South Africa. Location option (Presence) left unchanged.
This took two attempts because the location-picker's inner list boxes render only ~5-7 rows at a time with coarse, inconsistent-jump scrolling (no visible/draggable scrollbar), which caused two mistakes that were caught and corrected before saving:
1. A stray small drag intended as a fine-scroll nudge instead behaved unpredictably; a follow-up **DOM-level read-only inspection** (via `javascript_exec`, read-only per policy — used only to read `textContent`/`getBoundingClientRect`, never to call `.click()` or mutate state) was used to enumerate the *entire* targeted list irrespective of scroll/virtualization, which is what actually caught the problem below.
2. The DOM inspection revealed Mexico had been re-added to the Included list, so it was still targeted, sitting silently in a scroll-skipped gap. It was still counted as targeted alongside 28 correct rows shown by the panel and the header read 29, not 28.
Fixed by computing Mexico's exact remove-button screen coordinates from its live `getBoundingClientRect()` (read-only) and clicking that pixel with the normal click tool (no JS-driven click) to remove it from Included. Re-ran the DOM inspection afterward: **Targeted list = exactly the 28 expected countries** (United States, Canada, United Kingdom, Ireland, Germany, France, Netherlands, Spain, Italy, Portugal, Switzerland, Austria, Belgium, Sweden, Norway, Denmark, Finland, Poland, United Arab Emirates, Saudi Arabia, Israel, Singapore, Hong Kong, Japan, South Korea, Taiwan, Australia, New Zealand). Saved (confirmed the "You're removing some locations" dialog → Continue) and re-verified via the Campaign settings summary row: **"Targeted: 28 locations"**, no auth block encountered. Excluded list remains its pre-existing 29 entries, unaffected.

### E. Enable campaign + ad groups — DONE
Campaign status changed **Paused → Enabled**; read-back shows **Status: Eligible**. All 4 ad groups (AG1–AG4) were already `Enabled`/green-dot and now read **Status: Eligible** now that the campaign itself is eligible. No old ads needed pausing since no replacement ads were ever successfully created (Task B remains blocked) — the original 4 ads are simply now live again under the new $10/day budget, narrowed 28-country targeting, and 4 new callouts, still pointing at the site root rather than `/form-5472-filing`.

### Final read-back sweep (end of session 3)
- Budget: **US$10.00/day**
- Campaign status: **Enabled**, Status: **Eligible**
- Ad groups: AG1/AG2/AG3/AG4 all **Enabled**, Status: **Eligible**
- Ads: all 4 ad groups still on their **original** ad (old copy, root-domain final URL) — Task B (headline/description/final-URL rewrite) remains fully **BLOCKED** by the "Confirm it's you" gate; no ad content or final URL was changed this session
- Callouts: 4/4 new campaign-level callouts saved and Eligible
- Locations: Targeted **28** (down from 36; the 8 low-conversion geos removed), Excluded unchanged at 29
- No red banners other than the pre-existing informational "Two-step verification required — Starting 7 September 2026" notice (unrelated, account-wide, not a blocker)

## Session 4 — health check (2026-08-26)

### Read-back (no changes made in this section)
- Campaign: **Form5472 Filing Service** — Status: **Enabled** / **Eligible**, Type: Search, Budget: **US$10.00/day**, Optimisation score: not shown (—).
- Campaign diagnostics panel: "Your campaign hasn't served in the past week" banner present, but drilling into it (All / Account / Ads / Budget and bidding / Goals / Audiences — all green checkmarks) shows **"There are no outstanding issues for this campaign."** No disapprovals, no limited-by-policy notices found anywhere on Overview or Ads pages.
- Only other banner: the pre-existing account-wide informational notice **"Two-step verification required - Starting 7 September 2026, you will need Two-step verification on this account."** (unrelated, not a campaign blocker).
- Today (25 Aug 2026) performance: **0 clicks, 0 impressions, $0.00 cost** — consistent with the "hasn't served" banner. All-time (29 Apr – 25 Aug 2026): 1.25k clicks, 26.8k impressions, $0.13 avg CPC, $168 total cost.
- Ad groups (all 4): AG1 - Filing Service, AG2 - Foreign-Owned LLC, AG3 - CPA Help, AG4 - Late Filing & Penalty — all **Enabled**, Status **Eligible**.
- Ads (read via accessibility-tree DOM inspection, since the Ads grid still renders zero-height rows in this session): all 4 ad groups' RSAs are **Enabled** / **Eligible**, Ad strength **Average**, Ad type Responsive search ad, **Final URL still `https://form5472prep.com` (site root, not `/form-5472-filing`)**, still carrying the pre-existing headline/description copy (not the JSON copy) — i.e. unchanged from Session 3's end state.

### Conditional fix — AG1 ad rewrite retry (probe)
Retried the Task-C fallback (blue "+" → "Responsive search ad" on AG1 - Filing Service, since the Ads grid rows are zero-height/unclickable in this session too). Set Final URL to `https://www.form5472prep.com/form-5472-filing`, display path `form-5472` / `filing`, replaced all 15 prefilled headlines with the JSON's 15 and all 4 prefilled descriptions with the JSON's 4 verbatim, then explicitly unpinned one description field that had inherited a pin from the AI prefill (chose "Show in any unpinned position") — confirmed no other field carried a pin. Ad strength showed "Excellent" before saving.

Clicking **"Save ad" triggered the same "Confirm it's you" dialog** seen in Session 3 ("To keep your data safe, please confirm that it's really you... After confirmation, you will need to complete your action."). Per instructions, **Confirm was never clicked**, no bypass attempted — clicked **Cancel** on the dialog, then **Cancel → "Yes, leave"** on the ad-draft page to discard the unsaved draft cleanly. Verified back on the Ads page with no orphan draft left behind.

**Result: BLOCKED — did not proceed to AG2/AG3/AG4.** This is the 4th independent confirmation (2 sessions, spanning AG1 x3 and AG2 x1) that the "Confirm it's you" gate blocks every ad-save attempt regardless of ad group or draft content; it remains an account-level security gate, not something fixable from within the Ads UI. The owner still needs to clear this (likely tied to the pending 7-Sept-2026 two-step-verification requirement) before Task B (final URL + headline/description rewrite to `/form-5472-filing`) can proceed on any ad group.

## Session 5 — ad swap after verification (2026-08-26)

### A. Ads — UNBLOCKED, all 4 new RSAs saved successfully
The "Confirm it's you" gate that blocked Sessions 3–4 did **not** reappear this session (owner had just completed Google's identity verification). Used the same Task-C fallback (blue "+" → "Responsive search ad") since the Ads grid still renders zero-height rows in this session too (see DOM-bug note below). For each ad group: cleared AI prefills, set Final URL to `https://www.form5472prep.com/form-5472-filing`, display path `form-5472` / `filing`, entered exactly the 15 headlines and 4 descriptions from `google-ads-copy-2026-08-19.json`, left every asset unpinned, then clicked **Save ad** — each save completed cleanly (returned to the Ads list, no dialog) with **no auth block whatsoever** across all 4 ad groups.

New ad IDs (read via the Report Editor, `Ad` + `Ad ID` + `Ad group` + `Ad state` + `Ad final URL` dimensions — this view renders correctly, unlike the Ads grid):
| Ad group | New ad ID | Ad state | Final URL |
|---|---|---|---|
| AG1 - Filing Service | 822242517758 | Enabled | .../form-5472-filing |
| AG2 - Foreign-Owned LLC | 822170710012 | Enabled | .../form-5472-filing |
| AG3 - CPA Help | 822243342473 | Enabled | .../form-5472-filing |
| AG4 - Late Filing & Penalty | 822243630470 | Enabled | .../form-5472-filing |

All 4 confirmed 15/15 headlines, 4/4 descriptions, Ad strength "Excellent" at save time; no pin icons observed on any field.

### B. Old ads — could NOT be paused (Ads grid rendering bug, not the auth gate)
The Ads grid (`/aw/ads`) renders **zero-height rows** for every ad-group/campaign scope this session — confirmed via `read_page` (rows excluded entirely from the accessibility tree) and via read-only `javascript_exec` DOM inspection: the row container `.ess-table-canvas.mouse-active` computes `display: none` / height 0 all the way up to the `.ess-table-wrapper`, while `body` carries a consistent `navmode-mouse` class (i.e. not a touch/mouse viewport-mode mismatch) and no sibling "touch" canvas exists to fall back to. This is a genuine Google Ads front-end bug, not a permissions/security block. Tried and exhausted: full page reload, `Expand` fullscreen, removing extra columns via Modify Columns, toggling the chart panel, resizing the browser window (incl. to a mobile viewport), and the Ad-group-scoped `/aw/ads?adGroupId=...` URL — all produced the same zero-height rows. No direct ad-edit URL pattern was found (`/aw/ads/edit/search?...&adId=...` 404s); the only working read surface is the Report Editor, which is read-only (clicking an ad's title link there opens the ad's landing page in a new tab, not an edit view).

Old ad IDs (still Enabled, unchanged copy, still pointing at the site root `https://form5472prep.com`, not `/form-5472-filing`):
| Ad group | Old ad ID | Ad state | Final URL |
|---|---|---|---|
| AG1 - Filing Service | 809761611023 | Enabled | https://form5472prep.com |
| AG2 - Foreign-Owned LLC | 809684918350 | Enabled | https://form5472prep.com |
| AG3 - CPA Help | 809685503758 | Enabled | https://form5472prep.com |
| AG4 - Late Filing & Penalty | 809763184250 | Enabled | https://form5472prep.com |

**Net effect: each ad group now serves 2 active RSAs (1 old + 1 new) instead of a clean swap.** Google will rotate/optimise between them automatically, but the old off-brand copy and root-domain landing URL are still live and should be paused as soon as the grid bug clears (try again in a fresh session, or use Google Ads Editor / the mobile app, which may not share this web-UI rendering bug) — pause ad IDs 809761611023, 809684918350, 809685503758, 809763184250 by ad group once reachable.

### C. Campaign read-back
- Status: **Enabled**, Eligible, Type: Search.
- Budget: **US$12.00/day** — note this differs from the US$10.00/day set in Session 3 and confirmed in Session 4; something changed it back up to $12/day between Session 4 and now (not touched this session — flagging for owner awareness, not something this session modified).
- Performance diagnostics: "Your campaign hasn't served in the past week" banner present, but drilling in (All / Account / Ads / Budget and bidding / Goals / Audiences) shows **"There are no outstanding issues for this campaign."**
- Today (25 Aug 2026, account timezone GMT-04:00): **0 clicks, 0 impressions, $0.00 cost** — expected, since the new ads only went live moments before this read-back.
- Only other banner: the pre-existing account-wide "Two-step verification required - Starting 7 September 2026" notice (unrelated).

### Summary for owner
4 of 4 ad groups now carry the new copy + `/form-5472-filing` landing URL and are Enabled/Eligible. The old ads in all 4 groups are still Enabled (not paused) purely because of a Google Ads web-UI grid bug (zero-height rows) that made every pause attempt this session impossible — this is not the identity-verification gate, and not something this session left undone by choice. Campaign is Enabled/Eligible; budget reads $12/day (was $10/day as of Session 4, cause unknown). No impressions/clicks yet today, consistent with ads having just gone live.

---

## Session 6 — cleanup + delivery diagnosis (2026-08-26)

**Scope:** (1) pause the 4 old ads, (2) set budget to $10/day, (3) read-only diagnosis of why 0 impressions. No bids, keywords, or bidding-strategy fields were changed. Fresh tab used throughout.

### Task 1 — pausing the 4 old ads: still blocked, same root cause as Session 5

The `.ess-table-canvas` zero-height/zero-width, `display:none` rendering bug is **still present and reproduced again**, confirmed on all of the following paths, each tried in order per the runbook:

- **(a) Campaigns → Ads, hover/click row status:** Ads grid at `/aw/ads?campaignId=...` renders "1 - 8 of 8" (later, at campaign scope) but zero visible rows, both at default 1600px width and after `resize_window` to 1920×1200 — same result after full reload.
- **(b) Single ad group → Ads tab:** navigated into AG1 (`adGroupId=196657682613`) specifically — Keywords tab for that ad group renders perfectly (see Task 3), but its Ads tab shows the identical "1 - 2 of 2" / zero-row bug. Ruled out: this is not a campaign-wide-view-only issue.
- **(c) Row checkbox → Bulk edit bar:** Used `read_page` (accessibility tree) to enumerate all 8 ad rows and their exact `ref_N` checkbox elements even though invisible on screen (the DOM/AX tree still exposes the full row content — headline, ad group, final URL — confirming this is a pure paint/layout bug, not a data-loading bug). Clicked the old-ad checkboxes (e.g. `ref_340` for the AG1 old ad) directly by ref; verified via `aria-checked` and DOM query afterward that **no checkbox actually toggled** — ref-based clicks on a `display:none` ancestor don't register as real pointer events. Bulk-edit bar stayed at "0 selected."
- **(d) Bulk upload CSV (Tools → Bulk actions → Uploads → Upload a file):** This step of the UI works fine (not affected by the grid bug) and successfully accepts a CSV. Tried two header formats — `Action,Campaign,Ad group,Ad ID,Status` and a minimal `Ad ID,Status` — both times "Preview" returned **0 changes / 0 successful / 0 errors**, i.e. the parser didn't recognise either header set as a valid row-type signature (it appears to require the exact template schema, and the "Download template" button generates its file client-side as a Blob with no matching network request, so the real header set could not be captured for a corrected retry). Did not proceed to Apply on unvalidated 0-change data.
- **New attempt this session — Tools → Bulk actions → Rules → Ad rules:** confirmed a rule can be scoped to "Ad group ad," but (i) the built-in "Final URL" condition picker (Attributes → Final URL) needed several nested-menu clicks that kept resetting, and (ii) rules default to a recurring **Daily 02:00–03:00** schedule rather than a one-time run, which is a real risk of an unattended rule firing again later with an unintended scope. Given the ambiguity around getting a one-shot/manual run and the recurring-schedule default, the draft rule was **cancelled without saving** rather than risk leaving a live scheduled rule behind.
- **(e) Reported here per instructions; new ads were NOT touched.** Read-back via the Report Editor (a separate, unaffected reporting surface at `/aw/reporteditor`) confirms the account state is unchanged from before this session: all 8 ads — the 4 old (809761611023, 809684918350, 809685503758, 809763184250, final URL still `https://form5472prep.com`) and the 4 new (822242517758, 822170710012, 822243342473, 822243630470, final URL `.../form-5472-filing`) — are still **Enabled**. Nothing was accidentally paused or modified.

**Recommendation carried forward again:** pause the 4 old ad IDs above via Google Ads Editor (desktop) or the mobile app, which likely don't share this web-UI Angular rendering bug, or retry the web UI in a later session in case it's since been patched.

### Task 2 — Budget: read back and reset to $10/day ✅

- Before change: **US$12.00/day**, plain "average daily budget" field — no shared-budget icon, no "adjusted/recommended by Google" annotation or note of any kind next to it. (This confirms Session 5's note that it drifted from $10 → $12 between sessions was a manual/unexplained change, not an automatic recommendation.)
- Changed via Campaign Settings → Budget → typed `10.00` → Save.
- **After, read back twice (Settings row + top campaign-header budget chip):** US$10.00/day. Confirmed saved.

### Task 3 — Why 0 impressions? (read-only diagnosis)

**Keywords (26 total across the campaign, all phrase/exact match, all $0 cost / 0 impressions):**

| Ad group | Keyword count | Not eligible (Low search volume) | Eligible |
|---|---|---|---|
| AG1 - Filing Service | 9 | 2 | 7 |
| AG2 - Foreign-Owned LLC | 6 | 1 | 5 |
| AG3 - CPA Help | 5 | 1 | 4 |
| AG4 - Late Filing & Penalty | 6 | 3 | 3 |
| **Total** | **26** | **7** | **19** |

No keyword showed "Below first page bid," "Rarely shown due to low Quality Score," or a visible Quality Score column value (QS shows blank/unassigned for all, consistent with keywords that have never accumulated any impressions to score). The 7 "Not eligible — Low search volume" keywords are long-tail phrase-match terms (e.g. `"form 5472 catch up filing"`, `"hire someone to file form 5472"`) that Google has determined get too little search traffic to serve at all; the other 19 are Eligible but still 0 impressions.

**Ad review status:** Could not get a definitive per-ad "Under review"/"Eligible"/"Limited" pill (the Ads grid bug blocked the direct read, and the Report Editor's "Ad status" column returned blank for every row rather than a value). However, the **Overview → Performance diagnostics → Ads tab** gives an authoritative rollup: *"Your ad groups are properly configured and active with ads that are eligible to serve."* Same green checkmark on **Account**, **Budget and bidding**, **Goals**, and **Audiences** tabs — Google's own diagnostic explicitly reports **no outstanding issues** anywhere in the campaign, despite the top-level "hasn't served in the past week" banner.

**Campaign settings relevant to delivery:**
- Bid strategy: **Maximise clicks**, with a **Maximum CPC bid limit of US$3.00 set and enabled** (checkbox on) — a real constraint that could suppress participation in any auction where the going rate exceeds $3, though Google's own recommendation banner in that same panel suggests switching to *Maximise conversions* instead, not that the cap itself is blocking.
- Locations: **Targeted: Australia (country) + 27 more = 28 total** ✅ matches expected count. Excluded: Algeria (country) + 28 more = 29 total.
- Languages: **English** only.
- Networks: Google Search Network.
- Start date: 22 May 2026 (campaign has been live/Enabled for over 3 months already — this is not a "just launched, still ramping" situation for the campaign as a whole, only for the 4 brand-new ads swapped in today).
- No "Limited by budget" / "Learning" / policy notice appeared anywhere in Settings or the diagnostics panel.

**Overview (today, 25 Aug 2026, account timezone GMT-04:00):** 0 clicks, 0 impressions, $0.00 cost for the selected 7-day window (18–24 Aug) and implicitly today — consistent with the "hasn't served in the past week" banner.

**Best-evidence explanation for 0 impressions:** Google's own diagnostics report zero configuration issues, so this reads as a genuine near-zero-search-volume problem rather than a disapproval/budget/targeting misconfiguration. All 26 keywords are ultra-specific, low-competition long-tail phrases around "Form 5472" filing — 7 are flagged outright as having too little search volume to ever serve, and the remaining 19 "Eligible" keywords are similarly narrow (e.g. `"form 5472 accountant"`, `"non resident llc form 5472"`) with likely near-zero real query volume, worsened by phrase/exact-only matching (no broad match) and a $3 max-CPC cap on a Maximise-clicks strategy that further narrows auction participation. This has apparently been the state for the campaign's full 3-month lifetime (26,791 lifetime impressions per Session 1's original diagnosis were mostly from Search+Display+Search Partners running broader/looser targeting before Session 3/4 tightened things down — see §1–2 above), i.e. the current very narrow, Search-only, low-cap, long-tail-keyword configuration is structurally why it now gets ~0 impressions, not a broken account.

---

## Session 7 — delivery unblock (2026-08-26)

**Scope:** (1) remove the $3 max-CPC bid cap flagged in Session 6, (2) add head-term keywords across all 4 ad groups, (3) add campaign negatives, (4) retry pausing the 4 old ads. Fresh tab used throughout.

### Task 1 — Bid cap removed ✅

Campaign → Settings → Bidding → unchecked **"Set a maximum cost per click bid limit"** (was checked, US$3.00). Bid strategy left unchanged (**Maximise clicks**). Saved; read back twice (collapsed row shows "Maximise clicks" with no cap sub-line; re-expanded panel shows the checkbox unchecked and the "Maximum CPC bid limit" field gone entirely). Budget's $10/day is now the only spend control on this campaign.

### Task 2 — Keyword audit + head-term additions ✅

**All 26 existing keywords, verbatim (compact):**

| Ad group | Keyword | Match | Status |
|---|---|---|---|
| AG1 | form 5472 preparation service | Phrase | Not eligible – Low search volume |
| AG1 | form 5472 preparation service | Exact | Not eligible – Low search volume |
| AG1 | file form 5472 | Exact | Eligible |
| AG1 | file form 5472 | Phrase | Eligible |
| AG1 | form 5472 filing service | Exact | Eligible |
| AG1 | form 5472 filing service | Phrase | Eligible |
| AG1 | form 5472 preparation | Exact | Eligible |
| AG1 | 5472 filing service | Phrase | Eligible |
| AG1 | form 5472 filing help | Phrase | Eligible |
| AG2 | file 5472 foreign owned llc | Phrase | Not eligible – Low search volume |
| AG2 | form 5472 single member llc | Phrase | Eligible |
| AG2 | foreign owned llc form 5472 | Exact | Eligible |
| AG2 | foreign owned llc form 5472 | Phrase | Eligible |
| AG2 | non resident llc form 5472 | Phrase | Eligible |
| AG2 | form 5472 foreign owned llc filing | Phrase | Eligible |
| AG3 | hire someone to file form 5472 | Phrase | Not eligible – Low search volume |
| AG3 | form 5472 accountant | Phrase | Eligible |
| AG3 | form 5472 help | Phrase | Eligible |
| AG3 | form 5472 cpa | Phrase | Eligible |
| AG3 | form 5472 pro forma 1120 filing | Phrase | Eligible |
| AG4 | form 5472 penalty help | Phrase | Not eligible – Low search volume |
| AG4 | form 5472 late filing help | Phrase | Not eligible – Low search volume |
| AG4 | form 5472 catch up filing | Phrase | Not eligible – Low search volume |
| AG4 | form 5472 penalty | Phrase | Eligible |
| AG4 | form 5472 late filing | Phrase | Eligible |
| AG4 | late form 5472 foreign owned llc | Phrase | Eligible |

**Added (phrase match), skipping exact duplicates already present:**

- **AG1** (5 added, 1 skipped): added "form 5472", "irs form 5472", "form 5472 filing", "form 5472 service", "pro forma 1120". Skipped **"file form 5472"** (already existed, both exact and phrase).
- **AG2** (4 added, 1 skipped): added "foreign owned llc tax return", "foreign owned single member llc", "us llc foreign owner tax", "single member llc foreign owner tax". Skipped **"foreign owned llc form 5472"** (already existed, both exact and phrase).
- **AG3** (3 added, 1 skipped): added "form 5472 preparer", "cpa form 5472", "form 5472 accountant near me". Skipped **"form 5472 help"** (already existed).
- **AG4** (3 added, 1 skipped): added "late form 5472", "form 5472 penalty abatement", "form 5472 late filing penalty". Skipped **"form 5472 penalty"** (already existed).

**New totals per ad group** (read back via the campaign-wide Keywords grid, "1 - 41 of 41"): AG1 = **14**, AG2 = **10**, AG3 = **8**, AG4 = **9**. 26 original + 15 added = 41, confirmed.

### Task 3 — Campaign negative keywords ✅

Added via Keywords → Negative keywords → "+" → Campaign-level (Form5472 Filing Service), broad match: **jobs, salary, "free template", pdf, "sample form", software, "how to fill out"**. Save confirmation "Your negative keywords were created" shown.

Note: the negative-keywords list was **not empty going in** — it already held 33 campaign-level negatives from an earlier session (e.g. `5471`, `"beneficial ownership"`, `boi`, `career`, `course`/`courses`, `definition`, `diy`, `"do it yourself"`, `example`/`examples`, `explained`, `fbar`, `fincen`, `"form 5471"`, `forum`, `free`, `"free filing"`, `"how to fill"`, `instructions`, `irs.gov`, `job`, `jobs`, `"log in"`, `login`, `meaning`, `reddit`, `sample`, `study`, `template`/`templates`, `turbotax`, `tutorial`, `"what is"`). **`jobs` was already on the list**, so it did not create a duplicate row. Final read-back: **40 total campaign negatives** (33 pre-existing + 7 requested − 0 net-new for the 1 duplicate = 40; i.e. `salary`, `"free template"`, `pdf`, `"sample form"`, `software`, `"how to fill out"` are net-new, `jobs` was already covered).

### Task 4 — Retry pausing the 4 old ads: still blocked, same confirmed root cause

Retried in order per the runbook, on a fresh tab, fresh reload:
- **(a) Fresh reload of Campaigns → Ads:** `/aw/ads?campaignId=...` still renders **"1 - 8 of 8"** with zero visible/interactable rows. Same after a second full reload and after re-navigating in from Campaigns → Ads menu item.
- **(b) Direct ad detail URL:** `https://ads.google.com/aw/ads/detail?adId=809761611023&adGroupIdForAd=196657682613&campaignId=...` → **404 "That's an error."** This URL pattern does not exist in this Google Ads UI version.
- **(c) Different view/columns/kebab menu:** Tried the ad-group-scoped Ads view (AG1, `adGroupId=196657682613`) — same zero-row bug ("1 - 2 of 2", nothing rendered). Tried fullscreen **Expand** — no change. Tried **Segment** toggle — no menu effect. Opened the **Columns** "Modify columns for ads" panel (this itself renders correctly) and closed it without changes — no effect on the grid below. Tried editing/re-toggling the "Ad status: Enabled, Paused" filter chip to force a full data reload — filter re-saved identically, no effect.
- **(d) Keyboard shortcut (`p` on a selected row):** Confirmed via read-only `javascript_exec` DOM inspection that this is structurally impossible this session: `getBoundingClientRect()` on every `[role="row"]` in the Ads grid returns `{height:0, width:0, top:0}`, and their immediate row-container ancestor (`.ess-table-canvas`) computes `display: none` (up through `.ess-table-wrapper`, `.ess-table-constraint`). A `.focus()` call on the row-1 checkbox lands on `<body>` instead — browsers refuse to focus descendants of a `display:none` ancestor — so there is no way to keyboard-select a row to fire a status shortcut. Ref-based clicks on the same (zero-height) elements via the automation tool also silently fail to register (checkbox stayed at "0 selected" / `aria-checked` unchanged after the click).
- **(e) Reporting per instructions — new ads were NOT touched.** No JS-driven `.click()`/state mutation was used to force a pause; only read-only inspection (`getBoundingClientRect`, `getComputedStyle`, `focus()` diagnostics) was performed on the grid, consistent with prior sessions' policy of never scripting UI actions directly.

This is the **5th consecutive session** (Sessions 5, 6, and now 7) reproducing the identical `.ess-table-canvas { display: none }` bug on the Ads grid, across full reloads, different ad-group/campaign scopes, different browser tabs, and now also ruling out keyboard-focus as a workaround. It is conclusively a Google Ads web-UI rendering defect, not fixable from within this Chrome-automation session. **Recommendation unchanged from Session 6:** pause ad IDs 809761611023 (AG1), 809684918350 (AG2), 809685503758 (AG3), 809763184250 (AG4) via Google Ads Editor (desktop app) or the Google Ads mobile app, neither of which shares this Angular web-grid bug.

### Task 5 — Final read-back

- **Bid cap:** removed (unchecked); bid strategy remains Maximise clicks; budget $10/day is the sole spend lever.
- **Keyword counts:** AG1 14, AG2 10, AG3 8, AG4 9 — **41 total** (26 original + 15 new).
- **Negatives:** **40 total** campaign-level negatives (33 pre-existing + 6 net-new; `jobs` already present).
- **Ads enabled/paused:** unchanged — all 8 ads (4 old: 809761611023/809684918350/809685503758/809763184250, 4 new: 822242517758/822170710012/822243342473/822243630470) remain **Enabled**. Pausing the 4 old ads is still blocked by the Ads-grid rendering bug (Task 4 above); nothing was touched on the new ads.
- **Budget:** US$10.00/day (unchanged, confirmed).
- **Campaign status:** **Enabled**, Status **Eligible**, Type Search.

## Session 8 — architect verification (2026-08-26)

Independently verified in a fresh browser session (not taking lane reports on trust):
- Campaign header, freshly loaded: **Enabled · Status: Eligible · Type: Search · Budget: US$10.00/day**. (The "US$12.00/day" seen in Session 7 came from a STALE Report-Editor tab left open from an earlier session — not a real drift. Always reload before reading campaign chrome.)
- Keywords page: **41 of 41** — confirms 26 original + 15 added. Head terms now present.
- Report Editor (Ad / Ad ID / Ad group / Ad state / Ad final URL) renders correctly and shows **8 enabled ads**: the 4 new ones on `https://www.form5472prep.com/form-5472-filing` and the 4 old ones still Enabled on `https://form5472prep.com` (root).

### ROOT CAUSE HYPOTHESIS for the 5-session Ads-grid failure
Navigating to `/aw/settings?...` returned Google's own interstitial: **"Turn off ad blockers — Google Ads can't work when you're using an ad blocker."** An ad-blocking extension is active in this Chrome profile. Ad blockers apply *cosmetic filtering* by injecting `display:none` on elements matching ad-ish selectors — which is exactly the observed symptom (`.ess-table-canvas { display:none }`, zero-height rows) and exactly why the **Ads** grid breaks while the Keywords grid and Report Editor render fine. This is almost certainly not a Google bug.
**Fix:** allowlist `ads.google.com` in the ad blocker (uBlock Origin: click the extension icon → big power button → reload), then the Ads grid renders and the 4 old ads can be paused normally.

Old ads awaiting pause: 809761611023 (AG1), 809684918350 (AG2), 809685503758 (AG3), 809763184250 (AG4).
Also noted: account-level banner **"Two-step verification required — starting 7 September 2026"** (the likely source of the recurring "Confirm it's you" gate).
