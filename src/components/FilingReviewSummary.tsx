import { useTranslations, useLocale } from "next-intl";
// "In review" summary on /filings/[id] (release gate, PR 1): before staff
// release the package the client sees what they told us — not the PDF — so
// they can spot a mistake and send a correction. Values are shown as stored.

type Money = { toString(): string } | number | string | null | undefined;

type YearRow = {
  taxYear: number;
  totalAssetsYearEnd?: Money;
  contributions?: Money;
  distributions?: Money;
  reportableTransactions?: unknown;
  ownerPaidCosts?: unknown;
  nonCashTransfers?: unknown;
  otherTransactionsNote?: string | null;
  rcsWhyMissed?: string | null;
  rcsWhenLearned?: string | null;
};

export type FilingReviewSummaryFiling = {
  llcName: string | null;
  llcEin: string | null;
  llcAddress: string | null;
  llcCity: string | null;
  llcState: string | null;
  llcZip: string | null;
  llcCountry?: string | null;
  ownerName: string | null;
  ownerAddress: string | null;
  ownerAddressStreet?: string | null;
  ownerAddressCity?: string | null;
  ownerAddressState?: string | null;
  ownerAddressPostal?: string | null;
  ownerAddressCountry?: string | null;
  taxYears: number[];
  yearData: YearRow[];
};

const join = (parts: Array<string | null | undefined>) => parts.map((p) => p?.trim()).filter(Boolean).join(", ");
const str = (v: unknown) => (typeof v === "string" ? v : "");
const rows = (v: unknown): Array<Record<string, unknown>> =>
  Array.isArray(v) ? v.filter((r): r is Record<string, unknown> => !!r && typeof r === "object") : [];

export function FilingReviewSummary({ filing }: { filing: FilingReviewSummaryFiling }) {
  const t = useTranslations();
  const locale = useLocale();
  const usd = (n: number) => n.toLocaleString(locale, { style: "currency", currency: "USD" });
  const dollars = (v: Money) => usd(Number(v ?? 0) || 0);
  const cents = (v: unknown) => usd((typeof v === "number" && Number.isFinite(v) ? v : 0) / 100);
  const ownerAddress =
    join([
      filing.ownerAddressStreet,
      filing.ownerAddressCity,
      filing.ownerAddressState,
      filing.ownerAddressPostal,
      filing.ownerAddressCountry,
    ]) || filing.ownerAddress;
  const companyAddress = join([filing.llcAddress, filing.llcCity, filing.llcState, filing.llcZip, filing.llcCountry]);
  const years = [...filing.yearData].sort((a, b) => a.taxYear - b.taxYear);

  return (
    <section className="space-y-4" aria-labelledby="review-summary-heading">
      <h2 id="review-summary-heading" className="font-medium">{t("portal.filing.whatYouToldUs")}</h2>
      <dl className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white text-sm">
        <Row label="LLC" value={filing.llcName} />
        <Row label="EIN" value={filing.llcEin} />
        <Row label={t("portal.filing.companyAddress")} value={companyAddress} />
        <Row label={t("portal.filing.owner")} value={filing.ownerName} />
        <Row label={t("portal.filing.ownerAddress")} value={ownerAddress} />
        <Row label={t("portal.filing.taxYears2")} value={filing.taxYears.join(", ")} />
      </dl>

      {years.map((y) => {
        const txs = rows(y.reportableTransactions);
        const costs = rows(y.ownerPaidCosts);
        const nonCash = rows(y.nonCashTransfers);
        return (
          <div key={y.taxYear} className="rounded-lg border border-slate-200 bg-white p-4 text-sm space-y-3">
            <h3 className="font-medium">{y.taxYear}</h3>
            <dl className="grid grid-cols-1 gap-1 sm:grid-cols-3">
              <Stat label={t("portal.filing.totalAssetsAtYearEnd")} value={dollars(y.totalAssetsYearEnd)} />
              <Stat label={t("portal.filing.contributions")} value={dollars(y.contributions)} />
              <Stat label={t("portal.filing.distributions")} value={dollars(y.distributions)} />
            </dl>
            {(txs.length > 0 || costs.length > 0 || nonCash.length > 0) && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <caption className="sr-only">{t("portal.filing.partVTransactionsFor", { year: y.taxYear })}</caption>
                  <thead className="text-slate-500">
                    <tr>
                      <th className="py-1 pr-3 font-medium">{t("common.date")}</th>
                      <th className="py-1 pr-3 font-medium">{t("portal.filing.description")}</th>
                      <th className="py-1 text-right font-medium">{t("portal.filing.amount")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {txs.map((transaction, i) => (
                      <tr key={`t${i}`}>
                        <td className="py-1 pr-3 whitespace-nowrap">{str(transaction.date) || str(transaction.dateInput)}</td>
                        <td className="py-1 pr-3">
                          {join([str(transaction.category), str(transaction.description), str(transaction.counterparty)])}
                          {str(transaction.currency) && str(transaction.currency) !== "USD" ? ` (${str(transaction.originalAmountInput) || String(transaction.originalAmount ?? "")} ${str(transaction.currency)})` : ""}
                        </td>
                        <td className="py-1 text-right whitespace-nowrap">
                          {typeof transaction.amountCents === "number" ? cents(transaction.amountCents) : t("portal.filing.amountMissing")}
                        </td>
                      </tr>
                    ))}
                    {costs.map((c, i) => (
                      <tr key={`c${i}`}>
                        <td className="py-1 pr-3 whitespace-nowrap">{str(c.date)}</td>
                        <td className="py-1 pr-3">
                          {join([t("portal.filing.paidByOwner"), str(c.category).replace(/_/g, " "), str(c.note)])}
                        </td>
                        <td className="py-1 text-right whitespace-nowrap">{cents(c.amountCents)}</td>
                      </tr>
                    ))}
                    {nonCash.map((n, i) => (
                      <tr key={`n${i}`}>
                        <td className="py-1 pr-3 whitespace-nowrap">{str(n.date)}</td>
                        <td className="py-1 pr-3">
                          {join([t("portal.filing.nonCashTransfer"), n.direction === "out" ? t("portal.filing.toOwner") : t("portal.filing.fromOwner"), str(n.description)])}
                        </td>
                        <td className="py-1 text-right whitespace-nowrap">{cents(n.fairMarketValueCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {y.otherTransactionsNote?.trim() && (
              <p className="text-slate-600">
                <span className="font-medium text-slate-900">{t("portal.filing.otherTransactions")}</span> {y.otherTransactionsNote}
              </p>
            )}
            {(y.rcsWhyMissed?.trim() || y.rcsWhenLearned?.trim()) && (
              <div className="space-y-1">
                <p className="font-medium text-slate-900">{t("portal.filing.whyThisYearWasFiledLateYourWords")}</p>
                {y.rcsWhyMissed?.trim() && <p className="whitespace-pre-wrap text-slate-700">{y.rcsWhyMissed}</p>}
                {y.rcsWhenLearned?.trim() && (
                  <p className="whitespace-pre-wrap text-slate-700">
                    <span className="font-medium text-slate-900">{t("portal.filing.whenYouLearnedOfIt")}</span> {y.rcsWhenLearned}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  const t = useTranslations();
  return (
    <div className="grid grid-cols-1 gap-0.5 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="break-words font-medium text-slate-900">
        {value || <em className="font-normal text-amber-700">{t("portal.filing.missing")}</em>}
      </dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
