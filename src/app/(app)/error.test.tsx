// @vitest-environment node
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CustomerError from "./error";

describe("CustomerError", () => {
  it("renders the app-error marker without browser APIs", () => {
    const html = renderToStaticMarkup(
      <CustomerError error={new Error("x")} reset={() => {}} />,
    );
    expect(html).toContain('data-smoke="app-error"');
    expect(html).toContain('href="/dashboard"');
  });
});
