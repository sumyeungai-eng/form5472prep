import { afterEach, describe, expect, it, vi } from "vitest";
import type { DependencyList, MouseEvent, MutableRefObject } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { jsxDEV } from "react/jsx-dev-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { chooseLocale, LanguageMenu } from "./LanguageMenu";
import { LOCALIZED_MARKETING_PATHS, localizedPath } from "@/i18n/marketing/config";

const navigation = vi.hoisted(() => ({ pathname: "/" as string | null }));
// There is no DOM environment installed. Keep real SSR rendering, capture host
// event props, and explicitly flush effects/state for the interaction checks.
const hooks = vi.hoisted(() => ({
  enabled: false,
  open: false,
  effects: [] as Array<() => void | (() => void)>,
}));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));
vi.mock("react", async original => {
  const react = await original<typeof import("react")>();
  return {
    ...react,
    useState: (initial: unknown) => hooks.enabled
      ? [hooks.open, (value: boolean | ((previous: boolean) => boolean)) => {
        hooks.open = typeof value === "function" ? value(hooks.open) : value;
      }]
      : react.useState(initial),
    useEffect: (effect: () => void | (() => void), deps?: DependencyList) => {
      if (hooks.enabled) hooks.effects.push(effect);
      else react.useEffect(effect, deps);
    },
  };
});
vi.mock("react/jsx-runtime", async original => {
  const runtime = await original<typeof import("react/jsx-runtime")>();
  return { ...runtime, jsx: vi.fn(runtime.jsx), jsxs: vi.fn(runtime.jsxs) };
});

vi.mock("react/jsx-dev-runtime", async original => {
  const runtime = await original<typeof import("react/jsx-dev-runtime")>();
  return { ...runtime, jsxDEV: vi.fn(runtime.jsxDEV) };
});

let cleanups: Array<() => void> = [];
function cleanupEffects() {
  cleanups.forEach(cleanup => cleanup());
  cleanups = [];
}
afterEach(() => {
  cleanupEffects();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  hooks.enabled = false;
  hooks.open = false;
  hooks.effects = [];
  navigation.pathname = "/";
});

function hostProps<Tag extends keyof React.JSX.IntrinsicElements>(tag: Tag) {
  return [...vi.mocked(jsx).mock.calls, ...vi.mocked(jsxs).mock.calls, ...vi.mocked(jsxDEV).mock.calls]
    .filter(([type]) => type === tag)
    .map(([, props]) => props as React.JSX.IntrinsicElements[Tag]);
}

function interactionHarness() {
  hooks.enabled = true;
  const listeners = new Map<string, EventListener>();
  const document = {
    addEventListener: vi.fn((type: string, listener: EventListener) => listeners.set(type, listener)),
    removeEventListener: vi.fn((type: string, listener: EventListener) => {
      if (listeners.get(type) === listener) listeners.delete(type);
    }),
  };
  vi.stubGlobal("document", document);
  class TestNode {}
  vi.stubGlobal("Node", TestNode);
  const inside = new TestNode();
  const focus = vi.fn();
  function render() {
    cleanupEffects();
    vi.mocked(jsx).mockClear();
    vi.mocked(jsxs).mockClear();
    vi.mocked(jsxDEV).mockClear();
    const html = renderToStaticMarkup(<LanguageMenu />);
    const trigger = hostProps("button")[0];
    const wrapper = hostProps("div").find(props => props.className === "relative")!;
    (trigger.ref as MutableRefObject<unknown>).current = { focus };
    (wrapper.ref as MutableRefObject<unknown>).current = { contains: (target: unknown) => target === inside };
    cleanups = hooks.effects.splice(0).map(effect => effect()).filter((cleanup): cleanup is () => void => typeof cleanup === "function");
    return html;
  }
  function clickTrigger() {
    hostProps("button")[0].onClick!({} as MouseEvent<HTMLButtonElement>);
    return render();
  }
  function dispatch(type: string, event: object) {
    listeners.get(type)?.(event as Event);
    return render();
  }
  return { render, clickTrigger, dispatch, listeners, document, focus, inside, outside: new TestNode() };
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
  it("includes all language links in the closed SSR panel", () => {
    const html = renderToStaticMarkup(<LanguageMenu label="Choose language" />);
    expect(html).toContain('aria-label="Choose language"');
    expect(html).toContain('aria-haspopup="true"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('shadow-lg hidden');
    expect(hostProps("a").map(props => [props.children, props.hrefLang, props.lang])).toEqual([
      ["English", "en", "en"], ["简体中文", "zh-Hans", "zh-Hans"], ["Deutsch", "de", "de"],
    ]);
  });
  it.each([["en", "EN"], ["de", "DE"], ["zh-Hans", "中文"]] as const)("marks %s as the current language", (locale, shortLabel) => {
    navigation.pathname = localizedPath(locale, "/pricing");
    const html = renderToStaticMarkup(<LanguageMenu />);
    const current = hostProps("a").filter(props => props["aria-current"] === "true");
    expect(current).toHaveLength(1);
    expect(current[0].lang).toBe(locale);
    expect(current[0].className).toContain("font-medium");
    expect(html).toContain(`<span class="hidden sm:inline">${shortLabel}</span>`);
  });
  it("falls back to English when the pathname is unavailable", () => {
    navigation.pathname = null;
    renderToStaticMarkup(<LanguageMenu />);
    expect(hostProps("a").find(props => props["aria-current"] === "true")?.lang).toBe("en");
  });
  it.each(["en", "de", "zh-Hans"] as const)("saves explicit %s preference before native anchor navigation", locale => {
    navigation.pathname = "/de/pricing";
    const document = { cookie: "NEXT_LOCALE=fr" };
    vi.stubGlobal("document", document);
    renderToStaticMarkup(<LanguageMenu />);
    const anchor = hostProps("a").find(props => props.lang === locale)!;
    expect(anchor.href).toBe(localizedPath(locale, "/pricing"));
    const preventDefault = vi.fn();
    anchor.onClick!({ preventDefault } as unknown as MouseEvent<HTMLAnchorElement>);
    expect(document.cookie).toBe(`NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`);
    expect(preventDefault).not.toHaveBeenCalled();
  });
  it("keeps navigation available when writing cookies throws", () => {
    vi.stubGlobal("document", { set cookie(_value: string) { throw new Error("Cookies blocked"); } });
    renderToStaticMarkup(<LanguageMenu />);
    for (const anchor of hostProps("a")) {
      const preventDefault = vi.fn();
      expect(() => anchor.onClick!({ preventDefault } as unknown as MouseEvent<HTMLAnchorElement>)).not.toThrow();
      expect(preventDefault).not.toHaveBeenCalled();
      expect(anchor.href).toBeTruthy();
    }
    expect(() => chooseLocale("de")).not.toThrow();
  });
  it("toggles aria-expanded and panel visibility with the trigger", () => {
    const menu = interactionHarness();
    expect(menu.render()).toContain('aria-expanded="false"');
    expect(menu.document.addEventListener).not.toHaveBeenCalled();
    const openHtml = menu.clickTrigger();
    expect(openHtml).toContain('aria-expanded="true"');
    expect(openHtml).not.toContain('shadow-lg hidden');
    expect(menu.listeners.has("mousedown")).toBe(true);
    expect(menu.clickTrigger()).toContain('aria-expanded="false"');
    expect(menu.listeners.size).toBe(0);
  });
  it("closes on Escape and returns focus to the trigger", () => {
    const menu = interactionHarness();
    menu.render();
    menu.clickTrigger();
    expect(menu.dispatch("keydown", { key: "Enter" })).toContain('aria-expanded="true"');
    expect(menu.focus).not.toHaveBeenCalled();
    expect(menu.dispatch("keydown", { key: "Escape" })).toContain('aria-expanded="false"');
    expect(menu.focus).toHaveBeenCalledOnce();
    expect(menu.listeners.size).toBe(0);
  });
  it("closes only on outside mousedown and cleans up listeners on unmount", () => {
    const menu = interactionHarness();
    menu.render();
    menu.clickTrigger();
    expect(menu.dispatch("mousedown", { target: menu.inside })).toContain('aria-expanded="true"');
    expect(menu.dispatch("mousedown", { target: menu.outside })).toContain('aria-expanded="false"');
    expect(menu.focus).not.toHaveBeenCalled();
    menu.clickTrigger();
    cleanupEffects();
    expect(menu.listeners.size).toBe(0);
  });
});
