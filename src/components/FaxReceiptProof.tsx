import { FaxReceipt } from "@/components/FaxReceipt";

// Explains provider transmission evidence and its limits; not IRS acceptance.

import { getMarketingTranslator } from "@/i18n/marketing";
import { localizedPath, type MarketingLocale } from "@/i18n/marketing/config";

export function FaxReceiptProof({ locale = "en" }: { locale?: "en" | MarketingLocale } = {}) {
  const t = getMarketingTranslator(locale);
  const PROOF_POINTS: Array<{ field: string; title: string; body: string }> = [
    {
      field: t("shared.proof.s001"),
      title: t("shared.proof.s002"),
      body: t("shared.proof.s003"),
    },
    {
      field: t("shared.proof.s004"),
      title: t("shared.proof.s005"),
      body: t("shared.proof.s006"),
    },
    {
      field: t("shared.proof.s007"),
      title: t("shared.proof.s008"),
      body: t("shared.proof.s009"),
    },
    {
      field: t("shared.proof.s010"),
      title: t("shared.proof.s011"),
      body: t("shared.proof.s012"),
    },
    {
      field: t("shared.proof.s013"),
      title: t("shared.proof.s014"),
      body: t("shared.proof.s015"),
    },
  ];

  return (
    <section className="border-y border-paper-edge bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
            {t("shared.proof.s016")}
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {t("shared.proof.s017")}
          </h2>
          <p className="mt-4 text-slate-600">
            {t("shared.proof.s018")}
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          {/* The crafted receipt */}
          <div lang={locale === "en" ? undefined : "en"} className="mx-auto w-full max-w-md">
            <FaxReceipt />
            <p className="mt-3 text-center font-mono text-[11px] text-slate-500">
              {t("shared.proof.s019")}
            </p>
          </div>

          {/* What each part proves */}
          <ul className="space-y-6">
            {PROOF_POINTS.map((p) => (
              <li key={p.field} className="border-l-2 border-paper-edge pl-5">
                <p className="font-mono text-[11px] uppercase tracking-wide text-accent">
                  {p.field}
                </p>
                <h3 className="mt-1.5 font-semibold text-ink">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Differentiator — directly answers "why pay $149 over $49" */}
        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50/70 px-6 py-5 text-center text-sm text-emerald-900">
          <strong className="font-semibold">{t("shared.proof.s020")}</strong>{" "}
          {t("shared.proof.s021")}{" "}
          <a href={localizedPath(locale, "/blog/form-5472-irs-receipt-confirmation-status")} className="underline">{t("shared.proof.s022")}</a>.
        </div>
      </div>
    </section>
  );
}
