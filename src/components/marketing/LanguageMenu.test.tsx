import { afterEach, describe, expect, it, vi } from "vitest";
import type { AnchorHTMLAttributes, MouseEvent, ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageMenu } from "./LanguageMenu";
import { LOCALIZED_MARKETING_PATHS, localizedPath } from "@/i18n/marketing/config";

const navigation = vi.hoisted(() => ({ pathname: "/" as string | null }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));
afterEach(() => { vi.unstubAllGlobals(); navigation.pathname = "/"; });

function anchors() {
  return LanguageMenu({})!.props.children as ReactElement<AnchorHTMLAttributes<HTMLAnchorElement>>[];
}

describe("marketing language menu", () => {
  it.each(["en", "de", "zh-Hans"] as const)("renders the same links for all five %s routes", locale => {
    for (const path of LOCALIZED_MARKETING_PATHS) {
      navigation.pathname = localizedPath(locale, path);
      const html = renderToStaticMarkup(<LanguageMenu />);
      for (const target of ["en", "de", "zh-Hans"] as const) expect(html).toContain(`href="${localizedPath(target, path)}"`);
    }
  });
  it.each(["/blog", "/ein", "/start", "/de/blog", "/zh-hans/ein", "/de/pricing/extra", "/deutsch"])("hides the switcher on %s", path => {
    navigation.pathname = path;
    expect(renderToStaticMarkup(<LanguageMenu />)).toBe("");
  });
  it.each(["en", "de", "zh-Hans"] as const)("saves explicit %s preference before native anchor navigation", locale => {
    navigation.pathname = "/de/pricing";
    const document = { cookie: "NEXT_LOCALE=fr" };
    vi.stubGlobal("document", document);
    const anchor = anchors().find(anchor => anchor.props.lang === locale)!;
    expect(anchor.props.href).toBe(localizedPath(locale, "/pricing"));
    const preventDefault = vi.fn();
    anchor.props.onClick!({ preventDefault } as unknown as MouseEvent<HTMLAnchorElement>);
    expect(document.cookie).toBe(`NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`);
    expect(preventDefault).not.toHaveBeenCalled();
  });
  it("keeps navigation available when writing cookies throws", () => {
    vi.stubGlobal("document", { set cookie(_value: string) { throw new Error("Cookies blocked"); } });
    for (const anchor of anchors()) {
      const preventDefault = vi.fn();
      expect(() => anchor.props.onClick!({ preventDefault } as unknown as MouseEvent<HTMLAnchorElement>)).not.toThrow();
      expect(preventDefault).not.toHaveBeenCalled();
      expect(anchor.props.href).toBeTruthy();
    }
  });
});
