import { describe, expect, it } from "vitest";
import {
  buildShareSearch,
  classify,
  classifyTransaction,
  normalizeSelection,
  parseSelection,
  serializeSelection,
} from "./classify";
import { OVERALL_MESSAGES, TX_CHECKER_FAQS } from "./content";
import { METHOD_SOURCES, SOURCES, TX_CHECKER_LAST_REVIEWED, type SourceKey } from "./sources";
import { GROUPS, PART_DESCRIPTIONS, TRANSACTIONS, VERDICT_LABELS } from "./transactions";

const ALLOWED_SOURCE_HOSTS = new Set(["www.irs.gov", "www.ecfr.gov", "www.law.cornell.edu"]);

function byId(id: string) {
  const item = TRANSACTIONS.find((transaction) => transaction.id === id);
  if (!item) throw new Error(`missing transaction ${id}`);
  return item;
}

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function allCopy(): string[] {
  return [
    ...TRANSACTIONS.flatMap((item) => [item.label, item.hint, item.where, item.reason]),
    ...TX_CHECKER_FAQS.flatMap((faq) => [faq.q, faq.a]),
    ...Object.values(OVERALL_MESSAGES).flatMap((message) => [message.title, message.body]),
    ...Object.values(PART_DESCRIPTIONS).flatMap((part) => [part.title, part.plain]),
  ];
}

describe("reportable-transactions rules data", () => {
  it("has 12–16 transaction types with unique, URL-safe ids", () => {
    expect(TRANSACTIONS.length).toBeGreaterThanOrEqual(12);
    expect(TRANSACTIONS.length).toBeLessThanOrEqual(16);
    const ids = TRANSACTIONS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("gives every type a verdict, a plain-English answer and at least one primary source", () => {
    for (const item of TRANSACTIONS) {
      expect(Object.keys(VERDICT_LABELS), item.id).toContain(item.verdict);
      expect(item.label.trim(), item.id).not.toBe("");
      expect(item.hint.trim(), item.id).not.toBe("");
      expect(item.where.trim(), item.id).not.toBe("");
      expect(wordCount(item.reason), item.id).toBeGreaterThanOrEqual(25);
      expect(wordCount(item.reason), item.id).toBeLessThanOrEqual(90);
      expect(item.sources.length, item.id).toBeGreaterThan(0);
      for (const key of item.sources) expect(SOURCES[key], `${item.id}:${key}`).toBeDefined();
    }
  });

  it("cites only irs.gov, eCFR and Cornell LII", () => {
    const urls = [
      ...Object.values(SOURCES).map((source) => source.url),
      ...METHOD_SOURCES.map((source) => source.url),
    ];
    for (const url of urls) {
      const parsed = new URL(url);
      expect(parsed.protocol, url).toBe("https:");
      expect(ALLOWED_SOURCE_HOSTS.has(parsed.host), url).toBe(true);
    }
  });

  it("records a verbatim quote for every source", () => {
    for (const [key, source] of Object.entries(SOURCES)) {
      expect(source.quote.trim().length, key).toBeGreaterThan(15);
    }
  });

  it("uses every source key at least once", () => {
    const used = new Set<SourceKey>(TRANSACTIONS.flatMap((item) => item.sources));
    for (const key of Object.keys(SOURCES) as SourceKey[]) {
      if (key === "i5472Penalties") continue; // cited by the FAQ, not a rule
      expect(used.has(key), key).toBe(true);
    }
  });

  it("puts every type in a known group and leaves no group empty", () => {
    const groupIds = new Set(GROUPS.map((group) => group.id));
    for (const item of TRANSACTIONS) expect(groupIds.has(item.group), item.id).toBe(true);
    for (const group of GROUPS) {
      expect(TRANSACTIONS.some((item) => item.group === group.id), group.id).toBe(true);
    }
  });

  it("never assigns a form part to a not-reportable type", () => {
    for (const item of TRANSACTIONS.filter((transaction) => transaction.verdict === "not-reportable")) {
      expect(item.parts, item.id).toEqual([]);
    }
  });

  it("keeps a review date for the methodology section", () => {
    expect(TX_CHECKER_LAST_REVIEWED).toBe("2026-09-29");
  });
});

describe("key verdicts (primary-source anchored)", () => {
  it("owner money into the LLC is a Part V contribution", () => {
    const item = byId("owner-funds-llc");
    expect(item.verdict).toBe("reportable");
    expect(item.parts).toEqual(["V"]);
    expect(item.sources).toContain("reg2B3Xi");
  });

  it.each(["owner-paid-state-fee", "owner-paid-registered-agent", "owner-paid-other-costs"])(
    "%s (LLC cost paid from personal funds) is reportable in Part V",
    (id) => {
      const item = byId(id);
      expect(item.verdict).toBe("reportable");
      expect(item.parts).toEqual(["V"]);
      expect(item.sources).toEqual(expect.arrayContaining(["reg2B3Xi", "reg482Transaction"]));
    },
  );

  it.each(["llc-pays-owner", "llc-pays-personal-expenses"])(
    "%s (money out to the owner) is reportable in Part V",
    (id) => {
      const item = byId(id);
      expect(item.verdict).toBe("reportable");
      expect(item.parts).toEqual(["V"]);
      expect(item.sources).toContain("reg2B3Xi");
    },
  );

  it.each(["loan-to-llc", "loan-to-owner"])(
    "%s (incl. repayments and interest) is reportable in Part IV",
    (id) => {
      const item = byId(id);
      expect(item.verdict).toBe("reportable");
      expect(item.parts).toEqual(["IV"]);
      expect(item.sources).toEqual(expect.arrayContaining(["reg2B3Loans", "reg2B3Interest", "i5472PartIV"]));
      expect(item.hint.toLowerCase()).toMatch(/paying .* back/);
      expect(item.hint.toLowerCase()).toContain("interest");
    },
  );

  it("an LLC reimbursing the owner is still reportable", () => {
    expect(byId("llc-reimburses-owner").verdict).toBe("reportable");
  });

  it("non-cash property from the owner is reportable and flags the Part VI description", () => {
    const item = byId("owner-contributes-property");
    expect(item.verdict).toBe("reportable");
    expect(item.parts).toEqual(["V", "VI"]);
    expect(item.sources).toContain("reg2B4");
    expect(item.hint.toLowerCase()).toContain("crypto");
  });

  it("the LLC paying the owner for services is a Part IV services payment", () => {
    const item = byId("llc-pays-owner-for-services");
    expect(item.verdict).toBe("reportable");
    expect(item.parts).toEqual(["IV"]);
    expect(item.sources).toContain("reg2B3Services");
  });

  it("unpaid work by the owner is 'depends' because the sources do not settle it", () => {
    const item = byId("owner-works-unpaid");
    expect(item.verdict).toBe("depends");
    expect(item.sources).toContain("reg482Transaction");
  });

  it("dealings with another company the owner controls are reportable on a separate Form 5472", () => {
    const item = byId("related-company");
    expect(item.verdict).toBe("reportable");
    expect(item.sources).toEqual(expect.arrayContaining(["reg1RelatedParty", "reg2A1"]));
    expect(item.where).toMatch(/separate Form 5472/);
  });

  it("family members are related parties", () => {
    const item = byId("family-member");
    expect(item.verdict).toBe("reportable");
    expect(item.sources).toContain("irc267");
  });

  it.each(["unrelated-customers", "unrelated-vendors"])("%s is not reportable", (id) => {
    const item = byId(id);
    expect(item.verdict).toBe("not-reportable");
    expect(item.sources).toContain("reg1RelatedParty");
  });
});

describe("selection parsing and share URLs", () => {
  it("parses the documented example query", () => {
    expect(parseSelection("owner-paid-state-fee,loan-to-llc")).toEqual([
      "loan-to-llc",
      "owner-paid-state-fee",
    ]);
  });

  it("drops unknown ids, duplicates, blanks and stray whitespace; tolerates case and encoding", () => {
    expect(parseSelection(" Loan-To-LLC , nope,,loan-to-llc,owner-funds-llc ")).toEqual([
      "owner-funds-llc",
      "loan-to-llc",
    ]);
    expect(parseSelection("owner-funds-llc%2Cloan-to-owner")).toEqual(["owner-funds-llc", "loan-to-owner"]);
    expect(parseSelection("%E0%A4%A")).toEqual([]);
    expect(parseSelection(null)).toEqual([]);
    expect(parseSelection(undefined)).toEqual([]);
    expect(parseSelection("")).toEqual([]);
  });

  it("round-trips every id through serialize → parse", () => {
    const all = TRANSACTIONS.map((item) => item.id);
    const reversed = [...all].reverse();
    expect(parseSelection(serializeSelection(reversed))).toEqual(all);
    expect(normalizeSelection(reversed)).toEqual(all);
  });

  it("writes ?t= with readable commas and keeps other params", () => {
    expect(buildShareSearch("?utm_source=x", ["owner-paid-state-fee", "loan-to-llc"])).toBe(
      "?utm_source=x&t=loan-to-llc,owner-paid-state-fee",
    );
    expect(buildShareSearch("", ["owner-funds-llc"])).toBe("?t=owner-funds-llc");
  });

  it("removes ?t= when nothing is selected", () => {
    expect(buildShareSearch("?t=owner-funds-llc&utm_source=x", [])).toBe("?utm_source=x");
    expect(buildShareSearch("?t=owner-funds-llc", [])).toBe("");
  });
});

describe("classify", () => {
  it("returns 'none' for an empty or unknown selection", () => {
    expect(classify([]).overall).toBe("none");
    expect(classify(["not-a-type"]).items).toEqual([]);
  });

  it("is 'reportable' when any selected item is reportable", () => {
    const result = classify(["unrelated-customers", "owner-paid-state-fee", "owner-works-unpaid"]);
    expect(result.overall).toBe("reportable");
    expect(result.counts).toEqual({ reportable: 1, "not-reportable": 1, depends: 1 });
    expect(result.items.map((item) => item.id)).toEqual([
      "owner-paid-state-fee",
      "owner-works-unpaid",
      "unrelated-customers",
    ]);
  });

  it("is 'depends' when nothing is clearly reportable but something depends", () => {
    expect(classify(["owner-works-unpaid", "unrelated-vendors"]).overall).toBe("depends");
  });

  it("is 'not-reportable' when only unrelated-party items are selected", () => {
    const result = classify(["unrelated-customers", "unrelated-vendors"]);
    expect(result.overall).toBe("not-reportable");
    expect(result.parts).toEqual([]);
  });

  it("collects the form parts in form order", () => {
    expect(classify(["owner-contributes-property", "loan-to-llc"]).parts).toEqual(["IV", "V", "VI"]);
    expect(classify(["owner-paid-state-fee"]).parts).toEqual(["V"]);
  });

  it("resolves source keys into labelled links", () => {
    const item = classifyTransaction("owner-paid-state-fee");
    expect(item?.sources[0]).toEqual({ label: SOURCES.reg2B3Xi.label, url: SOURCES.reg2B3Xi.url });
    expect(classifyTransaction("nope")).toBeUndefined();
  });

  it("has a banner message for every overall outcome", () => {
    for (const key of ["none", "reportable", "depends", "not-reportable"] as const) {
      expect(OVERALL_MESSAGES[key].title.trim()).not.toBe("");
      expect(OVERALL_MESSAGES[key].body.trim()).not.toBe("");
    }
  });
});

describe("page copy rules", () => {
  it("has 4–6 FAQs with answers of 50 words or fewer", () => {
    expect(TX_CHECKER_FAQS.length).toBeGreaterThanOrEqual(4);
    expect(TX_CHECKER_FAQS.length).toBeLessThanOrEqual(6);
    for (const faq of TX_CHECKER_FAQS) {
      expect(faq.q.endsWith("?"), faq.q).toBe(true);
      expect(wordCount(faq.a), faq.q).toBeLessThanOrEqual(50);
    }
  });

  it("makes no credential, approval, guarantee or advice claims", () => {
    const forbidden = [/\bCPA\b/, /IRS[- ]approved/i, /guarantee/i, /\bcertified\b/i, /\blicensed\b/i, /\benrolled agent\b/i];
    for (const text of allCopy()) {
      for (const pattern of forbidden) expect(text, text).not.toMatch(pattern);
    }
  });

  it("does not give line-by-line filling instructions", () => {
    for (const text of allCopy()) expect(text, text).not.toMatch(/\blines?\s+\d/i);
  });
});
