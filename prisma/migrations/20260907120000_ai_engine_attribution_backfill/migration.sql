-- Backfill AI answer-engine attribution for existing Filing, EinApplication and ItinApplication rows.
--
-- Runtime attribution now classifies recognized AI engines from either the normalized referrer host
-- or sanitized utm_source token as "<engine>-ai" with medium "ai". This migration mirrors that
-- runtime logic for historical rows and is safe to re-run: paid attribution is explicitly excluded,
-- and once a row is rewritten its attrSource no longer satisfies the referral/direct/null or raw
-- utm-token predicates.
--
-- Storage-shape correction: attrReferrer stores only the normalized bare host, never a URL, and
-- attrLanding stores only the landing pathname, never the query string. Historical utm_source
-- evidence survives in attrSource itself, so this backfill intentionally matches attrReferrer host
-- values and lower(attrSource), not URL-shaped referrer or landing-query regexes.

UPDATE "Filing"
SET "attrSource" = 'chatgpt-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)(chatgpt\.com|openai\.com)$')
    OR lower("attrSource") IN ('chatgpt.com','chatgpt','openai')
  );

UPDATE "Filing"
SET "attrSource" = 'perplexity-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)perplexity\.ai$')
    OR lower("attrSource") IN ('perplexity','perplexity.ai')
  );

UPDATE "Filing"
SET "attrSource" = 'copilot-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)copilot\.microsoft\.com$')
    OR lower("attrSource") IN ('copilot')
  );

UPDATE "Filing"
SET "attrSource" = 'claude-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)claude\.ai$')
    OR lower("attrSource") IN ('claude','claude.ai')
  );

UPDATE "Filing"
SET "attrSource" = 'gemini-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)gemini\.google\.com$')
    OR lower("attrSource") IN ('gemini')
  );

UPDATE "Filing"
SET "attrSource" = 'grok-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)(grok\.com|x\.ai)$')
    OR lower("attrSource") IN ('grok')
  );

UPDATE "Filing"
SET "attrSource" = 'metaai-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)meta\.ai$')
    OR lower("attrSource") IN ('meta.ai')
  );

UPDATE "Filing"
SET "attrSource" = 'you-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)you\.com$')
    OR lower("attrSource") IN ('you.com')
  );

UPDATE "EinApplication"
SET "attrSource" = 'chatgpt-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)(chatgpt\.com|openai\.com)$')
    OR lower("attrSource") IN ('chatgpt.com','chatgpt','openai')
  );

UPDATE "EinApplication"
SET "attrSource" = 'perplexity-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)perplexity\.ai$')
    OR lower("attrSource") IN ('perplexity','perplexity.ai')
  );

UPDATE "EinApplication"
SET "attrSource" = 'copilot-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)copilot\.microsoft\.com$')
    OR lower("attrSource") IN ('copilot')
  );

UPDATE "EinApplication"
SET "attrSource" = 'claude-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)claude\.ai$')
    OR lower("attrSource") IN ('claude','claude.ai')
  );

UPDATE "EinApplication"
SET "attrSource" = 'gemini-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)gemini\.google\.com$')
    OR lower("attrSource") IN ('gemini')
  );

UPDATE "EinApplication"
SET "attrSource" = 'grok-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)(grok\.com|x\.ai)$')
    OR lower("attrSource") IN ('grok')
  );

UPDATE "EinApplication"
SET "attrSource" = 'metaai-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)meta\.ai$')
    OR lower("attrSource") IN ('meta.ai')
  );

UPDATE "EinApplication"
SET "attrSource" = 'you-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)you\.com$')
    OR lower("attrSource") IN ('you.com')
  );

UPDATE "ItinApplication"
SET "attrSource" = 'chatgpt-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)(chatgpt\.com|openai\.com)$')
    OR lower("attrSource") IN ('chatgpt.com','chatgpt','openai')
  );

UPDATE "ItinApplication"
SET "attrSource" = 'perplexity-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)perplexity\.ai$')
    OR lower("attrSource") IN ('perplexity','perplexity.ai')
  );

UPDATE "ItinApplication"
SET "attrSource" = 'copilot-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)copilot\.microsoft\.com$')
    OR lower("attrSource") IN ('copilot')
  );

UPDATE "ItinApplication"
SET "attrSource" = 'claude-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)claude\.ai$')
    OR lower("attrSource") IN ('claude','claude.ai')
  );

UPDATE "ItinApplication"
SET "attrSource" = 'gemini-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)gemini\.google\.com$')
    OR lower("attrSource") IN ('gemini')
  );

UPDATE "ItinApplication"
SET "attrSource" = 'grok-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)(grok\.com|x\.ai)$')
    OR lower("attrSource") IN ('grok')
  );

UPDATE "ItinApplication"
SET "attrSource" = 'metaai-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)meta\.ai$')
    OR lower("attrSource") IN ('meta.ai')
  );

UPDATE "ItinApplication"
SET "attrSource" = 'you-ai', "attrMedium" = 'ai'
WHERE ("attrSource" IS NULL OR "attrSource" NOT IN ('google-ads','meta-ads','microsoft-ads'))
  AND (
    (("attrSource" IS NULL OR "attrSource" IN ('referral','direct'))
      AND "attrReferrer" ~* '(^|\.)you\.com$')
    OR lower("attrSource") IN ('you.com')
  );
