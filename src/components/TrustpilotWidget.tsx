"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

// Trustpilot business unit for form5472prep.com (public identifier, safe to ship).
const BUSINESS_UNIT_ID = "6a1c5cbd206ad0ec1cb879be";
export const TRUSTPILOT_PROFILE_URL = "https://www.trustpilot.com/review/form5472prep.com";

// TrustBox template ids. Review Collector is free on every plan; the display
// widgets (rating/review carousels) require the paid Plus plan to render.
export const TRUSTPILOT_TEMPLATES = {
  reviewCollector: "56278e9abfbbba0bdcd568bc", // free — "Review us on Trustpilot" button
  microReviewCount: "5419b6a8b0d04a076446a9ad", // Plus — "See our N reviews"
  microStar: "5419b732fbfb950b10de65e5", // Plus — star rating
} as const;

// The Review Collector's tracking token (from the widget builder).
export const REVIEW_COLLECTOR_TOKEN = "53f8ae8f-c06e-4143-acd9-9225ec222cfe";

declare global {
  interface Window {
    Trustpilot?: { loadFromElement: (el: HTMLElement, forceReload?: boolean) => void };
  }
}

export function TrustpilotWidget({
  templateId,
  height = "52px",
  width = "100%",
  token,
  className,
}: {
  templateId: string;
  height?: string;
  width?: string;
  token?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Re-initialise on mount. The bootstrap script auto-scans on first load, but
  // on client-side (SPA) navigation the div mounts after the script already
  // ran, so we ask Trustpilot to (re)render this element explicitly.
  useEffect(() => {
    if (ref.current && window.Trustpilot) {
      window.Trustpilot.loadFromElement(ref.current, true);
    }
  }, [templateId]);

  return (
    <>
      <Script
        src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (ref.current && window.Trustpilot) {
            window.Trustpilot.loadFromElement(ref.current, true);
          }
        }}
      />
      <div
        ref={ref}
        className={`trustpilot-widget ${className ?? ""}`}
        data-locale="en-US"
        data-template-id={templateId}
        data-businessunit-id={BUSINESS_UNIT_ID}
        data-style-height={height}
        data-style-width={width}
        {...(token ? { "data-token": token } : {})}
      >
        {/* Fallback link shown until the widget renders. */}
        <a href={TRUSTPILOT_PROFILE_URL} target="_blank" rel="noopener noreferrer">
          Trustpilot
        </a>
      </div>
    </>
  );
}
