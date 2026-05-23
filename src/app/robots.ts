import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

// Crawler policy. The site benefits from being cited by AI engines
// (ChatGPT, Claude, Perplexity, Google AI Overviews) — non-resident LLC
// owners increasingly research compliance via AI assistants before
// reaching Google. We explicitly opt every major AI crawler into the
// public marketing surface; the disallow list matches what we hide from
// general search engines too (authenticated app routes + API).
const APP_ROUTES_TO_HIDE = ["/dashboard", "/filings", "/admin", "/api/"];

// AI crawler user-agents we explicitly allow. Maintaining this list (vs.
// relying on the default `User-agent: *`) ensures we keep access even if
// a crawler later honours an explicit allow but rejects the wildcard.
//
// References:
//   - OpenAI: GPTBot, ChatGPT-User, OAI-SearchBot
//   - Anthropic: ClaudeBot, Claude-Web, Anthropic-AI
//   - Perplexity: PerplexityBot, Perplexity-User
//   - Google AI Overviews: Google-Extended (separate from Googlebot, opt-in)
//   - Apple Intelligence: Applebot-Extended
//   - ByteDance / TikTok search: Bytespider
//   - Common Crawl (training data for many LLMs): CCBot
//   - Meta AI: FacebookBot, Meta-ExternalAgent
//   - Mistral: MistralAI-User
//   - Cohere: cohere-ai
const AI_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "Anthropic-AI",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "FacebookBot",
  "Meta-ExternalAgent",
  "MistralAI-User",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow: APP_ROUTES_TO_HIDE,
    },
    ...AI_USER_AGENTS.map((ua) => ({
      userAgent: ua,
      allow: "/",
      disallow: APP_ROUTES_TO_HIDE,
    })),
  ];
  return {
    rules,
    sitemap: `${env.appUrl}/sitemap.xml`,
    host: env.appUrl,
  };
}
