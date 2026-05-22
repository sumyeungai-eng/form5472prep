// AI compliance check for a generated Form 5472 + pro forma 1120 filing
// package. The model reads the PDF and the structured filing data we used
// to generate it, then returns whether the PDF complies with IRS rules.
//
// Behavior contract:
//   - Returns a typed structured response (no free-form prose to parse).
//   - On any model/network error, returns { status: "error", ... } so
//     callers can fail open (send the customer their PDF anyway).
//   - Designed to run server-side only (Anthropic key in env).
//
// Cost: ~$0.05–$0.40 per call on Sonnet 4.6 against a 20–40 page PDF.

import Anthropic from "@anthropic-ai/sdk";

export type ValidationStatus = "passed" | "fix_attempted" | "needs_customer_input" | "error";

export type ValidationIssue = {
  severity: "blocker" | "warning";
  // Where in the package, e.g. "Form 5472 Part I line 1c" or "Cover letter address block".
  location: string;
  description: string;
  // Free-text suggestion the AI thinks would resolve the issue. May be null.
  suggested_fix: string | null;
  // True if resolving requires input from the customer (vs. a generator-side fix).
  needs_customer_input: boolean;
  // The literal question we should put in the in-portal message, if needs_customer_input.
  customer_question: string | null;
};

// A field-level patch the AI is confident enough to apply silently. The
// validate-filing endpoint runs each proposal through a server-side allowlist
// (field + category + confidence) before committing it — never trust the
// AI's category tag alone.
export type ProposedFix = {
  // Filing field name, e.g. "llcCity" or "ownerCountryCitizenship". Yearly
  // financial fields are intentionally excluded from auto-fix and the AI is
  // instructed to put those in customer_questions instead.
  field: string;
  before: string;
  after: string;
  category:
    | "casing"
    | "whitespace"
    | "punctuation"
    | "country_normalization"
    | "narrative_clarity"
    | "business_activity_normalization"
    | "typo_proper_noun";
  confidence: "high" | "medium" | "low";
  // One-sentence justification. Surfaces in the FilingChangeLog reason field
  // + the admin audit email so silent edits are always reviewable.
  reason: string;
};

export type ValidationResponse = {
  status: ValidationStatus;
  summary: string;
  issues: ValidationIssue[];
  // Distilled list of questions for the customer. Empty when status != needs_customer_input.
  customer_questions: string[];
  // Field-level patches the AI thinks can be silently applied. May coexist
  // with customer_questions when only SOME issues are auto-fixable.
  proposed_fixes: ProposedFix[];
  // Raw model output for audit / debugging. May be truncated.
  raw?: unknown;
  // Error message when status == "error".
  errorMessage?: string;
};

// Subset of the filing fields we send to the AI so it can cross-check the
// PDF against the source data. Adding fields is safe; the AI ignores unknown.
export type FilingSnapshot = {
  id: string;
  tier: string;
  taxYears: number[];
  isDiirsp: boolean;
  reasonableCauseNarrative: string | null;
  llcName: string | null;
  llcEin: string | null;
  llcAddress: string | null;
  llcCity: string | null;
  llcState: string | null;
  llcZip: string | null;
  llcCountry: string | null;
  llcDateIncorporated: string | null;
  llcBusinessActivity: string | null;
  llcBusinessCode: string | null;
  ownerName: string | null;
  ownerAddress: string | null;
  ownerCountryCitizenship: string | null;
  ownerCountryTaxResidence: string | null;
  ownerCountryBusiness: string | null;
  ownerFtin: string | null;
  ownerItin: string | null;
  ownerReferenceId: string | null;
  yearData: Array<{
    taxYear: number;
    totalAssetsYearEnd: string;
    contributions: string;
    distributions: string;
    otherTransactionsNote: string | null;
    reportableTransactions: unknown[];
  }>;
};

const SYSTEM_PROMPT = `You are a senior IRS Form 5472 compliance reviewer. Your job is to read a generated
filing package (PDF) and the structured data used to produce it, then decide whether
the package is ready to be faxed to the IRS Ogden PIN Unit.

A complete package contains:
  1. Cover letter addressed to: Internal Revenue Service, 1973 Rulon White Blvd,
     M/S 6112, Attn: PIN Unit, Ogden, UT 84201
  2. Pro forma Form 1120 (year-appropriate revision; 2025 onward uses f1120-2025).
     Minimal fill: name, address, EIN. Marked as a pro forma attachment to Form 5472.
  3. Form 5472 for the reporting corporation (the U.S. LLC).
     - Part I: name, address, EIN, dates, business activity/code, total assets,
       check the "Reporting corporation is foreign-owned U.S. DE" box on 1j (box 3).
     - Part II: 25% foreign shareholder name, address, country of citizenship,
       FTIN (required) OR Reference ID if FTIN is "applied for"/unavailable.
     - Part III: Related party (typically same as the foreign owner) info.
     - Part IV: Monetary transactions between the reporting corporation and the
       foreign related party (lines 7–17). May be 0 if no transactions; the form
       still must show 0, not blank.
     - Part V: Reportable transactions. If present, supporting statement attached.
   For multi-year filings, ONE Form 5472 per tax year (each with its own pro forma 1120).
  4. If DIIRSP (delinquent submission under Rev. Proc. 2020-29 / DIIRSP procedures),
     a reasonable cause statement must be attached. Cannot be empty or trivially short.

Common issues that BLOCK filing:
  - Missing or empty required Part I/II fields (name, EIN, address, country, FTIN/Reference ID)
  - Part 1j box 3 not checked (or wrong box checked)
  - Pro forma 1120 missing for one or more years
  - DIIRSP filing but reasonable cause statement is missing/blank/trivial
  - FTIN missing AND Reference ID missing (one or the other required)
  - Country names mismatched between Part II and supporting documents
  - Years on Form 5472 vs pro forma 1120 mismatched
  - Cover letter has wrong IRS address (must be Ogden PIN Unit)

PROPOSED FIXES — auto-apply path
You may also populate proposed_fixes with field-level patches that are safe to
apply without asking the customer. The server runs every proposal through a
strict allowlist (field + category + confidence) before committing, so over-
proposing is fine — bad proposals just get dropped. Under-proposing wastes a
round-trip with the customer, so propose whenever you're confident.

Each proposed_fix needs: field, before, after, category, confidence, reason.

Categories you may propose:
  - casing                        : "wyoming" -> "Wyoming"; "john smith" -> "John Smith"
  - whitespace                    : trim, collapse double-spaces, strip tabs
  - punctuation                   : add missing period; normalize quotes
  - country_normalization         : "USA" -> "United States"; "UK" -> "United Kingdom"; "Hong Kong SAR" -> "Hong Kong"
  - narrative_clarity             : tighten grammar in reasonableCauseNarrative (do NOT change meaning)
  - business_activity_normalization : "selling stuff online" -> "Online retail sales"
  - typo_proper_noun              : obvious spelling errors on owner name, city, state, address line

HARD RULES — never propose a fix for these:
  - llcName                       (legal entity name — even an obvious-looking typo could be intentional)
  - llcEin / ownerFtin / ownerItin / ownerReferenceId  (legal identifiers — typos must be customer-confirmed)
  - llcDateIncorporated           (historical fact)
  - taxYears / tier               (changes scope and billing)
  - yearData.* (any year financials) (contributions / distributions / total assets / transactions — always ask)
  - llcCountry                    (always US for our service — but flag in issues, don't auto-edit)
  - Anything where you are not highly confident the change preserves the customer's intent

For everything that is NOT auto-fixable but still needs resolution, put it in
issues[] with needs_customer_input=true and add the question to
customer_questions[].

You MUST call the report_validation tool exactly once with your assessment. Do not respond with
prose; the tool call is the only acceptable output. Be conservative on customer-facing classification:
when in doubt, classify as needs_customer_input rather than auto-passing. False negatives (filing a
bad form) are far worse than false positives (asking the customer to confirm).`;

const REPORT_TOOL = {
  name: "report_validation",
  description: "Report the AI compliance check result for an IRS Form 5472 filing package.",
  input_schema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["passed", "fix_attempted", "needs_customer_input"],
        description:
          "Overall verdict. 'passed' = no issues. 'fix_attempted' = issues found that can be auto-fixed by the regenerator (provide suggested_fix on each issue). 'needs_customer_input' = customer must clarify before we can ship.",
      },
      summary: {
        type: "string",
        description: "One- or two-sentence human-readable summary of the verdict.",
      },
      issues: {
        type: "array",
        items: {
          type: "object",
          properties: {
            severity: { type: "string", enum: ["blocker", "warning"] },
            location: {
              type: "string",
              description: "Where in the package, e.g. 'Form 5472 Part I line 1c (year 2024)' or 'Cover letter, address block'.",
            },
            description: { type: "string", description: "What's wrong." },
            suggested_fix: {
              type: ["string", "null"],
              description: "What a regenerator-side fix would look like, if applicable.",
            },
            needs_customer_input: {
              type: "boolean",
              description: "True iff resolving requires asking the customer.",
            },
            customer_question: {
              type: ["string", "null"],
              description: "Exact wording of the question to post to the customer's portal, if needs_customer_input.",
            },
          },
          required: ["severity", "location", "description", "needs_customer_input"],
        },
      },
      customer_questions: {
        type: "array",
        items: { type: "string" },
        description: "Distilled, deduplicated list of questions to put in the portal message. Empty if no customer input needed.",
      },
      proposed_fixes: {
        type: "array",
        description: "Field-level patches you're confident are safe to apply silently. Server enforces an allowlist on top of this — over-proposing is fine. See system prompt for HARD RULES.",
        items: {
          type: "object",
          properties: {
            field: { type: "string", description: "Filing field name, e.g. 'llcCity' or 'ownerCountryCitizenship'. yearData.* fields are not allowed." },
            before: { type: "string", description: "Current value (as shown in the JSON snapshot)." },
            after: { type: "string", description: "Corrected value to write." },
            category: {
              type: "string",
              enum: [
                "casing",
                "whitespace",
                "punctuation",
                "country_normalization",
                "narrative_clarity",
                "business_activity_normalization",
                "typo_proper_noun",
              ],
            },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
            reason: { type: "string", description: "One short sentence justifying why this is safe to auto-apply." },
          },
          required: ["field", "before", "after", "category", "confidence", "reason"],
        },
      },
    },
    required: ["status", "summary", "issues", "customer_questions"],
  },
} as const;

type ToolInput = {
  status: "passed" | "fix_attempted" | "needs_customer_input";
  summary: string;
  issues: ValidationIssue[];
  customer_questions: string[];
  proposed_fixes?: ProposedFix[];
};

export async function validateFiling(args: {
  pdfBytes: Uint8Array | Buffer;
  filing: FilingSnapshot;
}): Promise<ValidationResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      status: "error",
      summary: "ANTHROPIC_API_KEY not configured",
      issues: [],
      customer_questions: [],
      proposed_fixes: [],
      errorMessage: "missing_api_key",
    };
  }

  const client = new Anthropic({ apiKey });
  const pdfBase64 = Buffer.from(args.pdfBytes).toString("base64");

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5", // Sonnet 4.6 alias; falls back to 4.5 if API hasn't surfaced 4.6 yet
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [REPORT_TOOL as never],
      tool_choice: { type: "tool", name: "report_validation" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
            },
            {
              type: "text",
              text:
                "Review this generated Form 5472 filing package against IRS rules. " +
                "Below is the structured source data used to generate the PDF — cross-check the PDF " +
                "against it for inconsistencies, missing fields, and IRS-rule violations.\n\n" +
                "```json\n" +
                JSON.stringify(args.filing, null, 2) +
                "\n```",
            },
          ],
        },
      ],
    });

    // Find the tool_use block we forced via tool_choice.
    const toolBlock = response.content.find((b) => b.type === "tool_use");
    if (!toolBlock || toolBlock.type !== "tool_use" || toolBlock.name !== "report_validation") {
      return {
        status: "error",
        summary: "AI did not return a tool call",
        issues: [],
        customer_questions: [],
        proposed_fixes: [],
        errorMessage: `no_tool_call (stop_reason=${response.stop_reason})`,
        raw: response,
      };
    }
    const out = toolBlock.input as ToolInput;
    return {
      status: out.status,
      summary: out.summary,
      issues: out.issues ?? [],
      customer_questions: out.customer_questions ?? [],
      proposed_fixes: out.proposed_fixes ?? [],
      raw: out,
    };
  } catch (err) {
    return {
      status: "error",
      summary: "AI call failed",
      issues: [],
      customer_questions: [],
      proposed_fixes: [],
      errorMessage: err instanceof Error ? err.message : String(err),
    };
  }
}
