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
