import { afterEach, describe, expect, it, vi } from "vitest";
import type { DependencyList, FocusEvent, MouseEvent, MutableRefObject } from "react";
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
  effectIndex: 0,
  effects: [] as Array<{ deps?: DependencyList; cleanup?: () => void }>,
  pendingEffects: [] as Array<{ index: number; effect: () => void | (() => void); deps?: DependencyList }>,
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
      if (!hooks.enabled) return react.useEffect(effect, deps);
      const index = hooks.effectIndex++;
      const previous = hooks.effects[index];
      if (!previous || !deps || !previous.deps || deps.length !== previous.deps.length
        || deps.some((dep, i) => !Object.is(dep, previous.deps![i]))) {
        hooks.pendingEffects.push({ index, effect, deps: deps?.slice() });
      }
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

function cleanupEffects() {
  hooks.effects.forEach(({ cleanup }) => cleanup?.());
  hooks.effects = [];
  hooks.pendingEffects = [];
}
afterEach(() => {
  cleanupEffects();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  hooks.enabled = false;
  hooks.open = false;
  hooks.effectIndex = 0;
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
  const wrapperNode = { contains: (target: unknown) => target === inside };
  function render() {
    let html: string;
    let renderedOpen: boolean;
    do {
      renderedOpen = hooks.open;
      hooks.effectIndex = 0;
      vi.mocked(jsx).mockClear();
      vi.mocked(jsxs).mockClear();
      vi.mocked(jsxDEV).mockClear();
      html = renderToStaticMarkup(<LanguageMenu />);
      const trigger = hostProps("button")[0];
      const wrapper = hostProps("div").find(props => props.className === "relative");
      if (trigger) (trigger.ref as MutableRefObject<unknown>).current = { focus };
      if (wrapper) (wrapper.ref as MutableRefObject<unknown>).current = wrapperNode;
      for (const { index, effect, deps } of hooks.pendingEffects.splice(0)) {
        hooks.effects[index]?.cleanup?.();
        const cleanup = effect();
        hooks.effects[index] = { deps, cleanup: typeof cleanup === "function" ? cleanup : undefined };
      }
    } while (hooks.open !== renderedOpen);
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
  function blur(relatedTarget: unknown) {
    hostProps("div").find(props => props.className === "relative")!.onBlur!({
      currentTarget: wrapperNode, relatedTarget,
    } as FocusEvent<HTMLDivElement>);
    return render();
  }
  return { render, clickTrigger, dispatch, blur, listeners, document, focus, inside, outside: new TestNode() };
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
    expect(html).toContain('aria-label="Choose language: English"');
    expect(html).not.toContain('aria-haspopup');
    const panelId = hostProps("div").find(props => props.id)?.id;
    expect(panelId).toBeTruthy();
    expect(hostProps("button")[0]["aria-controls"]).toBe(panelId);
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('shadow-lg hidden');
    expect(hostProps("a").map(props => [props.children, props.hrefLang, props.lang])).toEqual([
      ["English", "en", "en"], ["简体中文", "zh-Hans", "zh-Hans"], ["Deutsch", "de", "de"],
    ]);
  });
  it.each([["en", "EN", "English"], ["de", "DE", "Deutsch"], ["zh-Hans", "中文", "简体中文"]] as const)("marks %s as the current language", (locale, shortLabel, currentName) => {
    navigation.pathname = localizedPath(locale, "/pricing");
    const html = renderToStaticMarkup(<LanguageMenu />);
    const current = hostProps("a").filter(props => props["aria-current"] === "true");
    expect(current).toHaveLength(1);
    expect(current[0].lang).toBe(locale);
    expect(current[0].className).toContain("font-medium");
    expect(html).toContain(`<span class="hidden sm:inline">${shortLabel}</span>`);
    expect(hostProps("button")[0]["aria-label"]).toBe(`Language: ${currentName}`);
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
  it("attaches document listeners only while open and preserves them when deps are unchanged", () => {
    const menu = interactionHarness();
    menu.render();
    menu.render();
    expect(menu.document.addEventListener).not.toHaveBeenCalled();
    expect(menu.document.removeEventListener).not.toHaveBeenCalled();
    menu.clickTrigger();
    const mouseListener = menu.listeners.get("mousedown");
    const keyListener = menu.listeners.get("keydown");
    expect(mouseListener).toBeTypeOf("function");
    expect(keyListener).toBeTypeOf("function");
    menu.render();
    expect(menu.document.addEventListener).toHaveBeenCalledTimes(2);
    expect(menu.document.removeEventListener).not.toHaveBeenCalled();
    menu.clickTrigger();
    expect(menu.document.removeEventListener).toHaveBeenCalledTimes(2);
    expect(menu.document.removeEventListener).toHaveBeenCalledWith("mousedown", mouseListener);
    expect(menu.document.removeEventListener).toHaveBeenCalledWith("keydown", keyListener);
    expect(menu.listeners.size).toBe(0);
    menu.render();
    expect(menu.document.removeEventListener).toHaveBeenCalledTimes(2);
    menu.clickTrigger();
    expect(menu.document.addEventListener).toHaveBeenCalledTimes(4);
  });
  it.each(["/pricing", "/de", "/blog"])("closes an open menu when the pathname changes to %s", pathname => {
    const menu = interactionHarness();
    menu.render();
    menu.clickTrigger();
    navigation.pathname = pathname;
    const html = menu.render();
    expect(hooks.open).toBe(false);
    expect(menu.listeners.size).toBe(0);
    if (pathname === "/blog") expect(html).toBe("");
    else expect(html).toContain('aria-expanded="false"');
  });
  it("keeps the menu open when focus moves to a link inside", () => {
    const menu = interactionHarness();
    menu.render();
    menu.clickTrigger();
    expect(hostProps("a")).toHaveLength(3);
    expect(menu.blur(menu.inside)).toContain('aria-expanded="true"');
    expect(menu.listeners.size).toBe(2);
  });
  it("keeps the menu open when blur has a null relatedTarget", () => {
    const menu = interactionHarness();
    menu.render();
    menu.clickTrigger();
    expect(menu.blur(null)).toContain('aria-expanded="true"');
    expect(menu.listeners.size).toBe(2);
  });
  it("closes when focus moves to an outside node", () => {
    const menu = interactionHarness();
    menu.render();
    menu.clickTrigger();
    expect(menu.blur(menu.outside)).toContain('aria-expanded="false"');
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

// Keep translated behavior covered while the production switch is disabled.
vi.mock("@/config/i18n-switch.mjs", async original => ({
  ...await original<typeof import("@/config/i18n-switch.mjs")>(), I18N_ENABLED: true,
}));
