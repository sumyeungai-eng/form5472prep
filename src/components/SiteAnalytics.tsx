"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { onPortalHost } from "@/lib/partner/portalHost";

// Vercel Analytics + Speed Insights everywhere except the partner clients'
// portal domain. Both inject their script on mount anyway, so mounting them
// one effect later changes nothing for the main site.
export function SiteAnalytics() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => setEnabled(!onPortalHost()), []);
  if (!enabled) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
