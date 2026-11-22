// TrustBox template ids. Review Collector is free on every plan; the display
// widgets (rating/review carousels) require the paid Plus plan to render.
export const TRUSTPILOT_TEMPLATES = {
  reviewCollector: "56278e9abfbbba0bdcd568bc", // free — "Review us on Trustpilot" button
  microReviewCount: "5419b6a8b0d04a076446a9ad", // Plus — "See our N reviews"
  microStar: "5419b732fbfb950b10de65e5", // Plus — star rating
} as const;

// The Review Collector's tracking token (from the widget builder).
export const REVIEW_COLLECTOR_TOKEN = "53f8ae8f-c06e-4143-acd9-9225ec222cfe";
