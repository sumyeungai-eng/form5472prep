"use client";

import { useRef, useState, type ReactNode } from "react";
import { Upload, FileText, X, Sparkles, AlertTriangle, ArrowUp, ArrowDown, Plus, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import type { CategorizedTransaction, Category } from "@/lib/bank/categorize";
import { formatUsd } from "@/lib/utils";
import {
  buildYearPayload,
  categoryTotals,
  deriveInitialAnswer,
  EMPTY_ANSWER_MESSAGE,
  extractSimpleLoans,
  isReportableCategory,
  usdToCents,
  yesAnswerErrors,
  yesErrorMessages,
  type LoanDirection,
  type LoanDraft,
  type OwnerPaidCostCategory,
  type OwnerPaidCostRow,
  type YesNo,
  type ZeroConfirmations,
} from "./transactionsAnswers";
// PlaidConnectButton import temporarily removed while the bank-connect
// button is hidden on the transactions page. Restore alongside the JSX
// when re-enabling.

type ManualOnlyCategory = "loan_from_owner" | "loan_to_owner";
type WizardCategory = Category | ManualOnlyCategory;
type WizardTransaction = Omit<CategorizedTransaction, "category"> & { category: WizardCategory };

const CATEGORY_LABELS: Record<WizardCategory, string> = {
  contribution: "Contribution (Part V)",
  distribution: "Distribution (Part V)",
  loan_from_owner: "Loan from you to LLC (Part V)",
  loan_to_owner: "Loan from LLC to you (Part V)",
  revenue: "Revenue",
  vendor_expense: "Vendor expense",
  card_reimbursement: "Card reimbursement",
  internal_transfer: "Internal transfer",
  unknown: "Unknown",
};

const OWNER_PAID_COST_LABELS: Record<OwnerPaidCostCategory, string> = {
  state_filing_fee: "State filing fee",
  registered_agent: "Registered agent",
  formation_or_ein_service: "Formation or EIN service",
  software_subscriptions: "Software or subscriptions",
  initial_bank_funding: "Initial bank funding",
  other: "Other",
};

const LOAN_FIELDS: Array<{ direction: LoanDirection; label: string }> = [
  { direction: "loan_from_owner", label: "You lent the LLC" },
  { direction: "loan_to_owner", label: "The LLC lent you" },
];

type Panel = "loans" | "other" | "upload";

type YearState = {
  taxYear: number;
  totalAssetsYearEnd: number;
  // Answer to "Did any money move between you and the LLC?". null = not yet
  // answered (blocks Continue).
  moneyMoved: YesNo;
  // Detailed rows: bank-statement uploads, manual/pasted rows, or rows saved
  // earlier. Loans entered through the loan question live in `loans` instead.
  transactions: WizardTransaction[];
  // Typed totals, used per category only when there are no detailed rows of
  // that category (the generator ignores the bare total otherwise).
  manualContributions?: number;
  manualDistributions?: number;
  loans: Record<LoanDirection, LoanDraft>;
  uploadWarnings: string[];
  uploadedFiles: { id: string; name: string; type: "csv" | "excel"; addedTxCount: number }[];
  // Plaid connections completed this session — surfaces a "Connected to X"
  // chip below the dropzone. Persistence lives in the PlaidConnection table.
  plaidConnections: { institutionName: string | null; addedTxCount: number }[];
  // Tracks whether the year-end total was auto-derived from the uploaded
  // statements (so we can show a "auto-filled" hint without losing the flag
  // when the user clears and retypes).
  totalAssetsAutoFilled?: boolean;
  // Free-text disclosure of other related-party transactions (sales, services,
  // rent, royalties, etc.) — flows into the Part V supporting statement.
  otherTransactionsNote: string;
  nonCashTransfers: NonCashTransferDraft[];
  // Legacy "costs paid personally" rows from earlier saves. Read-only here
  // (remove only); new costs go into "Money you put in".
  ownerPaidCosts: OwnerPaidCostRow[];
};

type NonCashTransferDraft = {
  date: string;
  direction: "in" | "out";
  description: string;
  fairMarketValueUsd: string;
  valuationMethod: string;
  alsoInPartV: boolean;
};

const MAX_FILES_PER_YEAR = 13;

function normalizeNonCashTransfers(value: unknown): NonCashTransferDraft[] {
  if (!Array.isArray(value)) return [];
  return value.map((row) => {
    const item = row as Record<string, unknown>;
    const cents = typeof item.fairMarketValueCents === "number" ? item.fairMarketValueCents : 0;
    return {
      date: typeof item.date === "string" ? item.date : "",
      direction: item.direction === "out" ? "out" : "in",
      description: typeof item.description === "string" ? item.description : "",
      fairMarketValueUsd: cents > 0 ? (cents / 100).toFixed(2) : "",
      valuationMethod: typeof item.valuationMethod === "string" ? item.valuationMethod : "",
      alsoInPartV: item.alsoInPartV === true,
    };
  });
}

function normalizeOwnerPaidCosts(value: unknown): OwnerPaidCostRow[] {
  if (!Array.isArray(value)) return [];
  return value.map((row) => {
    const item = row as Record<string, unknown>;
    const category = Object.prototype.hasOwnProperty.call(OWNER_PAID_COST_LABELS, item.category as string)
      ? (item.category as OwnerPaidCostCategory)
      : "state_filing_fee";
    const cents = typeof item.amountCents === "number" ? item.amountCents : 0;
    const note = typeof item.note === "string" ? item.note.trim() : "";
    return {
      category,
      date: typeof item.date === "string" ? item.date : "",
      amountCents: Math.max(0, Math.round(cents)),
      ...(note ? { note } : {}),
    };
  });
}

function normalizeReportableTransactions(value: unknown): WizardTransaction[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row): WizardTransaction[] => {
    if (!row || typeof row !== "object") return [];
    const item = row as Record<string, unknown>;
    if (
      typeof item.date !== "string" ||
      typeof item.description !== "string" ||
      typeof item.amountCents !== "number" ||
      !Number.isFinite(item.amountCents) ||
      typeof item.category !== "string"
    ) {
      return [];
    }
    if (!isReportableCategory(item.category)) return [];
    return [{
      date: item.date,
      description: item.description,
      counterparty: typeof item.counterparty === "string" ? item.counterparty : "",
      amountCents: item.amountCents,
      category: item.category as WizardCategory,
      rule: "Saved transaction",
    }];
  });
}

function panelKey(taxYear: number, panel: Panel) {
  return `${taxYear}:${panel}`;
}

const RADIO_LABEL = "flex items-start gap-2 rounded-md border border-slate-300 p-3 text-sm";
const RADIO_INPUT = "mt-0.5 h-4 w-4 shrink-0 accent-accent";

export function TransactionsReview({
  filingId,
  // ownerName and plaidEnabled are still passed in by the wizard so the
  // call-site signature doesn't have to change while the Plaid UI is
  // hidden. Both go back into the JSX when we re-enable the bank-connect
  // button — see the matching commented block below the UploadDropzone.
  ownerName: _ownerName,
  plaidEnabled: _plaidEnabled = false,
  formationYear,
  isFinalReturn = false,
  initialYears,
  initialHasUsSourceIncome,
  initialUsTaxWithheld,
  onSubmit,
  onBack,
  saving,
}: {
  filingId: string;
  ownerName: string | null;
  plaidEnabled?: boolean;
  formationYear: number | null;
  // True when this package is the LLC's FINAL (short-year) return. Copy-only:
  // a closing LLC almost always pays its remaining cash out to the owner, and
  // customers don't recognise that wind-up transfer as a Part V distribution.
  // Optional so existing call sites keep compiling; absent behaves as false.
  isFinalReturn?: boolean;
  initialYears: {
    taxYear: number;
    totalAssetsYearEnd: number;
    contributions: number;
    distributions: number;
    otherTransactionsNote?: string;
    noReportableTransactions?: boolean;
    reportableTransactions?: unknown;
    nonCashTransfers?: unknown;
    ownerPaidCosts?: unknown;
    // Only read to pre-answer the money question; confirmations are derived on save.
    zeroConfirmations?: unknown;
  }[];
  initialHasUsSourceIncome: boolean | null;
  initialUsTaxWithheld: boolean | null;
  onSubmit: (years: {
    taxYear: number;
    totalAssetsYearEnd: number;
    contributions: number;
    distributions: number;
    reportableTransactions: WizardTransaction[];
    otherTransactionsNote: string;
    noReportableTransactions: boolean;
    replaceReportableTransactions: boolean;
    ownerPaidCosts: {
      category: OwnerPaidCostCategory;
      date: string;
      amountCents: number;
      note?: string;
    }[];
    zeroConfirmations: ZeroConfirmations;
    nonCashTransfers: {
      date: string;
      direction: "in" | "out";
      description: string;
      fairMarketValueCents: number;
      valuationMethod: string;
      alsoInPartV: boolean;
    }[];
  }[], incomeAnswers: { hasUsSourceIncome: boolean | null; usTaxWithheld: boolean | null }) => Promise<void>;
  onBack: () => void;
  saving: boolean;
}) {
  const [years, setYears] = useState<YearState[]>(() =>
    initialYears.map((y) => {
      const savedRows = normalizeReportableTransactions(y.reportableTransactions);
      const ownerPaidCosts = normalizeOwnerPaidCosts(y.ownerPaidCosts);
      const { rows, loans } = extractSimpleLoans(savedRows);
      return {
        taxYear: y.taxYear,
        totalAssetsYearEnd: y.totalAssetsYearEnd,
        moneyMoved: deriveInitialAnswer({
          noReportableTransactions: y.noReportableTransactions,
          contributions: y.contributions,
          distributions: y.distributions,
          reportableRowCount: savedRows.length,
          ownerPaidCostCount: ownerPaidCosts.length,
          otherTransactionsNote: y.otherTransactionsNote,
          zeroConfirmations: y.zeroConfirmations,
        }),
        transactions: rows,
        manualContributions: y.contributions || undefined,
        manualDistributions: y.distributions || undefined,
        loans,
        uploadWarnings: [],
        uploadedFiles: [],
        plaidConnections: [],
        totalAssetsAutoFilled: false,
        otherTransactionsNote: y.otherTransactionsNote ?? "",
        nonCashTransfers: normalizeNonCashTransfers(y.nonCashTransfers),
        ownerPaidCosts,
      };
    }),
  );
  const [hasUsSourceIncome, setHasUsSourceIncome] = useState<boolean | null>(
    initialHasUsSourceIncome,
  );
  const [usTaxWithheld, setUsTaxWithheld] = useState<boolean | null>(
    initialUsTaxWithheld,
  );
  // Which collapsible sections are open, keyed by panelKey(). Seeded once from
  // what's already entered so saved answers are visible, then user-controlled
  // (so clearing a field doesn't snap its section shut).
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>(() => {
    const open: Record<string, boolean> = {};
    for (const y of years) {
      if (y.loans.loan_from_owner.amountUsd || y.loans.loan_to_owner.amountUsd) {
        open[panelKey(y.taxYear, "loans")] = true;
      }
      if (y.otherTransactionsNote.trim()) open[panelKey(y.taxYear, "other")] = true;
      if (y.transactions.length > 0) open[panelKey(y.taxYear, "upload")] = true;
    }
    return open;
  });
  const [uploading, setUploading] = useState<number | null>(null);

  // Draft state for the inline "add transaction manually" form, keyed by year.
  // null means the form is hidden for that year.
  type Draft = { description: string; amountUsd: string; category: WizardCategory };
  const [drafts, setDrafts] = useState<Record<number, Draft | null>>({});
  // Bulk-paste textarea state, keyed by year. null = hidden.
  const [bulkPaste, setBulkPaste] = useState<Record<number, string | null>>({});
  // Refs to the description input per year — so we can auto-focus after each
  // commit for rapid multi-entry.
  const descRefs = useRef<Record<number, HTMLInputElement | null>>({});

  function isPanelOpen(taxYear: number, panel: Panel) {
    return openPanels[panelKey(taxYear, panel)] === true;
  }
  function setPanelOpen(taxYear: number, panel: Panel, open: boolean) {
    setOpenPanels((p) => ({ ...p, [panelKey(taxYear, panel)]: open }));
  }

  function updateYear(taxYear: number, patch: Partial<YearState>) {
    setYears((all) => all.map((y) => (y.taxYear === taxYear ? { ...y, ...patch } : y)));
  }

  function setLoan(taxYear: number, direction: LoanDirection, patch: Partial<LoanDraft>) {
    setYears((all) =>
      all.map((y) =>
        y.taxYear === taxYear
          ? { ...y, loans: { ...y.loans, [direction]: { ...y.loans[direction], ...patch } } }
          : y,
      ),
    );
  }

  function startDraft(taxYear: number) {
    setDrafts((d) => ({
      ...d,
      [taxYear]: { description: "", amountUsd: "", category: "contribution" },
    }));
    // Focus the description input after the form mounts.
    setTimeout(() => descRefs.current[taxYear]?.focus(), 0);
  }
  function cancelDraft(taxYear: number) {
    setDrafts((d) => ({ ...d, [taxYear]: null }));
  }
  function updateDraft(taxYear: number, patch: Partial<Draft>) {
    setDrafts((d) => ({
      ...d,
      [taxYear]: d[taxYear] ? { ...d[taxYear]!, ...patch } : d[taxYear],
    }));
  }
  function commitDraft(taxYear: number) {
    const draft = drafts[taxYear];
    if (!draft) return;
    const desc = draft.description.trim();
    const amount = parseFloat(draft.amountUsd);
    if (!desc || !Number.isFinite(amount) || amount === 0) return;
    appendManualTx(taxYear, desc, amount, draft.category);
    // Reset to blank but keep the form open and refocus description for fast
    // rapid-fire entry: type → Tab → type amount → Enter → next row.
    setDrafts((d) => ({
      ...d,
      [taxYear]: { description: "", amountUsd: "", category: draft.category },
    }));
    setTimeout(() => descRefs.current[taxYear]?.focus(), 0);
  }

  // Shared helper used by both single-add and bulk-paste.
  function appendManualTx(
    taxYear: number,
    description: string,
    amount: number,
    category: WizardCategory,
  ) {
    const cents = Math.round(Math.abs(amount) * 100);
    const signedCents =
      category === "distribution" || category === "loan_to_owner" ? -cents : cents;
    // Default the transaction date to the LAST day of the tax year being
    // filed (not today). Manual entries without a specific date should fall
    // within the period the form covers — otherwise the AI compliance check
    // (correctly) flags a tax-year-vs-date mismatch.
    const defaultDate = `${taxYear}-12-31`;
    const newTx: WizardTransaction = {
      date: defaultDate,
      description,
      counterparty: "",
      amountCents: signedCents,
      category,
      rule: "Manually entered",
    };
    setYears((all) =>
      all.map((y) =>
        y.taxYear === taxYear ? { ...y, transactions: [...y.transactions, newTx] } : y,
      ),
    );
  }

  // Parse pasted spreadsheet rows. Accepts tab- or comma-separated, with up to
  // 3 columns: description, amount, optional type ("contribution"/"distribution"
  // or any text containing "dist"/"out" → distribution). One row per line.
  // Negative amounts auto-classify as distributions even if no type column.
  function commitBulkPaste(taxYear: number) {
    const raw = bulkPaste[taxYear];
    if (!raw) return;
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let added = 0;
    for (const line of lines) {
      const parts = line.split(/\t|,/).map((p) => p.trim());
      if (parts.length < 2) continue;
      const desc = parts[0];
      // Strip currency symbols, thousands separators, and parentheses (which
      // some accounting exports use for negatives).
      const rawAmount = parts[1].replace(/[$,\s]/g, "");
      const isParenNeg = /^\(.+\)$/.test(rawAmount);
      const numStr = isParenNeg ? rawAmount.slice(1, -1) : rawAmount;
      const num = parseFloat(numStr);
      if (!desc || !Number.isFinite(num) || num === 0) continue;
      const signedNum = isParenNeg ? -Math.abs(num) : num;
      // Determine category: explicit 3rd column wins; else infer from sign.
      let category: WizardCategory = "contribution";
      const typeHint = (parts[2] ?? "").toLowerCase();
      if (typeHint.includes("loan") && (typeHint.includes("to owner") || typeHint.includes("from llc"))) {
        category = "loan_to_owner";
      } else if (typeHint.includes("loan")) {
        category = "loan_from_owner";
      } else if (typeHint.includes("dist") || typeHint.includes("out")) {
        category = "distribution";
      } else if (typeHint.includes("contrib") || typeHint.includes("in")) {
        category = "contribution";
      } else {
        category = signedNum < 0 ? "distribution" : "contribution";
      }
      appendManualTx(taxYear, desc, signedNum, category);
      added++;
    }
    if (added > 0) {
      setBulkPaste((b) => ({ ...b, [taxYear]: null }));
    } else {
      alert("Couldn't parse any rows. Use one transaction per line: description, amount [, contribution|distribution]");
    }
  }

  async function uploadFiles(taxYear: number, files: File[]) {
    const year = years.find((y) => y.taxYear === taxYear);
    if (!year) return;
    const remaining = MAX_FILES_PER_YEAR - year.uploadedFiles.length;
    if (remaining <= 0) {
      alert(`You've already uploaded ${MAX_FILES_PER_YEAR} files for ${taxYear}.`);
      return;
    }
    const toUpload = files.slice(0, remaining);
    if (toUpload.length < files.length) {
      alert(
        `Only the first ${remaining} files were accepted (limit: ${MAX_FILES_PER_YEAR}/year).`,
      );
    }

    setUploading(taxYear);
    try {
      // Upload sequentially — Prisma + pdf-parse won't love a burst of parallel writes.
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("taxYear", String(taxYear));
        const res = await fetch(`/api/filings/${filingId}/statements`, {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          const errorText = await res.text();
          alert(`Upload failed for ${file.name}: ${errorText}`);
          continue;
        }
        const data: {
          statementId: string;
          transactions: CategorizedTransaction[];
          warnings: string[];
          fileName: string;
          fileType: "csv" | "excel";
        } = await res.json();
        // Tag every transaction with the BankStatement id it came from so we
        // can remove just this file's rows if the user deletes it.
        const tagged = data.transactions.map((t) => ({
          ...t,
          bankStatementId: data.statementId,
        }));
        setYears((all) =>
          all.map((y) => {
            if (y.taxYear !== taxYear) return y;
            const nextTxs = [...y.transactions, ...tagged];
            const netCashUsd =
              nextTxs.reduce((sum, t) => sum + t.amountCents, 0) / 100;
            const shouldAutoFill = y.totalAssetsYearEnd === 0 && netCashUsd > 0;
            return {
              ...y,
              transactions: nextTxs,
              uploadWarnings: [...y.uploadWarnings, ...data.warnings],
              uploadedFiles: [
                ...y.uploadedFiles,
                {
                  id: data.statementId,
                  name: data.fileName,
                  type: data.fileType,
                  addedTxCount: tagged.length,
                },
              ],
              totalAssetsYearEnd: shouldAutoFill
                ? Math.round(netCashUsd * 100) / 100
                : y.totalAssetsYearEnd,
              totalAssetsAutoFilled: shouldAutoFill || y.totalAssetsAutoFilled,
            };
          }),
        );
      }
    } finally {
      setUploading(null);
    }
  }

  function setCategory(taxYear: number, idx: number, category: WizardCategory) {
    setYears((all) =>
      all.map((y) =>
        y.taxYear === taxYear
          ? {
              ...y,
              transactions: y.transactions.map((t, i) =>
                i === idx ? { ...t, category, rule: "Manual override" } : t,
              ),
            }
          : y,
      ),
    );
  }

  function removeTx(taxYear: number, idx: number) {
    setYears((all) =>
      all.map((y) =>
        y.taxYear === taxYear
          ? { ...y, transactions: y.transactions.filter((_, i) => i !== idx) }
          : y,
      ),
    );
  }

  // Plaid Link returned with a set of transactions for the year — fold them
  // into our year state the same way uploaded files do. Unused while the
  // Plaid button is hidden; kept here so re-enabling is one-edit only.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function _onPlaidTransactions(
    taxYear: number,
    institutionName: string | null,
    fresh: CategorizedTransaction[],
  ) {
    setYears((all) =>
      all.map((y) => {
        if (y.taxYear !== taxYear) return y;
        const nextTxs = [...y.transactions, ...fresh];
        const netCashUsd = nextTxs.reduce((s, t) => s + t.amountCents, 0) / 100;
        const shouldAutoFill = y.totalAssetsYearEnd === 0 && netCashUsd > 0;
        return {
          ...y,
          transactions: nextTxs,
          plaidConnections: [
            ...y.plaidConnections,
            { institutionName, addedTxCount: fresh.length },
          ],
          totalAssetsYearEnd: shouldAutoFill
            ? Math.round(netCashUsd * 100) / 100
            : y.totalAssetsYearEnd,
          totalAssetsAutoFilled: shouldAutoFill || y.totalAssetsAutoFilled,
        };
      }),
    );
  }

  async function removeFile(taxYear: number, statementId: string) {
    const year = years.find((y) => y.taxYear === taxYear);
    const file = year?.uploadedFiles.find((f) => f.id === statementId);
    if (!file) return;
    if (!confirm(`Remove "${file.name}" and its ${file.addedTxCount} transaction(s)?`)) return;

    const res = await fetch(`/api/filings/${filingId}/statements/${statementId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert(`Couldn't remove that file: ${await res.text()}`);
      return;
    }

    setYears((all) =>
      all.map((y) =>
        y.taxYear === taxYear
          ? {
              ...y,
              uploadedFiles: y.uploadedFiles.filter((f) => f.id !== statementId),
              transactions: y.transactions.filter(
                (t) => t.bankStatementId !== statementId,
              ),
            }
          : y,
      ),
    );
  }

  function bulkReclassify(taxYear: number, from: WizardCategory, to: WizardCategory) {
    setYears((all) =>
      all.map((y) =>
        y.taxYear === taxYear
          ? {
              ...y,
              transactions: y.transactions.map((t) =>
                t.category === from
                  ? { ...t, category: to, rule: `Bulk reclassified ${from} → ${to}` }
                  : t,
              ),
            }
          : y,
      ),
    );
  }

  function setManual(taxYear: number, field: "manualContributions" | "manualDistributions" | "totalAssetsYearEnd", v: number) {
    setYears((all) =>
      all.map((y) => {
        if (y.taxYear !== taxYear) return y;
        const next = { ...y, [field]: v };
        // Manual edit of the year-end total drops the "auto-filled" badge.
        if (field === "totalAssetsYearEnd") next.totalAssetsAutoFilled = false;
        return next;
      }),
    );
  }

  function removeOwnerPaidCost(taxYear: number, index: number) {
    const year = years.find((y) => y.taxYear === taxYear);
    if (!year) return;
    updateYear(taxYear, { ownerPaidCosts: year.ownerPaidCosts.filter((_, i) => i !== index) });
  }

  function openStatementPanel(taxYear: number) {
    setPanelOpen(taxYear, "upload", true);
    setTimeout(() => {
      document.getElementById(`statement-${taxYear}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  const yearIssues = years
    .map((y) => {
      if (y.moneyMoved === null) {
        return { taxYear: y.taxYear, messages: ["Answer whether any money moved between you and the LLC."] };
      }
      if (y.moneyMoved === "no") return { taxYear: y.taxYear, messages: [] as string[] };
      return { taxYear: y.taxYear, messages: yesErrorMessages(yesAnswerErrors(y)) };
    })
    .filter((row) => row.messages.length > 0);
  const transactionsIncomplete = yearIssues.length > 0;

  async function handleSubmit() {
    if (transactionsIncomplete) return;
    const payload = years.map((y) =>
      buildYearPayload(y.moneyMoved === "no" ? "no" : "yes", {
        ...y,
        nonCashTransfers: y.nonCashTransfers.map((row) => ({
          date: row.date,
          direction: row.direction,
          description: row.description.trim(),
          fairMarketValueCents: usdToCents(row.fairMarketValueUsd),
          valuationMethod: row.valuationMethod.trim(),
          alsoInPartV: row.alsoInPartV,
        })),
      }),
    );
    await onSubmit(payload, {
      hasUsSourceIncome,
      usTaxWithheld: hasUsSourceIncome ? usTaxWithheld : null,
    });
  }

  function setNonCashTransfers(taxYear: number, rows: NonCashTransferDraft[]) {
    updateYear(taxYear, { nonCashTransfers: rows });
  }

  function addNonCashTransfer(taxYear: number) {
    const row: NonCashTransferDraft = {
      date: `${taxYear}-12-31`,
      direction: "in",
      description: "",
      fairMarketValueUsd: "",
      valuationMethod: "",
      alsoInPartV: false,
    };
    const year = years.find((y) => y.taxYear === taxYear);
    setNonCashTransfers(taxYear, [...(year?.nonCashTransfers ?? []), row]);
  }

  function updateNonCashTransfer(
    taxYear: number,
    index: number,
    patch: Partial<NonCashTransferDraft>,
  ) {
    const year = years.find((y) => y.taxYear === taxYear);
    if (!year) return;
    setNonCashTransfers(
      taxYear,
      year.nonCashTransfers.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function removeNonCashTransfer(taxYear: number, index: number) {
    const year = years.find((y) => y.taxYear === taxYear);
    if (!year) return;
    setNonCashTransfers(taxYear, year.nonCashTransfers.filter((_, i) => i !== index));
  }

  // Empty state when the user lands here without picking tax years first.
  // The original /edit flow gated step navigation linearly so this branch
  // never fired; the v3 sidebar lets users jump to any step, so we explain
  // what to do instead of rendering a blank page.
  if (years.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Transactions per year</h2>
          <p className="text-sm text-slate-500 mt-1">
            Pick at least one tax year first — this step shows a card per year so you can enter
            the totals.
          </p>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          You haven&apos;t selected any tax years yet. Head back to the <strong>Tax years</strong>{" "}
          step to pick the year(s) you&apos;re filing for, then come back here.
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Go to Tax years
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Transactions per year</h2>
        <p className="text-sm text-slate-500 mt-1">
          All amounts are in US dollars. If your records are in another currency, convert using
          the{" "}
          <a
            href="https://www.irs.gov/individuals/international-taxpayers/yearly-average-currency-exchange-rates"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            IRS yearly average rate
          </a>
          .
        </p>
      </div>

      <div className="space-y-6">
        {years.map((y) => {
          const totals = categoryTotals(y);
          const errors = y.moneyMoved === "yes" ? yesAnswerErrors(y) : null;
          const isFormationYear = formationYear !== null && y.taxYear === formationYear;
          const hasLegacyCosts = y.ownerPaidCosts.length > 0;
          const loansOpen = isPanelOpen(y.taxYear, "loans");
          const otherOpen = isPanelOpen(y.taxYear, "other");
          const uploadOpen = isPanelOpen(y.taxYear, "upload");
          return (
            <div key={y.taxYear} className="border border-slate-200 rounded-md bg-white p-4 sm:p-5">
              <p className="font-medium mb-4">Tax year {y.taxYear}</p>

              {/* 1. Money between the owner and the LLC (Part V). */}
              <fieldset>
                <legend className="text-sm font-medium text-slate-900">
                  Did any money move between you and the LLC in {y.taxYear}?
                </legend>
                <p className="mt-1 text-xs text-slate-500">
                  {isFormationYear
                    ? `This includes the state filing fee, registered agent or bank deposit you paid yourself when forming the LLC in ${y.taxYear}.`
                    : "Includes paying the LLC's state filing fee or registered agent yourself."}
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className={RADIO_LABEL}>
                    <input
                      type="radio"
                      name={`money-moved-${y.taxYear}`}
                      checked={y.moneyMoved === "yes"}
                      onChange={() => updateYear(y.taxYear, { moneyMoved: "yes" })}
                      className={RADIO_INPUT}
                    />
                    <span>Yes</span>
                  </label>
                  <label className={RADIO_LABEL}>
                    <input
                      type="radio"
                      name={`money-moved-${y.taxYear}`}
                      checked={y.moneyMoved === "no"}
                      onChange={() => updateYear(y.taxYear, { moneyMoved: "no" })}
                      className={RADIO_INPUT}
                    />
                    <span>No</span>
                  </label>
                </div>
              </fieldset>

              {y.moneyMoved === "yes" && errors && (
                <div className="mt-4 space-y-4 rounded-md border border-slate-200 bg-slate-50 p-3 sm:p-4">
                  {hasLegacyCosts && (
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Costs you already told us you paid personally
                      </p>
                      <ul className="mt-2 divide-y divide-slate-100 rounded-md border border-slate-200 bg-white">
                        {y.ownerPaidCosts.map((row, index) => (
                          <li
                            key={index}
                            className="flex items-start justify-between gap-3 px-3 py-2 text-sm"
                          >
                            <span className="min-w-0">
                              <span className="block text-slate-900">
                                {OWNER_PAID_COST_LABELS[row.category]}
                                {row.note ? ` — ${row.note}` : ""}
                              </span>
                              <span className="block text-xs text-slate-500">
                                {row.date} · {formatUsd(row.amountCents)}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => removeOwnerPaidCost(y.taxYear, index)}
                              className="flex-none text-sm text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {totals.contributionRowCount > 0 ? (
                      <StatementTotal
                        label={
                          hasLegacyCosts
                            ? "Other money you put in (not listed above)"
                            : "Money you put in (including LLC costs you paid yourself)"
                        }
                        amount={totals.contributions}
                        count={totals.contributionRowCount}
                        onEdit={() => openStatementPanel(y.taxYear)}
                      />
                    ) : (
                      <Field
                        label={
                          hasLegacyCosts
                            ? "Other money you put in (not listed above)"
                            : "Money you put in (including LLC costs you paid yourself)"
                        }
                        error={errors.contributions ?? undefined}
                      >
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={y.manualContributions ?? ""}
                          onChange={(e) =>
                            setManual(y.taxYear, "manualContributions", Number(e.target.value) || 0)
                          }
                        />
                      </Field>
                    )}
                    {totals.distributionRowCount > 0 ? (
                      <StatementTotal
                        label="Money you took out"
                        amount={totals.distributions}
                        count={totals.distributionRowCount}
                        onEdit={() => openStatementPanel(y.taxYear)}
                      />
                    ) : (
                      <Field
                        label="Money you took out"
                        // On a final return the biggest distribution of the year is
                        // usually the closing sweep of the remaining bank balance
                        // back to the owner — which customers think of as "closing
                        // the account", not as money taken out. Say so.
                        hint={
                          isFinalReturn
                            ? "Including anything that came back to you when the LLC closed."
                            : undefined
                        }
                        error={errors.distributions ?? undefined}
                      >
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={y.manualDistributions ?? ""}
                          onChange={(e) =>
                            setManual(y.taxYear, "manualDistributions", Number(e.target.value) || 0)
                          }
                        />
                      </Field>
                    )}
                  </div>

                  {/* Loans — stored as loan_from_owner / loan_to_owner rows. */}
                  <div>
                    <PanelToggle
                      open={loansOpen}
                      onToggle={() => setPanelOpen(y.taxYear, "loans", !loansOpen)}
                    >
                      Any loans between you and the LLC?
                    </PanelToggle>
                    {loansOpen && (
                      <div className="mt-3 space-y-4">
                        {LOAN_FIELDS.map(({ direction, label }) => {
                          const loan = y.loans[direction];
                          const statementRows = y.transactions.filter(
                            (tx) => tx.category === direction,
                          );
                          const error = errors.loans[direction];
                          return (
                            <div key={direction}>
                              <p className="text-sm font-medium text-slate-700">{label}</p>
                              {statementRows.length > 0 && (
                                <p className="mt-1 text-xs text-slate-500">
                                  Your statement already includes{" "}
                                  {formatUsd(
                                    statementRows.reduce((s, tx) => s + Math.abs(tx.amountCents), 0),
                                  )}{" "}
                                  from {statementRows.length}{" "}
                                  {statementRows.length === 1 ? "transaction" : "transactions"} — only
                                  enter a loan here if it isn&apos;t listed there.
                                </p>
                              )}
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label className="block text-xs font-medium text-slate-600">
                                  Amount (USD)
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={loan.amountUsd}
                                    onChange={(e) =>
                                      setLoan(y.taxYear, direction, { amountUsd: e.target.value })
                                    }
                                    aria-invalid={error ? true : undefined}
                                    className="mt-1"
                                  />
                                </label>
                                <label className="block text-xs font-medium text-slate-600">
                                  Date
                                  <Input
                                    type="date"
                                    min={`${y.taxYear}-01-01`}
                                    max={`${y.taxYear}-12-31`}
                                    value={loan.date}
                                    onChange={(e) =>
                                      setLoan(y.taxYear, direction, { date: e.target.value })
                                    }
                                    aria-invalid={error ? true : undefined}
                                    className="mt-1"
                                  />
                                </label>
                              </div>
                              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Other related-party transactions → otherTransactionsNote. */}
                  <div>
                    <PanelToggle
                      open={otherOpen}
                      onToggle={() => setPanelOpen(y.taxYear, "other", !otherOpen)}
                    >
                      Anything else between you and the LLC (sales, services, rent, royalties)?
                    </PanelToggle>
                    {otherOpen && (
                      <div className="mt-3">
                        <label
                          htmlFor={`other-tx-${y.taxYear}`}
                          className="block text-xs text-slate-500"
                        >
                          Describe each one with its amount and date.
                        </label>
                        <textarea
                          id={`other-tx-${y.taxYear}`}
                          rows={3}
                          value={y.otherTransactionsNote}
                          onChange={(e) =>
                            updateYear(y.taxYear, { otherTransactionsNote: e.target.value })
                          }
                          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                        />
                      </div>
                    )}
                  </div>

                  {/* Bank-statement upload + manual/pasted rows. */}
                  <div id={`statement-${y.taxYear}`}>
                    <PanelToggle
                      open={uploadOpen}
                      onToggle={() => setPanelOpen(y.taxYear, "upload", !uploadOpen)}
                    >
                      Upload a bank statement instead
                    </PanelToggle>
                    {uploadOpen && (
                      <div className="mt-3">
                        <p className="mb-3 text-xs text-slate-500">
                          We sort the transactions for you. Only rows marked Contribution,
                          Distribution or Loan are reported.
                        </p>
                        <UploadDropzone
                          disabled={uploading === y.taxYear || y.uploadedFiles.length >= MAX_FILES_PER_YEAR}
                          uploading={uploading === y.taxYear}
                          uploadedCount={y.uploadedFiles.length}
                          limit={MAX_FILES_PER_YEAR}
                          onFiles={(files) => uploadFiles(y.taxYear, files)}
                        />

                        {/* Plaid bank-connect button + "or" divider + connected-bank
                            list are hidden until further notice. All backend/import
                            code, the PlaidConnectButton component, the
                            /api/plaid/* routes, and the plaidConnections state stay
                            intact so this is a one-block-restore if we re-enable it.
                            See git history for the original JSX. */}

                        <div className="mt-3">
                          {drafts[y.taxYear] ? (
                            <div className="border border-slate-200 rounded-md p-3 bg-white">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <p className="text-xs font-medium text-slate-700">
                                  Add transactions — press <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono">Enter</kbd> after amount to add and continue
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setBulkPaste((b) => ({ ...b, [y.taxYear]: "" }))}
                                  className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                                >
                                  <ClipboardPaste className="h-3 w-3" />
                                  Paste from spreadsheet
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                <div className="sm:col-span-6">
                                  <label className="text-xs text-slate-500 mb-1 block">Description</label>
                                  <Input
                                    ref={(el) => {
                                      descRefs.current[y.taxYear] = el;
                                    }}
                                    placeholder="e.g., Owner capital injection"
                                    value={drafts[y.taxYear]!.description}
                                    onChange={(e) =>
                                      updateDraft(y.taxYear, { description: e.target.value })
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        commitDraft(y.taxYear);
                                      }
                                    }}
                                  />
                                </div>
                                <div className="sm:col-span-3">
                                  <label className="text-xs text-slate-500 mb-1 block">Amount (USD)</label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={drafts[y.taxYear]!.amountUsd}
                                    onChange={(e) =>
                                      updateDraft(y.taxYear, { amountUsd: e.target.value })
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        commitDraft(y.taxYear);
                                      }
                                    }}
                                  />
                                </div>
                                <div className="sm:col-span-3">
                                  <label className="text-xs text-slate-500 mb-1 block">Type</label>
                                  <select
                                    value={drafts[y.taxYear]!.category}
                                    onChange={(e) =>
                                      updateDraft(y.taxYear, {
                                        category: e.target.value as WizardCategory,
                                      })
                                    }
                                    className="w-full text-sm border border-slate-300 rounded-md px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                                  >
                                    <option value="contribution">Contribution (you → LLC)</option>
                                    <option value="distribution">Distribution (LLC → you)</option>
                                    <option value="loan_from_owner">Loan from you to the LLC</option>
                                    <option value="loan_to_owner">Loan from the LLC to you</option>
                                  </select>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => cancelDraft(y.taxYear)}
                                  className="text-sm px-3 py-1.5 text-slate-600 hover:text-slate-900"
                                >
                                  Done
                                </button>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => commitDraft(y.taxYear)}
                                  disabled={
                                    !drafts[y.taxYear]!.description.trim() ||
                                    !parseFloat(drafts[y.taxYear]!.amountUsd)
                                  }
                                >
                                  Add to list
                                </Button>
                              </div>

                              {bulkPaste[y.taxYear] !== null && bulkPaste[y.taxYear] !== undefined && (
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                  <label className="text-xs text-slate-600 mb-1 block">
                                    Paste rows from Excel or Google Sheets — one transaction per line.
                                    Columns: <span className="font-mono">description, amount [, type]</span>.
                                    Negative amounts auto-classify as distributions.
                                  </label>
                                  <textarea
                                    value={bulkPaste[y.taxYear] ?? ""}
                                    onChange={(e) =>
                                      setBulkPaste((b) => ({ ...b, [y.taxYear]: e.target.value }))
                                    }
                                    placeholder={`Owner capital injection, 5000\nManagement fee paid out, -1200, distribution\nLoan from owner, 10000`}
                                    rows={5}
                                    className="w-full text-sm font-mono border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                                  />
                                  <div className="mt-2 flex items-center gap-2 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setBulkPaste((b) => ({ ...b, [y.taxYear]: null }))}
                                      className="text-sm px-3 py-1.5 text-slate-600 hover:text-slate-900"
                                    >
                                      Cancel
                                    </button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={() => commitBulkPaste(y.taxYear)}
                                      disabled={!(bulkPaste[y.taxYear] ?? "").trim()}
                                    >
                                      Add all rows
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <button
                                type="button"
                                onClick={() => startDraft(y.taxYear)}
                                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Add transaction manually
                              </button>
                              <span className="text-slate-300">·</span>
                              <button
                                type="button"
                                onClick={() => {
                                  startDraft(y.taxYear);
                                  setBulkPaste((b) => ({ ...b, [y.taxYear]: "" }));
                                }}
                                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                              >
                                <ClipboardPaste className="h-3.5 w-3.5" />
                                Paste from spreadsheet
                              </button>
                            </div>
                          )}
                        </div>

                        {y.uploadedFiles.length > 0 && (
                          <UploadedFilesList
                            files={y.uploadedFiles}
                            onRemove={(id) => removeFile(y.taxYear, id)}
                          />
                        )}

                        {y.uploadWarnings.length > 0 && (
                          <ul className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3 space-y-1">
                            {y.uploadWarnings.map((w, i) => (
                              <li key={i}>{w}</li>
                            ))}
                          </ul>
                        )}

                        {y.transactions.length > 0 && (
                          <div className="mt-4">
                            <CategorySummary
                              transactions={y.transactions}
                              onBulkReclassify={(from, to) =>
                                bulkReclassify(y.taxYear, from, to)
                              }
                            />
                            <p className="text-xs text-slate-500 mt-3 mb-2 flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5" />
                              Auto-categorized. Override any row you disagree with — totals update live.
                            </p>
                            <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                              <div className="overflow-x-auto max-h-96">
                                <table className="w-full text-sm">
                                  <thead className="bg-slate-50 text-left text-xs text-slate-500 sticky top-0">
                                    <tr>
                                      <th className="py-2 px-3 font-medium">Date</th>
                                      <th className="py-2 px-3 font-medium">Description</th>
                                      <th className="py-2 px-3 font-medium text-right">Amount</th>
                                      <th className="py-2 px-3 font-medium">Category</th>
                                      <th className="py-2 px-3 w-8"></th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200">
                                    {y.transactions.map((tx, i) => (
                                      <tr
                                        key={i}
                                        className={
                                          isReportableCategory(tx.category) ? "bg-accent-50/40" : ""
                                        }
                                      >
                                        <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                                          {tx.date}
                                        </td>
                                        <td className="py-2 px-3 text-slate-900 max-w-xs truncate" title={tx.description}>
                                          {tx.description}
                                        </td>
                                        <td
                                          className={`py-2 px-3 text-right font-mono whitespace-nowrap ${
                                            tx.amountCents > 0 ? "text-emerald-700" : "text-slate-700"
                                          }`}
                                        >
                                          {tx.amountCents > 0 ? "+" : ""}
                                          {formatUsd(tx.amountCents)}
                                        </td>
                                        <td className="py-2 px-3">
                                          <select
                                            value={tx.category}
                                            onChange={(e) =>
                                              setCategory(y.taxYear, i, e.target.value as WizardCategory)
                                            }
                                            className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                                          >
                                            {(Object.keys(CATEGORY_LABELS) as WizardCategory[]).map((k) => (
                                              <option key={k} value={k}>
                                                {CATEGORY_LABELS[k]}
                                              </option>
                                            ))}
                                          </select>
                                        </td>
                                        <td className="py-2 px-3">
                                          <button
                                            type="button"
                                            onClick={() => removeTx(y.taxYear, i)}
                                            className="text-slate-400 hover:text-red-600"
                                            title="Remove this row"
                                            aria-label="Remove this row"
                                          >
                                            <X className="h-3.5 w-3.5" />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {errors.empty && (
                    <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                      {EMPTY_ANSWER_MESSAGE}
                    </p>
                  )}
                </div>
              )}

              {/* 2. Total assets at year end → pro forma 1120 item D. */}
              <div className="mt-5 pt-5 border-t border-slate-100">
                <Field
                  label={`LLC's total assets at the end of ${y.taxYear}`}
                  hint={
                    y.totalAssetsAutoFilled
                      ? "Filled in from your statement. Check it matches the LLC's bank balance on the last day of the year."
                      : "Usually the LLC's bank balance on the last day of the year. Enter 0 if it had no bank account."
                  }
                  help={
                    <>
                      <p>
                        The value of everything the LLC owns on the last day of the year. Goes on{" "}
                        <strong>Form 1120 item D</strong>.
                      </p>
                      <p className="mt-2">
                        For a typical single-member LLC with one bank account, this is just the
                        year-end bank balance. Add any other assets the LLC holds at year end,
                        such as another business account, unpaid customer invoices, equipment or
                        crypto held by the LLC.
                      </p>
                      <p className="mt-2">
                        Don&apos;t include anything in your personal accounts, or debts the LLC
                        owes.
                      </p>
                    </>
                  }
                >
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="sm:max-w-xs"
                    value={y.totalAssetsYearEnd}
                    onChange={(e) =>
                      setManual(y.taxYear, "totalAssetsYearEnd", Number(e.target.value) || 0)
                    }
                  />
                </Field>
              </div>

              {/* 3. Non-cash transfers → Part VI (pre-flight A14). */}
              <div className="mt-5 pt-5 border-t border-slate-100">
                <fieldset>
                  <legend className="block text-sm font-medium text-slate-900">
                    Did you move anything other than cash into or out of the LLC in {y.taxYear},
                    such as shares, crypto or equipment?
                  </legend>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className={RADIO_LABEL}>
                      <input
                        type="radio"
                        name={`non-cash-${y.taxYear}`}
                        checked={y.nonCashTransfers.length > 0}
                        onChange={() => {
                          if (y.nonCashTransfers.length === 0) addNonCashTransfer(y.taxYear);
                        }}
                        className={RADIO_INPUT}
                      />
                      <span>Yes</span>
                    </label>
                    <label className={RADIO_LABEL}>
                      <input
                        type="radio"
                        name={`non-cash-${y.taxYear}`}
                        checked={y.nonCashTransfers.length === 0}
                        onChange={() => setNonCashTransfers(y.taxYear, [])}
                        className={RADIO_INPUT}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </fieldset>
                {y.nonCashTransfers.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {y.nonCashTransfers.map((row, index) => (
                      <div
                        key={index}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label className="block text-xs font-medium text-slate-600">
                            Date
                            <Input
                              type="date"
                              value={row.date}
                              onChange={(e) =>
                                updateNonCashTransfer(y.taxYear, index, { date: e.target.value })
                              }
                              className="mt-1"
                            />
                          </label>
                          <label className="block text-xs font-medium text-slate-600">
                            Direction
                            <select
                              value={row.direction}
                              onChange={(e) =>
                                updateNonCashTransfer(y.taxYear, index, {
                                  direction: e.target.value === "out" ? "out" : "in",
                                })
                              }
                              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                            >
                              <option value="in">Into the LLC</option>
                              <option value="out">Out of the LLC</option>
                            </select>
                          </label>
                          <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
                            Description of what was transferred
                            <Input
                              value={row.description}
                              onChange={(e) =>
                                updateNonCashTransfer(y.taxYear, index, {
                                  description: e.target.value,
                                })
                              }
                              className="mt-1"
                            />
                          </label>
                          <label className="block text-xs font-medium text-slate-600">
                            Fair market value in USD
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={row.fairMarketValueUsd}
                              onChange={(e) =>
                                updateNonCashTransfer(y.taxYear, index, {
                                  fairMarketValueUsd: e.target.value,
                                })
                              }
                              className="mt-1"
                            />
                          </label>
                          <label className="block text-xs font-medium text-slate-600">
                            How the value was worked out
                            <Input
                              value={row.valuationMethod}
                              onChange={(e) =>
                                updateNonCashTransfer(y.taxYear, index, {
                                  valuationMethod: e.target.value,
                                })
                              }
                              className="mt-1"
                            />
                          </label>
                        </div>
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <label className="flex items-start gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={row.alsoInPartV}
                              onChange={(e) =>
                                updateNonCashTransfer(y.taxYear, index, {
                                  alsoInPartV: e.target.checked,
                                })
                              }
                              className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
                            />
                            <span>I also listed this as a cash contribution above</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => removeNonCashTransfer(y.taxYear, index)}
                            className="self-start text-sm text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addNonCashTransfer(y.taxYear)}
                    >
                      Add another non-cash transfer
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Asked once per filing. */}
      <fieldset className="rounded-md border border-slate-200 bg-white p-4">
        <legend className="text-sm font-medium text-slate-900">
          Did the LLC earn any U.S.-source income, such as dividends from U.S. shares?
        </legend>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className={RADIO_LABEL}>
            <input
              type="radio"
              name="us-source-income"
              checked={hasUsSourceIncome === true}
              onChange={() => setHasUsSourceIncome(true)}
              className={RADIO_INPUT}
            />
            <span>Yes</span>
          </label>
          <label className={RADIO_LABEL}>
            <input
              type="radio"
              name="us-source-income"
              checked={hasUsSourceIncome === false}
              onChange={() => {
                setHasUsSourceIncome(false);
                setUsTaxWithheld(null);
              }}
              className={RADIO_INPUT}
            />
            <span>No</span>
          </label>
        </div>
        {hasUsSourceIncome === true && (
          <fieldset className="mt-4">
            <legend className="text-sm font-medium text-slate-900">
              Was U.S. tax withheld at source?
            </legend>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className={RADIO_LABEL}>
                <input
                  type="radio"
                  name="us-tax-withheld"
                  checked={usTaxWithheld === true}
                  onChange={() => setUsTaxWithheld(true)}
                  className={RADIO_INPUT}
                />
                <span>Yes</span>
              </label>
              <label className={RADIO_LABEL}>
                <input
                  type="radio"
                  name="us-tax-withheld"
                  checked={usTaxWithheld === false}
                  onChange={() => setUsTaxWithheld(false)}
                  className={RADIO_INPUT}
                />
                <span>No</span>
              </label>
            </div>
          </fieldset>
        )}
      </fieldset>

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex flex-col items-end gap-2">
          {transactionsIncomplete && (
            <div className="max-w-sm text-right text-xs text-amber-700">
              {yearIssues.map((row) => (
                <p key={row.taxYear}>
                  {row.taxYear}: {row.messages.join(" ")}
                </p>
              ))}
            </div>
          )}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={saving || transactionsIncomplete}
          >
            {saving ? "Saving…" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PanelToggle({
  open,
  onToggle,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="text-left text-sm font-medium text-accent hover:underline"
    >
      {open ? "− " : "+ "}
      {children}
    </button>
  );
}

// Read-only total for a category that already has detailed rows. The generator
// ignores the typed total in that case, so we don't offer a competing input.
function StatementTotal({
  label,
  amount,
  count,
  onEdit,
}: {
  label: string;
  amount: number;
  count: number;
  onEdit: () => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-1.5">{label}</p>
      <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
        <span className="font-semibold text-slate-900">{formatUsd(Math.round(amount * 100))}</span>{" "}
        <span className="text-slate-500">
          from {count} {count === 1 ? "transaction" : "transactions"} in your statement
        </span>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="mt-1 text-xs text-accent hover:underline"
      >
        Edit transactions
      </button>
    </div>
  );
}

function UploadDropzone({
  onFiles,
  uploading,
  disabled,
  uploadedCount,
  limit,
}: {
  onFiles: (files: File[]) => void;
  uploading: boolean;
  disabled: boolean;
  uploadedCount: number;
  limit: number;
}) {
  const [hover, setHover] = useState(false);
  const atLimit = uploadedCount >= limit;
  return (
    <label
      onDragOver={(e) => {
        if (atLimit || disabled) return;
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        if (atLimit || disabled) return;
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) onFiles(files);
      }}
      className={`block border border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
        hover ? "border-accent bg-accent-50" : "border-slate-300 bg-slate-50"
      } ${disabled || atLimit ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <input
        type="file"
        accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        multiple
        className="sr-only"
        disabled={disabled || atLimit}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) onFiles(files);
          e.target.value = ""; // allow re-selecting the same files later
        }}
      />
      <div className="flex flex-col items-center gap-2 text-sm">
        {uploading ? (
          <>
            <FileText className="h-6 w-6 text-accent animate-pulse" />
            <span className="text-slate-600">Parsing…</span>
          </>
        ) : atLimit ? (
          <>
            <FileText className="h-6 w-6 text-slate-400" />
            <span className="text-slate-700 font-medium">
              Limit reached — {uploadedCount} / {limit} files uploaded
            </span>
            <span className="text-xs text-slate-500">
              Remove an existing file to upload another.
            </span>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-slate-400" />
            <span className="text-slate-700 font-medium">
              Drop your bank statements here or click to browse (optional)
            </span>
            <span className="text-xs text-slate-500">
              CSV or Excel (.xlsx, .xls) · Mercury · Wise · Relay · Brex · or generic · up to{" "}
              {limit - uploadedCount} more file{limit - uploadedCount === 1 ? "" : "s"}
            </span>
          </>
        )}
      </div>
    </label>
  );
}

function UploadedFilesList({
  files,
  onRemove,
}: {
  files: { id: string; name: string; type: "csv" | "excel"; addedTxCount: number }[];
  onRemove: (id: string) => void;
}) {
  return (
    <ul className="mt-3 border border-slate-200 rounded-md divide-y divide-slate-100 bg-white">
      {files.map((f) => (
        <li
          key={f.id}
          className="flex items-center justify-between gap-3 px-3 py-2 text-xs"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className={`flex-none rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                f.type === "excel"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {f.type}
            </span>
            <span className="text-slate-700 truncate">{f.name}</span>
          </div>
          <span className="flex-none text-slate-500">
            {f.addedTxCount} {f.addedTxCount === 1 ? "transaction" : "transactions"}
          </span>
          <button
            type="button"
            onClick={() => onRemove(f.id)}
            className="flex-none text-slate-400 hover:text-red-600 rounded p-1 -mr-1"
            aria-label={`Remove ${f.name}`}
            title="Remove this file and its transactions"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

// Pill row showing how many transactions landed in each category. The Unknown
// pill turns amber and offers a one-click bulk-reclassify into Contribution or
// Distribution — the most common manual fix when the auto-categorizer can't
// match opaque counterparty codes.
function CategorySummary({
  transactions,
  onBulkReclassify,
}: {
  transactions: WizardTransaction[];
  onBulkReclassify: (from: WizardCategory, to: WizardCategory) => void;
}) {
  const counts = transactions.reduce(
    (acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<WizardCategory, number>,
  );

  const unknownCount = counts.unknown ?? 0;

  const pillTone: Record<WizardCategory, string> = {
    contribution: "bg-accent-50 text-accent border-accent/20",
    distribution: "bg-accent-50 text-accent border-accent/20",
    loan_from_owner: "bg-accent-50 text-accent border-accent/20",
    loan_to_owner: "bg-accent-50 text-accent border-accent/20",
    revenue: "bg-emerald-50 text-emerald-700 border-emerald-200",
    vendor_expense: "bg-slate-100 text-slate-700 border-slate-200",
    card_reimbursement: "bg-slate-100 text-slate-700 border-slate-200",
    internal_transfer: "bg-slate-100 text-slate-700 border-slate-200",
    unknown: "bg-amber-100 text-amber-800 border-amber-300",
  };

  // Order: reportable first, then non-reportable, then unknown last.
  const order: WizardCategory[] = [
    "contribution",
    "distribution",
    "loan_from_owner",
    "loan_to_owner",
    "revenue",
    "vendor_expense",
    "card_reimbursement",
    "internal_transfer",
    "unknown",
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {order
          .filter((cat) => counts[cat] > 0)
          .map((cat) => (
            <span
              key={cat}
              className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full border px-2.5 py-1 ${pillTone[cat]}`}
            >
              {CATEGORY_LABELS[cat]}
              <span className="font-normal opacity-70">{counts[cat]}</span>
            </span>
          ))}
      </div>

      {unknownCount > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="flex-none h-4 w-4 text-amber-600 mt-0.5" />
            <div className="flex-1 text-xs text-amber-900">
              <p className="font-medium">
                {unknownCount} {unknownCount === 1 ? "row" : "rows"} not auto-categorized
              </p>
              <p className="mt-0.5 text-amber-800">
                We couldn&apos;t tell from the bank description who these counterparties are.
                Pick a category for each row in the table below — they don&apos;t count toward
                your Form 5472 totals until you do.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-amber-800 font-medium">Bulk actions:</span>
                <button
                  type="button"
                  onClick={() => onBulkReclassify("unknown", "contribution")}
                  className="inline-flex items-center gap-1 rounded border border-amber-300 bg-white text-amber-900 hover:bg-amber-100 px-2 py-1 transition-colors"
                >
                  <ArrowUp className="h-3 w-3" />
                  Mark all as Contribution
                </button>
                <button
                  type="button"
                  onClick={() => onBulkReclassify("unknown", "distribution")}
                  className="inline-flex items-center gap-1 rounded border border-amber-300 bg-white text-amber-900 hover:bg-amber-100 px-2 py-1 transition-colors"
                >
                  <ArrowDown className="h-3 w-3" />
                  Mark all as Distribution
                </button>
                <button
                  type="button"
                  onClick={() => onBulkReclassify("unknown", "revenue")}
                  className="inline-flex items-center gap-1 rounded border border-amber-300 bg-white text-amber-900 hover:bg-amber-100 px-2 py-1 transition-colors"
                >
                  Mark all as Revenue
                </button>
                <button
                  type="button"
                  onClick={() => onBulkReclassify("unknown", "vendor_expense")}
                  className="inline-flex items-center gap-1 rounded border border-amber-300 bg-white text-amber-900 hover:bg-amber-100 px-2 py-1 transition-colors"
                >
                  Mark all as Vendor expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
