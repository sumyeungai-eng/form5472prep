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
  it.each(PROVIDERS)("%s answers alternative, process, price and scope within 120 words", (slug, provider) => {
    const page = LANDING_PAGES.find((entry) => entry.slug === slug)!;
    const opening = [page.intro, ...page.sections.flatMap((s) => [s.heading, s.body])]
      .join(" ").split(/\s+/).slice(0, 120).join(" ");
    const std = formatPrice(TIERS.standard.priceCents);
    const exp = formatPrice(TIERS.express.priceCents);
    const parts = [
      `Can a ${provider} customer file Form 5472 another way? Yes.`,
      "guided intake form",
      `Standard (${std}) ready to sign in 5-7 business days, Express (${exp}) under 3; no subscription.`,
      "Not covered: state returns, bookkeeping, tax advice, IRS representation.",
    ];
    const at = parts.map((p) => opening.indexOf(p));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect(at).toEqual([...at].sort((a, b) => a - b));
    expect(opening).toContain("a tax accountant who holds an IRS PTIN reviews");
    expect(opening).toContain("we fax the IRS Ogden PIN Unit");
    expect(opening).toContain("may suffice");
  });
});
