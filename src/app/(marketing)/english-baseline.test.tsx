import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Layout from "./layout";
import Home, { metadata as homeMeta } from "./page";
import Pricing, { metadata as pricingMeta } from "./pricing/page";
import Services, { metadata as servicesMeta } from "./services/page";
import Faq, { metadata as faqMeta } from "./faq/page";
import Penalty, { metadata as penaltyMeta } from "./form-5472-penalty-calculator/page";

vi.mock("@/lib/stats", async (original) => ({
  ...await original<typeof import("@/lib/stats")>(),
  getConfirmedFilingsCount: vi.fn().mockResolvedValue(147),
}));

beforeAll(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-23T12:00:00Z")); });
afterAll(() => vi.useRealTimers());

describe("frozen English marketing baseline", () => {
  const pages = [
    ["home", Home, homeMeta], ["pricing", Pricing, pricingMeta],
    ["services", Services, servicesMeta], ["faq", Faq, faqMeta],
    ["penalty", Penalty, penaltyMeta],
  ] as const;
  it.each(pages)("%s HTML and metadata", async (name, Page, metadata) => {
    const html = renderToStaticMarkup(await Page());
    await expect(html).toMatchFileSnapshot(`__snapshots__/${name}.html`);
    await expect(JSON.stringify(metadata, null, 2)).toMatchFileSnapshot(`__snapshots__/${name}.json`);
  });
  it("shared chrome", async () => {
    await expect(renderToStaticMarkup(<Layout><div>Page content</div></Layout>))
      .toMatchFileSnapshot("__snapshots__/chrome.html");
  });
});
