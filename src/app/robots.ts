import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

// Crawler policy. The site benefits from being cited by AI engines
// (ChatGPT, Claude, Perplexity, Google AI Overviews) — non-resident LLC
// owners increasingly research compliance via AI assistants before
// reaching Google. We explicitly opt every major AI crawler into the
// public marketing surface; the disallow list matches what we hide from
// general search engines too (authenticated app routes + API).
// "/start?" blocks only the tracked CTA variants (/start?src=…, ~110 URLs):
// they are noindex duplicates of /start and were 110 of Moz's 114 "meta
// noindex" crawl issues (2026-10-11). /start itself stays crawlable.
// The other 4 of those 114 were the noindex login / application-form pages
// (/sign-in, /partner/sign-in, /ein/apply, /itin/apply). They already carry a
// meta noindex and are not in the sitemap; disallowing them keeps Moz (which
// honours robots.txt) from re-reporting them on every crawl.
// "/applications/" is the auth-gated EIN/ITIN application area
// (/applications/ein/<id>); Googlebot fetched one on 2026-10-13 and only got
// the sign-in redirect, so keep crawlers from spending time there.
const APP_ROUTES_TO_HIDE = [
  // RSC prefetch payloads: not pages, no canonical tag (see src/middleware.ts).
  "/*?_rsc=",
  "/dashboard",
  "/filings",
  "/applications/",
  "/admin",
  "/api/",
  "/start?",
  "/sign-in",
  "/partner/sign-in",
  "/ein/apply",
  "/itin/apply",
];

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
