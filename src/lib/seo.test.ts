import { describe, expect, it } from "vitest";
import { organizationNode, pageMeta, SITE_NAME, SITE_URL } from "./seo";

describe("pageMeta", () => {
  it("emits canonical, RSS discovery, Open Graph, and Twitter metadata", () => {
    const meta = pageMeta({
      title: "Pricing — Form 5472 Filing for Foreign-Owned LLCs",
      description: "Pricing for Form 5472 + pro forma 1120 filing.",
      path: "/pricing",
    });
    const twitter = meta.twitter as { card?: string; title?: unknown };
    const openGraph = meta.openGraph as { title?: unknown; type?: string };

    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/pricing`);
    expect(meta.alternates?.types?.["application/rss+xml"]).toBe(`${SITE_URL}/feed.xml`);
    expect(twitter.card).toBe("summary_large_image");
    expect(twitter.title).toBe(openGraph.title);
    expect(openGraph.type).toBe("website");
  });

  it("emits Open Graph image alt text defaulting to the site name", () => {
    const meta = pageMeta({
      title: "Pricing",
      description: "Pricing page",
      path: "/pricing",
    });
    const openGraph = meta.openGraph as {
      images?: Array<{ alt?: string }>;
    };

    expect(openGraph.images?.[0]?.alt).toBe(SITE_NAME);
  });

  it("emits modifiedTime only for article metadata", () => {
    const modifiedTime = "2026-09-11";

    const websiteMeta = pageMeta({
      title: "Pricing",
      description: "Pricing page",
      path: "/pricing",
      modifiedTime,
    });
    const articleMeta = pageMeta({
      title: "Landing page",
      description: "Landing page",
      path: "/delaware-llc-form-5472",
      type: "article",
      modifiedTime,
    });

    expect(websiteMeta.openGraph as Record<string, unknown>).not.toHaveProperty("modifiedTime");
    expect(articleMeta.openGraph as Record<string, unknown>).toHaveProperty("modifiedTime", modifiedTime);
  });
});

describe("organizationNode", () => {
  it("carries the canonical organization facts", () => {
    const node = organizationNode();

    expect(node).toMatchObject({
      legalName: "Form5472 Prep",
      foundingDate: "2025",
      logo: `${SITE_URL}/logo-mark.svg`,
    });
    expect(node.sameAs).toEqual(["https://www.trustpilot.com/review/form5472prep.com"]);
  });

  it("carries restored organization authority fields", () => {
    const node = organizationNode();

    expect(node.knowsAbout).toEqual([
      "IRS Form 5472",
      "IRS Form 1120 (pro forma)",
      "Foreign-owned US single-member LLC tax compliance",
      "DIIRSP — Delinquent International Information Return Submission Procedure",
      "IRC § 6038A reportable transactions",
      "Treasury Regulation § 1.6038A-1",
      "$25,000 IRS information-return penalty abatement",
    ]);
    expect(node.knowsAbout).not.toHaveLength(0);
    expect(node.slogan).toBe("Flat-rate Form 5472 filing. No hidden fees.");
    expect(node.description).toBe(
      "Done-for-you IRS Form 5472 + pro forma Form 1120 filing for foreign-owned US single-member LLCs. Every package reviewed by a qualified tax accountant before fax delivery to the IRS Ogden PIN Unit.",
    );
    expect(node.areaServed).toEqual({ "@type": "Country", name: "United States" });
    expect(node.contactPoint).toHaveLength(2);
    expect(node.contactPoint).toEqual([
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@form5472prep.com",
        availableLanguage: ["en"],
      },
      {
        "@type": "ContactPoint",
        contactType: "billing support",
        email: "support@form5472prep.com",
        availableLanguage: ["en"],
      },
    ]);
  });
});
