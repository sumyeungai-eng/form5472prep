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
      title: { zh: "哪些人要報利得稅", en: "Who files" },
      content: {
        zh: (
          <p>
            以獨資經營或合夥形式在香港經營行業、專業或業務的個人，須就其在香港產生或得自香港的
            應評稅利潤繳納利得稅。獨資經營者一般在個人報稅表 BIR60 的第 5 部分申報業務詳情及利潤；
            合夥業務本身可能需要另行提交合夥業務報稅表，而每位合夥人分佔的利潤，仍然要在自己的
            BIR60 第 5 部分申報，一併計入個人的整體稅務狀況（例如會否選擇個人入息課稅）。
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
      title: { zh: "應評稅利潤如何計算", en: "How assessable profits are computed" },
      content: {
        zh: (
          <p>
            應評稅利潤以你的會計利潤為起點，再按稅務規則作出調整：加回不可扣除的開支（見下文）、
            剔除不屬應課稅的收入項目，然後扣減折舊免稅額，得出該年度的應評稅利潤。
            如有從上年度結轉下來的虧損，亦會在這一步扣減。
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
            <li>私人或家庭性質的開支（例如非因業務需要的個人生活費用）。</li>
            <li>資本性開支（例如購置資產或進行改良工程的成本 — 這類開支須透過折舊免稅額分年扣除，而不是在該年一筆過扣除）。</li>
            <li>以薪金名義支付給獨資經營者本人或其配偶的款項，以及就經營者投入資本所計算的利息。</li>
            <li>非慈善性質的捐款，或捐給未經稅務局認可的機構的捐款。</li>
            <li>任何並非為賺取應課稅利潤而招致的開支、一般性撥備／準備金、罰款，以及利得稅本身。</li>
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
      title: { zh: "折舊免稅額 — 簡化說明", en: "Capital allowances — a simplified explanation" },
      content: {
        zh: (
          <p>
            用於業務的機械及工業裝置等資產，通常不可在購入該年一筆過扣除全部成本，而是按稅務局訂明的類別
            歸入「資產組別」：在購入該年度先獲得初期免稅額，其後每年再按遞減價值方式獲得年度免稅額，
            直至該組別的結餘用盡或資產出售為止；工業及商業建築物另設一套獨立而較為複雜的免稅額制度。
            由於具體百分比因資產類別而異，亦會不時隨政策調整，如你有相當數量的機械設備或建築物投資，
            建議使用本網站計算工具內的進階輸入，或直接查閱稅務局最新指引，以取得準確的免稅額比率。
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
              合資格的獨資經營／合夥業務，首 {hkd(profitsTax.tierOneCap, "zh")} 應評稅利潤按{" "}
              {pct(profitsTax.tierOneRate, "zh")} 稅率計稅，超出部分按 {pct(profitsTax.standardRate, "zh")}{" "}
              標準稅率計稅。
            </p>
            <p>
              <strong>一組有關連實體只可由其中一個享用兩級制</strong> — 如果你同時經營多於一項業務，
              或你的業務與其他實體（例如配偶名下的業務、由你控制的公司）互為「有關連實體」，
              則在同一組有關連實體之中，只可由其中一個實體享用兩級制稅率；其餘實體的全部利潤，
              一律按標準稅率 {pct(profitsTax.standardRate, "zh")} 計稅，不會享有首 {hkd(profitsTax.tierOneCap, "zh")}{" "}
              的較低稅階。報稅表會問及「有關連實體」的情況，務必如實申報。
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
            業務虧損可以無限期結轉，在日後年度的應評稅利潤中扣除（同一項業務，或在規則容許下同一納稅人
            的其他應評稅利潤），直至用盡為止；利得稅並不容許將虧損追溯抵銷過往年度已課稅的利潤。
            另一個做法是在虧損的該年度選擇個人入息課稅，將業務虧損即時抵銷你該年其他來源的入息
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
            利得稅同樣受惠於財政預算案的一次性寬減，最終應繳利得稅可獲寬減{" "}
            {pct(taxReduction.percent, "zh")}，每宗個案上限 {hkd(taxReduction.cap, "zh")}，
            但只適用於最終評稅，不適用於下一年度的暫繳利得稅。
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
  const eyebrowTracking = lang === "en" ? "uppercase tracking-[0.18em]" : "";
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
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="max-w-3xl">
            <p className={`text-xs font-bold text-teal-700 sm:text-sm ${eyebrowTracking}`}>
              {lang === "zh" ? "稅務指南" : "Guides"} · {t(`header.year.${year}`)}
            </p>
            <h1 className="display-hero mt-4 max-w-4xl">
              {lang === "zh" ? "利得稅（獨資／合夥）指南" : "Profits Tax (Sole Prop / Partnership) Guide"}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-warm-700">
              {lang === "zh"
                ? "如果你以獨資經營或合夥形式在香港經營業務，便須就業務利潤繳納利得稅。本指南集中講解與個人及獨資／合夥業務相關的利得稅規則，不涵蓋有限公司的利得稅。"
                : "If you run a business in Hong Kong as a sole proprietor or partner, you are liable to profits tax on the business's profits. This guide focuses on the profits tax rules relevant to individuals and unincorporated businesses — it does not cover limited company (corporate) profits tax."}
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
              {lang === "zh" ? "計算示例" : "Worked example"}
            </h2>
            <p className="mt-4 max-w-[65ch] text-base leading-7 text-warm-700">
              {lang === "zh"
                ? `假設一項獨資業務全年應評稅利潤為 ${hkd(example.assessableProfits, "zh")}，並符合資格享用兩級制稅率（同一組有關連實體之中並無其他業務已使用這項稅率）。`
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
