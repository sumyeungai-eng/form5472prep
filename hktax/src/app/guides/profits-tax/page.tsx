"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { useI18n } from "@/lib/i18n/useI18n";
import { getParams } from "@/lib/tax/params";

type TaxParams = ReturnType<typeof getParams>;
type Lang = "zh" | "en";

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

function buildSections(params: TaxParams): Section[] {
  const { profitsTax, taxReduction } = params;

  return [
    {
      id: "who",
      title: { zh: "邊啲人要報利得稅", en: "Who files" },
      content: {
        zh: (
          <p>
            以獨資經營或合夥形式喺香港經營行業、專業或業務嘅個人，就其源自香港嘅應評稅利潤，
            要負責繳交利得稅。獨資經營者一般喺個人報稅表 BIR60 嘅第 5 部分申報業務詳情及利潤；
            合夥業務本身可能需要另行提交合夥業務報稅表，而每位合夥人分佔嘅利潤，仍然要喺自己嘅
            BIR60 第 5 部分申報，一併計入個人嘅整體稅務狀況（例如會否揀個人入息課稅）。
          </p>
        ),
        en: (
          <p>
            An individual who carries on a trade, profession, or business in Hong Kong as a sole proprietor
            or as a partner is chargeable to profits tax on the Hong Kong-sourced assessable profits.
            Sole proprietors generally report the business and its profits in Part 5 of the individual tax
            return, BIR60. A partnership itself may need to file its own partnership return, but each
            partner&apos;s share of the profit still needs to be reported in Part 5 of that partner&apos;s
            own BIR60, and feeds into their overall tax position (including whether Personal Assessment is
            worth electing).
          </p>
        )
      }
    },
    {
      id: "assessable-profits",
      title: { zh: "應評稅利潤點計", en: "How assessable profits are computed" },
      content: {
        zh: (
          <p>
            應評稅利潤源自你嘅商業會計利潤，再按稅務規則調整：加返唔可扣除嘅開支（見下）、
            扣走唔屬應課稅嘅收入項目，再扣減折舊（資本）免稅額，得出嗰年嘅應評稅利潤。
            如果有上年度結轉落嚟嘅虧損，亦會喺呢一步扣減。
          </p>
        ),
        en: (
          <p>
            Assessable profits start from your accounting profit and are then adjusted under tax rules: add
            back non-deductible expenses (see below), deduct any items that are not chargeable income, and
            deduct capital allowances, arriving at the year&apos;s assessable profits. Any loss carried
            forward from a prior year is also deducted at this stage.
          </p>
        )
      }
    },
    {
      id: "non-deductible",
      title: { zh: "常見不可扣除項目", en: "Common non-deductible items" },
      content: {
        zh: (
          <ul className="list-disc space-y-2 pl-5">
            <li>私人或家庭性質嘅開支（例如非因業務需要嘅個人生活費用）。</li>
            <li>資本性開支（例如購置資產、裝修改動嘅成本 — 呢類開支要透過折舊免稅額分年扣除，而唔係即年一筆過扣除）。</li>
            <li>業主／獨資經營者本人（或其配偶）當作「支薪」畀自己嘅款項，以及本人資本嘅利息。</li>
            <li>非慈善捐款，或者捐畀未經稅務局認可機構嘅捐款。</li>
            <li>任何並非為賺取應課稅利潤而招致嘅開支、一般性撥備／準備金、罰款及利得稅本身。</li>
          </ul>
        ),
        en: (
          <ul className="list-disc space-y-2 pl-5">
            <li>Private or domestic expenses (personal living costs not incurred for the business).</li>
            <li>
              Capital expenditure (the cost of acquiring assets or making improvements — this is recovered
              over time through capital allowances, not deducted in full in the year incurred).
            </li>
            <li>Amounts treated as &ldquo;salary&rdquo; paid to the proprietor or their spouse, and interest on the proprietor&apos;s own capital.</li>
            <li>Non-charitable donations, or donations to bodies not approved by the IRD.</li>
            <li>Any expense not incurred in producing chargeable profits, general provisions/reserves, fines, and profits tax itself.</li>
          </ul>
        )
      }
    },
    {
      id: "capital-allowances",
      title: { zh: "折舊（資本）免稅額 — 簡化說明", en: "Capital allowances — a simplified explanation" },
      content: {
        zh: (
          <p>
            用喺業務嘅機器、設備等資產，通常唔可以即年一筆過扣除全部成本，而係按稅務局訂明嘅類別歸類做
            「資產組別」，喺購入嗰年先扣一個初期免稅額，之後每年再按遞減結餘方式扣一個年度免稅額，
            直至組別結餘用盡或資產出售為止；工業／商業樓宇另設一套獨立、較為複雜嘅免稅額制度。
            由於具體百分比會因資產類別而異、亦不時因政策調整，如你有相當數量嘅機器設備或樓宇投資，
            建議使用本網站計算工具入面嘅進階輸入，或直接查閱稅務局最新指引以取得準確嘅免稅額比率。
          </p>
        ),
        en: (
          <p>
            Plant and machinery used in the business generally cannot be expensed in full in the year of
            purchase. Instead, assets are pooled by class, an initial allowance is given in the year of
            purchase, and an annual (writing-down) allowance is then given each year on the pool&apos;s
            reducing balance until the pool is exhausted or the asset is disposed of. Commercial and
            industrial buildings sit under a separate, more complex allowance regime. Because the exact
            percentages vary by asset class and can change with policy, if you have significant plant,
            machinery, or building investment, use the advanced inputs in this site&apos;s calculators, or
            check the IRD&apos;s current guidance directly for the precise rates.
          </p>
        )
      }
    },
    {
      id: "two-tier",
      title: { zh: "兩級制利得稅率", en: "The two-tiered profits tax rate" },
      content: {
        zh: (
          <>
            <p>
              合資格嘅獨資經營／合夥業務，首 {hkd(profitsTax.tierOneCap, "zh")} 應評稅利潤按{" "}
              {pct(profitsTax.tierOneRate, "zh")} 稅率計稅，超出部分按 {pct(profitsTax.standardRate, "zh")}{" "}
              標準稅率計稅。
            </p>
            <p>
              <strong>「一組相聯實體只可選一間享用兩級制」規則</strong> — 如果你同時經營多於一盤生意，
              或者你嘅業務同其他實體（例如配偶名下嘅業務、你控制嘅公司）屬於「相聯實體」，
              喺一組相聯實體入面，只可以揀其中一間享用兩級制優惠稅率；其餘實體嘅全部利潤，
              一律按標準稅率 {pct(profitsTax.standardRate, "zh")} 計稅，冇首 {hkd(profitsTax.tierOneCap, "zh")}{" "}
              優惠稅階。報稅表會問及呢個「相聯實體」問題，務必如實申報。
            </p>
          </>
        ),
        en: (
          <>
            <p>
              For an eligible sole proprietorship or partnership, the first{" "}
              {hkd(profitsTax.tierOneCap, "en")} of assessable profits is taxed at{" "}
              {pct(profitsTax.tierOneRate, "en")}, and profits above that are taxed at the{" "}
              {pct(profitsTax.standardRate, "en")} standard rate.
            </p>
            <p>
              <strong>The one-election-per-connected-entities rule</strong> — if you run more than one
              business, or your business is connected to other entities (e.g. a business under your
              spouse&apos;s name, or a company you control), only one entity within that connected group
              may benefit from the two-tiered rate. Every other entity in the group is taxed at the flat{" "}
              {pct(profitsTax.standardRate, "en")} standard rate on all of its profits, with no preferential
              first {hkd(profitsTax.tierOneCap, "en")} band. The tax return asks about connected entities —
              answer it accurately.
            </p>
          </>
        )
      }
    },
    {
      id: "losses",
      title: { zh: "虧損結轉", en: "Loss carry-forward" },
      content: {
        zh: (
          <p>
            業務虧損可以無限期結轉，喺未來年度嘅應評稅利潤中扣除（同一盤生意，或按規則容許嘅同一納稅人
            嘅其他應評稅利潤），直至用盡為止；利得稅並唔容許將虧損向前結轉抵銷過往年度已完稅嘅利潤。
            另一個做法係喺蝕錢嘅嗰一年選擇個人入息課稅，將業務虧損即時抵銷你嗰年其他來源嘅入息
            （例如薪俸或租金），詳見
            {" "}
            <Link href="/guides/personal-assessment" className="font-semibold text-teal-700 hover:underline">
              個人入息課稅詳解
            </Link>
            。
          </p>
        ),
        en: (
          <p>
            Business losses can be carried forward indefinitely and set off against future assessable
            profits (of the same business, or against the same taxpayer&apos;s other assessable profits
            where the rules allow) until fully used. Profits tax does not allow carrying a loss back against
            profits already taxed in an earlier year. An alternative is to elect Personal Assessment in the
            loss year, which can set the business loss off immediately against your other income for that
            year (e.g. salary or rental income) — see{" "}
            <Link href="/guides/personal-assessment" className="font-semibold text-teal-700 hover:underline">
              Personal Assessment explained
            </Link>
            .
          </p>
        )
      }
    },
    {
      id: "reduction",
      title: { zh: "一次性寬減", en: "The one-off tax reduction" },
      content: {
        zh: (
          <p>
            利得稅同樣受惠於財政預算案嘅一次性寬減，最終應繳利得稅可獲寬減{" "}
            {pct(taxReduction.percent, "zh")}，每宗個案上限 {hkd(taxReduction.cap, "zh")}，
            但只適用於最終評稅，唔適用於下一年度嘅暫繳利得稅。
          </p>
        ),
        en: (
          <p>
            Profits tax also benefits from the Budget&apos;s one-off reduction: final profits tax payable is
            reduced by {pct(taxReduction.percent, "en")}, capped at {hkd(taxReduction.cap, "en")} per case —
            but only for the final assessment, not for the following year&apos;s provisional profits tax.
          </p>
        )
      }
    }
  ];
}

export default function ProfitsTaxGuidePage() {
  const { lang, t, year } = useI18n();
  const params = getParams(year);
  const sections = useMemo(() => buildSections(params), [params]);

  const example = useMemo(() => {
    const assessableProfits = params.profitsTax.tierOneCap + 600000;
    const tierOneTax = params.profitsTax.tierOneCap * params.profitsTax.tierOneRate;
    const remainder = assessableProfits - params.profitsTax.tierOneCap;
    const remainderTax = remainder * params.profitsTax.standardRate;
    const taxBeforeReduction = tierOneTax + remainderTax;
    const reduction = Math.min(taxBeforeReduction * params.taxReduction.percent, params.taxReduction.cap);
    const finalTax = taxBeforeReduction - reduction;

    return { assessableProfits, tierOneTax, remainder, remainderTax, taxBeforeReduction, reduction, finalTax };
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
              {lang === "zh" ? "利得稅（獨資／合夥）指南" : "Profits Tax (Sole Prop / Partnership) Guide"}
            </h1>
            <p className="mt-5 text-base leading-7 text-warm-700">
              {lang === "zh"
                ? "如果你以獨資經營或合夥形式喺香港做生意，就要就業務利潤繳交利得稅。本指南集中講解個人／獨資業務相關嘅利得稅規則，唔涵蓋有限公司嘅利得稅。"
                : "If you run a business in Hong Kong as a sole proprietor or partner, you are liable to profits tax on the business's profits. This guide focuses on the profits tax rules relevant to individuals and unincorporated businesses — it does not cover limited company (corporate) profits tax."}
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
              {lang === "zh" ? "計算示例" : "Worked example"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-warm-700">
              {lang === "zh"
                ? `假設一盤獨資業務全年應評稅利潤為 ${hkd(example.assessableProfits, "zh")}，並符合資格享用兩級制稅率（相聯實體之中並冇其他業務已使用呢個優惠）。`
                : `Assume a sole proprietorship has assessable profits of ${hkd(example.assessableProfits, "en")} for the year and is eligible for the two-tiered rate (no other entity in its connected group has already used the election).`}
            </p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">
                  {lang === "zh"
                    ? `首 ${hkd(params.profitsTax.tierOneCap, "zh")} 按 ${pct(params.profitsTax.tierOneRate, "zh")}`
                    : `First ${hkd(params.profitsTax.tierOneCap, "en")} at ${pct(params.profitsTax.tierOneRate, "en")}`}
                </dt>
                <dd className="font-semibold text-navy-900">{hkd(example.tierOneTax, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">
                  {lang === "zh"
                    ? `餘額 ${hkd(example.remainder, "zh")} 按 ${pct(params.profitsTax.standardRate, "zh")}`
                    : `Remaining ${hkd(example.remainder, "en")} at ${pct(params.profitsTax.standardRate, "en")}`}
                </dt>
                <dd className="font-semibold text-navy-900">{hkd(example.remainderTax, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "寬減前利得稅" : "Tax before reduction"}</dt>
                <dd className="font-semibold text-navy-900">{hkd(example.taxBeforeReduction, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "一次性寬減" : "One-off reduction"}</dt>
                <dd className="font-semibold text-navy-900">-{hkd(example.reduction, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 pb-2 sm:col-span-2">
                <dt className="font-semibold text-navy-900">{lang === "zh" ? "應繳利得稅" : "Profits tax payable"}</dt>
                <dd className="font-bold text-teal-700">{hkd(example.finalTax, lang)}</dd>
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
