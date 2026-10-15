import { EIN_PRICE_CENTS, ITIN_PRICE_CENTS, MULTI_YEAR_ADDON_CENTS, TIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";

// Price tokens for blog posts.
//
// Posts never hard-code our own prices. They write a token instead and the
// blog loader (src/lib/blog.ts) swaps it for the live figure from
// src/lib/pricing.ts, so a price change reaches every post, the RSS feed,
// llms.txt, meta descriptions and FAQ JSON-LD on the next build:
//
//   {{price.standard}}        -> $149  (Standard filing, TIERS.standard)
//   {{price.express}}         -> $199  (Express filing, TIERS.express)
//   {{price.additionalYear}}  -> $99   (each additional past tax year)
//   {{price.ein}}             -> $149  (EIN service)
//   {{price.itin}}            -> $349  (ITIN service)
//
// A token may also be simple arithmetic over those names and plain dollar
// numbers, for worked examples whose totals depend on our price:
//
//   {{price.standard * 20}}               -> $2,980
//   {{(399 - price.standard) * 60 / 40}}  -> $375
//
// Grammar: + - * / and parentheses; numbers are whole or decimal dollars.
// Results are rounded to the cent and formatted like every other public price
// (formatPrice: "$2,980", "$373.50").
//
// Fail closed: an unknown name, a syntax error, a stray "{{" or "}}", a
// division by zero or a negative result throws. Nothing ever renders a raw
// token — a file post with a bad token fails the build (every post page is
// prerendered) and the content guard test, and writePost refuses to save one
// from /admin.

export const PRICE_TOKENS = {
  "price.standard": TIERS.standard.priceCents,
  "price.express": TIERS.express.priceCents,
  "price.additionalYear": MULTI_YEAR_ADDON_CENTS,
  "price.ein": EIN_PRICE_CENTS,
  "price.itin": ITIN_PRICE_CENTS,
} as const satisfies Record<string, number>;

export type PriceTokenName = keyof typeof PRICE_TOKENS;

const TOKEN_RE = /\{\{([^{}]*)\}\}/g;

export class PriceTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PriceTokenError";
  }
}

type Lexeme = { kind: "num"; value: number } | { kind: "name"; value: string } | { kind: "op"; value: string };

function lex(source: string, where: string): Lexeme[] {
  const out: Lexeme[] = [];
  // Global (not sticky) regex for the ES5 target: a match must start exactly
  // where the previous one ended, else the token has an illegal character.
  const re = /\s*(?:(\d+(?:\.\d+)?)|([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)|([-+*/()]))\s*/g;
  let index = 0;
  while (index < source.length) {
    re.lastIndex = index;
    const match = re.exec(source);
    if (!match || match.index !== index || match[0].length === 0) {
      throw new PriceTokenError(`Malformed price token "{{${source}}}" in ${where}`);
    }
    if (match[1] !== undefined) out.push({ kind: "num", value: Number(match[1]) });
    else if (match[2] !== undefined) out.push({ kind: "name", value: match[2] });
    else out.push({ kind: "op", value: match[3] });
    index = re.lastIndex;
  }
  return out;
}

/** Evaluate a token body to a dollar amount (not yet rounded). */
function evaluate(source: string, where: string): number {
  const lexemes = lex(source, where);
  if (lexemes.length === 0) throw new PriceTokenError(`Empty price token "{{}}" in ${where}`);
  let pos = 0;
  const fail = (why: string): never => {
    throw new PriceTokenError(`Malformed price token "{{${source}}}" in ${where}: ${why}`);
  };
  const peekOp = (...ops: string[]) => {
    const next = lexemes[pos];
    return next?.kind === "op" && ops.includes(next.value) ? next.value : null;
  };

  const factor = (): number => {
    const next = lexemes[pos++];
    if (!next) return fail("unexpected end");
    if (next.kind === "num") return next.value;
    if (next.kind === "name") {
      if (!Object.prototype.hasOwnProperty.call(PRICE_TOKENS, next.value)) {
        throw new PriceTokenError(
          `Unknown price token "${next.value}" in ${where}. Known tokens: ${Object.keys(PRICE_TOKENS).join(", ")}`,
        );
      }
      return PRICE_TOKENS[next.value as PriceTokenName] / 100;
    }
    if (next.value === "(") {
      const value = expr();
      if (lexemes[pos]?.kind !== "op" || lexemes[pos].value !== ")") fail("missing )");
      pos++;
      return value;
    }
    return fail(`unexpected "${next.value}"`);
  };
  const term = (): number => {
    let value = factor();
    for (let op = peekOp("*", "/"); op; op = peekOp("*", "/")) {
      pos++;
      const rhs = factor();
      if (op === "/" && rhs === 0) fail("division by zero");
      value = op === "*" ? value * rhs : value / rhs;
    }
    return value;
  };
  const expr = (): number => {
    let value = term();
    for (let op = peekOp("+", "-"); op; op = peekOp("+", "-")) {
      pos++;
      const rhs = term();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  };

  const value = expr();
  if (pos !== lexemes.length) fail("unexpected trailing input");
  return value;
}

/** Evaluate one token body ("price.standard * 20") to integer cents. */
export function priceTokenCents(source: string, where = "price token"): number {
  const dollars = evaluate(source, where);
  if (!Number.isFinite(dollars)) throw new PriceTokenError(`Price token "{{${source}}}" in ${where} is not a finite amount`);
  if (dollars < 0) {
    throw new PriceTokenError(
      `Price token "{{${source}}}" in ${where} evaluates to a negative amount — the worked example needs rewriting for the current prices`,
    );
  }
  // toPrecision strips binary float noise first (1.005 * 100 = 100.49999...),
  // so half cents round up as written; `|| 0` turns -0 into 0.
  return Math.round(Number((dollars * 100).toPrecision(12))) || 0;
}

/**
 * Replace every {{...}} price token in `text` with its formatted value.
 * Throws PriceTokenError on any unknown, malformed or unbalanced token.
 */
export function renderPriceTokens(text: string, where = "text"): string {
  const rendered = text.replace(TOKEN_RE, (_whole, inner: string) =>
    formatPrice(priceTokenCents(inner.trim(), where)),
  );
  const stray = rendered.match(/\{\{|\}\}/);
  if (stray) {
    const at = stray.index ?? 0;
    throw new PriceTokenError(
      `Unbalanced price token near "${rendered.slice(Math.max(0, at - 30), at + 30)}" in ${where}`,
    );
  }
  return rendered;
}

/** The literal strings our current prices render as ("$149", "$199", ...). */
export function currentPriceLiterals(): string[] {
  return Array.from(new Set(Object.values(PRICE_TOKENS).map((cents) => formatPrice(cents))));
}
