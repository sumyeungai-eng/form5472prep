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
  const { propertyTax, taxReduction } = params;

  return [
    {
      id: "nav",
      title: { zh: "應評稅淨值（NAV）如何計算", en: "How the net assessable value (NAV) is computed" },
      content: {
        zh: (
          <>
            <p>物業稅按物業的「應評稅淨值」（Net Assessable Value，簡稱 NAV）計算，步驟如下：</p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                <strong>代價總額</strong> — 你該年應收的租金總額，包括租金、簽約時收取而按租期攤分的
                租約溢價（premium），以及租客直接支付、原本屬於業主責任的款項（例如管理費由租客代付）。
              </li>
              <li>
                <strong>減：不能收回的租金</strong> — 已經盡力追討仍然未能收回、經稅務局接納為壞帳的租金，
                可以在該年扣減；日後如果追回，就要在追回的年度重新計入應課稅入息。
              </li>
              <li>
                <strong>減：業主支付的差餉</strong> — 如果差餉是由業主（而不是租客）支付，可以全數扣減；
                由租客支付的差餉不可以扣除。
              </li>
              <li>
                <strong>減：法定修葺及支出免稅額</strong> — 不需要提供收據，稅務局會自動在上述淨額基礎上
                扣除 {pct(propertyTax.repairsAllowancePercent, "zh")} 作為法定修葺及支出免稅額，計出最終的 NAV。
              </li>
            </ol>
          </>
        ),
        en: (
          <>
            <p>Property tax is charged on the property&apos;s Net Assessable Value (NAV), computed as:</p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                <strong>Total consideration</strong> — the total rent receivable for the year, including
                any lease premium apportioned over the lease term, plus any sum the tenant pays directly
                that would otherwise be the owner&apos;s responsibility (e.g. management fees paid by the
                tenant on the owner&apos;s behalf).
              </li>
              <li>
                <strong>Less: irrecoverable rent</strong> — rent you have taken reasonable steps to collect
                but which the IRD accepts as a bad debt can be deducted for that year; if you later recover
                it, the recovered amount is taxed in the year you receive it.
              </li>
              <li>
                <strong>Less: rates paid by the owner</strong> — rates are deductible only if the owner (not
                the tenant) pays them.
              </li>
              <li>
                <strong>Less: statutory repairs and outgoings allowance</strong> — no receipts required; the
                IRD automatically deducts {pct(propertyTax.repairsAllowancePercent, "en")} of the figure
                above as a flat repairs and outgoings allowance, arriving at the final NAV.
              </li>
            </ol>
          </>
        )
      }
    },
    {
      id: "rate",
      title: { zh: "物業稅稅率", en: "The property tax rate" },
      content: {
        zh: (
          <p>
            物業稅稅款 = NAV × {pct(propertyTax.rate, "zh")}。與薪俸稅或利得稅不同，物業稅沒有累進稅階，
            亦沒有兩級制，一律以單一稅率計算，不會因應入息高低而有不同稅率。
          </p>
        ),
        en: (
          <p>
            Property tax payable = NAV × {pct(propertyTax.rate, "en")}. Unlike salaries tax or profits tax,
            there are no progressive bands and no two-tiered rate — a single flat rate applies regardless of
            how much rental income you have.
          </p>
        )
      }
    },
    {
      id: "co-ownership",
      title: { zh: "共同擁有物業", en: "Co-ownership" },
      content: {
        zh: (
          <p>
            物業由多於一位業主共同擁有時，物業稅一般會按各業主的實際擁有份額分攤：如果是「分權共有」
            （tenants in common，各人持有明確份額），稅務局會按各人份額分別評稅；如果是「聯權共有」
            （joint tenants，各人份額相同且不可分割），一般會視作一個評稅單位共同評稅。實際分類同申報方式，
            應以物業契約及稅務局評稅通知書為準。
          </p>
        ),
        en: (
          <p>
            When a property has more than one owner, property tax is generally apportioned by each
            owner&apos;s actual share. Tenants in common (each holding a defined share) are typically
            assessed separately on their respective share, while joint tenants (equal, undivided shares)
            are typically assessed together as a single body. The precise classification and reporting
            follow the title deed and the IRD&apos;s assessment notice.
          </p>
        )
      }
    },
    {
      id: "premium",
      title: { zh: "租約溢價攤分", en: "Lease premium spreading" },
      content: {
        zh: (
          <p>
            如果你在簽訂租約時一次收取一筆「溢價」（premium），一般不會即時全數計入該年度的租金收入，
            而是按租期平均攤分作為每年的租金收入計稅，攤分年期在法例下設有上限。實際攤分方法及年期上限
            請查閱稅務局最新指引，或於申報時向稅務局查詢，以免計錯攤分年期而多報或少報租金收入。
          </p>
        ),
        en: (
          <p>
            A lump-sum premium received when granting a lease is generally not taxed in full in the year
            you receive it. Instead, it is spread evenly as rental income over the lease term, subject to a
            statutory cap on the spreading period set out in the Inland Revenue Ordinance. Check the IRD&apos;s
            current guidance (or ask the IRD directly when filing) for the exact spreading period that
            applies to your lease, to avoid over- or under-reporting rental income.
          </p>
        )
      }
    },
    {
      id: "no-reduction",
      title: { zh: "為何物業稅沒有一次性寬減", en: "Why property tax gets no one-off reduction" },
      content: {
        zh: (
          <p>
            財政預算案宣布的一次性稅款寬減，適用範圍限於：
            {" "}
            {taxReduction.appliesTo
              .map((headKey) =>
                headKey === "salaries" ? "薪俸稅" : headKey === "profits" ? "利得稅" : "個人入息課稅"
              )
              .join("、")}
            。物業稅並不包括在寬減範圍之內 —
            即使你的物業稅款很低，也不會有這項寬減。如果你名下物業有按揭利息開支，
            不妨參閱下面「個人入息課稅」如何可能幫助你進一步節省稅款。
          </p>
        ),
        en: (
          <p>
            The Budget&apos;s one-off reduction applies only to:{" "}
            {taxReduction.appliesTo
              .map((headKey) =>
                headKey === "salaries" ? "salaries tax" : headKey === "profits" ? "profits tax" : "tax under Personal Assessment"
              )
              .join(", ")}
            . Property tax is not included in that list — even a small property tax bill does not receive
            this reduction. If you have mortgage interest on the let property, see how electing{" "}
            <Link href="/guides/personal-assessment" className="font-semibold text-teal-700 hover:underline">
              Personal Assessment
            </Link>{" "}
            below may help further.
          </p>
        )
      }
    },
    {
      id: "personal-assessment",
      title: { zh: "個人入息課稅何時能幫助業主", en: "When Personal Assessment helps landlords" },
      content: {
        zh: (
          <p>
            單獨計算物業稅時，供款買樓的按揭利息是<strong>不可以</strong>扣除的 —
            只有差餉及法定修葺免稅額可以扣除。但如果你選擇個人入息課稅，就可以將該物業的按揭利息
            （上限為該物業的 NAV）在合併入息中扣除，有可能令你的總體稅款低於單獨計算物業稅。
            詳情請參閱{" "}
            <Link href="/guides/personal-assessment" className="font-semibold text-teal-700 hover:underline">
              個人入息課稅詳解
            </Link>
            。
          </p>
        ),
        en: (
          <p>
            Under property tax alone, mortgage interest on the loan used to buy the let property is{" "}
            <strong>not</strong> deductible — only rates and the statutory repairs allowance are. If you
            elect Personal Assessment instead, mortgage interest on that property (capped at the
            property&apos;s NAV) becomes deductible against your aggregated income, which can result in a
            lower overall bill than paying property tax alone. See{" "}
            <Link href="/guides/personal-assessment" className="font-semibold text-teal-700 hover:underline">
              Personal Assessment explained
            </Link>{" "}
            for details.
          </p>
        )
      }
    }
  ];
}

export default function PropertyTaxGuidePage() {
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
    const tax = nav * params.propertyTax.rate;

    return { monthlyRent, consideration, ratesPaidByOwner, beforeAllowance, repairsAllowance, nav, tax };
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
              {lang === "zh" ? "物業稅指南" : "Property Tax Guide"}
            </h1>
            <p className="mt-5 text-base leading-7 text-warm-700">
              {lang === "zh"
                ? "如果你將香港物業出租收租，就可能要繳交物業稅。物業稅的計算方法比薪俸稅簡單得多，只涉及一個淨值及一個單一稅率，但仍有幾個容易忽略的細節，例如共同擁有、租約溢價，以及它與個人入息課稅的關係。"
                : "If you let out a Hong Kong property, you may be liable to property tax. The computation is much simpler than salaries tax — a single net value and a single flat rate — but there are a few details worth knowing, including co-ownership, lease premiums, and how it interacts with Personal Assessment."}
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
                ? `假設你將單位出租，月租 ${hkd(example.monthlyRent, "zh")}，全年沒有壞帳租金，差餉由業主支付，全年 ${hkd(example.ratesPaidByOwner, "zh")}。`
                : `Assume you let a flat for ${hkd(example.monthlyRent, "en")} per month, no irrecoverable rent for the year, and rates of ${hkd(example.ratesPaidByOwner, "en")} for the year paid by you as the owner.`}
            </p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "全年租金總額" : "Total rent for the year"}</dt>
                <dd className="font-semibold text-navy-900">{hkd(example.consideration, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "減：業主支付差餉" : "Less: rates paid by owner"}</dt>
                <dd className="font-semibold text-navy-900">-{hkd(example.ratesPaidByOwner, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "扣除差餉後淨額" : "Net of rates"}</dt>
                <dd className="font-semibold text-navy-900">{hkd(example.beforeAllowance, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">
                  {lang === "zh"
                    ? `減：法定修葺及支出免稅額（${pct(params.propertyTax.repairsAllowancePercent, "zh")}）`
                    : `Less: statutory repairs allowance (${pct(params.propertyTax.repairsAllowancePercent, "en")})`}
                </dt>
                <dd className="font-semibold text-navy-900">-{hkd(example.repairsAllowance, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "應評稅淨值（NAV）" : "Net assessable value (NAV)"}</dt>
                <dd className="font-semibold text-navy-900">{hkd(example.nav, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 pb-2">
                <dt className="font-semibold text-navy-900">
                  {lang === "zh"
                    ? `應繳物業稅（NAV × ${pct(params.propertyTax.rate, "zh")}）`
                    : `Property tax payable (NAV × ${pct(params.propertyTax.rate, "en")})`}
                </dt>
                <dd className="font-bold text-teal-700">{hkd(example.tax, lang)}</dd>
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
