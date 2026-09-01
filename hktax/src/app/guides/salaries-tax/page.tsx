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

function describeBands(bands: Band[], lang: Lang) {
  let cursor = 0;
  return bands.map((band, index) => {
    const isFirst = index === 0;
    const isLast = band.width === null;
    const label = isLast
      ? lang === "zh"
        ? `餘額按 ${pct(band.rate, lang)} 稅率`
        : `Remaining balance at ${pct(band.rate, lang)}`
      : lang === "zh"
      ? `${isFirst ? "首" : "再"} ${hkd(band.width as number, lang)} 按 ${pct(band.rate, lang)} 稅率`
      : `${isFirst ? "First" : "Next"} ${hkd(band.width as number, lang)} at ${pct(band.rate, lang)}`;
    cursor += band.width ?? 0;
    return label;
  });
}

function computeBands(amount: number, bands: Band[]) {
  let remaining = Math.max(amount, 0);
  let tax = 0;
  const rows: { width: number; rate: number; taxable: number; taxInRow: number }[] = [];

  for (const band of bands) {
    const width = band.width === null ? remaining : Math.min(remaining, band.width);
    const taxInRow = width * band.rate;
    rows.push({ width, rate: band.rate, taxable: width, taxInRow });
    tax += taxInRow;
    remaining -= width;
    if (remaining <= 0) break;
  }

  return { tax, rows };
}

function buildSections(params: TaxParams): Section[] {
  const { allowances, deductionCaps, progressiveBands, standardRateTiers, taxReduction } = params;

  return [
    {
      id: "who",
      title: { zh: "哪些人要課薪俸稅", en: "Who is chargeable" },
      content: {
        zh: (
          <>
            <p>
              任何人在香港「因任何office（職位）、僱傭或退休金」而產生或得自香港的入息，都要課繳薪俸稅。
              簡單而言，只要你受僱工作的職位或提供服務的地方在香港，你的入息就很可能屬於應課稅範圍，
              毋須是香港永久性居民或持有香港身份證才需要課稅。
            </p>
            <p>
              相反，如果你的僱傭關係全部在香港以外地方訂立、管理及執行（即「非香港僱傭」），
              就可能只需要就實際在香港提供服務的日數比例課稅，甚至完全豁免。這類跨境情況牽涉的規則
              （例如 60 日豁免規則）比較複雜，建議另行諮詢專業意見。
            </p>
          </>
        ),
        en: (
          <>
            <p>
              Anyone whose income arises in or is derived from an office, employment, or pension in
              Hong Kong is chargeable to salaries tax. Broadly, if the post you hold or the services you
              perform are based in Hong Kong, your income is likely within scope — you do not need to be
              a permanent resident or ID card holder for salaries tax to apply.
            </p>
            <p>
              Conversely, if your employment is entirely negotiated, controlled, and paid from outside
              Hong Kong (a &ldquo;non-Hong Kong employment&rdquo;), you may only be taxed on the days you
              actually work in Hong Kong, or be exempt altogether under the 60-day rule. Cross-border
              situations like this are complex — seek professional advice for your specific case.
            </p>
          </>
        )
      }
    },
    {
      id: "income",
      title: { zh: "哪些入息要計算在內", en: "What counts as income" },
      content: {
        zh: (
          <ul className="list-disc space-y-2 pl-5">
            <li>基本薪金、工資、假期薪酬、董事袍金、佣金及花紅（無論是否合約列明）。</li>
            <li>
              各種實物利益（perquisites）— 凡可以兌換現金、或由僱主代你支付本應由你負責的開支
              （例如僱主代交你個人的私人費用），一般都要計入應課稅入息。
            </li>
            <li>
              購股權（share option）收益 — 在行使、轉讓或放棄購股權的一刻，市值減去行使價的差額，
              一般要計入該課稅年度的入息，並非資本增值稅範圍。
            </li>
            <li>
              終止僱傭時收取的款項 — 屬合約性酬金或約滿酬金一般要課稅，並可選擇追溯攤分至最多 36
              個月；至於法定遣散費／長期服務金當中屬彌補離職損失的部分，一般不屬於應課稅入息，
              但實際定性要視乎每宗個案的事實，建議個案有疑問時查詢稅務局或專業意見。
            </li>
            <li>
              僱主提供居所的「租值」（rental value）— 詳見下一節，會按你的入息或物業應課差餉租值計算。
            </li>
          </ul>
        ),
        en: (
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Basic salary, wages, leave pay, director&apos;s fees, commission, and bonuses — whether or
              not they are contractually guaranteed.
            </li>
            <li>
              Perquisites — any benefit convertible into cash, or any personal expense of yours that your
              employer settles on your behalf, is generally chargeable income.
            </li>
            <li>
              Share option gains — the difference between market value and exercise price at the point you
              exercise, assign, or release the option is generally chargeable in that year of assessment;
              this is an employment-income rule, not a capital gain.
            </li>
            <li>
              Termination payments — contractual gratuities and payments in lieu of notice are generally
              taxable and can be spread back over up to 36 months by election. The portion of a statutory
              severance or long-service payment that compensates for loss of office is generally not
              taxable, but the correct characterisation depends on the facts — check with the IRD or a
              professional adviser if in doubt.
            </li>
            <li>
              The rental value of employer-provided accommodation — see the next section; it is computed
              from your income or the property&apos;s rateable value.
            </li>
          </ul>
        )
      }
    },
    {
      id: "accommodation",
      title: {
        zh: "僱主提供宿舍的租值計算",
        en: "Employer-provided accommodation: rental value"
      },
      content: {
        zh: (
          <>
            <p>
              如果僱主免費或以低於市值的租金提供住宿，稅務局會將一個「租值」加回你的應課稅入息，
              比例視乎住宿類型而定 — 一般住宅單位（例如整個單位／整間房屋）的比例，會高於酒店、賓館或
              服務式住宅的套房或單人房。具體比例並不包含在本網站的課稅年度參數之內（因為這類比例
              屬長期不變的結構性規則，並非每年隨財政預算案調整），請以稅務局最新指引所列的百分比為準。
            </p>
            <p>
              以上比例一般乘以你該年的「應評稅入息淨額」（即扣除准許開支之後、計租值之前的入息）計出租值。
              在某些情況下，你亦可以選擇改用該物業的應課差餉租值，兩者取較低者 —
              實際比較方法及適用條件請參閱稅務局最新指引，因為涉及的細節規則較多。
            </p>
          </>
        ),
        en: (
          <>
            <p>
              If your employer provides you with accommodation rent-free or below market rent, the IRD
              adds a &ldquo;rental value&rdquo; to your chargeable income, at a percentage that depends on
              the type of accommodation — an ordinary residence (e.g. a whole flat or house) attracts a
              higher percentage than a hotel, hostel, or serviced-apartment suite or single room. The exact
              percentages are not part of this site&apos;s year-of-assessment parameters, since this is a
              long-standing structural rule rather than something the annual Budget adjusts — check the
              IRD&apos;s current guidance for the applicable percentage.
            </p>
            <p>
              The percentage is generally applied to your net income for the year (income after allowable
              outgoings, before the rental value is added). In some circumstances you may instead be able
              to use the property&apos;s rateable value if that produces a lower figure — the exact
              comparison rules have a number of conditions, so check the IRD&apos;s current guidance for
              your situation.
            </p>
          </>
        )
      }
    },
    {
      id: "deductions",
      title: { zh: "扣除項目次序", en: "Deductions, in order" },
      content: {
        zh: (
          <>
            <p>
              計算薪俸稅時，扣除項目大致按以下次序，由入息總額逐步減去，先得出「應評稅入息淨額」（NAI），
              再減去免稅額，得出「應課稅入息實額」（NCI）：
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>屬工作上完全、純粹及必須產生的開支（例如專業會費）。</li>
              <li>認可慈善捐款，上限為認可入息的 {pct(deductionCaps.donationsPercent, "zh")}。</li>
              <li>強制性公積金供款，每年上限 {hkd(deductionCaps.mpfMandatory, "zh")}。</li>
              <li>
                個人進修開支，每年上限 {hkd(deductionCaps.selfEducation, "zh")}。
              </li>
              <li>
                居所貸款利息（一般上限 {hkd(deductionCaps.homeLoanInterest, "zh")}，合資格新生子女個案可提高至{" "}
                {hkd(deductionCaps.homeLoanInterestElevated, "zh")}，可申索年期 {deductionCaps.homeLoanInterestYears}{" "}
                個課稅年度）— 同「居所租金」互斥，兩者只可擇一申索同一課稅年度。
              </li>
              <li>
                居所租金（一般上限 {hkd(deductionCaps.domesticRent, "zh")}，合資格新生子女個案可提高至{" "}
                {hkd(deductionCaps.domesticRentElevated, "zh")}）。
              </li>
              <li>長者住宿照顧開支，每名受養父母／祖父母上限 {hkd(deductionCaps.elderlyCare, "zh")}。</li>
              <li>
                合資格年金保費及強積金可扣稅自願性供款（TVC），合併上限 {hkd(deductionCaps.annuityAndTvc, "zh")}。
              </li>
              <li>
                自願medical保險計劃（VHIS）保費，每名受保人上限 {hkd(deductionCaps.vhisPerPerson, "zh")}。
              </li>
              <li>
                合資格輔助生育服務開支，每年上限 {hkd(deductionCaps.assistedReproduction, "zh")}。
              </li>
            </ol>
          </>
        ),
        en: (
          <>
            <p>
              Deductions are broadly applied in this order, reducing total income down to Net Assessable
              Income (NAI), before allowances are deducted to reach Net Chargeable Income (NCI):
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Outgoings wholly, exclusively, and necessarily incurred in your work (e.g. professional dues).</li>
              <li>
                Approved charitable donations, capped at {pct(deductionCaps.donationsPercent, "en")} of
                approved income.
              </li>
              <li>Mandatory MPF contributions, capped at {hkd(deductionCaps.mpfMandatory, "en")} per year.</li>
              <li>Self-education expenses, capped at {hkd(deductionCaps.selfEducation, "en")} per year.</li>
              <li>
                Home loan interest (standard cap {hkd(deductionCaps.homeLoanInterest, "en")}, raised to{" "}
                {hkd(deductionCaps.homeLoanInterestElevated, "en")} for an eligible taxpayer residing with a
                qualifying newborn first child, claimable for {deductionCaps.homeLoanInterestYears} years of
                assessment) — mutually exclusive with domestic rent in the same year.
              </li>
              <li>
                Domestic rent (standard cap {hkd(deductionCaps.domesticRent, "en")}, raised to{" "}
                {hkd(deductionCaps.domesticRentElevated, "en")} under the same newborn condition).
              </li>
              <li>Elderly residential care expenses, capped at {hkd(deductionCaps.elderlyCare, "en")} per dependent parent/grandparent.</li>
              <li>
                Qualifying annuity premiums plus MPF Tax Deductible Voluntary Contributions (TVC), combined
                cap {hkd(deductionCaps.annuityAndTvc, "en")}.
              </li>
              <li>VHIS premiums, capped at {hkd(deductionCaps.vhisPerPerson, "en")} per insured person.</li>
              <li>Qualifying assisted reproductive services expenses, capped at {hkd(deductionCaps.assistedReproduction, "en")} per year.</li>
            </ol>
          </>
        )
      }
    },
    {
      id: "allowances",
      title: { zh: "免稅額", en: "Allowances" },
      content: {
        zh: (
          <ul className="grid gap-x-8 gap-y-2 pl-5 sm:grid-cols-2">
            <li className="list-disc">基本免稅額：{hkd(allowances.basic, "zh")}</li>
            <li className="list-disc">已婚人士免稅額：{hkd(allowances.married, "zh")}</li>
            <li className="list-disc">子女免稅額（每名）：{hkd(allowances.child, "zh")}</li>
            <li className="list-disc">子女出生年度額外免稅額：{hkd(allowances.childNewbornExtra, "zh")}</li>
            <li className="list-disc">供養父母／祖父母（60 歲以上）：{hkd(allowances.parentAged60, "zh")}</li>
            <li className="list-disc">供養父母／祖父母（55 至 59 歲）：{hkd(allowances.parentAged55, "zh")}</li>
            <li className="list-disc">同住額外免稅額（60 歲以上）：{hkd(allowances.parentResidingExtra60, "zh")}</li>
            <li className="list-disc">同住額外免稅額（55 至 59 歲）：{hkd(allowances.parentResidingExtra55, "zh")}</li>
            <li className="list-disc">供養兄弟姊妹（每名）：{hkd(allowances.sibling, "zh")}</li>
            <li className="list-disc">單親免稅額：{hkd(allowances.singleParent, "zh")}</li>
            <li className="list-disc">傷殘受養人免稅額（每名）：{hkd(allowances.disabledDependant, "zh")}</li>
            <li className="list-disc">本人傷殘免稅額：{hkd(allowances.personalDisability, "zh")}</li>
          </ul>
        ),
        en: (
          <ul className="grid gap-x-8 gap-y-2 pl-5 sm:grid-cols-2">
            <li className="list-disc">Basic allowance: {hkd(allowances.basic, "en")}</li>
            <li className="list-disc">Married person&apos;s allowance: {hkd(allowances.married, "en")}</li>
            <li className="list-disc">Child allowance (each): {hkd(allowances.child, "en")}</li>
            <li className="list-disc">Extra allowance in year of birth: {hkd(allowances.childNewbornExtra, "en")}</li>
            <li className="list-disc">Dependent parent/grandparent (60+): {hkd(allowances.parentAged60, "en")}</li>
            <li className="list-disc">Dependent parent/grandparent (55–59): {hkd(allowances.parentAged55, "en")}</li>
            <li className="list-disc">Additional residing allowance (60+): {hkd(allowances.parentResidingExtra60, "en")}</li>
            <li className="list-disc">Additional residing allowance (55–59): {hkd(allowances.parentResidingExtra55, "en")}</li>
            <li className="list-disc">Dependent sibling (each): {hkd(allowances.sibling, "en")}</li>
            <li className="list-disc">Single parent allowance: {hkd(allowances.singleParent, "en")}</li>
            <li className="list-disc">Disabled dependant allowance (each): {hkd(allowances.disabledDependant, "en")}</li>
            <li className="list-disc">Personal disability allowance: {hkd(allowances.personalDisability, "en")}</li>
          </ul>
        )
      }
    },
    {
      id: "rates",
      title: {
        zh: "累進稅率 vs 兩級制標準稅率",
        en: "Progressive rate vs the two-tiered standard rate"
      },
      content: {
        zh: (
          <>
            <p>
              稅務局會分別用兩種方法計出稅款，然後取較低者作為你要繳交的薪俸稅：
            </p>
            <p className="font-semibold text-navy-900">累進稅率 — 按「應課稅入息實額」（NCI，即扣除埋免稅額之後）計算：</p>
            <ul className="list-disc space-y-1 pl-5">
              {describeBands(progressiveBands, "zh").map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="font-semibold text-navy-900">
              兩級制標準稅率 — 按「應評稅入息淨額」（NAI，扣除開支之後、未計免稅額之前）計算：
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {describeBands(standardRateTiers, "zh").map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p>
              兩個結果之中，哪個較低就採用哪個。一般而言，入息不算太高、又有不少免稅額及扣除的納稅人，
              用累進稅率通常較有利；入息很高、免稅額相對入息又不算多的納稅人，就有可能是標準稅率較有利。
            </p>
          </>
        ),
        en: (
          <>
            <p>
              The IRD calculates tax both ways and charges you whichever is lower:
            </p>
            <p className="font-semibold text-navy-900">
              Progressive rate — applied to Net Chargeable Income (NCI, after allowances):
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {describeBands(progressiveBands, "en").map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="font-semibold text-navy-900">
              Two-tiered standard rate — applied to Net Assessable Income (NAI, after outgoings but before allowances):
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {describeBands(standardRateTiers, "en").map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p>
              Whichever produces the lower figure is what you pay. As a rule of thumb, moderate earners
              with meaningful allowances and deductions tend to do better under the progressive rate, while
              very high earners with relatively few allowances relative to income may end up on the
              standard rate.
            </p>
          </>
        )
      }
    },
    {
      id: "reduction",
      title: { zh: "一次性寬減", en: "The one-off tax reduction" },
      content: {
        zh: (
          <p>
            政府在財政預算案宣布的一次性寬減，會將你該年的薪俸稅（連同利得稅及個人入息課稅）扣減{" "}
            {pct(taxReduction.percent, "zh")}，每宗個案上限 {hkd(taxReduction.cap, "zh")}。這項寬減只適用於{" "}
            <strong>最終評稅</strong>，不適用於下一年度的暫繳稅（暫繳稅仍要按單全數繳交，寬減會在最終評稅時反映）。
          </p>
        ),
        en: (
          <p>
            The Budget&apos;s one-off reduction cuts your final salaries tax (along with profits tax and
            tax under Personal Assessment) by {pct(taxReduction.percent, "en")}, capped at{" "}
            {hkd(taxReduction.cap, "en")} per case. It applies only to the <strong>final assessment</strong>{" "}
            — provisional tax for the following year must still be paid in full as billed, with the
            reduction applied once the final assessment is raised.
          </p>
        )
      }
    },
    {
      id: "joint",
      title: { zh: "夫婦聯合評稅基本概念", en: "Joint assessment basics" },
      content: {
        zh: (
          <>
            <p>
              已婚夫婦的入息預設是分開評稅（各自申報自己的入息、扣除及免稅額）。如果合併評稅對雙方合計而言
              較著數，夫婦雙方可以共同選擇「聯合評稅」— 將兩人入息合併計算，改用已婚人士免稅額代替兩份基本免稅額，
              其餘扣除及免稅額（例如子女、供養父母）合併申索，最後按合併後的入息比例攤分應繳稅款。
            </p>
            <p>
              聯合評稅純粹是選擇性，稅務局不會自動為你決定；建議兩種方式都計算一次，選擇較低的一種。
              本網站的計算工具會自動比較這兩個方案。
            </p>
          </>
        ),
        en: (
          <>
            <p>
              Married couples are assessed separately by default — each spouse reports their own income,
              deductions, and allowances. If combining incomes produces a lower total bill, the couple can
              jointly elect Joint Assessment: incomes are aggregated, the married person&apos;s allowance
              replaces the two basic allowances, other deductions/allowances (children, parents, etc.) are
              combined, and the resulting tax is apportioned between the spouses by their share of income.
            </p>
            <p>
              Joint assessment is elective — the IRD will not automatically pick it for you. It is worth
              computing both ways and choosing the lower one; this site&apos;s calculators compare both
              automatically.
            </p>
          </>
        )
      }
    }
  ];
}

export default function SalariesTaxGuidePage() {
  const { lang, t, year } = useI18n();
  const eyebrowTracking = lang === "en" ? "uppercase tracking-[0.18em]" : "";
  const params = getParams(year);
  const sections = useMemo(() => buildSections(params), [params]);

  const example = useMemo(() => {
    const income = 600000;
    const mpfDeduction = Math.min(params.deductionCaps.mpfMandatory, income);
    const nai = income - mpfDeduction;
    const nci = Math.max(nai - params.allowances.basic, 0);
    const progressive = computeBands(nci, params.progressiveBands);
    const standard = computeBands(nai, params.standardRateTiers);
    const basisUsed: "progressive" | "standard" =
      progressive.tax <= standard.tax ? "progressive" : "standard";
    const taxBeforeReduction = basisUsed === "progressive" ? progressive.tax : standard.tax;
    const reduction = Math.min(taxBeforeReduction * params.taxReduction.percent, params.taxReduction.cap);
    const finalTax = taxBeforeReduction - reduction;

    return { income, mpfDeduction, nai, nci, progressive, standard, basisUsed, taxBeforeReduction, reduction, finalTax };
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
              {lang === "zh" ? "薪俸稅指南" : "Salaries Tax Guide"}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-warm-700">
              {lang === "zh"
                ? "薪俸稅是香港最多人接觸的稅種，計算方法看似複雜，但其實可以拆分為幾個步驟：確定應課稅入息、逐項扣除、逐項申索免稅額，再在累進稅率及兩級制標準稅率之間取較低者。以下逐步講解，並附一個以本頁參數計算的簡單示例。"
                : "Salaries tax is the tax most people in Hong Kong deal with directly. The computation looks complex but breaks down into a few steps: work out chargeable income, apply deductions in order, apply allowances, then take the lower of the progressive rate and the two-tiered standard rate. This guide walks through each step, with a simple worked example computed from this page's live parameters."}
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
                ? `假設一位單身人士，全年入息 ${hkd(example.income, "zh")}，已供滿強積金上限，除基本免稅額外沒有其他免稅額或扣除。`
                : `Assume a single taxpayer with annual income of ${hkd(example.income, "en")}, maxed-out mandatory MPF contributions, and no allowances or deductions beyond the basic allowance.`}
            </p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "強積金強制性供款" : "Mandatory MPF contribution"}</dt>
                <dd className="font-semibold text-navy-900">{hkd(example.mpfDeduction, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "應評稅入息淨額（NAI）" : "Net assessable income (NAI)"}</dt>
                <dd className="font-semibold text-navy-900">{hkd(example.nai, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "應課稅入息實額（NCI）" : "Net chargeable income (NCI)"}</dt>
                <dd className="font-semibold text-navy-900">{hkd(example.nci, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "累進稅率計出的稅款" : "Tax under progressive rate"}</dt>
                <dd className="font-semibold text-navy-900">{hkd(example.progressive.tax, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "標準稅率計出的稅款" : "Tax under standard rate"}</dt>
                <dd className="font-semibold text-navy-900">{hkd(example.standard.tax, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "採用基準" : "Basis used"}</dt>
                <dd className="font-semibold text-navy-900">
                  {example.basisUsed === "progressive"
                    ? lang === "zh"
                      ? "累進稅率（較低）"
                      : "Progressive (lower)"
                    : lang === "zh"
                    ? "標準稅率（較低）"
                    : "Standard rate (lower)"}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-warm-200 pb-2">
                <dt className="text-warm-700">{lang === "zh" ? "一次性寬減" : "One-off reduction"}</dt>
                <dd className="font-semibold text-navy-900">-{hkd(example.reduction, lang)}</dd>
              </div>
              <div className="flex justify-between gap-3 pb-2">
                <dt className="font-semibold text-navy-900">{lang === "zh" ? "應繳薪俸稅" : "Salaries tax payable"}</dt>
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
