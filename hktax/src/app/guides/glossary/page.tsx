"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { useI18n } from "@/lib/i18n/useI18n";

type GlossaryEntry = {
  id: string;
  zh: string;
  en: string;
  defZh: string;
  defEn: string;
};

const glossaryEntries: GlossaryEntry[] = [
  {
    id: "salaries-tax",
    zh: "薪俸稅",
    en: "Salaries Tax",
    defZh: "向源自香港的受僱、董事及退休金等入息徵收的稅項。",
    defEn: "Tax charged on income from Hong Kong employment, directorships, and pensions."
  },
  {
    id: "property-tax",
    zh: "物業稅",
    en: "Property Tax",
    defZh: "向出租香港物業所得的租金收入（以應評稅淨值計算）徵收的稅項。",
    defEn: "Tax charged on rental income from letting Hong Kong property, computed on the net assessable value."
  },
  {
    id: "profits-tax",
    zh: "利得稅",
    en: "Profits Tax",
    defZh: "向在香港經營行業、專業或業務所得的應評稅利潤徵收的稅項；本網站涵蓋獨資及合夥形式。",
    defEn: "Tax charged on assessable profits from carrying on a trade, profession, or business in Hong Kong; this site covers the sole-proprietorship and partnership share of it."
  },
  {
    id: "personal-assessment",
    zh: "個人入息課稅",
    en: "Personal Assessment",
    defZh: "一種選擇性的合併課稅方式，將個人（或夫婦）在薪俸稅、物業稅及利得稅下的入息合併計算，並容許額外扣除，藉此有機會減省整體稅款。",
    defEn: "An elective basis of assessment that aggregates an individual's (or couple's) income across salaries, property, and profits tax, allowing extra deductions that may reduce the overall tax bill."
  },
  {
    id: "allowance",
    zh: "免稅額",
    en: "Allowance",
    defZh: "在計算應課稅入息時，可從入息中扣減的固定金額，視乎個人狀況（例如已婚、子女、受養父母）而定。",
    defEn: "A fixed amount deducted from income when computing tax, depending on personal circumstances such as marital status, children, or dependent parents."
  },
  {
    id: "deduction",
    zh: "扣除",
    en: "Deduction",
    defZh: "在計算應課稅入息時，可從入息中扣減的實際開支或供款（例如自願醫保保費、進修開支），通常設有法定上限。",
    defEn: "An actual expense or contribution (e.g. VHIS premiums, self-education expenses) subtracted from income when computing tax, usually subject to a statutory cap."
  },
  {
    id: "assessable-income",
    zh: "應評稅入息",
    en: "Assessable Income",
    defZh: "在扣除任何扣除項目或免稅額之前，按稅例計算所得的總入息。",
    defEn: "Total income computed under the tax rules before any deductions or allowances are subtracted."
  },
  {
    id: "nai",
    zh: "應評稅入息實額",
    en: "Net Assessable Income (NAI)",
    defZh: "應評稅入息扣除認可扣除項目（但未扣減免稅額）後的餘額，是計算標準稅率稅款的基礎。",
    defEn: "Assessable income after allowable deductions but before allowances are subtracted; this is the base used for the standard-rate computation."
  },
  {
    id: "nci",
    zh: "應課稅入息實額",
    en: "Net Chargeable Income (NCI)",
    defZh: "應評稅入息實額再扣除免稅額後的餘額，是計算累進稅率稅款的基礎。",
    defEn: "Net assessable income after allowances are also subtracted; this is the base used for the progressive-rate computation."
  },
  {
    id: "progressive-rates",
    zh: "累進稅率",
    en: "Progressive Rates",
    defZh: "應課稅入息實額按幾個遞增稅階分段課稅，入息愈高，較高部分適用的稅率愈高。",
    defEn: "A tiered rate structure applied to net chargeable income, where higher slices of income are taxed at progressively higher rates."
  },
  {
    id: "standard-rate",
    zh: "標準稅率",
    en: "Standard Rate",
    defZh: "以應評稅入息實額（未扣免稅額）為基礎、按劃一（兩級）稅率計算的另一種課稅方式；稅務局會與累進稅率比較，取較低者為應繳稅款。",
    defEn: "An alternative flat (two-tiered) rate applied to net assessable income before allowances; IRD compares this with the progressive-rate result and charges whichever is lower."
  },
  {
    id: "tax-reduction",
    zh: "寬減",
    en: "Tax Reduction",
    defZh: "政府在財政預算案中公布的一次性稅款寬減百分比及上限，逐年由立法程序通過後生效，適用範圍及金額每年可能不同。",
    defEn: "A one-off percentage reduction of tax payable, subject to a per-case cap, announced in the Budget and enacted each year; the scope and amount can differ from year to year."
  },
  {
    id: "provisional-tax",
    zh: "暫繳稅",
    en: "Provisional Tax",
    defZh: "稅務局按上一年度的入息或利潤水平估算，並要求納稅人就本課稅年度預先繳付的稅款，其後在下一次評稅時與實際稅款對銷。",
    defEn: "An advance payment of tax for the current year, estimated by IRD based on the prior year's income or profits, later offset against the actual tax once the real assessment is raised."
  },
  {
    id: "holdover",
    zh: "緩繳",
    en: "Holdover",
    defZh: "在符合法定理由的情況下，向稅務局申請暫緩繳付全部或部分暫繳稅款。",
    defEn: "An application to IRD to postpone payment of all or part of provisional tax, available where a statutory ground is met."
  },
  {
    id: "notice-of-assessment",
    zh: "評稅通知書",
    en: "Notice of Assessment",
    defZh: "稅務局發出、列明應課稅入息、稅款及繳款日期的正式文件，是計算反對期限的依據。",
    defEn: "The official document IRD issues stating chargeable income, tax payable, and payment dates; its issue date is what objection deadlines are counted from."
  },
  {
    id: "year-of-assessment",
    zh: "課稅年度",
    en: "Year of Assessment",
    defZh: "香港稅務年度，由每年 4 月 1 日起至翌年 3 月 31 日止，例如 2025/26 課稅年度即 2025 年 4 月 1 日至 2026 年 3 月 31 日。",
    defEn: "Hong Kong's tax year, running from 1 April to 31 March the following year — e.g. YA 2025/26 runs from 1 April 2025 to 31 March 2026."
  },
  {
    id: "rental-value",
    zh: "租值",
    en: "Rental Value",
    defZh: "僱主提供住宿予僱員時，按住宿類型（例如住宅、酒店房間）以入息某個百分比估算的應課稅福利金額。",
    defEn: "The taxable benefit assessed as a percentage of income when an employer provides accommodation to an employee, varying by the type of accommodation (e.g. residence, hotel room)."
  },
  {
    id: "nav",
    zh: "應評稅淨值",
    en: "Net Assessable Value (NAV)",
    defZh: "物業稅的課稅基礎，即租金收入扣除業主支付的差餉、已追討不了的租金及法定修葺免稅額後的淨額。",
    defEn: "The tax base for Property Tax: rental income less rates paid by the owner, irrecoverable rent, and the statutory repairs allowance."
  },
  {
    id: "rates",
    zh: "差餉",
    en: "Rates",
    defZh: "政府按物業應課差餉租值徵收的地方稅項，與物業稅是兩種不同的稅項；如由業主支付，可在計算物業稅時扣減。",
    defEn: "A local government charge on a property's rateable value, separate from Property Tax; if paid by the owner it can be deducted when computing Property Tax."
  },
  {
    id: "repairs-allowance",
    zh: "修葺免稅額",
    en: "Statutory Repairs Allowance",
    defZh: "計算物業稅應評稅淨值時，法例容許扣除的固定百分比，用以代表維修及雜項開支，毋須提交實際單據。",
    defEn: "A fixed statutory percentage deducted when computing a property's net assessable value, standing in for repairs and outgoings without needing actual receipts."
  },
  {
    id: "loss-carry-forward",
    zh: "結轉虧損",
    en: "Loss Carry-Forward",
    defZh: "業務在某年度出現的虧損，可結轉至日後年度，用以抵銷該業務其後的應評稅利潤。",
    defEn: "A business loss incurred in one year that is carried forward to offset assessable profits of that same business in future years."
  },
  {
    id: "two-tier-rates",
    zh: "兩級制",
    en: "Two-Tier Rates",
    defZh: "利得稅的優惠稅率安排：首若干金額的應評稅利潤按較低稅率課稅，超出部分則按標準稅率課稅。",
    defEn: "A preferential profits tax rate structure: the first slice of assessable profits is taxed at a lower rate, with the remainder taxed at the standard rate."
  },
  {
    id: "objection",
    zh: "反對",
    en: "Objection",
    defZh: "納稅人不同意評稅結果時，在指定期限內向稅務局提出的正式異議程序。",
    defEn: "The formal procedure by which a taxpayer disputes an assessment with IRD within a specified deadline."
  },
  {
    id: "bir60",
    zh: "報稅表",
    en: "BIR60 (Tax Return – Individuals)",
    defZh: "稅務局發給個別人士填報全年入息、扣除、免稅額及選擇評稅方式的標準報稅表格。",
    defEn: "IRD's standard form for individuals to report annual income, deductions, allowances, and elections for the basis of assessment."
  },
  {
    id: "mpf",
    zh: "強積金",
    en: "Mandatory Provident Fund (MPF)",
    defZh: "香港的強制性退休供款制度，僱主及僱員均須按法定百分比及上限供款。",
    defEn: "Hong Kong's mandatory retirement savings scheme, under which both employer and employee contribute a statutory percentage of income, subject to caps."
  },
  {
    id: "vhis",
    zh: "自願醫保",
    en: "Voluntary Health Insurance Scheme (VHIS)",
    defZh: "政府認可的自願醫療保險產品，為納稅人及其指明親屬支付的合資格保費可享稅務扣除。",
    defEn: "A government-certified voluntary medical insurance product; qualifying premiums paid for the taxpayer and specified relatives are deductible."
  },
  {
    id: "qdap",
    zh: "年金",
    en: "Qualifying Deferred Annuity Policy (QDAP)",
    defZh: "政府認可的年金產品，為納稅人繳付的合資格年金保費可與強積金可扣稅自願性供款共用扣除上限。",
    defEn: "A government-certified deferred annuity product; qualifying premiums paid share a combined deduction cap with MPF Tax-deductible Voluntary Contributions."
  },
  {
    id: "qualifying-annuity-premiums",
    zh: "合資格年金保費",
    en: "Qualifying Annuity Premiums",
    defZh: "為合資格年金保單（QDAP）繳付、符合稅務扣除條件的保費金額。",
    defEn: "Premiums paid under a Qualifying Deferred Annuity Policy that meet the conditions for a tax deduction."
  },
  {
    id: "tvc",
    zh: "強積金可扣稅自願性供款",
    en: "MPF Tax-deductible Voluntary Contributions (TVC)",
    defZh: "在強制性供款以外，另行向強積金計劃作出的自願性供款，可與合資格年金保費共用每年合併扣除上限。",
    defEn: "Voluntary contributions made to an MPF scheme on top of mandatory contributions, sharing an annual combined deduction cap with qualifying annuity premiums."
  }
];

export default function GlossaryGuidePage() {
  const { lang } = useI18n();
  const [query, setQuery] = useState("");

  const sortedEntries = useMemo(
    () => [...glossaryEntries].sort((a, b) => a.zh.localeCompare(b.zh, "zh-Hant")),
    []
  );

  const visibleEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return sortedEntries;
    }

    return sortedEntries.filter((entry) =>
      [entry.zh, entry.en, entry.defZh, entry.defEn].some((field) =>
        field.toLowerCase().includes(needle)
      )
    );
  }, [query, sortedEntries]);

  return (
    <main>
      <section className="bg-white py-14 sm:py-16">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
              {lang === "zh" ? "報稅指南" : "Filing guide"}
            </p>
            <h1 className="mt-3 text-3xl font-bold text-navy-900 sm:text-4xl">
              {lang === "zh" ? "中英稅務詞彙表" : "Chinese–English Tax Glossary"}
            </h1>
            <p className="mt-5 text-base leading-7 text-warm-700">
              {lang === "zh"
                ? "本表收錄本網站使用的所有主要稅務用詞，按繁體中文筆劃/字母順序排列，每項附一句話的中英對照解釋，方便你對照報稅表及稅務局文件時查閱。"
                : "This table lists every key tax term used on this site, ordered alphabetically by its Traditional Chinese term, each with a one-line bilingual definition — handy to check against your tax return and IRD documents."}
            </p>
          </div>

          <div className="mt-8 max-w-md">
            <label htmlFor="glossary-search" className="sr-only">
              {lang === "zh" ? "搜尋詞彙" : "Search glossary"}
            </label>
            <input
              id="glossary-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={lang === "zh" ? "搜尋中文或英文詞彙…" : "Search a Chinese or English term…"}
              className="form-input w-full"
            />
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-12 sm:py-16">
        <Container>
          <div className="overflow-x-auto rounded-lg border border-warm-200 bg-white shadow-soft">
            <table className="w-full min-w-[640px] table-fixed border-collapse text-sm">
              <caption className="sr-only">
                {lang === "zh" ? "中英稅務詞彙對照表" : "Chinese-English tax glossary table"}
              </caption>
              <thead>
                <tr className="border-b border-warm-200 bg-warm-50 text-left">
                  <th scope="col" className="w-1/5 px-4 py-3 font-bold text-navy-900">
                    {lang === "zh" ? "中文" : "Chinese"}
                  </th>
                  <th scope="col" className="w-1/4 px-4 py-3 font-bold text-navy-900">
                    {lang === "zh" ? "英文" : "English"}
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold text-navy-900">
                    {lang === "zh" ? "說明" : "Definition"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-200">
                {visibleEntries.map((entry) => (
                  <tr key={entry.id} className="align-top">
                    <td className="px-4 py-3 font-semibold text-navy-900">{entry.zh}</td>
                    <td className="px-4 py-3 font-semibold text-navy-900">{entry.en}</td>
                    <td className="px-4 py-3 leading-6 text-warm-700">
                      {lang === "zh" ? entry.defZh : entry.defEn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visibleEntries.length === 0 ? (
            <p className="mt-6 text-sm text-warm-600">
              {lang === "zh" ? "沒有符合搜尋字詞的詞彙。" : "No terms match your search."}
            </p>
          ) : (
            <p className="mt-4 text-xs text-warm-500">
              {lang === "zh"
                ? `共 ${visibleEntries.length} 項詞彙（總數 ${glossaryEntries.length} 項）。`
                : `Showing ${visibleEntries.length} of ${glossaryEntries.length} terms.`}
            </p>
          )}
        </Container>
      </section>

      <section className="bg-white py-10">
        <Container>
          <p className="max-w-3xl text-xs leading-6 text-warm-600">
            {lang === "zh"
              ? "本頁內容僅供一般教育及參考用途，並非稅務意見，亦與稅務局無從屬關係。詞彙解釋為簡化說明，正式定義以《稅務條例》及稅務局發布的文件為準；如有疑問，建議諮詢執業會計師或稅務顧問。"
              : "This page is for general education and reference only. It is not tax advice and this website is not affiliated with the Inland Revenue Department. Definitions here are simplified explanations — the formal definitions are set out in the Inland Revenue Ordinance and IRD's published materials; consult a qualified accountant or tax adviser if in doubt."}
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
