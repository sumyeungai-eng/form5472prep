# Form 5472 Google Ads — Setup & Launch Checklist

> **STOP BEFORE GOING LIVE.** Complete every item in Phase 0 and Phase 1 before enabling the campaign.  
> This checklist covers both the Google Ads Editor (CSV import) path and the manual UI path.  
> Do NOT click "Publish" in Google Ads Editor or "Save and continue" on billing until you are ready to spend real money.

---

## ⚠️ PHASE 0 — PREREQUISITES (must complete before anything else)

### 0.1 Conversion Tracking — #1 PRIORITY

**Status: Unknown — verify before launch.**

Without a conversion action firing, you cannot optimize bids, cannot measure ROI, and cannot transition to smart bidding later.

**Check whether you already have tracking:**
1. Log in to Google Ads at ads.google.com (account: sumyeungus@gmail.com).
2. Go to **Goals → Conversions → Summary**.
3. Look for an active conversion action on form5472prep.com. Check the "Status" column — it should say "Recording conversions."

**If no conversion action exists, set one up NOW:**
- Recommended event to track: **Lead form submission** (the "Contact Us" / intake form submit on form5472prep.com) OR **Purchase / checkout complete** if the site has a payment flow.
- How to create it:
  1. In Google Ads → Goals → Conversions → click **New conversion action**.
  2. Choose **Website**.
  3. Enter `form5472prep.com` and click **Scan**.
  4. Choose **Submit lead form** (or "Purchase" if applicable).
  5. Follow the tag setup instructions (Google Tag or Google Tag Manager).
  6. Install the tag on your site and verify it fires on a test submission.
  7. Wait 24–48 hours and confirm the status shows "Recording conversions" before enabling the campaign.

**Why this matters:** Without conversions tracked, Manual CPC will run blind. Smart bidding (Phase 3) cannot activate without 15–30 conversion signals.

---

### 0.2 Verify Sitelink URLs

Before importing or manually entering sitelinks, visit each URL and confirm the page exists and loads correctly:

| Sitelink | Intended URL | Live? |
|----------|-------------|-------|
| Pricing | form5472prep.com/pricing | ☐ |
| How It Works | form5472prep.com/how-it-works | ☐ |
| Late Filing Help | form5472prep.com/late-filing | ☐ |
| Get Started | form5472prep.com/get-started | ☐ |

If a URL returns a 404 or redirect, update it to the correct live URL before adding the sitelink. Use the homepage as a fallback only as a last resort.

---

### 0.3 Confirm Existing Campaign Is Untouched

1. Log in to ads.google.com (sumyeungus@gmail.com).
2. In the Campaigns view, note the name of the existing campaign.
3. Confirm it is **not** paused, modified, or affected.
4. Note the existing campaign name here for reference: `_______________________`

---

## PHASE 1 — IMPORT VIA GOOGLE ADS EDITOR (recommended path)

### 1.1 Download & Open Google Ads Editor

1. Download Google Ads Editor from: https://ads.google.com/home/tools/ads-editor/
2. Open Ads Editor and sign in with **sumyeungus@gmail.com**.
3. Click **Download** to pull your current account data.
4. Confirm the existing campaign appears. Do not select or modify it.

### 1.2 Import the CSV

1. In Google Ads Editor, click **File → Import → Import CSV…** (or use Ctrl+Shift+I / Cmd+Shift+I).
2. Select `form5472_campaign_build.csv` from your workspace folder.
3. In the import dialog:
   - Review the column mapping. Key columns to verify:
     - `Campaign` → Campaign
     - `Ad Group` → Ad group
     - `Keyword` → Keyword
     - `Match Type` → Match type
     - `Max CPC` → Max. CPC bid
     - `Headline 1` … `Headline 15` → Headline 1 … 15
     - `Description 1` … `Description 4` → Description 1 … 4
     - `Final URL` → Final URL
   - If any column is "Ignored" or unmatched, manually remap it using the dropdown.
4. Click **Import**.
5. Review the **Import summary** — it should show:
   - 1 campaign added
   - 4 ad groups added
   - ~26 keywords added
   - ~36 negative keywords added
   - 4 responsive search ads added
   - 4 sitelinks added
   - 6 callouts added

**If you see errors:** Google Ads Editor will flag them in red. Common issues and fixes:
- *"Duplicate keyword"* — safe to ignore if it's the same keyword in the same match type.
- *"Headline exceeds 30 characters"* — check the ad copy file; all headlines are ≤30 chars. May be a display encoding issue.
- *"URL not valid"* — update the sitelink URLs to verified live pages.
- *"Column not recognized"* — remap in the import dialog or delete the column from the CSV.

### 1.3 Post-Import Checks in Google Ads Editor

Run through each item in the campaign tree:

**Campaign level:**
- [ ] Campaign name: "Form5472 Filing Service"
- [ ] Status: Paused
- [ ] Daily budget: $50.00
- [ ] Bid strategy: Manual CPC
- [ ] Search Network: ON / Search Partners: OFF / Display Network: OFF
- [ ] Language: English

**Ad Groups (4):**
- [ ] AG1 - Filing Service — Default Max CPC: $8.00
- [ ] AG2 - Foreign-Owned LLC — Default Max CPC: $8.00
- [ ] AG3 - CPA Help — Default Max CPC: $8.00
- [ ] AG4 - Late Filing & Penalty — Default Max CPC: $8.00

**Keywords:**
- [ ] All keywords in Phrase or Exact match only. Zero broad match keywords.
- [ ] No keyword appears in a wrong ad group.

**RSAs (4 total — one per ad group):**
- [ ] Each RSA has 15 headlines and 4 descriptions.
- [ ] Headline 1 is pinned to position 1 in each RSA.
- [ ] Final URL is correct on each ad.

**Negative Keywords (campaign-level):**
- [ ] ~36 negatives present at campaign level (not ad-group level).
- [ ] Review DECIDE items — see Section 1.4 below.

**Sitelinks / Callouts:**
- [ ] 4 sitelinks visible at campaign level.
- [ ] 6 callouts visible at campaign level.
- [ ] Structured snippet visible (Services).

### 1.4 Resolve DECIDE Items Before Publishing

| DECIDE Item | Your Decision | Action |
|-------------|---------------|--------|
| `deadline` and `due date` as negatives | Keep or remove? | Recommend: **REMOVE** both as negatives — urgent deadline searchers are high-value buyers, not browsers. |
| `form 5471`, `5471` as negatives | Keep if 5471 is NOT offered | Delete these two negative rows if you also offer Form 5471 filing. |
| `fbar` as negative | Keep if FBAR is NOT offered | Delete if you offer FBAR. |
| `fincen`, `boi`, `beneficial ownership` as negatives | Keep if BOI is NOT offered | Delete if you offer BOI/FinCEN reporting. |
| Location targeting scope | All countries vs. narrower list | Default is all countries. Optional narrow set: India, UK, UAE, Canada, Germany, Pakistan, Nigeria, Singapore, Australia, Netherlands, Hong Kong. |
| Lead Form asset | Add or skip? | Recommended: add if you want direct leads captured in the SERP (especially valuable on mobile). |
| Call asset | Add or skip? | Only add if you have a staffed phone line. |

### 1.5 Publish

> ⚠️ **Do NOT click Publish until all checklist items above are complete and conversion tracking is confirmed active.**

1. In Google Ads Editor, click **Post changes** (or "Publish").
2. Review the summary one final time.
3. Click **Post**.
4. The campaign will appear in your Google Ads account — still **Paused**.

---

## PHASE 2 — SETTINGS THAT CANNOT BE IMPORTED (do these in the UI)

Some settings cannot be set via CSV import and must be done manually in the Google Ads UI.

Log in at: https://ads.google.com → Account: sumyeungus@gmail.com → Find campaign "Form5472 Filing Service."

### 2.1 Location Targeting

1. Click the campaign → **Settings → Locations**.
2. **Add** your target locations. Default choice: leave blank for all countries (global).  
   Optional: add specific countries — India, UK, UAE, Canada, Germany, Pakistan, Nigeria, Singapore, Australia, Netherlands, Hong Kong.
3. **Critical — change the Location Options setting:**
   - Click "Location options" (advanced).
   - Set **Target** to: **"Presence: People in or regularly in your targeted locations"**
   - Do NOT use "Presence or interest." This distinction is critical for targeting actual foreign founders, not people who just searched about those places.
4. Save.

### 2.2 Ad Schedule (optional)

If your service team is available only certain hours, consider restricting ad serving. For a global audience, running 24/7 is usually correct — leave the default (all hours).

### 2.3 Conversion Action Assignment

1. Go to campaign **Settings → Goals**.
2. Under "Conversion goals," confirm the lead/purchase conversion action you created in Phase 0 is selected.
3. If it's not listed, click **Edit conversion goals** and add it.

### 2.4 Verify the Structured Snippet

Structured snippets can only be partially configured via import. Verify in the UI:
1. Campaign → **Assets** → **Structured snippets**.
2. Confirm: Header = "Services", Values = "Form 5472 Prep, Pro Forma 1120, Late Filing, Penalty Help, Catch-Up Filing."
3. If missing or incomplete, add manually.

### 2.5 Billing (YOUR ACTION — do not automate)

> This step is for you to complete manually. Do not share billing details in any automated workflow.

1. Go to **Billing → Summary** and confirm a valid payment method is attached.
2. If not, add one now before enabling the campaign.

---

## PHASE 3 — ENABLE & MONITOR

### 3.1 Enable the Campaign

Once Phases 0–2 are complete and conversion tracking is confirmed firing:
1. Go to Campaigns → find "Form5472 Filing Service" (Status: Paused).
2. Click the status toggle → change to **Enabled**.
3. Note the date: `_______________________`

### 3.2 First 48–72 Hours — Watch These

| Signal | What to check | Action if problem |
|--------|--------------|-------------------|
| Impression share | Are keywords getting any impressions? | If zero impressions after 24h: check that ads are approved and campaign is enabled. |
| Search terms report | What queries is Google matching? | Add new negatives immediately for any irrelevant terms. Check: Campaigns → Keywords → Search terms. |
| Ad strength | Each RSA should show "Good" or "Excellent" | If "Poor," add more headline variety or unpin H1 and re-test. |
| Disapprovals | Any ads flagged? | Common: trademark issues, capitalization. Review and fix in Ads & Assets tab. |
| Spend rate | Is the $50/day budget burning quickly? | At launch, expect underspend (niche query volume). If overspending unexpectedly, pause and review match types. |

### 3.3 Ongoing — First 2 Weeks

- **Weekly:** Pull the Search Terms report and add new negatives. This is the single highest-impact maintenance task.
- **After 2 weeks:** Review CPC by keyword. Raise max CPC on keywords converting; lower or pause keywords with high spend and zero conversions.
- **Review the DECIDE items:** Check if `deadline` / `due date` traffic is converting. If yes, confirm you removed those negatives.

---

## PHASE 4 — BIDDING STRATEGY UPGRADE (do later, not now)

> Do NOT switch bidding strategy at launch. Manual CPC is correct until you have data.

**When to switch:** After accumulating **15–30 tracked conversions** in the campaign (typically 4–8 weeks after launch).

**How to switch:**
1. Google Ads → Campaign → Settings → Bidding.
2. Change from "Manual CPC" to **"Maximize Conversions."**
3. Set a **Target CPA** if you have a clear cost-per-lead target. If not, leave it unset initially and let Google optimize for volume first.
4. After 2–4 weeks on Maximize Conversions with stable data, you can refine to **Target CPA** or **Target ROAS** if you have revenue data.

> **Note:** Do not switch to Target Impression Share or Maximize Clicks as a long-term strategy — these optimize for visibility/traffic, not intent.

---

## QUICK REFERENCE — FINAL PRE-LAUNCH CHECKLIST

- [ ] Conversion action created and firing on form5472prep.com
- [ ] All 4 sitelink URLs verified live
- [ ] CSV imported successfully via Google Ads Editor
- [ ] Campaign status: Paused in Editor before posting
- [ ] Existing campaign confirmed untouched
- [ ] DECIDE items resolved (negatives, location scope, lead form)
- [ ] Location targeting set to "Presence" (not "Interest")
- [ ] Conversion action assigned to campaign (Phase 2.3)
- [ ] Billing method confirmed
- [ ] Campaign enabled (date: _________________)
- [ ] Search terms report scheduled for review at Day 3, Day 7, Day 14
