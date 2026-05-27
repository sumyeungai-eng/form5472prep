# Claude Code Prompt — Install Google Ads Conversion Tag

Copy everything below the `---` line and paste it into Claude Code (in your form5472prep.com project directory).

---

I need you to install the Google Ads conversion tracking tag on form5472prep.com. The conversion ID is **AW-18127544007**.

## Goals (in priority order)

1. **Install the base gtag.js snippet** so it loads on every page of the site (homepage and any subpages).
2. **Fire a conversion event** when a customer successfully submits the intake/checkout form (i.e., the action that means "this person became a lead/paid customer"). I do not yet have the conversion label from Google Ads — for now, wire up the call with a placeholder label like `AW-18127544007/CONVERSION_LABEL_TBD` and leave a clear `TODO` comment so I can swap it in once I create the conversion action in Google Ads.
3. **Don't break anything.** This site is live and serving paid Google Ads traffic. The tag must not block rendering, not throw console errors, and not interfere with the existing form submission flow.

## Steps I want you to follow

1. **Detect the stack first.** Look at `package.json` / framework config to confirm whether this is Next.js (App Router vs Pages Router), plain React, vanilla HTML, etc. Adjust your install accordingly:
   - **Next.js App Router** → use `next/script` with `strategy="afterInteractive"` inside `app/layout.tsx` (or `.jsx`).
   - **Next.js Pages Router** → use `next/script` in `pages/_app.tsx` or `pages/_document.tsx`.
   - **Vanilla HTML / static** → add the snippet to `<head>` of every HTML page (or the shared layout/template).
   - **Other framework** → install in the equivalent shared layout file. Tell me what you chose and why.

2. **Add the base tag** exactly as Google specifies:

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

   In a framework, use the idiomatic equivalent (e.g., `next/script` components). Do NOT use a wrapper library — just gtag.js directly.

3. **Wire the conversion fire** on successful form submission. Find the form submit handler (probably in a component like `CheckoutForm`, `IntakeForm`, or wherever Stripe/payment success is handled). After the success state (200 response, payment confirmed, whatever the "we got the customer" moment is), call:

   ```js
   if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
     window.gtag('event', 'conversion', {
       send_to: 'AW-18127544007/CONVERSION_LABEL_TBD', // TODO: replace CONVERSION_LABEL_TBD with the real label from Google Ads → Goals → Conversions
       value: 199.00, // adjust to actual purchase amount if you have it in scope
       currency: 'USD',
       transaction_id: '', // optional: pass order ID if available, to dedupe conversions
     });
   }
   ```

   If the order total varies (Standard $199 / Rush $279 / Premium $449 / +$149 per additional year), pass the actual purchase amount in `value` instead of hard-coding 199.

4. **Verify after install:**
   - Run the dev server (`npm run dev` or equivalent) and open the site.
   - Open DevTools → Network tab → filter for "googletagmanager" or "google".
   - Reload the homepage. Confirm a request to `https://www.googletagmanager.com/gtag/js?id=AW-18127544007` returns 200.
   - Open the Console and run `typeof window.gtag` — should return `"function"`.
   - Confirm no new console errors or warnings introduced.

5. **Don't deploy.** Just commit to a branch (or leave uncommitted) and tell me what files you changed. I'll review and deploy myself.

## Things NOT to do

- Don't install Google Tag Manager (GTM) — I want gtag.js directly.
- Don't add Google Analytics 4 unless I ask separately (this is Ads conversion tracking only).
- Don't touch `.env` or add new dependencies — gtag.js is loaded from Google's CDN, no npm install needed.
- Don't modify the existing form validation or submit logic beyond adding the gtag call after success.
- Don't add cookie banners or consent management — I'll handle that separately if needed.

## What to report back

When done, tell me:
1. What stack you detected and which file(s) you modified.
2. The exact `git diff` (or a summary of edits).
3. Confirmation that the tag fires on page load (verified via Network tab).
4. The exact line where you added the conversion event call, so I know where to swap in the real conversion label later.
