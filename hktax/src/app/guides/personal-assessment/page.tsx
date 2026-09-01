"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { useI18n } from "@/lib/i18n/useI18n";
import { getParams } from "@/lib/tax/params";

type TaxParams = ReturnType<typeof getParams>;
type Lang = "zh" | "en";
type Band = { width: number | null; rate: number };

type Section = {
  id: string;
  title: { zh: string; en: string };
  content: { zh: ReactNode; en: ReactNode };
};

function hkd(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "zh" ? "zh-HK" : "en-HK", {
    style: "currency",
    currency: "HKD",
    maximumFractionDigits: 0
  }).format(value);
}

function pct(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "zh" ? "zh-HK" : "en-HK", {
    style: "percent",
    maximumFractionDigits: 2
  }).format(value);
}

function computeBands(amount: number, bands: Band[]) {
  let remaining = Math.max(amount, 0);
  let tax = 0;

  for (const band of bands) {
    const width = band.width === null ? remaining : Math.min(remaining, band.width);
    tax += width * band.rate;
    remaining -= width;
    if (remaining <= 0) break;
  }

  return tax;
}

function buildSections(params: TaxParams): Section[] {
  const { propertyTax } = params;

  return [
    {
      id: "what",
      title: { zh: "個人入息課稅其實是甚麼", en: "What Personal Assessment actually is" },
      content: {
        zh: (
          <>
            <p>
              個人入息課稅（俗稱「入息稅」）<strong>並非香港的第四種稅</strong>，
              而是一種選擇性的「合併計稅」方法。你可以選擇將全年的物業應評稅淨值、
              薪俸稅應評稅入息淨額，以及利得稅應評稅利潤（你個人／夫婦分佔的部分）三項合併，
              再用薪俸稅的扣除、免稅額及稅率計法（累進稅率 vs 標準稅率取較低者）計出一個總稅款，
              並與你分開繳付三種稅的總和比較，選擇較低者。
            </p>
            <p>
              關鍵在於「選擇」二字 — 你或你夫婦須在限期內主動向稅務局提出選擇個人入息課稅，
              稅務局不會自動為你套用；亦不會在對你不利時仍然強制執行 — 如果計算結果顯示個人入息課稅
              反而需要繳付更多稅款，你可在限期內撤回選擇。
            </p>
          </>
        ),
        en: (
          <>
            <p>
              Personal Assessment (PA) is <strong>not a fourth Hong Kong tax</strong> — it is an elective
              way of aggregating your figures. You can elect to combine the net assessable value from
              property tax, the net assessable income from salaries tax, and your share of assessable
              profits from profits tax into one total, then compute tax on that combined figure using the
              salaries-tax-style deduction, allowance, and rate rules (progressive vs standard rate,
              whichever is lower), and compare the result against the sum of what you would pay under the
              separate taxes.
            </p>
            <p>
              The key word is &ldquo;elective&rdquo; — you or your spouse must actively elect Personal
              Assessment with the IRD within the time limit; it is never applied automatically. And if the
              computation turns out worse for you, you can withdraw the election within the time limit.
            </p>
          </>
        )
      }
    },
    {
      id: "who-benefits",
      title: { zh: "哪些人選擇後可節省稅款", en: "Who benefits from electing it" },
      content: {
        zh: (
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>有按揭的業主</strong> — 單獨計算物業稅不可以扣除按揭利息，但個人入息課稅可以扣除
              （上限為該物業的 NAV），業主往往可以節省不少稅款。
            </li>
            <li>
              <strong>有業務虧損的人</strong> — 單獨計算利得稅的虧損只可以結轉至下一年度，
              但個人入息課稅可以將虧損即時抵銷你該年度的其他收入（例如薪俸或租金）。
            </li>
            <li>
              <strong>入息偏低的業主／小生意經營者</strong> — 物業稅（{pct(propertyTax.rate, "zh")} 單一稅率）
              及利得稅的兩級制優惠稅階，都沒有考慮你的個人免稅額。如果你整體入息不算高，
              將所有入息合併再套用免稅額及累進稅率，很可能比逐項分開計算更節省稅款。
            </li>
          </ul>
        ),
        en: (
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Landlords with a mortgage</strong> — property tax alone gives no deduction for
              mortgage interest, but Personal Assessment does (capped at that property&apos;s NAV), often
              producing a meaningful saving.
            </li>
            <li>
              <strong>Anyone with a business loss</strong> — under profits tax alone a loss just carries
              forward, but under Personal Assessment the loss can offset your other income (e.g. salary or
              rental income) in the same year.
            </li>
            <li>
              <strong>Landlords or small business owners with modest overall income</strong> — property tax
              (a flat {pct(propertyTax.rate, "en")} rate) and the profits tax two-tier band do not take your
              personal allowances into account at all. If your total income is not high, combining
              everything and applying your allowances and the progressive rate can beat paying each tax
              separately.
            </li>
          </ul>
        )
      }
    },
    {
      id: "who-doesnt",
      title: { zh: "哪些人不會受惠", en: "Who doesn't benefit" },
      content: {
        zh: (
          <p>
            如果你的薪俸稅已經是用標準稅率計算（即入息高於某個水平，累進稅率反而計出更多稅款），
            而且你沒有按揭利息、業務虧損等可以額外扣除的項目，合併薪俸、租金及業務利潤，
            往往只會令更多入息納入標準稅率的計算基礎，未必有利，甚至有可能需要繳付更多稅款。
            這類高入息、扣除項目相對少的納稅人，一般選擇分開評稅較為有利。
          </p>
        ),
        en: (
          <p>
            If your salaries tax is already computed on the standard rate (income high enough that the
            progressive rate would produce more tax), and you have no mortgage interest, business loss, or
            similar extra deductions to bring in, combining salary, rental, and business profits together
            usually just adds more income into the standard-rate base without an offsetting benefit — and
            can occasionally work out worse. High earners with relatively few extra deductions generally do
            better staying on separate assessments.
          </p>
        )
      }
    },
    {
      id: "married-election",
      title: { zh: "夫婦選擇規則", en: "Married-couple election rules" },
      content: {
        zh: (
          <ul className="list-disc space-y-2 pl-5">
            <li>
              由2018/19課稅年度起，已婚人士可<strong>個別</strong>選擇個人入息課稅，
              即使配偶在同一課稅年度亦有應課稅入息，亦不會因此失去個別選擇資格。
            </li>
            <li>
              夫婦亦可在雙方同意下<strong>共同</strong>選擇個人入息課稅，將雙方所有入息
              合併評稅，並使用已婚人士免稅額；最終稅款會按雙方各自入息比例攤分繳付責任。
            </li>
            <li>
              如果個別及共同選擇均符合資格，應比較各方案實際稅款；本網站的優化器會自動逐一計算。
            </li>
          </ul>
        ),
        en: (
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Since YA 2018/19, a married person may elect Personal Assessment{" "}
              <strong>individually</strong>, even if the spouse also has chargeable income for the year.
            </li>
            <li>
              A couple may also elect Personal Assessment <strong>jointly</strong> if both spouses agree,
              aggregating all of both spouses&apos; income and using the married person&apos;s allowance;
              the resulting liability is then apportioned between the spouses by their respective share of income.
            </li>
            <li>
              If both individual and joint election are available, compare the actual outcomes; this app&apos;s
              optimizer does that automatically.
            </li>
          </ul>
        )
      }
    },
    {
      id: "optimizer",
      title: { zh: "我們的計算工具如何自動比較", en: "How our optimizer compares the options" },
      content: {
        zh: (
          <p>
            是否需要選擇個人入息課稅，往往要逐個情境試算才知道哪個方案稅款最低 — 本網站的計算精靈及結果頁面，
            會自動列出你（及配偶，如適用）所有合法可行的組合：分開評稅、薪俸稅聯合評稅、
            單獨選擇個人入息課稅、夫婦聯合選擇個人入息課稅，逐一計出總稅款，
            選出總稅款最低的方案，並用淺白文字解釋為何選擇該方案（例如「因為你出租單位的按揭利息
            及業務虧損可以在個人入息課稅下扣除」）。你只需要輸入資料一次，無須自行逐個情境手動計算。
          </p>
        ),
        en: (
          <p>
            Whether Personal Assessment is worth electing usually only becomes clear once every scenario is
            actually computed — this site&apos;s wizard and results page do that automatically. They
            enumerate every legally available combination for you (and your spouse, if applicable) —
            separate assessments, joint salaries assessment, PA individually, and PA jointly — compute the
            total tax under each, and recommend whichever produces the lowest legal total, with a
            plain-language explanation (e.g. &ldquo;because the mortgage interest on your rental flat and
            your business loss become deductible under Personal Assessment&rdquo;). You enter your data once
            and the comparison is done for you.
          </p>
        )
      }
    }
  ];
}

export default function PersonalAssessmentGuidePage() {
  const { lang, t, year } = useI18n();
  const eyebrowTracking = lang === "en" ? "uppercase tracking-[0.18em]" : "";
  const params = getParams(year);
  const sections = useMemo(() => buildSections(params), [params]);

  const example = useMemo(() => {
    const monthlyRent = 20000;
    const consideration = monthlyRent * 12;
    const ratesPaidByOwner = 6000;
    const beforeAllowance = Math.max(consideration - ratesPaidByOwner, 0);
    const repairsAllowance = beforeAllowance * params.propertyTax.repairsAllowancePercent;
    const nav = beforeAllowance - repairsAllowance;
    const propertyTaxAlone = nav * params.propertyTax.rate;

    const mortgageInterest = 90000;
    const mortgageDeduction = Math.min(mortgageInterest, nav);
    const paAggregateIncome = Math.max(nav - mortgageDeduction, 0);
    const paNci = Math.max(paAggregateIncome - params.allowances.basic, 0);
    const paProgressiveTax = computeBands(paNci, params.progressiveBands);
    const paStandardTax = computeBands(paAggregateIncome, params.standardRateTiers);
    const paTaxBeforeReduction = Math.min(paProgressiveTax, paStandardTax);
    const paReduction = Math.min(paTaxBeforeReduction * params.taxReduction.percent, params.taxReduction.cap);
    const paFinalTax = paTaxBeforeReduction - paReduction;

    const saving = propertyTaxAlone - paFinalTax;

    return {
      nav,
      propertyTaxAlone,
      mortgageInterest,
      mortgageDeduction,
      paAggregateIncome,
      paNci,
      paTaxBeforeReduction,
      paReduction,
      paFinalTax,
      saving
    };
  }, [params]);

  return (
    <main>
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="max-w-3xl">
            <p className={`text-xs font-bold text-teal-700 sm:text-sm ${eyebrowTracking}`}>
              {lang === "zh" ? "稅務指南" : "Guides"} · {t(`header.year.${year}`)}
            </p>
            <h1 className="display-hero mt-4 max-w-4xl">
              {lang === "zh" ? "個人入息課稅詳解" : "Personal Assessment Explained"}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-warm-700">
              {lang === "zh"
                ? "「個人入息課稅」是香港稅制中最容易被誤解的一環 —— 很多人以為它是第四種獨立的稅，其實它只是一個選擇性的合併計稅方法。本指南講解它的運作原理、哪些人受惠、夫婦選擇規則，以及為何值得逐一試算。"
                : "Personal Assessment is one of the most misunderstood parts of the Hong Kong tax system — many people assume it is a fourth, separate tax, when it is really an elective way of combining your figures. This guide explains how it works, who benefits, the married-couple election rules, and why it's worth computing every time."}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="max-w-4xl space-y-8">
            {sections.map((section) => (
              <article key={section.id} className="card p-6 sm:p-8">
                <h2 className="display-subsection">{section.title[lang]}</h2>
                <div className="mt-5 max-w-[65ch] space-y-4 text-base leading-7 text-warm-700 sm:leading-8">{section.content[lang]}</div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="card max-w-4xl p-6 sm:p-8">
            <h2 className="display-subsection">
              {lang === "zh" ? "計算示例：有按揭的業主" : "Worked example: a landlord with a mortgage"}
            </h2>
            <p className="mt-4 max-w-[65ch] text-base leading-7 text-warm-700">
              {lang === "zh"
                ? `延續物業稅指南的示例（NAV 為 ${hkd(example.nav, "zh")}），假設這位業主當年有 ${hkd(example.mortgageInterest, "zh")} 按揭利息，並沒有其他入息或免稅額（只有基本免稅額）。`
                : `Continuing the example from the property tax guide (NAV of ${hkd(example.nav, "en")}), assume this landlord paid ${hkd(example.mortgageInterest, "en")} of mortgage interest that year, with no other income and only the basic allowance.`}
            </p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2 sm:col-span-2">
                <dt className="text-warm-700">{lang === "zh" ? "單獨計物業稅" : "Property tax alone"}</dt>
                <dd className="font-semibold text-navy-900">{hkd(example.propertyTaxAlone, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "按揭利息扣除（上限為 NAV）" : "Mortgage interest deducted (capped at NAV)"}</dt>
                <dd className="font-semibold text-navy-900">-{hkd(example.mortgageDeduction, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "個人入息課稅合併入息" : "PA aggregate income"}</dt>
                <dd className="font-semibold text-navy-900">{hkd(example.paAggregateIncome, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "應課稅入息實額（NCI）" : "Net chargeable income (NCI)"}</dt>
                <dd className="font-semibold text-navy-900">{hkd(example.paNci, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "一次性寬減" : "One-off reduction"}</dt>
                <dd className="font-semibold text-navy-900">-{hkd(example.paReduction, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="font-semibold text-navy-900">{lang === "zh" ? "個人入息課稅下應繳稅款" : "Tax payable under Personal Assessment"}</dt>
                <dd className="font-bold text-navy-900">{hkd(example.paFinalTax, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 pb-2 sm:col-span-2">
                <dt className="font-semibold text-navy-900">{lang === "zh" ? "選擇個人入息課稅可節省" : "Saving from electing Personal Assessment"}</dt>
                <dd className="font-bold text-teal-700">{hkd(Math.max(example.saving, 0), lang)}</dd>
              </div>
            </dl>
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-14 sm:py-16">
        <Container>
          <div className="card max-w-4xl p-6 text-sm leading-6 text-warm-700">
            <p>
              {lang === "zh"
                ? "本頁內容僅供教育及參考用途，並非稅務意見，亦沒有考慮閣下個人情況。本網站並非香港稅務局網站，亦與稅務局無從屬關係。如有疑問，請參閱稅務局最新指引或諮詢專業稅務顧問。"
                : "This page is provided for general education and reference only. It is not tax advice and does not take account of your personal circumstances. This website is not the Inland Revenue Department's website and is not affiliated with the IRD. For authoritative guidance, consult the IRD's current guidance or a qualified tax adviser."}
            </p>
            <Link href="/guides" className="mt-4 inline-block font-semibold text-teal-700 hover:underline">
              {lang === "zh" ? "← 返回稅務指南" : "← Back to guides"}
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
