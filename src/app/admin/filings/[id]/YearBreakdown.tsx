import type { BankStatement, FilingYearData } from "@prisma/client";
import { ExternalLink } from "lucide-react";
import { reportableTransactionsSchema } from "@/lib/schemas";
import { formatUsd } from "@/lib/utils";

type YearWithBankStatementUrls = FilingYearData & {
  bankStatements: Array<BankStatement & { url: string }>;
};

type YearBreakdownProps = {
  year: YearWithBankStatementUrls;
};

type DecimalValue = FilingYearData["contributions"];
type ReportableTransaction = {
  date: string;
  description: string;
  counterparty?: string;
  amountCents: number;
  category: string;
};

type ReconciliationWarning = {
  key: string;
  label: string;
  lineItemsCents: number;
  storedValue: DecimalValue;
  storedCents: number;
};

const dollarFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function YearBreakdown({ year }: YearBreakdownProps) {
  const parsedTransactions = reportableTransactionsSchema.safeParse(year.reportableTransactions);
  const transactions = parsedTransactions.success ? parsedTransactions.data : null;
  const categorySubtotals = transactions ? subtotalByCategory(transactions) : [];
  const grandTotalCents = transactions
    ? transactions.reduce((sum, tx) => sum + Math.abs(tx.amountCents), 0)
    : 0;
  // No line items means the typed total stands on its own, so it is not flagged.
  const reconciliationWarnings =
    transactions && transactions.length > 0 ? buildReconciliationWarnings(year, transactions) : [];
  const note = year.otherTransactionsNote?.trim();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-base font-semibold text-slate-900">Tax year {year.taxYear}</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:text-right">
          <StoredTotal label="Total assets (year-end)" value={year.totalAssetsYearEnd} />
          <StoredTotal label="Contributions" value={year.contributions} />
          <StoredTotal label="Distributions" value={year.distributions} />
        </div>
      </div>

      {year.noReportableTransactions && (
        <span className="block w-fit text-[11px] font-medium rounded-full px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200">
          Customer declared: no reportable transactions for this year.
        </span>
      )}

      <div className="space-y-2">
        <h4 className="text-xs uppercase tracking-wider text-slate-500">
          Reportable transaction line items
        </h4>
        {transactions ? (
          transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr className="border-b border-slate-200">
                    <th className="text-left font-semibold py-2 pr-3">Date</th>
                    <th className="text-left font-semibold py-2 pr-3">Description</th>
                    <th className="text-left font-semibold py-2 pr-3">Counterparty</th>
                    <th className="text-left font-semibold py-2 pr-3">Category</th>
                    <th className="text-right font-semibold py-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx, index) => (
                    <tr key={`${tx.date}-${tx.category}-${index}`}>
                      <td className="py-2 pr-3 text-slate-700 whitespace-nowrap">{tx.date}</td>
                      <td className="py-2 pr-3 text-slate-900">{tx.description}</td>
                      <td className="py-2 pr-3 text-slate-700">
                        {tx.counterparty?.trim() ? tx.counterparty : <span className="text-slate-400">&mdash;</span>}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">{tx.category}</td>
                      <td className="py-2 text-right tabular-nums text-slate-900">
                        {formatUsd(Math.abs(tx.amountCents))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-slate-200">
                  {categorySubtotals.map((subtotal) => (
                    <tr key={subtotal.category}>
                      <td colSpan={4} className="py-2 pr-3 text-right text-slate-500">
                        {capitalizeLabel(subtotal.category)} subtotal
                      </td>
                      <td className="py-2 text-right tabular-nums font-medium text-slate-900">
                        {formatUsd(subtotal.amountCents)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-slate-100">
                    <td colSpan={4} className="py-2 pr-3 text-right font-medium text-slate-700">
                      Grand total
                    </td>
                    <td className="py-2 text-right tabular-nums font-semibold text-slate-900">
                      {formatUsd(grandTotalCents)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            !year.noReportableTransactions && (
              <p className="text-sm text-slate-400">No transaction line items entered.</p>
            )
          )
        ) : (
          <p className="w-fit text-[11px] font-medium rounded-full px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200">
            Transaction data could not be read &mdash; inspect this filing in the database.
          </p>
        )}
      </div>

      {reconciliationWarnings.length > 0 && (
        <div className="flex flex-col gap-1">
          {reconciliationWarnings.map((warning) => (
            <span
              key={warning.key}
              className="w-fit text-[11px] font-medium rounded-full px-2 py-0.5 bg-red-50 text-red-700 border border-red-200"
            >
              {warning.label}: line items total {formatUsd(warning.lineItemsCents)} but the filing
              records {formatDollarValue(warning.storedValue)}.
            </span>
          ))}
        </div>
      )}

      {note && (
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-slate-500">
            Other transactions with the foreign owner
          </h4>
          <div className="border border-slate-200 rounded p-3 text-sm text-slate-700 whitespace-pre-wrap">
            {note}
          </div>
        </div>
      )}

      {year.bankStatements.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-slate-500">Bank statements</h4>
          <div>
            {year.bankStatements.map((statement) => (
              <BankStatementRow key={statement.id} statement={statement} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StoredTotal({ label, value }: { label: string; value: DecimalValue }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-sm font-medium tabular-nums text-slate-900">
        {formatDollarValue(value)}
      </div>
    </div>
  );
}

function BankStatementRow({
  statement,
}: {
  statement: BankStatement & { url: string };
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-100 last:border-0">
      <span className="min-w-0 text-sm text-slate-700">
        <span className="block truncate">{statement.fileName}</span>
        <span className="text-xs text-slate-400">
          {statement.uploadedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </span>
      <a
        href={statement.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-none text-sm text-accent hover:underline inline-flex items-center gap-1"
      >
        View <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function subtotalByCategory(transactions: ReportableTransaction[]) {
  const subtotals = new Map<string, number>();
  for (const tx of transactions) {
    subtotals.set(tx.category, (subtotals.get(tx.category) ?? 0) + Math.abs(tx.amountCents));
  }

  return Array.from(subtotals, ([category, amountCents]) => ({ category, amountCents })).sort(
    (a, b) => a.category.localeCompare(b.category),
  );
}

function buildReconciliationWarnings(
  year: YearWithBankStatementUrls,
  transactions: ReportableTransaction[],
): ReconciliationWarning[] {
  const contributionLineItemsCents = sumCategoryCents(transactions, "contribution");
  const distributionLineItemsCents = sumCategoryCents(transactions, "distribution");
  const checks = [
    {
      key: "contribution",
      label: "Contributions",
      lineItemsCents: contributionLineItemsCents,
      storedValue: year.contributions,
      storedCents: decimalDollarsToCents(year.contributions),
    },
    {
      key: "distribution",
      label: "Distributions",
      lineItemsCents: distributionLineItemsCents,
      storedValue: year.distributions,
      storedCents: decimalDollarsToCents(year.distributions),
    },
  ];

  return checks.filter((check) => Math.abs(check.lineItemsCents - check.storedCents) > 1);
}

// Amounts are signed, but wizard totals use magnitudes; category conveys direction here.
function sumCategoryCents(transactions: ReportableTransaction[], category: string): number {
  return transactions.reduce(
    (sum, tx) => (tx.category === category ? sum + Math.abs(tx.amountCents) : sum),
    0,
  );
}

function decimalDollarsToCents(value: DecimalValue): number {
  // Line items are cents; stored Prisma Decimal totals are dollars.
  return Math.round(Number(value) * 100);
}

function formatDollarValue(value: DecimalValue): string {
  return dollarFormatter.format(Number(value));
}

function capitalizeLabel(value: string): string {
  return value.length > 0 ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}
