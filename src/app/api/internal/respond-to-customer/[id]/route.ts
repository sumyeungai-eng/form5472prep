import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { putPdf } from "@/lib/storage";
import { generatePackage, type SignatureLocation } from "@/lib/pdf/generatePackage";
import { resolveTier } from "@/lib/pricing";
import { makeMagicLink } from "@/lib/magicLink";
import {
  sendOrderConfirmationEmail,
  sendAiFieldChangeAdminEmail,
  sendAiEscalationAdminEmail,
} from "@/lib/email";
import { validateFiling, type FilingSnapshot } from "@/lib/ai/validateFiling";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Conversation loop with tool execution can take 30-90s depending on path.
export const maxDuration = 180;

// AI conversation agent. Triggered when the customer replies in a thread
// where an earlier validation flagged needs_customer_input. The agent reads
// the thread + the original issues + the current filing data, then can:
//   - reply in the chat
//   - update whitelisted fields based on customer clarification
//   - regenerate + revalidate the PDF
//   - send the final order-confirmation email (PDF + signature steps)
//   - escalate to admin
//
// Hard limits enforced:
//   - aiTurnsUsed cap of 3 per filing before forced escalation (set in caller)
//   - Field updates restricted to a whitelist; financial/identity fields excluded
//   - mark_resolved_and_send_final requires a fresh validation=passed result
//   - Single max-iterations loop cap to prevent runaway costs

const MAX_LOOP_ITERATIONS = 8;
const MAX_OUTPUT_TOKENS = 4096;

// Fields the AI may update via update_filing_field. Excludes:
//  - llcEin / ownerFtin-as-identity (real risk of corruption)
//  - llcDateIncorporated (date format risk; historical fact)
//  - tier / taxYears (changes pricing)
//  - payment / PDF / signature / fax fields
//  - userId / sessionId (auth)
// ownerFtin IS in the list because typos are common and customer can
// re-confirm. Same logic for ownerItin / ownerReferenceId.
const EDITABLE_FILING_FIELDS = new Set([
  "llcName",
  "llcAddress",
  "llcCity",
  "llcState",
  "llcZip",
  "llcCountry",
  "llcBusinessActivity",
  "llcBusinessCode",
  "ownerName",
  "ownerAddress",
  "ownerAddressStreet",
  "ownerAddressCity",
  "ownerAddressState",
  "ownerAddressPostal",
  "ownerAddressCountry",
  "ownerCountryCitizenship",
  "ownerCountryTaxResidence",
  "ownerCountryBusiness",
  "ownerFtin",
  "ownerItin",
  "ownerReferenceId",
  "reasonableCauseNarrative",
]);

const EDITABLE_YEAR_FIELDS = new Set([
  "totalAssetsYearEnd",
  "contributions",
  "distributions",
  "otherTransactionsNote",
]);

const SYSTEM_PROMPT = `You are the AI compliance + support agent for Form5472 Prep, a service that
prepares IRS Form 5472 filings for foreign-owned U.S. LLCs.

CONTEXT
You're in the middle of a conversation with a customer in their filing portal.
Earlier, you (or an earlier validation pass) flagged some issues with their
generated Form 5472 package that required customer clarification. The customer
has now replied. Your job: continue the conversation until the issues are
either resolved (regenerate + send final PDF) or you must escalate to admin.

CONVERSATION GUIDELINES
- The customer sees you as "Form5472 Prep team" — a human-like persona. Be
  warm, concise, professional. Avoid robotic phrases like "I am an AI".
- Keep replies short. One short paragraph or a few bullets. No multi-page text.
- When the customer answers a question, acknowledge it briefly and either
  apply the fix or ask the next thing.
- When you make a field change, tell the customer plainly what you changed
  ("I've updated the LLC name to 'East West Global Technology LLC'").

ACTIONS YOU CAN TAKE
You have tools that let you reply, update specific filing fields, regenerate
the PDF, send the final package to the customer, or escalate to admin. Use
them in this order when applicable:

1. Read the conversation and decide what the customer's reply means.
2. If they confirmed a fix: call update_filing_field (or update_year_data)
   to apply it. Then reply_to_customer to acknowledge.
3. If there are still unresolved issues from the original flag, ask the next
   question via reply_to_customer.
4. If you've applied all needed fixes and the customer has confirmed all open
   issues: call regenerate_and_revalidate to rebuild the PDF and re-check it.
5. If the re-check returns status=passed: call mark_resolved_and_send_final
   with a brief closing reply for the customer.
6. If the re-check returns more issues, ask the customer about those.
7. If the customer is confused, off-topic, contradicts themselves, asks for
   a human, or you've made no progress after one exchange: call
   escalate_to_admin with a brief reason.

GUARDRAILS
- Never invent field values. If a customer's reply is ambiguous, ask, don't guess.
- Don't apply a financial-number change without the customer explicitly stating it.
- Don't call mark_resolved_and_send_final unless regenerate_and_revalidate
  has just been called and returned status=passed. The tool will refuse otherwise.
- One reply per turn — don't call reply_to_customer twice in the same turn.
- When in doubt, escalate. False handoffs to human cost less than wrong filings.`;

const TOOLS = [
  {
    name: "reply_to_customer",
    description: "Post a single chat message to the customer in the filing portal. The customer sees this as 'Form5472 Prep team'. Use for clarifying questions, status updates, or acknowledgements. Do NOT call this more than once per turn.",
    input_schema: {
      type: "object",
      properties: {
        text: { type: "string", description: "The plain-text message body. Keep it short and warm." },
      },
      required: ["text"],
    },
  },
  {
    name: "update_filing_field",
    description: "Apply a customer-confirmed change to a top-level filing field. Logged to FilingChangeLog and emailed to admin. Whitelist only — non-whitelisted fields return an error.",
    input_schema: {
      type: "object",
      properties: {
        field: {
          type: "string",
          description: "Field name. Allowed values: llcName, llcAddress, llcCity, llcState, llcZip, llcCountry, llcBusinessActivity, llcBusinessCode, ownerName, ownerAddress, ownerAddressStreet, ownerAddressCity, ownerAddressState, ownerAddressPostal, ownerAddressCountry, ownerCountryCitizenship, ownerCountryTaxResidence, ownerCountryBusiness, ownerFtin, ownerItin, ownerReferenceId, reasonableCauseNarrative.",
        },
        value: { type: ["string", "null"], description: "New string value. Use null only to explicitly clear a field." },
        reason: { type: "string", description: "Brief quote or paraphrase of what the customer said that authorizes this change." },
      },
      required: ["field", "value", "reason"],
    },
  },
  {
    name: "update_year_data",
    description: "Apply a customer-confirmed change to a per-year value. Logged and emailed. Whitelist: totalAssetsYearEnd, contributions, distributions, otherTransactionsNote.",
    input_schema: {
      type: "object",
      properties: {
        year: { type: "number", description: "The tax year (e.g. 2024)." },
        field: { type: "string", description: "One of: totalAssetsYearEnd, contributions, distributions, otherTransactionsNote." },
        value: { type: ["string", "number", "null"], description: "New value. Numeric for the dollar fields, string for otherTransactionsNote, null to clear." },
        reason: { type: "string", description: "Brief quote from the customer." },
      },
      required: ["year", "field", "value", "reason"],
    },
  },
  {
    name: "regenerate_and_revalidate",
    description: "Rebuild the PDF from current DB state and re-run the AI compliance check. Returns the new validation status and any remaining issues. Call this after applying field updates.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "mark_resolved_and_send_final",
    description: "Close the loop: send the final signed-ready PDF + signature instructions to the customer via email, and post a closing message in the chat. Requires that the MOST RECENT regenerate_and_revalidate call returned status=passed. Refuses otherwise.",
    input_schema: {
      type: "object",
      properties: {
        text: { type: "string", description: "The closing message to post in the chat. Tell the customer their PDF is on its way and they can find it in their email." },
      },
      required: ["text"],
    },
  },
  {
    name: "escalate_to_admin",
    description: "Give up and hand the thread to a human admin. Posts a brief 'we're looping in our team' message to the customer and sends admin an email. Use when the customer is confused, off-topic, asks for human, or you can't make progress.",
    input_schema: {
      type: "object",
      properties: {
        reason: { type: "string", description: "Brief reason for the handoff (admin sees this)." },
      },
      required: ["reason"],
    },
  },
] as const;

function isAuthorized(req: Request): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return false;
  return (req.headers.get("authorization") ?? "") === `Bearer ${secret}`;
}

type ToolUseBlock = { type: "tool_use"; id: string; name: string; input: Record<string, unknown> };
type TextBlock = { type: "text"; text: string };
type ContentBlock = ToolUseBlock | TextBlock;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const filing = await prisma.filing.findUnique({
    where: { id: params.id },
    include: { user: true, yearData: { orderBy: { taxYear: "asc" } } },
  });
  if (!filing) return NextResponse.json({ error: "filing not found" }, { status: 404 });

  // Pre-checks: AI defers to admin handoff, and only runs while the filing
  // is in the needs_customer_input state.
  if (filing.aiHandoff === "admin") {
    return NextResponse.json({ skipped: "admin_handoff" });
  }
  if (filing.validationStatus !== "needs_customer_input") {
    return NextResponse.json({ skipped: `validation_status=${filing.validationStatus}` });
  }

  const adminFilingUrl = `${env.appUrl}/admin/filings/${filing.id}`;

  // Hit the cap → escalate immediately (no LLM call).
  if (filing.aiTurnsUsed >= 3) {
    await forceEscalate(filing.id, "Reached max AI conversation turns", filing, adminFilingUrl);
    return NextResponse.json({ ok: true, action: "escalated", reason: "max_turns" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
  const client = new Anthropic({ apiKey });

  // Claim the thread + bump turn counter atomically.
  await prisma.filing.update({
    where: { id: filing.id },
    data: { aiHandoff: "agent", aiTurnsUsed: { increment: 1 } },
  });

  // Load message thread.
  const messages = await prisma.message.findMany({
    where: { filingId: filing.id },
    orderBy: { createdAt: "asc" },
    select: { fromAdmin: true, body: true, createdAt: true },
  });

  // Build the user message: thread + current filing data + last AI validation result.
  const threadText = messages
    .map((m) => `[${m.createdAt.toISOString()}] ${m.fromAdmin ? "Form5472 Prep team" : "Customer"}: ${m.body}`)
    .join("\n\n");
  const snapshot = buildSnapshot(filing);
  const lastValidation = filing.validationIssuesJson as Record<string, unknown> | null;

  // State for this run that tools mutate.
  const runState = {
    lastRevalidationPassed: false,
    lastRevalidationStatus: null as string | null,
    repliedThisTurn: false,
    finalAction: "no_action" as "no_action" | "replied" | "applied_change" | "regenerated" | "resolved" | "escalated",
    appliedChanges: [] as Array<{ field: string; before: unknown; after: unknown }>,
  };

  // Build the initial conversation for Claude.
  const initialUserText =
    `Here is the current state of the customer support thread, the open issues, and the filing data.\n\n` +
    `=== CONVERSATION THREAD (oldest first) ===\n${threadText}\n\n` +
    `=== ORIGINAL VALIDATION RESULT ===\n${JSON.stringify(lastValidation, null, 2)}\n\n` +
    `=== CURRENT FILING DATA ===\n${JSON.stringify(snapshot, null, 2)}\n\n` +
    `Decide what to do based on the customer's most recent message. Use the tools provided.`;

  const claudeMessages: Array<{ role: "user" | "assistant"; content: unknown }> = [
    { role: "user", content: initialUserText },
  ];

  // Tool-execution loop.
  for (let iteration = 0; iteration < MAX_LOOP_ITERATIONS; iteration++) {
    let response: Anthropic.Messages.Message;
    try {
      response = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: MAX_OUTPUT_TOKENS,
        system: SYSTEM_PROMPT,
        tools: TOOLS as never,
        messages: claudeMessages as never,
      });
    } catch (err) {
      console.error("[respond-to-customer] anthropic call failed", err);
      // Best-effort escalation if Claude is unreachable.
      await forceEscalate(filing.id, `AI infra error: ${err instanceof Error ? err.message : "unknown"}`, filing, adminFilingUrl);
      return NextResponse.json({ ok: true, action: "escalated", reason: "ai_error" });
    }

    const content = response.content as ContentBlock[];
    claudeMessages.push({ role: "assistant", content });

    const toolUses = content.filter((b): b is ToolUseBlock => b.type === "tool_use");
    if (toolUses.length === 0) {
      // Claude returned text-only — treat as silent end. Force escalate so customer isn't ignored.
      const text = content.filter((b): b is TextBlock => b.type === "text").map((b) => b.text).join(" ").trim();
      console.warn("[respond-to-customer] no tool calls; treating as end_turn", { text });
      if (!runState.repliedThisTurn) {
        await forceEscalate(filing.id, "AI returned no action", filing, adminFilingUrl);
        runState.finalAction = "escalated";
      }
      break;
    }

    // Execute each tool call.
    const toolResults: Array<{ type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean }> = [];
    let shouldBreak = false;
    for (const use of toolUses) {
      const out = await executeTool(use, {
        filingId: filing.id,
        filing,
        adminFilingUrl,
        runState,
        snapshot,
      });
      toolResults.push({
        type: "tool_result",
        tool_use_id: use.id,
        content: typeof out.result === "string" ? out.result : JSON.stringify(out.result),
        is_error: out.isError,
      });
      if (out.terminal) shouldBreak = true;
    }

    claudeMessages.push({ role: "user", content: toolResults });
    if (shouldBreak) break;
  }

  return NextResponse.json({ ok: true, action: runState.finalAction, changes: runState.appliedChanges.length });
}

// -------- Tool execution --------

type LoadedFiling = {
  id: string;
  llcName: string | null;
  user: { id: string; email: string } | null;
};
type ExecCtx = {
  filingId: string;
  filing: LoadedFiling;
  adminFilingUrl: string;
  runState: {
    lastRevalidationPassed: boolean;
    lastRevalidationStatus: string | null;
    repliedThisTurn: boolean;
    finalAction: "no_action" | "replied" | "applied_change" | "regenerated" | "resolved" | "escalated";
    appliedChanges: Array<{ field: string; before: unknown; after: unknown }>;
  };
  snapshot: FilingSnapshot;
};

async function executeTool(use: ToolUseBlock, ctx: ExecCtx): Promise<{ result: unknown; isError?: boolean; terminal?: boolean }> {
  try {
    switch (use.name) {
      case "reply_to_customer": {
        const text = String(use.input.text ?? "").trim();
        if (!text) return { result: { error: "empty text" }, isError: true };
        if (ctx.runState.repliedThisTurn) {
          return { result: { error: "already replied this turn — only one reply allowed per agent run" }, isError: true };
        }
        await prisma.message.create({
          data: { filingId: ctx.filingId, fromAdmin: true, body: text },
        });
        ctx.runState.repliedThisTurn = true;
        ctx.runState.finalAction = "replied";
        return { result: { ok: true } };
      }

      case "update_filing_field": {
        const field = String(use.input.field ?? "");
        if (!EDITABLE_FILING_FIELDS.has(field)) {
          return { result: { error: `field "${field}" is not editable. Allowed: ${Array.from(EDITABLE_FILING_FIELDS).join(", ")}` }, isError: true };
        }
        const rawValue = use.input.value;
        const value: string | null = rawValue === null ? null : String(rawValue);
        const reason = String(use.input.reason ?? "");

        const current = await prisma.filing.findUnique({ where: { id: ctx.filingId } });
        if (!current) return { result: { error: "filing not found" }, isError: true };
        const before = (current as unknown as Record<string, unknown>)[field];

        await prisma.filing.update({
          where: { id: ctx.filingId },
          data: { [field]: value },
        });
        await prisma.filingChangeLog.create({
          data: { filingId: ctx.filingId, source: "ai", field, beforeJson: before as never, afterJson: value as never, reason },
        });

        ctx.runState.appliedChanges.push({ field, before, after: value });
        ctx.runState.finalAction = "applied_change";

        // Admin notification (don't block on it).
        sendAiFieldChangeAdminEmail({
          adminEmail: env.supportEmail,
          filingId: ctx.filingId,
          llcName: ctx.filing.llcName,
          adminFilingUrl: ctx.adminFilingUrl,
          field,
          before,
          after: value,
          reason,
        }).catch((err) => console.error("[respond-to-customer] field change email failed", err));

        return { result: { ok: true, before, after: value } };
      }

      case "update_year_data": {
        const year = Number(use.input.year);
        const field = String(use.input.field ?? "");
        const reason = String(use.input.reason ?? "");
        if (!EDITABLE_YEAR_FIELDS.has(field)) {
          return { result: { error: `year field "${field}" is not editable. Allowed: ${Array.from(EDITABLE_YEAR_FIELDS).join(", ")}` }, isError: true };
        }
        const yd = await prisma.filingYearData.findUnique({
          where: { filingId_taxYear: { filingId: ctx.filingId, taxYear: year } },
        });
        if (!yd) return { result: { error: `no year data row for tax year ${year}` }, isError: true };

        let prismaValue: number | string | null;
        if (field === "otherTransactionsNote") {
          prismaValue = use.input.value === null ? null : String(use.input.value);
        } else {
          const n = Number(use.input.value);
          if (Number.isNaN(n)) return { result: { error: "value must be a number for this field" }, isError: true };
          prismaValue = n;
        }

        const before = (yd as unknown as Record<string, unknown>)[field];
        await prisma.filingYearData.update({
          where: { filingId_taxYear: { filingId: ctx.filingId, taxYear: year } },
          data: { [field]: prismaValue },
        });
        await prisma.filingChangeLog.create({
          data: { filingId: ctx.filingId, source: "ai", field: `yearData[${year}].${field}`, beforeJson: before as never, afterJson: prismaValue as never, reason },
        });
        ctx.runState.appliedChanges.push({ field: `yearData[${year}].${field}`, before, after: prismaValue });
        ctx.runState.finalAction = "applied_change";

        sendAiFieldChangeAdminEmail({
          adminEmail: env.supportEmail,
          filingId: ctx.filingId,
          llcName: ctx.filing.llcName,
          adminFilingUrl: ctx.adminFilingUrl,
          field: `yearData[${year}].${field}`,
          before,
          after: prismaValue,
          reason,
        }).catch((err) => console.error("[respond-to-customer] year change email failed", err));

        return { result: { ok: true, before, after: prismaValue } };
      }

      case "regenerate_and_revalidate": {
        const fresh = await prisma.filing.findUnique({
          where: { id: ctx.filingId },
          include: { yearData: { orderBy: { taxYear: "asc" } } },
        });
        if (!fresh) return { result: { error: "filing not found" }, isError: true };
        const pkg = await regeneratePackage(fresh);
        if ("error" in pkg) return { result: { error: pkg.error }, isError: true };

        const key = `${ctx.filingId}_unsigned.pdf`;
        await putPdf(key, pkg.bytes);

        const snapshot = buildSnapshot(fresh);
        const validation = await validateFiling({ pdfBytes: pkg.bytes, filing: snapshot });
        await prisma.filing.update({
          where: { id: ctx.filingId },
          data: {
            generatedPdfKey: key,
            validationStatus: validation.status,
            validationIssuesJson: validation as unknown as never,
            validationCheckedAt: new Date(),
          },
        });

        ctx.runState.lastRevalidationPassed = validation.status === "passed";
        ctx.runState.lastRevalidationStatus = validation.status;
        ctx.runState.finalAction = "regenerated";

        return {
          result: {
            status: validation.status,
            summary: validation.summary,
            issues: validation.issues,
            customer_questions: validation.customer_questions,
          },
        };
      }

      case "mark_resolved_and_send_final": {
        if (!ctx.runState.lastRevalidationPassed) {
          return {
            result: {
              error: `cannot send final yet — last revalidation status was "${ctx.runState.lastRevalidationStatus ?? "(never run)"}". Call regenerate_and_revalidate first and check status=passed.`,
            },
            isError: true,
          };
        }
        const text = String(use.input.text ?? "Your filing is ready — check your email.").trim();

        // Post closing message.
        await prisma.message.create({
          data: { filingId: ctx.filingId, fromAdmin: true, body: text },
        });

        // Send the final order-confirmation email with the regenerated PDF.
        const fresh = await prisma.filing.findUnique({
          where: { id: ctx.filingId },
          include: { user: true, yearData: { orderBy: { taxYear: "asc" } } },
        });
        if (!fresh) return { result: { error: "filing not found" }, isError: true };
        const pkg = await regeneratePackage(fresh);
        if ("error" in pkg) {
          return { result: { error: `regenerate failed at send time: ${pkg.error}` }, isError: true };
        }
        if (fresh.user) {
          await sendOrderConfirmationEmail({
            email: fresh.user.email,
            filingId: fresh.id,
            llcName: fresh.llcName,
            taxYears: fresh.taxYears,
            tier: resolveTier(fresh.tier).tier,
            amountPaidCents: fresh.amountPaid,
            faxService: fresh.faxService,
            portalLink: makeMagicLink(fresh.user.id),
            receiptUrl: null,
            pdfBytes: pkg.bytes,
            signatures: pkg.signatures,
          });
        }

        // Clear handoff + reset turn counter so a future round (e.g. if customer
        // signs in to ask something else after the fact) starts fresh.
        await prisma.filing.update({
          where: { id: ctx.filingId },
          data: { aiHandoff: null, aiTurnsUsed: 0 },
        });

        ctx.runState.finalAction = "resolved";
        ctx.runState.repliedThisTurn = true;
        return { result: { ok: true }, terminal: true };
      }

      case "escalate_to_admin": {
        const reason = String(use.input.reason ?? "no reason given");
        await escalateNow(ctx.filingId, reason, ctx.filing, ctx.adminFilingUrl);
        ctx.runState.finalAction = "escalated";
        ctx.runState.repliedThisTurn = true;
        return { result: { ok: true }, terminal: true };
      }

      default:
        return { result: { error: `unknown tool "${use.name}"` }, isError: true };
    }
  } catch (err) {
    console.error("[respond-to-customer] tool execution error", use.name, err);
    return { result: { error: err instanceof Error ? err.message : "unknown error" }, isError: true };
  }
}

// -------- Helpers --------

async function escalateNow(
  filingId: string,
  reason: string,
  filing: { llcName: string | null; user: { email: string } | null },
  adminFilingUrl: string,
) {
  const customerNotice = "Thanks for the reply — I'm looping in our team and we'll follow up within one business day.";
  await prisma.message.create({
    data: { filingId, fromAdmin: true, body: customerNotice },
  });
  await prisma.filing.update({
    where: { id: filingId },
    data: { aiHandoff: "admin" },
  });
  const recent = await prisma.message.findMany({
    where: { filingId },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { fromAdmin: true, body: true, createdAt: true },
  });
  const threadExcerpt = recent
    .reverse()
    .map((m) => `[${m.createdAt.toISOString()}] ${m.fromAdmin ? "Team" : "Customer"}: ${m.body}`)
    .join("\n\n");
  try {
    await sendAiEscalationAdminEmail({
      adminEmail: env.supportEmail,
      customerEmail: filing.user?.email ?? null,
      filingId,
      llcName: filing.llcName,
      adminFilingUrl,
      reason,
      recentThread: threadExcerpt,
    });
  } catch (err) {
    console.error("[respond-to-customer] escalation email failed", err);
  }
}

async function forceEscalate(
  filingId: string,
  reason: string,
  filing: { llcName: string | null; user: { email: string } | null },
  adminFilingUrl: string,
) {
  await escalateNow(filingId, reason, filing, adminFilingUrl);
}

type RegenInput = {
  llcName: string | null; llcEin: string | null; llcAddress: string | null;
  llcCity: string | null; llcState: string | null; llcZip: string | null;
  llcCountry: string; llcDateIncorporated: Date | null;
  llcBusinessActivity: string | null; llcBusinessCode: string | null;
  ownerName: string | null; ownerAddress: string | null;
  ownerCountryCitizenship: string | null; ownerCountryTaxResidence: string | null;
  ownerCountryBusiness: string | null; ownerFtin: string | null;
  ownerItin: string | null; ownerReferenceId: string | null;
  taxYears: number[]; isDiirsp: boolean; reasonableCauseNarrative: string | null;
  yearData: Array<{ taxYear: number; totalAssetsYearEnd: { toString(): string }; contributions: { toString(): string }; distributions: { toString(): string }; otherTransactionsNote: string | null; reportableTransactions: unknown }>;
};

async function regeneratePackage(filing: RegenInput): Promise<{ bytes: Uint8Array; signatures: SignatureLocation[] } | { error: string }> {
  if (!filing.llcName || !filing.llcEin || !filing.llcAddress || !filing.llcCity ||
      !filing.llcState || !filing.llcZip || !filing.llcDateIncorporated ||
      !filing.llcBusinessActivity || !filing.llcBusinessCode || !filing.ownerName ||
      !filing.ownerAddress || !filing.ownerCountryCitizenship ||
      !filing.ownerCountryTaxResidence || !filing.ownerCountryBusiness ||
      !filing.ownerFtin) {
    return { error: "filing missing required generator inputs" };
  }
  const pkg = await generatePackage({
    llcName: filing.llcName, llcEin: filing.llcEin, llcAddress: filing.llcAddress,
    llcCity: filing.llcCity, llcState: filing.llcState, llcZip: filing.llcZip,
    llcCountry: filing.llcCountry, llcDateIncorporated: filing.llcDateIncorporated,
    llcBusinessActivity: filing.llcBusinessActivity, llcBusinessCode: filing.llcBusinessCode,
    ownerName: filing.ownerName, ownerAddress: filing.ownerAddress,
    ownerCountryCitizenship: filing.ownerCountryCitizenship,
    ownerCountryTaxResidence: filing.ownerCountryTaxResidence,
    ownerCountryBusiness: filing.ownerCountryBusiness, ownerFtin: filing.ownerFtin,
    ownerItin: filing.ownerItin, ownerReferenceId: filing.ownerReferenceId,
    taxYears: filing.taxYears, isDiirsp: filing.isDiirsp,
    reasonableCauseNarrative: filing.reasonableCauseNarrative,
    yearData: filing.yearData.map((y) => ({
      taxYear: y.taxYear,
      totalAssetsYearEnd: Number(y.totalAssetsYearEnd),
      contributions: Number(y.contributions),
      distributions: Number(y.distributions),
      otherTransactionsNote: y.otherTransactionsNote,
      reportableTransactions: Array.isArray(y.reportableTransactions)
        ? (y.reportableTransactions as unknown[]).filter(
            (t): t is { date: string; description: string; counterparty?: string; amountCents: number; category: string } =>
              !!t && typeof t === "object" && "date" in t && "amountCents" in t && "category" in t,
          )
        : [],
    })),
  });
  return { bytes: pkg.bytes, signatures: pkg.signatures };
}

function buildSnapshot(filing: {
  id: string; tier: string; taxYears: number[]; isDiirsp: boolean;
  reasonableCauseNarrative: string | null;
  llcName: string | null; llcEin: string | null; llcAddress: string | null;
  llcCity: string | null; llcState: string | null; llcZip: string | null;
  llcCountry: string; llcDateIncorporated: Date | null;
  llcBusinessActivity: string | null; llcBusinessCode: string | null;
  ownerName: string | null; ownerAddress: string | null;
  ownerCountryCitizenship: string | null; ownerCountryTaxResidence: string | null;
  ownerCountryBusiness: string | null; ownerFtin: string | null;
  ownerItin: string | null; ownerReferenceId: string | null;
  yearData: Array<{ taxYear: number; totalAssetsYearEnd: { toString(): string }; contributions: { toString(): string }; distributions: { toString(): string }; otherTransactionsNote: string | null; reportableTransactions: unknown }>;
}): FilingSnapshot {
  return {
    id: filing.id,
    tier: filing.tier,
    taxYears: filing.taxYears,
    isDiirsp: filing.isDiirsp,
    reasonableCauseNarrative: filing.reasonableCauseNarrative,
    llcName: filing.llcName, llcEin: filing.llcEin, llcAddress: filing.llcAddress,
    llcCity: filing.llcCity, llcState: filing.llcState, llcZip: filing.llcZip,
    llcCountry: filing.llcCountry,
    llcDateIncorporated: filing.llcDateIncorporated?.toISOString().split("T")[0] ?? null,
    llcBusinessActivity: filing.llcBusinessActivity, llcBusinessCode: filing.llcBusinessCode,
    ownerName: filing.ownerName, ownerAddress: filing.ownerAddress,
    ownerCountryCitizenship: filing.ownerCountryCitizenship,
    ownerCountryTaxResidence: filing.ownerCountryTaxResidence,
    ownerCountryBusiness: filing.ownerCountryBusiness,
    ownerFtin: filing.ownerFtin, ownerItin: filing.ownerItin, ownerReferenceId: filing.ownerReferenceId,
    yearData: filing.yearData.map((y) => ({
      taxYear: y.taxYear,
      totalAssetsYearEnd: y.totalAssetsYearEnd.toString(),
      contributions: y.contributions.toString(),
      distributions: y.distributions.toString(),
      otherTransactionsNote: y.otherTransactionsNote,
      reportableTransactions: Array.isArray(y.reportableTransactions) ? y.reportableTransactions : [],
    })),
  };
}
