"use client";

import Link from "next/link";
import { Container } from "@/components/Container";
import { useI18n } from "@/lib/i18n/useI18n";
import { getParams } from "@/lib/tax/params";

type Bi = { zh: string; en: string };

const holdoverGrounds: Bi[] = [
  {
    zh: "本課稅年度的應課稅入息，預計會少於上一課稅年度應課稅入息的 90%。",
    en: "Income chargeable for the current year is likely to be less than 90% of the preceding year's chargeable amount."
  },
  {
    zh: "已經或即將獲得新增/增加的免稅額（例如新增子女或受養父母免稅額）。",
    en: "You have become entitled to a new or increased allowance (e.g. a newly qualifying child or dependent-parent allowance)."
  },
  {
    zh: "已經或即將獲得新增/增加的扣除項目（例如自願醫保、居所貸款利息、租金扣除、強積金及年金供款）。",
    en: "You have become entitled to a new or increased deduction (e.g. VHIS premiums, home loan interest, domestic rent, MPF/annuity contributions)."
  },
  {
    zh: "在本課稅年度完結前已經或將會停止產生應課稅入息（例如離職、結業或移居海外）。",
    en: "You have ceased, or will cease, to derive chargeable income before the year of assessment ends (e.g. leaving employment, ceasing business, or emigrating)."
  },
  {
    zh: "已就上一課稅年度的評稅提出反對。",
    en: "You have lodged an objection against your assessment for the preceding year."
  }
];

export default function ProvisionalTaxGuidePage() {
  const { lang, year } = useI18n();
  const params = getParams(year);
  const reductionCap = hkd(params.taxReduction.cap);
  const reductionPercent = formatPercent(params.taxReduction.percent);

  return (
    <main>
      <section className="bg-white py-14 sm:py-16">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
              {lang === "zh" ? "報稅指南" : "Filing guide"}
            </p>
            <h1 className="mt-3 text-3xl font-bold text-navy-900 sm:text-4xl">
              {lang === "zh" ? "暫繳稅與緩繳" : "Provisional Tax and Holdover"}
            </h1>
            <p className="mt-5 text-base leading-7 text-warm-700">
              {lang === "zh"
                ? "暫繳稅是香港稅制其中一項最易令人混淆的安排：稅務局在同一張繳稅通知書上，同時徵收「本年度最終稅款」及「下年度暫繳稅款」。以下說明其運作方式、分期繳付日期，以及可申請緩繳暫繳稅的法定理由。"
                : "Provisional tax is one of the more confusing parts of the Hong Kong tax system: IRD issues a single demand note that combines your final tax for the year just ended with an estimated provisional tax for the year ahead. This page explains how the two amounts are combined, the typical instalment dates, and the statutory grounds for applying to hold over (postpone) provisional tax."}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-12 sm:py-16">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="card p-6">
              <h2 className="text-xl font-bold text-navy-900">
                {lang === "zh" ? "繳稅通知書如何組成" : "How the demand note is assembled"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-warm-700">
                {lang === "zh"
                  ? "稅務局先計算你上一課稅年度的「最終稅款」（根據你申報的實際入息、扣除及免稅額計算）。由於下一課稅年度尚未完結，稅務局會假設下一年度的入息與本年度相若，以相同基礎估算「暫繳稅款」。兩筆款項會合併在同一張繳稅通知書內徵收，所以通知書上顯示的總額，通常遠高於單一年度的稅款。"
                  : "IRD first works out your final tax for the year that has just ended, based on your actual reported income, deductions, and allowances. Because the next year of assessment is not yet over, IRD estimates provisional tax for that year on the assumption that your income will be similar, using the same computation basis. Both amounts are billed together on one demand note, so the total shown is usually well above a single year's tax."}
              </p>
            </article>

            <article className="card p-6">
              <h2 className="text-xl font-bold text-navy-900">
                {lang === "zh" ? "兩期典型繳款日期" : "Two typical instalment dates"}
              </h2>
              <dl className="mt-3 space-y-3 text-sm leading-6 text-warm-700">
                <div>
                  <dt className="font-semibold text-navy-900">
                    {lang === "zh" ? "第一期（約一月）" : "First instalment (around January)"}
                  </dt>
                  <dd>
                    {lang === "zh"
                      ? "通常涵蓋本年度最終稅款的全數，加上下年度暫繳稅款的約 75%。"
                      : "Typically covers 100% of the final tax for the year just ended, plus about 75% of the next year's provisional tax."}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-navy-900">
                    {lang === "zh" ? "第二期（約四月）" : "Second instalment (around April)"}
                  </dt>
                  <dd>
                    {lang === "zh"
                      ? "涵蓋下年度暫繳稅款餘下的約 25%。"
                      : "Covers the remaining roughly 25% of the next year's provisional tax."}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs leading-5 text-warm-500">
                {lang === "zh"
                  ? "以上比例及月份為一般行政安排，實際日期及金額請以你本人的繳稅通知書為準——行政安排或有變動。"
                  : "These proportions and months describe typical administrative practice only. Always check the exact dates and amounts on your own demand note — administrative arrangements can change."}
              </p>
            </article>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <Container>
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold text-navy-900">
              {lang === "zh"
                ? "為何暫繳稅不會扣減本年度的寬減"
                : "Why provisional tax ignores the one-off reduction"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-warm-700">
              {lang === "zh"
                ? `政府每年公布的百分之百寬減（本年度上限 ${reductionCap}，即 ${reductionPercent} 寬減，設有每宗個案上限）一般只適用於「最終評稅」的稅款，並不適用於同一張通知書上的暫繳稅部分。原因是暫繳稅只是對下一年度的預先估算，寬減金額須待下一年度完結、稅務局計出該年度的最終評稅後才會在其稅款中扣除。換言之，你仍須按通知書列明的暫繳稅金額全數繳付，寬減會在下一次評稅時才體現。`
                : `The government's annual one-off reduction (currently ${reductionPercent} of tax payable, capped at ${reductionCap} per case for the year shown by the header selector) generally applies only to the final assessment, not to the provisional tax portion on the same demand note. Provisional tax is only an advance estimate for the year ahead, so the reduction for that future year can only be applied once IRD raises the actual final assessment for it. In practice this means you must still pay the full provisional tax amount shown on the notice — the reduction shows up only in the following year's assessment.`}
            </p>
            <p className="mt-3 text-sm leading-6 text-warm-700">
              {lang === "zh"
                ? "另外要留意：物業稅的暫繳稅並不包括在寬減適用範圍之內；薪俸稅、利得稅及個人入息課稅則通常適用（以稅務局當年公布為準）。"
                : "Also note: provisional property tax has historically fallen outside the scope of the annual reduction, while salaries tax, profits tax, and personal assessment are usually covered — always confirm the exact scope against IRD's announcement for the relevant year."}
            </p>
            <p className="mt-3 text-sm leading-6 text-warm-700">
              {lang === "zh"
                ? "暫繳稅估算以本年度免稅額及扣除上限計算；稅務局正式暫繳稅按下一年度的免稅額計算，金額或有不同。"
                : "Provisional tax here is estimated using the current year's allowances and caps; the IRD computes actual provisional tax using the following year's allowances, so your bill may differ."}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-12 sm:py-16">
        <Container>
          <h2 className="text-xl font-bold text-navy-900">
            {lang === "zh" ? "緩繳暫繳稅：法定理由" : "Holdover of provisional tax: statutory grounds"}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-warm-700">
            {lang === "zh"
              ? "如符合下列其中一項法定理由，你可以向稅務局申請緩繳（即暫緩繳付）全部或部分暫繳稅款。以下五項適用於暫繳薪俸稅；暫繳利得稅及暫繳物業稅設有相近但個別的理由（例如利潤/租值預計下跌九成以上、停業/停止擁有物業、擬選擇個人入息課稅等），申請時須按稅款種類填寫相應表格。"
              : "If any one of the following statutory grounds applies, you may apply to IRD to hold over (postpone) all or part of your provisional tax. The five grounds below apply to provisional salaries tax; provisional profits tax and provisional property tax have similar but distinct grounds (e.g. profits or rental value expected to fall by more than 90%, ceasing business or ownership, or an intended personal assessment election) — use the form corresponding to the tax type you are applying for."}
          </p>

          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {holdoverGrounds.map((ground, index) => (
              <li key={ground.en} className="card flex gap-4 p-5">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white"
                >
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-warm-700">{ground[lang]}</p>
              </li>
            ))}
          </ol>

          <div className="card mt-6 max-w-3xl border-teal-100 bg-teal-50 p-5">
            <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-teal-800">
              {lang === "zh" ? "申請期限" : "Application deadline"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-warm-700">
              {lang === "zh"
                ? "申請須於「繳稅日期前 28 天」或「繳稅通知書發出日期後 14 天」兩者中較遲的一天或之前提出。此為一般規則，實際期限請以你本人通知書上列明的日期，以及稅務局最新指引為準——行政安排或有變動。"
                : "Applications must be lodged by whichever is later: 28 days before the due date for payment, or 14 days after the date the demand note was issued. This is the general rule — always confirm the exact deadline against the date printed on your own notice and IRD's current guidance, as administrative arrangements can change."}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <Container>
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold text-navy-900">
              {lang === "zh" ? "本計算機如何顯示總繳稅金額" : "How our calculator shows your total demand"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-warm-700">
              {lang === "zh"
                ? "在「報稅精靈」及「快速計算機」的結果頁面中，我們會分開列出（a）本年度最終稅款、（b）估算暫繳稅款，並在最後加總為與繳稅通知書相若的總額，方便你核對。所有金額均按你在頁首選擇的課稅年度，套用該年度已核實的參數即時計算，不會使用寫死的數字。"
                : "On the results screens for both the guided wizard and the quick calculators, we show (a) your final tax for the year and (b) the estimated provisional tax separately, then add them together into a total comparable to your demand note, so you can cross-check it. All figures are computed live from the verified parameters for the year selected in the header — nothing is hard-coded."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/wizard" className="btn-primary">
                {lang === "zh" ? "前往報稅精靈" : "Go to the tax wizard"}
              </Link>
              <Link
                href="/calculators"
                className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-navy-900 px-5 py-3 text-sm font-bold text-navy-900 transition hover:bg-navy-900 hover:text-white"
              >
                {lang === "zh" ? "前往快速計算機" : "Go to quick calculators"}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-10">
        <Container>
          <p className="max-w-3xl text-xs leading-6 text-warm-600">
            {lang === "zh"
              ? "本頁內容僅供一般教育及參考用途，並非稅務意見，亦與稅務局無從屬關係。暫繳稅的分期比例、繳款日期及緩繳申請期限均可能因應個別情況或行政安排而有所不同，實際安排請以你本人的評稅通知書及稅務局最新公布為準；如有疑問，建議諮詢執業會計師或稅務顧問。"
              : "This page is for general education and reference only. It is not tax advice and this website is not affiliated with the Inland Revenue Department. Instalment proportions, payment dates, and holdover application deadlines can vary by case and by administrative practice — always rely on your own notice of assessment and IRD's latest guidance, and consult a qualified accountant or tax adviser if in doubt."}
          </p>
          <Link
            href="/guides"
            className="focus-ring mt-6 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800"
          >
            {lang === "zh" ? "← 返回稅務指南" : "← Back to guides"}
          </Link>
        </Container>
      </section>
    </main>
  );
}

function hkd(value: number) {
  return new Intl.NumberFormat("en-HK", {
    style: "currency",
    currency: "HKD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("en-HK", {
    style: "percent",
    maximumFractionDigits: 0
  }).format(value);
}
