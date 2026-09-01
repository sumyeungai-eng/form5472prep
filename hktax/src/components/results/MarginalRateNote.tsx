import type { ResultComputation } from "@/lib/results/recompute";
import type { ResultsLanguage } from "@/lib/results/resultsDictionary";
import { resultsDictionary, resultsT } from "@/lib/results/resultsDictionary";
import type { TaxBand, TaxYearParams } from "@/lib/tax/types";

type MarginalRateNoteProps = {
  item: ResultComputation | undefined;
  lang: ResultsLanguage;
  params: TaxYearParams;
};

export function MarginalRateNote({ item, lang, params }: MarginalRateNoteProps) {
  if (!item) {
    return null;
  }

  const comp = item.computation;
  const rateInfo = comp.basisUsed === "progressive"
    ? findBand(comp.netChargeableIncome, params.progressiveBands)
    : standardRateInfo(item, params);

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="display-subsection">
        {resultsT(resultsDictionary.marginalTitle, lang)}
      </h2>
      <p className="mt-2 text-sm leading-6 text-warm-700">
        <span className="font-semibold text-navy-900">
          {lang === "zh" ? item.titleZh : item.titleEn}：
        </span>{" "}
        {comp.basisUsed === "progressive"
          ? progressiveText(rateInfo, lang)
          : standardText(rateInfo, lang)}
      </p>
    </section>
  );
}

function progressiveText(rateInfo: { index: number; rate: number }, lang: ResultsLanguage): string {
  if (lang === "zh") {
    return `${resultsT(resultsDictionary.marginalProgressive, lang)}第 ${rateInfo.index} ${resultsT(resultsDictionary.marginalBand, lang)} ${formatPercent(rateInfo.rate)}。`;
  }

  return `${resultsT(resultsDictionary.marginalProgressive, lang)} band ${rateInfo.index}, with a marginal rate of ${formatPercent(rateInfo.rate)}.`;
}

function standardText(rateInfo: { index: number; rate: number }, lang: ResultsLanguage): string {
  const bandText = rateInfo.index > 1
    ? lang === "zh" ? `第 ${rateInfo.index} 級` : `band ${rateInfo.index}`
    : "";

  const punctuation = lang === "zh" ? "。" : ".";
  return `${resultsT(resultsDictionary.marginalStandard, lang)} ${bandText}${bandText ? " " : ""}${formatPercent(rateInfo.rate)}${punctuation}`;
}

function standardRateInfo(item: ResultComputation, params: TaxYearParams): { index: number; rate: number } {
  if (item.demandHead === "property") {
    return { index: 1, rate: params.propertyTax.rate };
  }

  if (item.demandHead === "profits") {
    const hasTwoTier = item.computation.lines.some((line) => line.key.includes("tax-tier-one"));
    const aboveFirstTier = item.computation.netChargeableIncome > params.profitsTax.tierOneCap;
    return {
      index: aboveFirstTier ? 2 : 1,
      rate: hasTwoTier && !aboveFirstTier ? params.profitsTax.tierOneRate : params.profitsTax.standardRate,
    };
  }

  return findBand(item.computation.netAssessableIncome, params.standardRateTiers);
}

function findBand(amount: number, bands: TaxBand[]): { index: number; rate: number } {
  let upper = 0;

  for (let index = 0; index < bands.length; index += 1) {
    const band = bands[index];

    if (band.width === null) {
      return { index: index + 1, rate: band.rate };
    }

    upper += band.width;
    if (amount <= upper) {
      return { index: index + 1, rate: band.rate };
    }
  }

  const lastBand = bands[bands.length - 1];
  return { index: bands.length, rate: lastBand?.rate ?? 0 };
}

function formatPercent(rate: number): string {
  return `${(rate * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}
