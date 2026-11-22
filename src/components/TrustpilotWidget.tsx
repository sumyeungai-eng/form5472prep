"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { TRUSTPILOT_PROFILE_URL } from "@/lib/seo";

// Trustpilot business unit for form5472prep.com (public identifier, safe to ship).
const BUSINESS_UNIT_ID = "6a1c5cbd206ad0ec1cb879be";

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
