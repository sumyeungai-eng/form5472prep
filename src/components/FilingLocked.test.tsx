import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import { FilingLocked } from "./FilingLocked";
import { LOCALES } from "@/i18n/locales";
import { readFileSync } from "node:fs";

describe("FilingLocked", () => {
  for (const locale of LOCALES) {
    const portal = JSON.parse(readFileSync(`messages/${locale}/portal.json`, "utf8"));
    const render = (email: string | null) => renderToStaticMarkup(
      <NextIntlClientProvider locale={locale} messages={{ portal }} timeZone="UTC">
        <FilingLocked ownerEmail={email} />
      </NextIntlClientProvider>,
    );
    it(`renders translated sign-in instructions in ${locale} and preserves masking`, () => {
      const html = render("alex@example.com");
      expect(html).toContain('data-smoke="filing-locked"');
      expect(html).toContain(portal.locked.heading);
      expect(html).toContain(portal.locked.signIn);
      expect(html).toContain("al••@example.com");
      expect(html).not.toContain("alex@example.com");
      expect(html).toContain('href="/sign-in"');
      expect(render(null)).not.toContain("@example.com");
      expect(render("a@example.com")).toContain("a•@example.com");
    });
  }
});
