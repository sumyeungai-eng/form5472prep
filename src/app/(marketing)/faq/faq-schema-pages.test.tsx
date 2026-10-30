import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import FaqPage from "./page";
import AboutPage from "../about/page";
import Form5472StatisticsPage from "../form-5472-statistics/page";
import DoINeedToFileForm5472Page from "../do-i-need-to-file-form-5472/page";
import ComplianceCalendarPage from "../foreign-owned-llc-compliance-calendar/page";
import DeadlineCalculatorPage from "../form-5472-deadline-calculator/page";
import LateFilingCheckerPage from "../form-5472-late-filing-checker/page";
import PenaltyCalculatorPage from "../form-5472-penalty-calculator/page";
import ReportableTransactionsCheckerPage from "../form-5472-reportable-transactions-checker/page";
import ExchangeRatesPage from "../irs-yearly-average-exchange-rates/page";
import LlcAnnualFeesPage from "../llc-annual-fees-by-state/page";

// plan-2026-10-30 P0-2: every question in a page's FAQPage JSON-LD must be a
// visible question on that page, as a heading (h2/h3) or a <dt>. A question
// that only lives in a <summary> next to a "+"/"▾" glyph was not read as a
// question by the 2026-10-30 audit, so tool FAQs wrap it in an <h3>.
const PAGES: Array<[string, ComponentType]> = [
  ["/faq", FaqPage],
  ["/about", AboutPage],
  ["/form-5472-statistics", Form5472StatisticsPage],
  ["/do-i-need-to-file-form-5472", DoINeedToFileForm5472Page],
  ["/foreign-owned-llc-compliance-calendar", ComplianceCalendarPage],
  ["/form-5472-deadline-calculator", DeadlineCalculatorPage],
  ["/form-5472-late-filing-checker", LateFilingCheckerPage],
  ["/form-5472-penalty-calculator", PenaltyCalculatorPage],
  ["/form-5472-reportable-transactions-checker", ReportableTransactionsCheckerPage],
  ["/irs-yearly-average-exchange-rates", ExchangeRatesPage],
  ["/llc-annual-fees-by-state", LlcAnnualFeesPage],
];

function textOf(fragment: string): string {
  return fragment
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function faqQuestions(html: string): string[] {
  return Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))
    .map((m) => JSON.parse(m[1]) as { "@type"?: string; mainEntity?: Array<{ name: string }> })
    .filter((node) => node["@type"] === "FAQPage")
    .flatMap((node) => node.mainEntity?.map((q) => q.name) ?? []);
}

function visibleQuestions(html: string): Set<string> {
  return new Set(
    Array.from(html.matchAll(/<(h2|h3|dt)\b[^>]*>([\s\S]*?)<\/\1>/g)).map((m) => textOf(m[2])),
  );
}

describe("FAQPage JSON-LD only lists visible questions", () => {
  it.each(PAGES)("%s", (_path, Page) => {
    const html = renderToStaticMarkup(<Page />);
    const questions = faqQuestions(html);
    const visible = visibleQuestions(html);

    expect(questions.length).toBeGreaterThanOrEqual(3);
    for (const q of questions) expect(visible.has(q), q).toBe(true);
  });
});
