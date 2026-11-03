import { describe, expect, it } from "vitest";
import { AUTHORED_DOC_SIGNATURE_HEADING } from "@/config/filingPackage";
import { hasAdminReasonableCauseForFax } from "@/lib/completeness";
import { generatePackage, RCS_DRAFT_MARKER } from "./generatePackage";
import { runPreflight } from "./preflight";
import { readPageLines } from "./validatePackage";
import { F11, lateCatchUpFinalisedAt } from "./__fixtures__/filings";

// P0-3: "Reasonable cause source" = CUSTOMER_VERBATIM. Synthetic fixture only.
const VERBATIM =
  "I opened a small café business in Lisbon in 2024 and formed the LLC for it.\n" +
  "My “formation service” said – wrongly – that nothing was due for a company with no U.S. income.\n\n" +
  "I learned of Form 5472 in September 2026… and I am now filing every outstanding year.";

const withVerbatim = (text: string | null, taxYear = 2024) => ({
  ...F11,
  yearData: F11.yearData.map((y) =>
    y.taxYear === taxYear
      ? { ...y, rcsSource: "CUSTOMER_VERBATIM", rcsVerbatimText: text, rcsVerbatimChosenBy: "staff-1", rcsVerbatimChosenAt: "2026-11-01T10:00:00.000Z" }
      : y,
  ),
});
type Pkg = Awaited<ReturnType<typeof generatePackage>>;
const norm = (t: string) => t.replace(/\s+/g, " ").trim();
const rcsDoc = (pkg: Pkg, taxYear: number) =>
  pkg.record.authoredDocuments.find((d) => d.kind === "reasonableCauseStatement" && d.taxYear === taxYear)!;
// The body: every printed line after the "Foreign Owner:" header line and before the signature heading.
const bodyOf = (lines: string[]) =>
  lines.slice(lines.findIndex((l) => l.startsWith("Foreign Owner:")) + 1, lines.indexOf(AUTHORED_DOC_SIGNATURE_HEADING));
const PDF_TIMEOUT = 60_000;

describe("P0-3 verbatim reasonable cause statement", () => {
  it("prints the stored text as the body, keeps café and curly quotes, and passes pre-flight", async () => {
    const pkg = await generatePackage(withVerbatim(VERBATIM), lateCatchUpFinalisedAt);
    const doc = rcsDoc(pkg, 2024);
    expect(doc.rcsNarrativeSource).toBe("verbatim");
    expect(doc.rcsMissingAnswers).toBe(false);
    expect(doc.lines[0]).toBe("REASONABLE CAUSE STATEMENT");
    expect(doc.lines).toContain(AUTHORED_DOC_SIGNATURE_HEADING);
    expect(norm(bodyOf(doc.lines).join(" "))).toBe(norm(VERBATIM));
    // No templated sections in verbatim mode.
    expect(doc.lines).not.toContain("2. Cause of the Delinquency");

    // Read back from the PDF bytes, not the record: accents and quotes survive.
    const page = pkg.record.pageOrder.find((p) => p.label === "Reasonable Cause Statement" && p.taxYear === 2024)!;
    const printed = await readPageLines(pkg.bytes, page.startPage);
    expect(norm(bodyOf(printed).join(" "))).toBe(norm(VERBATIM));
    expect(printed.join(" ")).toContain("café");
    expect(printed.join(" ")).toContain("“formation service”");

    const year = pkg.record.taxYears.find((y) => y.taxYear === 2024)!;
    expect(year.rcs?.verbatim).toMatchObject({ text: VERBATIM, unencodable: [], chosenBy: "staff-1" });
    const preflight = await runPreflight(pkg.record, pkg.bytes);
    expect(preflight.failures).toEqual([]);
    expect(preflight.warnings.map((w) => w.id)).not.toContain("W42");
  }, PDF_TIMEOUT);

  it("Thai characters print as ? and fail A37 without throwing", async () => {
    const pkg = await generatePackage(withVerbatim("ฉันไม่ทราบ about the requirement."), lateCatchUpFinalisedAt);
    const body = norm(bodyOf(rcsDoc(pkg, 2024).lines).join(" "));
    expect(body).toBe("?????????? about the requirement.");
    const preflight = await runPreflight(pkg.record, pkg.bytes);
    expect(preflight.failures.map((f) => f.id)).toEqual(["A37"]);
    expect(preflight.failures[0].message).toContain('"ฉ"');
  }, PDF_TIMEOUT);

  it("W42 flags a note to us: question, please, can you, your team, email, URL", async () => {
    const cases = [
      "Can you write this for me",
      "Please file it.",
      "Is this enough?",
      "Ask your team.",
      "Mail me at someone@example.test.",
      "See https://example.test/x for details.",
    ];
    for (const text of cases) {
      const pkg = await generatePackage(withVerbatim(`I did not know about the form. ${text}`), lateCatchUpFinalisedAt);
      const preflight = await runPreflight(pkg.record, pkg.bytes);
      expect(preflight.warnings.map((w) => w.id), text).toContain("W42");
      // Verbatim text is never judged by A33/A26: a note to us is a warning only.
      expect(preflight.failures.map((f) => f.id), text).toEqual([]);
    }
  }, PDF_TIMEOUT * 3);

  it("verbatim chosen with empty text prints the DRAFT marker and fails A32 (never the admin narrative)", async () => {
    const pkg = await generatePackage(withVerbatim("   "), lateCatchUpFinalisedAt);
    const lines = rcsDoc(pkg, 2024).lines;
    expect(lines).toContain(RCS_DRAFT_MARKER);
    expect(lines.join(" ")).not.toContain("I formed the LLC through an online formation service");
    const preflight = await runPreflight(pkg.record, pkg.bytes);
    expect(preflight.failures.map((f) => f.id)).toEqual(["A32"]);
    expect(preflight.failures[0].message).toContain("verbatim text is empty");
  }, PDF_TIMEOUT);

  it("the fax gate accepts verbatim with text, refuses verbatim without", () => {
    const filing = { taxYears: [2024], isFinalReturn: false, dissolvedAt: null, extensionFiled: null, extensionTransmittedAt: null };
    const now = new Date("2026-11-03T00:00:00Z");
    expect(hasAdminReasonableCauseForFax(filing, [{ taxYear: 2024, rcsAdminNarrative: null, rcsSource: "CUSTOMER_VERBATIM", rcsVerbatimText: "My words." }], now)).toBe(true);
    expect(hasAdminReasonableCauseForFax(filing, [{ taxYear: 2024, rcsAdminNarrative: "Admin text", rcsSource: "CUSTOMER_VERBATIM", rcsVerbatimText: " " }], now)).toBe(false);
    expect(hasAdminReasonableCauseForFax(filing, [{ taxYear: 2024, rcsAdminNarrative: "Admin text", rcsSource: "ADMIN_NARRATIVE" }], now)).toBe(true);
  });
});
