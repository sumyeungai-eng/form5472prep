import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { HomePage, homeMetadata } from "./HomePage";
import { getMarketingMessages } from "@/i18n/marketing";

vi.mock("@/lib/stats", async (original) => ({
  ...await original<typeof import("@/lib/stats")>(),
  getConfirmedFilingsCount: vi.fn().mockResolvedValue(147),
}));

describe("localized homepage copy", () => {
  it.each(["de", "zh-Hans"] as const)("%s translates its absolute title, hero deliverables and DIIRSP tag", async (locale) => {
    const { home } = getMarketingMessages(locale);
    const html = renderToStaticMarkup(await HomePage({ locale }));
    const spanText = Array.from(html.matchAll(/<span\b[^>]*>([^<]*)<\/span>/g), match => match[1]);
    expect(homeMetadata(locale).title).toEqual({ absolute: home.absoluteTitle });
    expect(home.absoluteTitle).not.toBe(getMarketingMessages("en").home.absoluteTitle);
    for (const text of [...Object.values(home.heroDeliverables), home.diirspTag]) {
      expect(spanText).toContain(renderToStaticMarkup(<>{text}</>));
    }
  });
});
