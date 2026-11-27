import { describe, expect, it } from "vitest";
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";
import { prepareDestination } from "next/dist/shared/lib/router/utils/prepare-destination";
import { I18N_ENABLED, buildI18nRedirects } from "./i18n-switch.mjs";
import nextConfig from "../../next.config.mjs";

describe("temporary i18n shutdown redirects", () => {
  it("ships disabled and uses the builder in Next config", async () => {
    expect(I18N_ENABLED).toBe(false);
    const redirects = await nextConfig.redirects!();
    for (const rule of buildI18nRedirects()) expect(redirects).toContainEqual(rule);
    expect(buildI18nRedirects()).toHaveLength(4);
    expect(buildI18nRedirects(true)).toEqual([]);
  });

  it.each([
    ["/de", "/"], ["/zh-hans", "/"],
    ["/de/pricing", "/pricing"], ["/zh-hans/faq", "/faq"],
    ["/de/any/nested/page", "/any/nested/page"],
    ["/zh-hans/any/nested/page", "/any/nested/page"],
  ])("maps %s to %s with Next's route matcher", (path, expected) => {
    const rule = buildI18nRedirects().find(rule => getPathMatch(rule.source)(path));
    expect(rule).toBeDefined();
    expect(rule!.permanent).toBe(false);
    const params = getPathMatch(rule!.source)(path);
    expect(params).not.toBe(false);
    const destination = prepareDestination({
      destination: rule!.destination, params: params || {},
      query: { src: "existing-campaign" }, appendParamsToQuery: false,
    });
    expect(destination.parsedDestination.pathname).toBe(expected);
    expect(destination.parsedDestination.query.src).toBe("existing-campaign");
  });

  it.each(["/deutsch", "/zh-hans-extra", "/pricing", "/start"])("leaves %s alone", path => {
    expect(buildI18nRedirects().some(rule => getPathMatch(rule.source)(path))).toBe(false);
  });
});
