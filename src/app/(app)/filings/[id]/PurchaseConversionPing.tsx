"use client";

import { useEffect } from "react";
import { firePurchaseConversion } from "@/lib/analytics/googleAds";

// Fires the Google Ads purchase conversion once per paid filing.
//
// Rendered by the filing detail page ONLY when the server has already
// verified payment (Stripe webhook promoted the filing, or the page's own
// Stripe session re-check did) — never off the bare ?paid=1 query param.
// Google-side dedupe via transaction_id (= filing id) means refreshes and
// revisits of the ?paid=1 URL don't double-count.
export function PurchaseConversionPing({
  amountCents,
  filingId,
}: {
  amountCents: number;
  filingId: string;
}) {
  useEffect(() => {
    firePurchaseConversion({ amountCents, transactionId: filingId });
  }, [amountCents, filingId]);
  return null;
}
