import { useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MessagesPanel } from "./MessagesPanel";

const languageSwitch = vi.hoisted(() => ({ enabled: true }));
vi.mock("@/config/i18n-switch.mjs", () => ({
  get I18N_ENABLED() { return languageSwitch.enabled; },
}));
vi.mock("react", async original => {
  const react = await original<typeof import("react")>();
  return { ...react, useState: vi.fn(react.useState) };
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe.each([true, false])("message timestamps (I18N_ENABLED=%s)", enabled => {
  it("formats today's time and older dates with the intended locale", () => {
    languageSwitch.enabled = enabled;
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-27T12:00:00Z"));
    const today = new Date("2026-11-27T12:00:00Z");
    const yesterday = new Date("2026-11-26T12:00:00Z");
    const locale = enabled ? undefined : "en-US";
    const timeOptions = { hour: "numeric", minute: "2-digit" } as const;
    const dateOptions = { month: "short", day: "numeric", ...timeOptions } as const;
    const expectedTime = today.toLocaleTimeString(locale, timeOptions);
    const expectedDate = yesterday.toLocaleString(locale, dateOptions);
    const timeFormatter = vi.spyOn(Date.prototype, "toLocaleTimeString");
    const dateFormatter = vi.spyOn(Date.prototype, "toLocaleString");
    const messages = [today, yesterday].map((date, index) => ({
      id: `message-${index}`, fromAdmin: true, body: "Hello",
      attachmentKey: null, attachmentName: null, attachmentType: null,
      readAt: null, createdAt: date.toISOString(),
    }));
    vi.mocked(useState).mockReturnValueOnce([messages, vi.fn()]);

    const html = renderToStaticMarkup(<MessagesPanel apiBase="/api/messages" isAdmin={false} />);

    expect(timeFormatter).toHaveBeenCalledExactlyOnceWith(locale, timeOptions);
    expect(dateFormatter).toHaveBeenCalledExactlyOnceWith(locale, dateOptions);
    expect(html).toContain(expectedTime);
    expect(html).toContain(expectedDate);
  });
});
