import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { GTAG_FCP_FALLBACK_MS, googleAdsBootstrapScript } from "./googleAdsLoader";

const TAG = "AW-18127544007";

type Harness = {
  dataLayer: unknown[][];
  injected: string[];
  fireLoad: () => void;
  firePaint: () => void;
  runTimers: (upToMs: number) => void;
  runIdle: () => void;
};

// Minimal browser stand-in: just enough DOM/Performance API surface for the
// bootstrap, with manual control over load, FCP, timers and idle callbacks.
function boot(opts: {
  path?: string;
  readyState?: "loading" | "complete";
  paintSupported?: boolean;
  fcpAlreadyRecorded?: boolean;
} = {}): Harness {
  const injected: string[] = [];
  const loadListeners: Array<() => void> = [];
  const timers: Array<{ at: number; fn: () => void; done?: boolean }> = [];
  const idle: Array<() => void> = [];
  let observerCb: ((list: { getEntriesByName: (n: string) => unknown[] }) => void) | null = null;
  let fcp = Boolean(opts.fcpAlreadyRecorded);

  class FakePO {
    static supportedEntryTypes = opts.paintSupported === false ? ["navigation"] : ["paint", "navigation"];
    constructor(cb: typeof observerCb) {
      observerCb = cb;
    }
    observe() {}
    disconnect() {
      observerCb = null;
    }
  }

  const win: Record<string, unknown> = {
    location: { pathname: opts.path ?? "/" },
    document: {
      readyState: opts.readyState ?? "loading",
      createElement: () => ({}) as { src?: string; async?: boolean },
      head: { appendChild: (el: { src: string }) => injected.push(el.src) },
    },
    performance: { getEntriesByName: (n: string) => (fcp && n === "first-contentful-paint" ? [{}] : []) },
    PerformanceObserver: FakePO,
    setTimeout: (fn: () => void, ms: number) => timers.push({ at: ms, fn }),
    requestIdleCallback: (fn: () => void) => idle.push(fn),
    addEventListener: (type: string, fn: () => void) => {
      if (type === "load") loadListeners.push(fn);
    },
    Date,
  };
  win.window = win;
  const ctx = vm.createContext(win);
  vm.runInContext(googleAdsBootstrapScript(TAG), ctx);

  return {
    get dataLayer() {
      return ((win.dataLayer as IArguments[]) ?? []).map((a) => Array.from(a));
    },
    injected,
    fireLoad: () => loadListeners.splice(0).forEach((fn) => fn()),
    firePaint: () => {
      fcp = true;
      observerCb?.({ getEntriesByName: (n) => (n === "first-contentful-paint" ? [{}] : []) });
    },
    runTimers: (upToMs) =>
      timers.filter((t) => !t.done && t.at <= upToMs).forEach((t) => {
        t.done = true;
        t.fn();
      }),
    runIdle: () => idle.splice(0).forEach((fn) => fn()),
  };
}

describe("googleAdsBootstrapScript", () => {
  it("queues js + config immediately, before gtag.js loads", () => {
    const h = boot();
    expect(h.dataLayer.map((a) => a[0])).toEqual(["js", "config"]);
    expect(h.dataLayer[1]).toEqual(["config", TAG]);
    expect(h.injected).toEqual([]);
  });

  it("skips the config call on /embed/* (tag still loads, as before)", () => {
    const h = boot({ path: "/embed/penalty-calculator" });
    expect(h.dataLayer.map((a) => a[0])).toEqual(["js"]);
    h.fireLoad();
    h.firePaint();
    h.runIdle();
    expect(h.injected).toHaveLength(1);
  });

  it("does not inject gtag.js on load alone — waits for first contentful paint", () => {
    const h = boot();
    h.fireLoad();
    h.runIdle();
    h.runTimers(1000);
    expect(h.injected).toEqual([]);
    h.firePaint();
    h.runIdle();
    expect(h.injected).toEqual([`https://www.googletagmanager.com/gtag/js?id=${TAG}`]);
  });

  it("does not inject on paint alone — waits for load", () => {
    const h = boot();
    h.firePaint();
    h.runIdle();
    expect(h.injected).toEqual([]);
    h.fireLoad();
    h.runIdle();
    expect(h.injected).toHaveLength(1);
  });

  it("injects once when the page already loaded and painted before hydration", () => {
    const h = boot({ readyState: "complete", fcpAlreadyRecorded: true });
    h.runIdle();
    h.firePaint();
    h.fireLoad();
    h.runIdle();
    expect(h.injected).toHaveLength(1);
  });

  it("falls back after the timeout when no FCP entry ever arrives (background tab)", () => {
    const h = boot();
    h.fireLoad();
    h.runTimers(GTAG_FCP_FALLBACK_MS - 1);
    h.runIdle();
    expect(h.injected).toEqual([]);
    h.runTimers(GTAG_FCP_FALLBACK_MS);
    h.runIdle();
    expect(h.injected).toHaveLength(1);
  });

  it("loads on `load` + idle when the browser has no paint timing", () => {
    const h = boot({ paintSupported: false });
    h.fireLoad();
    h.runIdle();
    expect(h.injected).toHaveLength(1);
  });
});
