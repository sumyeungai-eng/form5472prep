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
      title: { zh: "個人入息課稅其實係咩", en: "What Personal Assessment actually is" },
      content: {
        zh: (
          <>
            <p>
              個人入息課稅（俗稱「入息稅」）<strong>唔係香港嘅第四種稅</strong>，
              而係一種選擇性嘅「合併計稅」方法。你可以選擇將全年嘅物業應評稅淨值、
              薪俸稅應評稅入息淨額，同利得稅應評稅利潤（你個人／夫婦分佔嘅部分）三項合併埋一齊，
              再用薪俸稅嗰套扣除、免稅額同稅率計法（累進稅率 vs 標準稅率取較低者）計出一個總稅款，
              同你分開俾三種稅嘅總和比較，揀較低嗰個。
            </p>
            <p>
              關鍵在於「選擇」二字 — 你或你夫婦要喺限期內主動向稅務局提出選擇個人入息課稅，
              稅務局唔會自動幫你套用；亦唔會喺對你不利時仍然強制執行 — 如果計出嚟個人入息課稅
              反而要俾多啲，你隨時可以喺限期內撤回選擇。
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
      title: { zh: "邊啲人揀選會慳到稅", en: "Who benefits from electing it" },
      content: {
        zh: (
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>有按揭嘅業主</strong> — 單獨計物業稅唔可以扣按揭利息，但個人入息課稅可以扣
              （上限為該物業嘅 NAV），業主往往可以慳到唔少稅款。
            </li>
            <li>
              <strong>有業務虧損嘅人</strong> — 單獨計利得稅嘅虧損只可以結轉去下年，
              但個人入息課稅可以將虧損即時抵銷你嗰年其他收入（例如薪俸或租金）。
            </li>
            <li>
              <strong>入息偏低嘅業主／小生意經營者</strong> — 物業稅（{pct(propertyTax.rate, "zh")} 單一稅率）
              同利得稅嘅兩級制優惠稅階，都冇考慮你嘅個人免稅額。如果你整體入息唔算高，
              將所有入息合併再套用免稅額同累進稅率，好可能全部都好慳過分開計。
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
      title: { zh: "邊啲人唔會受惠", en: "Who doesn't benefit" },
      content: {
        zh: (
          <p>
            如果你嘅薪俸稅已經係用標準稅率計算（即入息高過某個水平，累進稅率反而計出更多稅款），
            而且你冇按揭利息、業務虧損之類可以額外扣除嘅項目，咁合併埋薪俸、租金同業務利潤，
            往往只會令更多入息推入標準稅率嘅計算基礎，未必有著數，甚至有可能要俾多啲。
            呢類高入息、扣除項目相對少嘅納稅人，一般揀分開評稅較着數。
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
              如果只有一方喺該課稅年度有應課稅入息（另一方完全冇入息），有入息嗰一方可以
              <strong>單獨</strong>選擇個人入息課稅，唔需要對方一齊選。
            </li>
            <li>
              如果夫婦雙方喺該課稅年度都有應課稅入息，兩人就<strong>必須一齊選擇</strong>
              個人入息課稅 — 唔可以一方揀、一方唔揀；亦唔可以各自揀完再喺呢兩個「個人入息課稅」
              評稅之間扮成分開評稅。
            </li>
            <li>
              夫婦一齊選擇個人入息課稅時，會將雙方所有入息合併評稅，並使用已婚人士免稅額；
              最終稅款會按雙方各自入息比例攤分繳付責任。
            </li>
          </ul>
        ),
        en: (
          <ul className="list-disc space-y-2 pl-5">
            <li>
              If only one spouse has chargeable income for the year (the other has none at all), the spouse
              with income may elect Personal Assessment <strong>individually</strong> — the other spouse
              does not need to join the election.
            </li>
            <li>
              If both spouses have chargeable income for the year, they <strong>must elect jointly</strong>{" "}
              — one spouse cannot elect while the other opts out, and they cannot each separately claim PA
              as if they were still assessed apart.
            </li>
            <li>
              When a couple elects jointly, all of both spouses&apos; income is aggregated and taxed as one,
              using the married person&apos;s allowance; the resulting liability is then apportioned between
              the spouses by their respective share of income.
            </li>
          </ul>
        )
      }
    },
    {
      id: "optimizer",
      title: { zh: "我哋嘅計算工具點樣自動比較", en: "How our optimizer compares the options" },
      content: {
        zh: (
          <p>
            個人入息課稅要唔要揀，往往要逐個情境試計先知道邊個最平 — 呢個網站嘅計算精靈同結果頁面，
            會自動列出你（同配偶，如適用）所有合法可行嘅組合：分開評稅、薪俸稅聯合評稅、
            單獨選擇個人入息課稅、夫婦聯合選擇個人入息課稅，逐一計出總稅款，
            揀出總稅款最低嗰個方案，並用淺白文字解釋點解揀呢個方案（例如「因為你出租單位嘅按揭利息
            同業務虧損可以喺個人入息課稅下扣除」）。你只需要輸入資料一次，唔使自己逐個情境手動計。
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
      <section className="bg-white py-14 sm:py-16">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
              {lang === "zh" ? "稅務指南" : "Guides"} · {t(`header.year.${year}`)}
            </p>
            <h1 className="mt-3 text-3xl font-bold text-navy-900 sm:text-4xl">
              {lang === "zh" ? "個人入息課稅詳解" : "Personal Assessment Explained"}
            </h1>
            <p className="mt-5 text-base leading-7 text-warm-700">
              {lang === "zh"
                ? "「個人入息課稅」係香港稅制入面最容易被誤解嘅一環 —— 好多人以為佢係第四種獨立嘅稅，其實佢只係一個選擇性嘅合併計稅方法。本指南講解佢嘅運作原理、邊啲人受惠、夫婦選擇規則，以及點解值得逐一試計。"
                : "Personal Assessment is one of the most misunderstood parts of the Hong Kong tax system — many people assume it is a fourth, separate tax, when it is really an elective way of combining your figures. This guide explains how it works, who benefits, the married-couple election rules, and why it's worth computing every time."}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-12 sm:py-16">
        <Container>
          <div className="space-y-10">
            {sections.map((section) => (
              <article key={section.id} className="card p-6">
                <h2 className="text-xl font-bold text-navy-900">{section.title[lang]}</h2>
                <div className="mt-4 space-y-3 text-sm leading-6 text-warm-700">{section.content[lang]}</div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <Container>
          <div className="card p-6">
            <h2 className="text-xl font-bold text-navy-900">
              {lang === "zh" ? "計算示例：有按揭嘅業主" : "Worked example: a landlord with a mortgage"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-warm-700">
              {lang === "zh"
                ? `延續物業稅指南嘅示例（NAV 為 ${hkd(example.nav, "zh")}），假設呢位業主當年有 ${hkd(example.mortgageInterest, "zh")} 按揭利息，並冇其他入息或免稅額（只有基本免稅額）。`
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
                <dt className="font-semibold text-navy-900">{lang === "zh" ? "揀個人入息課稅慳到" : "Saving from electing Personal Assessment"}</dt>
                <dd className="font-bold text-teal-700">{hkd(Math.max(example.saving, 0), lang)}</dd>
              </div>
            </dl>
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-10">
        <Container>
          <div className="rounded-lg border border-warm-200 bg-white p-6 text-sm leading-6 text-warm-700">
            <p>
              {lang === "zh"
                ? "本頁內容僅供教育及參考用途，並非稅務意見，亦冇考慮閣下個人情況。本網站並非香港稅務局網站，亦與稅務局無從屬關係。如有疑問，請參閱稅務局最新指引或諮詢專業稅務顧問。"
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
