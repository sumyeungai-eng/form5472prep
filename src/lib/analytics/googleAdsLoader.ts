import { PORTAL_HOSTNAME } from "@/lib/partner/portalHost";
// Inline bootstrap for the Google Ads tag (gtag.js), rendered once from
// src/app/layout.tsx via <Script strategy="afterInteractive">.
//
// Why a hand-rolled loader instead of <Script src strategy="lazyOnload">:
// lazyOnload injects gtag.js on `load` + idle, which can land BEFORE the first
// contentful paint whenever the first frame is slow (2026-10-11 Lighthouse runs:
// gtag.js finished at ~1.1 s, first paint at ~1.9 s). Lighthouse's simulated
// LCP then treats the 170 KB tag and its ~130 ms of script evaluation as an LCP
// dependency and replays it under mobile throttling: LCP 2.9 s -> 5.4 s on / and
// /blog/*. Waiting for the browser's own first-contentful-paint entry as well as
// `load` keeps the tag strictly after first paint, at no cost to tracking:
// gtag() calls made earlier queue in `dataLayer` and replay when the tag loads.
//
// Behaviour that must not change (consent/attribution contract):
//   - the `config` call is skipped on /embed/* (tools embedded in third-party
//     pages must not run the ad tag);
//   - the tag still loads on every page as before — this only changes WHEN.

/** Max wait for a first-contentful-paint entry before loading anyway. Pages
 *  opened in a background tab never record FCP, so without this they would
 *  never load the tag. */
export const GTAG_FCP_FALLBACK_MS = 6000;

export function googleAdsBootstrapScript(tagId: string): string {
  const src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagId)}`;
  const notPortal = PORTAL_HOSTNAME ? `location.hostname !== ${JSON.stringify(PORTAL_HOSTNAME)}` : "true";
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
// Partner clients' portal domain: no ad tag at all (gtag stays a stub).
if (${notPortal}) {
// Embeddable tools run inside third-party pages: no ad tag there.
if (!location.pathname.startsWith('/embed/')) gtag('config', ${JSON.stringify(tagId)});
(function () {
  var injected = false, painted = false, loaded = false;
  function inject() {
    if (injected) return;
    injected = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = ${JSON.stringify(src)};
    document.head.appendChild(s);
  }
  function maybeInject() {
    if (!painted || !loaded || injected) return;
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(inject, { timeout: 2000 });
    else setTimeout(inject, 1);
  }
  function onPaint() { if (painted) return; painted = true; maybeInject(); }
  try {
    var types = (window.PerformanceObserver && PerformanceObserver.supportedEntryTypes) || [];
    if (types.indexOf('paint') === -1) {
      painted = true;
    } else if (performance.getEntriesByName('first-contentful-paint').length) {
      painted = true;
    } else {
      var po = new PerformanceObserver(function (list) {
        if (list.getEntriesByName('first-contentful-paint').length) { po.disconnect(); onPaint(); }
      });
      po.observe({ type: 'paint', buffered: true });
      setTimeout(onPaint, ${GTAG_FCP_FALLBACK_MS});
    }
  } catch (e) {
    painted = true;
  }
  function onLoad() { loaded = true; maybeInject(); }
  if (document.readyState === 'complete') onLoad();
  else window.addEventListener('load', onLoad, { once: true });
})();
}
`;
}
