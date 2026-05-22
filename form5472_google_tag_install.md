# Form 5472 — Google Ads Conversion Tag Installation

**Conversion action created:** Form 5472 Lead  
**Google Ads account:** LuxuryAscent (205-421-5211) — sumyeungus@gmail.com  
**Tag ID:** AW-18127544007  
**Conversion label:** TFriCN3piLEcEMe98cNd  

---

## STEP 1 — Install the Google Tag on EVERY page

Copy and paste this code immediately after the `<head>` tag on **every page** of form5472prep.com.

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18127544007"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-18127544007');
</script>
```

> **If you use a website builder** (Webflow, Squarespace, WordPress, Wix, etc.), paste this in the global `<head>` injection setting — you do NOT need to add it to each page manually.

---

## STEP 2 — Install the Event Snippet on the Thank-You / Confirmation page

After someone submits the intake form, they should land on a confirmation or thank-you page. Add this snippet to that page **in addition to the Google Tag above**, placing it right after the Google Tag code.

```html
<!-- Event snippet for Form 5472 Lead conversion -->
<script>
  gtag('event', 'conversion', {
      'send_to': 'AW-18127544007/TFriCN3piLEcEMe98cNd',
      'value': 1.0,
      'currency': 'USD'
  });
</script>
```

> **No thank-you page?** If the form submits in-place (no redirect), fire this snippet on the button click instead. Select "Click" (not "Page load") in the Google Ads snippet settings.

---

## STEP 3 — Verify the tag is firing

1. Install the [Google Tag Assistant Chrome extension](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kehnjphhlifbgfenfkhleplkvkhcnmc).
2. Visit form5472prep.com and submit a test form.
3. Confirm Tag Assistant shows a green checkmark for tag `AW-18127544007`.
4. In Google Ads → Goals → Conversions → Summary, the status for **Form 5472 Lead** should change from "Unverified" to "Recording conversions" within 24–48 hours.

---

## STEP 4 — Do NOT enable the campaign until status shows "Recording conversions"

The campaign is imported and paused. Once this conversion action shows "Recording conversions" in the Google Ads UI, enable the campaign.
