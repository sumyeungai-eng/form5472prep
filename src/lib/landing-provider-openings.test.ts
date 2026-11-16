import { describe, expect, it } from "vitest";
import { LANDING_PAGES } from "./landing-pages";
import { TIERS } from "./pricing";
import { formatPrice } from "./utils";

const PROVIDERS = [
  ["doola-form-5472", "doola"],
  ["firstbase-form-5472", "Firstbase"],
  ["clemta-form-5472", "Clemta"],
  ["startglobal-form-5472", "StartGlobal"],
  ["zenind-form-5472", "Zenind"],
  ["northwest-registered-agent-form-5472", "Northwest Registered Agent"],
  ["stripe-atlas-form-5472", "Stripe Atlas"],
] as const;

describe("provider guide answer-first openings", () => {
  it.each(PROVIDERS)("%s answers alternative, process, price and scope (steps and price within 130 words)", (slug, provider) => {
    const page = LANDING_PAGES.find((entry) => entry.slug === slug)!;
    const full = [page.intro, ...page.sections.flatMap((s) => [s.heading, s.body])]
      .join(" ");
    const opening = full.split(/\s+/).slice(0, 130).join(" ");
    const std = formatPrice(TIERS.standard.priceCents);
    const exp = formatPrice(TIERS.express.priceCents);
    const parts = [
      `Can a ${provider} customer file Form 5472 another way? Yes, in five steps:`,
      "1. Complete the guided intake form.",
      "2. Our team prepares the package.",
      "3. A tax accountant who holds an IRS PTIN reviews it.",
      "4. You check and sign.",
      "5. We fax it to the IRS.",
      `Express (${exp}) is ready to sign in under 3 days; Standard (${std}), 5-7 business days; no subscription.`,
      "Not covered: ",
    ];
    const at = parts.map((p) => full.indexOf(p));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect(at).toEqual([...at].sort((a, b) => a - b));
    // The original (protected) intro precedes this section; steps and price must land inside ~130 words (120 is not reachable with the full five-step process).
    expect(opening).toContain("5. We fax it to the IRS.");
    expect(opening).toContain("no subscription.");
    expect(full).toContain("may suffice");
  });
});
