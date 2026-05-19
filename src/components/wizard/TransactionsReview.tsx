"use client";

import { useState } from "react";
import { Upload, FileText, X, Sparkles, AlertTriangle, ArrowUp, ArrowDown, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import type { CategorizedTransaction, Category } from "@/lib/bank/categorize";
import { formatUsd } from "@/lib/utils";
import { PlaidConnectButton } from "./PlaidConnectButton";

const CATEGORY_LABELS: Record<Category, string> = {
  contribution: "Contribution (Part V)",
  distribution: "Distribution (Part V)",
  revenue: "Revenue",
  vendor_expense: "Vendor expense",
  card_reimbursement: "Card reimbursement",
  internal_transfer: "Internal transfer",
  unknown: "Unknown",
};

const REPORTABLE: Category[] = ["contribution", "distribution"];

type YearState = {
  taxYear: number;
  totalAssetsYearEnd: number;
  transactions: CategorizedTransaction[];
  // Manual override path: user enters totals directly without uploading.
  manualContributions?: number;
  manualDistributions?: number;
  uploadWarnings: string[];
  uploadedFiles: { id: string; name: string; type: "csv" | "excel"; addedTxCount: number }[];
  // Plaid connections completed this session — surfaces a "Connected to X"
  // chip below the dropzone. Persistence lives in the PlaidConnection table.
  plaidConnections: { institutionName: string | null; addedTxCount: number }[];
  // Tracks whether the year-end total was auto-derived from the uploaded
  // statements (so we can show a "auto-filled" hint without losing the flag
  // when the user clears and retypes).
  totalAssetsAutoFilled?: boolean;
};

const MAX_FILES_PER_YEAR = 13;

export function TransactionsReview({
  filingId,
  ownerName,
  plaidEnabled = false,
  initialYears,
  onSubmit,
  onBack,
  saving,
}: {
  filingId: string;
  ownerName: string | null;
  plaidEnabled?: boolean;
  initialYears: {
    taxYear: number;
    totalAssetsYearEnd: number;
    contributions: number;
    distributions: number;
  }[];
  onSubmit: (years: {
    taxYear: number;
    totalAssetsYearEnd: number;
    contributions: number;
    distributions: number;
    reportableTransactions: CategorizedTransaction[];
  }[]) => Promise<void>;
  onBack: () => void;
  saving: boolean;
}) {
  const [years, setYears] = useState<YearState[]>(
    initialYears.map((y) => ({
      taxYear: y.taxYear,
      totalAssetsYearEnd: y.totalAssetsYearEnd,
      transactions: [],
      manualContributions: y.contributions || undefined,
      manualDistributions: y.distributions || undefined,
      uploadWarnings: [],
      uploadedFiles: [],
      plaidConnections: [],
      totalAssetsAutoFilled: false,
    })),
  );
  const [uploading, setUploading] = useState<number | null>(null);

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
              manualContributions: undefined,
              manualDistributions: undefined,
            };
          }),
        );
      }
    } finally {
      setUploading(null);
    }
  }

  function setCategory(taxYear: number, idx: number, category: Category) {
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
  // into our year state the same way uploaded files do.
  function onPlaidTransactions(
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
          manualContributions: undefined,
          manualDistributions: undefined,
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

  function bulkReclassify(taxYear: number, from: Category, to: Category) {
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

  function totalsFor(y: YearState) {
    if (y.transactions.length === 0) {
      return {
        contributions: y.manualContributions ?? 0,
        distributions: y.manualDistributions ?? 0,
        source: "manual" as const,
      };
    }
    let contributions = 0;
    let distributions = 0;
    for (const t of y.transactions) {
      const dollars = Math.abs(t.amountCents) / 100;
      if (t.category === "contribution") contributions += dollars;
      if (t.category === "distribution") distributions += dollars;
    }
    return { contributions, distributions, source: "uploaded" as const };
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

  async function handleSubmit() {
    const payload = years.map((y) => {
      const t = totalsFor(y);
      return {
        taxYear: y.taxYear,
        totalAssetsYearEnd: y.totalAssetsYearEnd,
        contributions: t.contributions,
        distributions: t.distributions,
        reportableTransactions: y.transactions.filter((tx) => REPORTABLE.includes(tx.category)),
      };
    });
    await onSubmit(payload);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Transactions per year</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload a CSV bank statement from Mercury, Wise, Relay, or Brex — we&apos;ll
          auto-categorize transactions. Or enter the totals manually below.
        </p>
      </div>

      <div className="space-y-6">
        {years.map((y) => {
          const t = totalsFor(y);
          return (
            <div key={y.taxYear} className="border border-slate-200 rounded-md bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-medium">Tax year {y.taxYear}</p>
                <div className="text-xs text-slate-500">
                  {t.source === "uploaded"
                    ? `${y.transactions.length} transactions`
                    : "Manual entry"}
                </div>
              </div>

              <UploadDropzone
                disabled={uploading === y.taxYear || y.uploadedFiles.length >= MAX_FILES_PER_YEAR}
                uploading={uploading === y.taxYear}
                uploadedCount={y.uploadedFiles.length}
                limit={MAX_FILES_PER_YEAR}
                onFiles={(files) => uploadFiles(y.taxYear, files)}
              />

              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex-1 border-t border-slate-200" />
                <span>or</span>
                <span className="flex-1 border-t border-slate-200" />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <PlaidConnectButton
                  filingId={filingId}
                  taxYear={y.taxYear}
                  ownerName={ownerName}
                  enabled={plaidEnabled}
                  onTransactions={({ institutionName, transactions }) =>
                    onPlaidTransactions(y.taxYear, institutionName, transactions)
                  }
                />
                <span className="text-xs text-slate-500">
                  {plaidEnabled
                    ? "Sign in to your bank — we pull only this year's transactions."
                    : "Bank connect is currently unavailable. Upload a CSV/PDF instead."}
                </span>
              </div>

              {y.plaidConnections.length > 0 && (
                <ul className="mt-3 border border-slate-200 rounded-md divide-y divide-slate-100 bg-white">
                  {y.plaidConnections.map((c, i) => (
                    <li key={i} className="flex items-center justify-between px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Landmark className="h-3.5 w-3.5 text-accent" />
                        <span className="text-slate-700">
                          Connected to{" "}
                          <strong>{c.institutionName ?? "your bank"}</strong> via Plaid
                        </span>
                      </div>
                      <span className="text-slate-500">
                        {c.addedTxCount} {c.addedTxCount === 1 ? "transaction" : "transactions"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

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
                  <div className="border border-slate-200 rounded-md overflow-hidden">
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
                                REPORTABLE.includes(tx.category) ? "bg-accent-50/40" : ""
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
                                    setCategory(y.taxYear, i, e.target.value as Category)
                                  }
                                  className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                                >
                                  {(Object.keys(CATEGORY_LABELS) as Category[]).map((k) => (
                                    <option key={k} value={k}>
                                      {CATEGORY_LABELS[k]}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2 px-3">
                                <button
                                  onClick={() => removeTx(y.taxYear, i)}
                                  className="text-slate-400 hover:text-red-600"
                                  title="Remove this row"
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

              {y.transactions.length === 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Field label="Contributions (USD)" hint="Money you put into the LLC">
                    <Input
                      type="number"
                      step="0.01"
                      value={y.manualContributions ?? ""}
                      onChange={(e) =>
                        setManual(y.taxYear, "manualContributions", Number(e.target.value) || 0)
                      }
                    />
                  </Field>
                  <Field label="Distributions (USD)" hint="Money the LLC paid you">
                    <Input
                      type="number"
                      step="0.01"
                      value={y.manualDistributions ?? ""}
                      onChange={(e) =>
                        setManual(y.taxYear, "manualDistributions", Number(e.target.value) || 0)
                      }
                    />
                  </Field>
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-4">
                <Field
                  label="Total assets at year-end (USD)"
                  hint={
                    y.totalAssetsAutoFilled
                      ? "Auto-filled from your statements — add any prior-year balance and override below."
                      : "The ending balance of your balance sheet — typically just your Dec 31 bank balance."
                  }
                  help={
                    <>
                      <p>
                        The <strong>ending balance of your balance sheet</strong> — the value of
                        everything the LLC owns on December 31. Goes on{" "}
                        <strong>Form 1120 line D</strong>.
                      </p>
                      <p className="mt-2">
                        For a typical single-member LLC with one bank account, this is just the{" "}
                        <strong>December 31 bank balance</strong> — we auto-fill it from the
                        transactions you uploaded.
                      </p>
                      <p className="mt-2">
                        Add to that any other assets the LLC holds at year-end:
                      </p>
                      <ul className="mt-1 space-y-0.5 list-disc list-inside">
                        <li>Cash in any other business bank / treasury account</li>
                        <li>Unpaid customer invoices (accounts receivable)</li>
                        <li>Inventory, equipment, or property (at depreciated cost)</li>
                        <li>Crypto held by the LLC (USD value on Dec 31)</li>
                        <li>Carry-over balance from the prior tax year</li>
                      </ul>
                      <p className="mt-2">
                        Don&apos;t include anything in your personal accounts, or debts the LLC
                        owes (those are liabilities, not assets). If the LLC had zero assets,
                        enter <code>0</code>.
                      </p>
                    </>
                  }
                >
                  <Input
                    type="number"
                    step="0.01"
                    value={y.totalAssetsYearEnd}
                    onChange={(e) =>
                      setManual(y.taxYear, "totalAssetsYearEnd", Number(e.target.value) || 0)
                    }
                  />
                </Field>
                <Summary
                  label="Total contributions"
                  amount={t.contributions}
                  hint={
                    y.transactions.length > 0
                      ? "Mark any owner-funded inflows as Contribution (Part V) above."
                      : "Money you sent into the LLC."
                  }
                />
                <Summary
                  label="Total distributions"
                  amount={t.distributions}
                  hint={
                    y.transactions.length > 0
                      ? "Mark any owner-paid outflows as Distribution (Part V) above."
                      : "Money the LLC paid to you personally."
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : "Continue"}
        </Button>
      </div>
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
              Drop your bank statements here or click to browse
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

function Summary({
  label,
  amount,
  hint,
}: {
  label: string;
  amount: number;
  hint?: string;
}) {
  const isZero = amount === 0;
  return (
    <div
      className={`rounded-md border p-3 ${
        isZero ? "bg-slate-50 border-slate-200" : "bg-accent-50 border-accent/20"
      }`}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`text-lg font-semibold mt-0.5 ${
          isZero ? "text-slate-400" : "text-slate-900"
        }`}
      >
        {formatUsd(amount * 100)}
      </p>
      {isZero && hint && <p className="text-[11px] text-slate-500 mt-1 leading-snug">{hint}</p>}
    </div>
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
  transactions: CategorizedTransaction[];
  onBulkReclassify: (from: Category, to: Category) => void;
}) {
  const counts = transactions.reduce(
    (acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<Category, number>,
  );

  const unknownCount = counts.unknown ?? 0;

  const pillTone: Record<Category, string> = {
    contribution: "bg-accent-50 text-accent border-accent/20",
    distribution: "bg-accent-50 text-accent border-accent/20",
    revenue: "bg-emerald-50 text-emerald-700 border-emerald-200",
    vendor_expense: "bg-slate-100 text-slate-700 border-slate-200",
    card_reimbursement: "bg-slate-100 text-slate-700 border-slate-200",
    internal_transfer: "bg-slate-100 text-slate-700 border-slate-200",
    unknown: "bg-amber-100 text-amber-800 border-amber-300",
  };

  // Order: reportable first, then non-reportable, then unknown last.
  const order: Category[] = [
    "contribution",
    "distribution",
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
