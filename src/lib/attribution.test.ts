import { describe, expect, it } from "vitest";
import { deriveAttribution, formatAttribution } from "./attribution";

const SITE = "https://www.form5472prep.com";

describe("deriveAttribution", () => {
  it("classifies a ChatGPT referrer as AI traffic", () => {
    expect(
      deriveAttribution({
        url: `${SITE}/`,
        referer: "https://chatgpt.com/",
        host: "www.form5472prep.com",
      }),
    ).toMatchObject({ source: "chatgpt-ai", medium: "ai", referrer: "chatgpt.com" });
  });

  it("classifies a ChatGPT utm_source as AI traffic without a referrer", () => {
    expect(deriveAttribution({ url: `${SITE}/?utm_source=chatgpt.com` })).toMatchObject({
      source: "chatgpt-ai",
      medium: "ai",
      referrer: null,
    });
  });

  it("classifies Gemini before Google organic matching", () => {
    expect(
      deriveAttribution({
        url: `${SITE}/start`,
        referer: "https://gemini.google.com/app",
      }),
    ).toMatchObject({ source: "gemini-ai", medium: "ai" });
  });

  it("keeps Google Search classified as organic", () => {
    expect(
      deriveAttribution({
        url: `${SITE}/start`,
        referer: "https://www.google.com/",
      }),
    ).toMatchObject({ source: "google-organic", medium: "organic" });
  });

  it("keeps paid click ids ahead of AI referrers", () => {
    expect(
      deriveAttribution({
        url: `${SITE}/start?gclid=x`,
        referer: "https://chatgpt.com/",
      }),
    ).toMatchObject({ source: "google-ads", medium: "cpc", referrer: "chatgpt.com" });
  });

  it("forces AI utm_source traffic to medium ai even when utm_medium is supplied", () => {
    expect(
      deriveAttribution({
        url: `${SITE}/?utm_source=perplexity&utm_medium=referral`,
      }),
    ).toMatchObject({ source: "perplexity-ai", medium: "ai" });
  });

  it("does not match lookalike AI referrer hosts", () => {
    expect(
      deriveAttribution({
        url: `${SITE}/`,
        referer: "https://chatgpt.com.evil.example/",
      }),
    ).toMatchObject({ source: "referral", medium: "referral", referrer: "chatgpt.com.evil.example" });
  });

  it.each([
    ["https://chat.openai.com/c/123", "chatgpt-ai"],
    ["https://www.openai.com/", "chatgpt-ai"],
    ["https://perplexity.ai/search", "perplexity-ai"],
    ["https://copilot.microsoft.com/chats", "copilot-ai"],
    ["https://claude.ai/chat", "claude-ai"],
    ["https://grok.com/", "grok-ai"],
    ["https://x.ai/", "grok-ai"],
    ["https://meta.ai/", "metaai-ai"],
    ["https://you.com/search", "you-ai"],
  ])("classifies AI referrer %s as %s", (referer, source) => {
    expect(deriveAttribution({ url: `${SITE}/start`, referer })).toMatchObject({
      source,
      medium: "ai",
    });
  });

  it.each([
    ["chatgpt", "chatgpt-ai"],
    ["openai", "chatgpt-ai"],
    ["perplexity.ai", "perplexity-ai"],
    ["copilot", "copilot-ai"],
    ["claude", "claude-ai"],
    ["claude.ai", "claude-ai"],
    ["gemini", "gemini-ai"],
    ["grok", "grok-ai"],
    ["meta.ai", "metaai-ai"],
    ["you.com", "you-ai"],
  ])("classifies AI utm_source %s as %s", (utmSource, source) => {
    expect(deriveAttribution({ url: `${SITE}/?utm_source=${utmSource}` })).toMatchObject({
      source,
      medium: "ai",
    });
  });
});

describe("formatAttribution", () => {
  it("renders AI labels without repeating the medium", () => {
    expect(formatAttribution({ source: "chatgpt-ai", medium: "ai" })).toBe("ChatGPT (AI)");
  });
});
