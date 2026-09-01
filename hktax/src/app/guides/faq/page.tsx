"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { useI18n } from "@/lib/i18n/useI18n";
import { getParams } from "@/lib/tax/params";

type FaqItem = {
  id: string;
  questionZh: string;
  questionEn: string;
  answerZh: string;
  answerEn: string;
};

const SIDE_BUSINESS_PLACEHOLDER_ZH =
  "屬於獨資業務利得稅的「兩級制」：首 {profitsTierOneCap} 應評稅利潤按 {profitsTierOneRate} 課稅，超出部分按 {profitsStandardRate} 課稅。留意如你或有關連人士的其他業務已選用兩級制，同一組關連實體一般只可有一間享有兩級制優惠，須在報稅時申報是否符合資格。";
const SIDE_BUSINESS_PLACEHOLDER_EN =
  "This falls under the unincorporated-business two-tier profits tax rate: the first {profitsTierOneCap} of assessable profits is taxed at {profitsTierOneRate}, and anything above that at {profitsStandardRate}. Note that if you or connected persons have other businesses already using the two-tier rate, generally only one entity within the same group of connected entities may benefit from it — you must declare your eligibility when filing.";

const MPF_PLACEHOLDER_ZH =
  "強制性供款是法例要求的最低供款，其相關的個人扣除設有每年 {mpfMandatoryCap} 上限。TVC（可扣稅自願性供款）則是額外自願性質的供款，與合資格年金保費共用另一個每年 {annuityAndTvcCap} 的合併上限——即 TVC 與強制性供款屬於兩個獨立的扣除額度，不會互相佔用對方的上限。";
const MPF_PLACEHOLDER_EN =
  "Mandatory contributions are the legally required minimum, and the related personal deduction is capped at {mpfMandatoryCap} per year. TVC (Tax-deductible Voluntary Contributions) are separate, voluntary contributions that share a different combined cap of {annuityAndTvcCap} per year together with qualifying annuity premiums — so TVC and mandatory contributions sit in two independent deduction buckets and do not eat into each other's cap.";

const NEWBORN_PLACEHOLDER_ZH =
  "在子女出生的課稅年度，除每名子女 {childAllowance} 的子女免稅額外，還可多獲一次性 {childNewbornExtra} 的額外子女免稅額。如你符合條件並與在 2023 年 10 月 25 日或之後出生的首名子女同住，居所貸款利息扣除及租金扣除的上限亦會由 {homeLoanInterestCap} / {domesticRentCap} 提高至 {homeLoanInterestElevatedCap} / {domesticRentElevatedCap}。";
const NEWBORN_PLACEHOLDER_EN =
  "In the year of assessment your child is born, on top of the {childAllowance} child allowance per child, you also get a one-off additional child allowance of {childNewbornExtra}. If you qualify and reside with your first child born on or after 25 October 2023, the home loan interest and domestic rent deduction caps are also raised from {homeLoanInterestCap} / {domesticRentCap} to {homeLoanInterestElevatedCap} / {domesticRentElevatedCap}.";

const REDUCTION_PLACEHOLDER_ZH =
  "兩個年度的寬減上限並不相同：2024/25 課稅年度每宗個案上限為 {reductionCap2024}，而 2025/26 課稅年度（按 2026 年 2 月《財政預算案》公布）上限提高至 {reductionCap2025}。兩個年度均為稅款的 {reductionPercent} 寬減，只是每宗個案的上限金額不同，屬於財政預算案每年獨立公布的一次性措施，並非固定不變的規則。";
const REDUCTION_PLACEHOLDER_EN =
  "The caps differ between the two years: for YA 2024/25 the cap per case is {reductionCap2024}, while for YA 2025/26 (as announced in the February 2026 Budget) the cap was raised to {reductionCap2025}. Both years apply a {reductionPercent} reduction of tax payable — only the per-case cap differs. This is a one-off measure announced separately in each year's Budget, not a fixed permanent rule.";

const PROPERTY_REDUCTION_PLACEHOLDER_ZH =
  "一般而言，物業稅並不包括在稅務局每年公布的一次性稅務寬減範圍之內——寬減通常只適用於薪俸稅、利得稅及個人入息課稅（{reductionPercent}，設每宗個案上限）。如你只有物業出租收入並以物業稅方式課稅，多數不會享有該項寬減；如你改為選擇個人入息課稅，則有機會納入寬減範圍。實際適用範圍請以稅務局每年的最新公布為準。";
const PROPERTY_REDUCTION_PLACEHOLDER_EN =
  "Property Tax generally falls outside the scope of IRD's annual one-off tax reduction — the reduction usually applies only to salaries tax, profits tax, and tax under personal assessment ({reductionPercent}, subject to a per-case cap). If you only have rental income assessed under Property Tax, you typically do not receive that reduction; electing personal assessment instead may bring you within its scope. Always confirm the exact coverage against IRD's latest announcement for the relevant year.";

const faqItems: FaqItem[] = [
  {
    id: "first-time-filer",
    questionZh: "我是第一次要報稅，應該怎樣做？",
    questionEn: "This is my first time filing tax in Hong Kong — what should I do?",
    answerZh:
      "先確認你有沒有收到稅務局的個別人士報稅表（BIR60）；如未收到但已有應課稅入息，你須主動通知稅務局（見〈報稅時間表〉指南）。建議先用本網站的「報稅精靈」，按你的實際入息、扣除及家庭狀況行一次，了解大概稅款及應填報的部分，再對照正式報稅表逐項填寫。",
    answerEn:
      "First check whether you have received an Individual Tax Return (BIR60) from IRD. If you have not, but you already have chargeable income, you must notify IRD yourself (see the Filing Deadlines guide). We suggest running the guided Tax Wizard on this site first with your real income, deductions, and family details to see an estimate and which parts of the return apply to you, then transferring the figures onto the official return."
  },
  {
    id: "married-filing-choices",
    questionZh: "已婚人士報稅有甚麼選擇？分開評稅還是合併較好？",
    questionEn: "What filing choices do married couples have — separate or joint assessment?",
    answerZh:
      "已婚人士的薪俸稅預設為「分開評稅」，但夫婦亦可選擇「合併評稅」，將雙方入息合併計算並使用已婚人士免稅額；由2018/19課稅年度起，已婚人士亦可個別選擇「個人入息課稅」，或在雙方同意下共同選擇。哪一種組合最節省稅款，視乎雙方入息差距、扣除項目及是否有虧損等因素而定，本網站的優化器會列出各方案的總稅款作比較。",
    answerEn:
      "Married couples' salaries tax defaults to separate assessment, but you may elect joint assessment (combining both incomes and using the married person's allowance) instead. Since YA 2018/19, married persons may also elect personal assessment individually, or jointly if both spouses agree. Which combination saves the most tax depends on the income gap between spouses, deductions, and any losses — our optimizer lists the total tax under each scenario for comparison."
  },
  {
    id: "rent-vs-home-loan",
    questionZh: "租金扣除及居所貸款利息扣除可否同時申索？",
    questionEn: "Can I claim both the domestic rent deduction and home loan interest deduction?",
    answerZh:
      "不可以——兩者互相排斥，同一課稅年度只能二選其一。此外，如你或配偶在香港擁有任何應課差餉租值的居住物業，一般不符合租金扣除資格，即使該物業並非你現時居住的單位亦然，這是常見的稅務局審查重點。",
    answerEn:
      "No — the two are mutually exclusive, so you may only claim one of them in the same year of assessment. In addition, if you or your spouse own any rateable domestic property in Hong Kong, you generally do not qualify for the rent deduction, even if that property is not the one you currently live in — this is a common point IRD checks closely."
  },
  {
    id: "landlord-pa",
    questionZh: "我有出租物業，是否應該選擇個人入息課稅？",
    questionEn: "I own a let property — should I elect personal assessment?",
    answerZh:
      "如你有為該出租物業支付按揭利息，物業稅本身並不容許扣除按揭利息，但個人入息課稅容許將該筆利息扣除（上限為該物業的應評稅淨值）。如你同時有其他入息（例如薪俸），個人入息課稅將所有收入合併計算，是否更節省稅款視乎整體數字，建議用本網站的優化器逐一比較。",
    answerEn:
      "If you pay mortgage interest on that let property, Property Tax itself does not allow a deduction for it — but Personal Assessment does, capped at that property's net assessable value. If you also have other income (such as a salary), Personal Assessment aggregates everything, so whether it saves tax overall depends on your full numbers — use our optimizer to compare directly."
  },
  {
    id: "side-business-two-tier",
    questionZh: "我有兼職生意，利潤未達兩級制門檻，稅率如何計算？",
    questionEn: "I run a small side business with profits below the two-tier threshold — how is the rate worked out?",
    answerZh: SIDE_BUSINESS_PLACEHOLDER_ZH,
    answerEn: SIDE_BUSINESS_PLACEHOLDER_EN
  },
  {
    id: "mpf-tvc-vs-mandatory",
    questionZh: "強積金強制性供款及「可扣稅自願性供款」(TVC) 有甚麼分別？",
    questionEn: "What is the difference between mandatory MPF contributions and Tax-deductible Voluntary Contributions (TVC)?",
    answerZh: MPF_PLACEHOLDER_ZH,
    answerEn: MPF_PLACEHOLDER_EN
  },
  {
    id: "newborn-caps",
    questionZh: "新生嬰兒出生的年度，有甚麼額外稅務優惠？",
    questionEn: "What extra tax benefits apply in the year my child is born?",
    answerZh: NEWBORN_PLACEHOLDER_ZH,
    answerEn: NEWBORN_PLACEHOLDER_EN
  },
  {
    id: "share-options",
    questionZh: "公司給予我認股權（share options），應如何計稅？",
    questionEn: "My employer granted me share options — how are they taxed?",
    answerZh:
      "行使、轉讓或放棄認股權時所得的收益，一般會被視為應課稅的僱傭入息（花紅性質），須計入行使/轉讓當年的薪俸稅評稅內。計算方法及涉及跨境受僱、分期歸屬（vesting）等情況可以相當複雜，本網站未有涵蓋認股權的自動計算，建議諮詢執業會計師或稅務顧問處理。",
    answerEn:
      "Gains realised when you exercise, assign, or release a share option are generally treated as taxable employment income (a perquisite) assessable in the year of exercise or assignment. The computation — especially where employment spans multiple jurisdictions or vesting is staggered — can be complex. This site does not automate share option computations; consult a qualified accountant or tax adviser for your situation."
  },
  {
    id: "leaving-hk",
    questionZh: "我打算永久或長期離開香港，稅務上有甚麼要處理？",
    questionEn: "I'm leaving Hong Kong for good (or for a long period) — what do I need to handle?",
    answerZh:
      "一般而言，僱主須在你預計離職日前最少一個月，以書面通知稅務局，並可能須代扣最後薪金直至取得稅務局的「釋放金錢通知書」（一般稱為稅務「清稅證明」）。你本人亦應主動通知稅務局你即將離港，並如實申報全年入息，確保清繳所有稅款後才安排資金調走。詳情及所需表格請以稅務局最新指引為準。",
    answerEn:
      "In general, your employer must notify IRD in writing at least one month before your expected departure date, and may need to withhold your final pay until IRD issues a Letter of Release (often called a tax clearance). You should also notify IRD yourself that you are leaving, and report your full-year income accurately so all tax is settled before funds are released. Check IRD's current guidance for the exact process and forms."
  },
  {
    id: "no-return-duty",
    questionZh: "沒有收到報稅表，但今年有應課稅入息，是否需要申報？",
    questionEn: "I didn't receive a tax return, but I have chargeable income this year — do I still need to file?",
    answerZh:
      "要。即使未收到報稅表，法例規定你須在該課稅年度完結後 4 個月內，主動以書面通知稅務局你有應課稅入息，稅務局其後會向你發出報稅表。詳見〈報稅時間表〉指南。",
    answerEn:
      "Yes. Even without a return, the law requires you to notify IRD in writing within 4 months after the end of the year of assessment that you have chargeable income; IRD will then issue you a return. See the Filing Deadlines guide for details."
  },
  {
    id: "provisional-holdover",
    questionZh: "暫繳稅金額太高，可否申請減少繳付？",
    questionEn: "My provisional tax bill is too high — can I apply to pay less?",
    answerZh:
      "如你符合法定的緩繳理由（例如預計入息大跌、新增扣除或免稅額、停止經營等），可在限期前向稅務局申請緩繳全部或部分暫繳稅。詳細的法定理由及申請期限請見〈暫繳稅與緩繳〉指南。",
    answerEn:
      "If you meet one of the statutory holdover grounds (e.g. a significant expected fall in income, a new deduction or allowance, ceasing to derive income, and so on), you can apply to IRD before the deadline to hold over all or part of your provisional tax. See the Provisional Tax and Holdover guide for the full grounds and deadlines."
  },
  {
    id: "joint-vs-separate-quick",
    questionZh: "大致上，何時合併評稅或個人入息課稅較有利？何時分開評稅較有利？",
    questionEn: "As a rule of thumb, when does joint assessment or personal assessment help, and when does separate assessment win?",
    answerZh:
      "概括而言：如夫婦入息相差懸殊，或其中一方有大額扣除項目（例如按揭利息、業務虧損）多於自己入息可以扣減，合併評稅或個人入息課稅通常較有利，因為可將盈餘扣除轉移抵銷另一方的入息。如雙方入息相若、各自已用盡扣除及免稅額，分開評稅未必較差。實際結果因人而異，建議一律以本網站優化器的逐項比較為準，不要單憑經驗法則下決定。",
    answerEn:
      "In broad terms: if one spouse's income is much higher, or one spouse has large deductions (mortgage interest, business losses) exceeding their own income, joint assessment or personal assessment usually helps because the surplus deduction offsets the other spouse's income. If incomes are similar and each spouse already uses up their own deductions and allowances, separate assessment may be just as good. Results vary by case — always rely on our optimizer's side-by-side comparison rather than a rule of thumb alone."
  },
  {
    id: "records-to-keep",
    questionZh: "報稅之後，我要保留哪些紀錄？",
    questionEn: "What records should I keep after filing?",
    answerZh:
      "建議保留所有支持你申報數字的文件，包括僱主提供的薪俸證明/報稅表（IR56 系列）、扣除項目的收據（自願醫保保費單、進修學費單、慈善捐款收據等）、租約及租金收據、按揭利息證明、以及物業/生意的帳目紀錄。法例對不同類別的紀錄設有不同的保存年期規定，具體年期請參閱稅務局最新指引，不宜自行假設。",
    answerEn:
      "Keep everything that supports the figures you reported: employer-issued pay/return records (the IR56 series), receipts for deductions claimed (VHIS premium statements, tuition fee receipts, donation receipts), tenancy agreements and rent receipts, mortgage interest certificates, and property/business accounting records. The law sets different minimum retention periods for different record categories — check IRD's current guidance for the exact period rather than assuming one."
  },
  {
    id: "etax-vs-paper",
    questionZh: "eTAX 網上報稅及紙本申報有甚麼分別？",
    questionEn: "What's the difference between filing through eTAX and filing on paper?",
    answerZh:
      "eTAX 網上報稅通常可享有較長的申報限期、即時遞交確認、可查閱過往申報紀錄，亦減省郵寄需時；紙本申報則須親手簽署及以郵寄或親身遞交方式交回，限期一般較短。兩者所需申報的資料內容大致相同，選擇哪一種主要視乎你是否已登記 eTAX 帳戶及個人使用習慣。",
    answerEn:
      "Filing through eTAX typically gives you a longer deadline, an instant submission confirmation, access to your filing history, and no mailing delay. Paper filing requires a physical signature and delivery by post or in person, usually within a shorter deadline. Both require essentially the same information — the choice mainly comes down to whether you have an eTAX account and your own preference."
  },
  {
    id: "privacy-model",
    questionZh: "使用這個計算機是否安全？我的稅務資料會否被上載？",
    questionEn: "Is this calculator safe to use — does my tax data get uploaded anywhere?",
    answerZh:
      "不會。本網站的所有計算均在你的瀏覽器內完成，你輸入的入息、家庭及扣除資料不會傳送到任何伺服器，我們亦沒有帳戶系統或後台資料庫。如你選擇讓精靈記住你的填寫進度，資料只會儲存在你自己裝置的瀏覽器（localStorage）內，你可以隨時按「清除我的資料」刪除。",
    answerEn:
      "No. All computations run entirely inside your own browser. The income, family, and deduction details you enter are never sent to any server, and we have no user accounts or backend database. If you let the wizard remember your progress, that data is stored only in your own device's browser (localStorage), and you can delete it at any time with the \"clear my data\" option."
  },
  {
    id: "does-tool-file-for-me",
    questionZh: "這個工具會否直接替我電子報稅？",
    questionEn: "Does this tool file my tax return for me?",
    answerZh:
      "不會。本網站是純教育及計算輔助工具，並沒有連接到稅務局的 eTAX 系統，亦無法代你提交任何報稅表或文件。你仍須自行透過 eTAX 或紙本方式，向稅務局正式申報。",
    answerEn:
      "No. This site is a purely educational and computational aid — it is not connected to IRD's eTAX system and cannot submit any return or document on your behalf. You still need to file your official return yourself, through eTAX or on paper."
  },
  {
    id: "non-resident-60-day",
    questionZh: "我不是香港居民，只來了香港工作幾十日，是否需要繳付薪俸稅？",
    questionEn: "I'm not a Hong Kong resident and only worked here for a number of days — do I owe salaries tax?",
    answerZh:
      "非香港居民的短期受僱情況，涉及「60 天規則」及按天數比例劃分入息來源等複雜判斷，本網站目前並未提供自動計算，僅作資訊性提示。如你屬於這類情況，強烈建議諮詢執業稅務顧問，確認實際的申報及繳稅義務。",
    answerEn:
      "Short-term work by a non-resident in Hong Kong involves the \"60-day rule\" and time-apportionment of income source, which requires case-specific judgment. This site does not compute this scenario automatically — the note here is informational only. If this applies to you, we strongly recommend consulting a qualified tax adviser to confirm your actual filing and payment obligations."
  },
  {
    id: "reduction-cap-2025-vs-2024",
    questionZh: "為何 2024/25 及 2025/26 課稅年度的寬減上限不一樣？",
    questionEn: "Why is the one-off tax reduction cap different between YA 2024/25 and YA 2025/26?",
    answerZh: REDUCTION_PLACEHOLDER_ZH,
    answerEn: REDUCTION_PLACEHOLDER_EN
  },
  {
    id: "property-tax-no-reduction",
    questionZh: "我只有物業出租、沒有其他入息，是否仍可享有稅務寬減？",
    questionEn: "I only have rental income under Property Tax — do I still get the tax reduction?",
    answerZh: PROPERTY_REDUCTION_PLACEHOLDER_ZH,
    answerEn: PROPERTY_REDUCTION_PLACEHOLDER_EN
  },
  {
    id: "where-figures-come-from",
    questionZh: "網站內的數字（免稅額、上限、稅率）來自哪裡？是否可信？",
    questionEn: "Where do the figures on this site (allowances, caps, rates) come from — can I trust them?",
    answerZh:
      "所有金額及稅率均取自稅務局官方發布的《免稅額、扣除及稅率表》（PAM 61(e)）及相關 ird.gov.hk / gov.hk 官方頁面，並按課稅年度分別存放在網站的參數檔案內，逐項核對來源後才使用；本網站的計算文字內不會直接寫死任何稅務金額，全部即時從已核實的參數計算出來。即使如此，本網站仍屬教育及估算工具，正式數字請以稅務局發出的通知為準。",
    answerEn:
      "All amounts and rates are sourced from IRD's official \"Allowances, Deductions and Tax Rate Table\" (PAM 61(e)) and related ird.gov.hk / gov.hk pages, stored per year of assessment in the site's parameter files after each figure was checked against its source. No tax amount is hard-coded in this site's text — every figure shown is computed live from the verified parameters. That said, this remains an educational and estimation tool; official figures are those on your own notice from IRD."
  }
];

export default function FaqGuidePage() {
  const { lang, year } = useI18n();
  const eyebrowTracking = lang === "en" ? "uppercase tracking-[0.18em]" : "";
  const [openId, setOpenId] = useState<string | null>("first-time-filer");

  const params = getParams(year);
  const params2024 = getParams("2024_25");
  const params2025 = getParams("2025_26");

  const variables = useMemo(
    () => ({
      profitsTierOneCap: hkd(params.profitsTax.tierOneCap),
      profitsTierOneRate: formatPercent(params.profitsTax.tierOneRate),
      profitsStandardRate: formatPercent(params.profitsTax.standardRate),
      mpfMandatoryCap: hkd(params.deductionCaps.mpfMandatory),
      annuityAndTvcCap: hkd(params.deductionCaps.annuityAndTvc),
      childNewbornExtra: hkd(params.allowances.childNewbornExtra),
      childAllowance: hkd(params.allowances.child),
      homeLoanInterestCap: hkd(params.deductionCaps.homeLoanInterest),
      homeLoanInterestElevatedCap: hkd(params.deductionCaps.homeLoanInterestElevated),
      domesticRentCap: hkd(params.deductionCaps.domesticRent),
      domesticRentElevatedCap: hkd(params.deductionCaps.domesticRentElevated),
      reductionCap2024: hkd(params2024.taxReduction.cap),
      reductionCap2025: hkd(params2025.taxReduction.cap),
      reductionPercent: formatPercent(params.taxReduction.percent)
    }),
    [params, params2024, params2025]
  );

  return (
    <main>
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="max-w-3xl">
            <p className={`text-xs font-bold text-teal-700 sm:text-sm ${eyebrowTracking}`}>
              {lang === "zh" ? "報稅指南" : "Filing guide"}
            </p>
            <h1 className="display-hero mt-4 max-w-4xl">
              {lang === "zh" ? "常見問題" : "Frequently Asked Questions"}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-warm-700">
              {lang === "zh"
                ? `以下 ${faqItems.length} 條問題整理自用戶最常詢問的報稅情境。金額會按你在頁首選擇的課稅年度（目前：${t2(year, lang)}）自動更新；如問題本身比較兩個年度，答案會分別列出兩年的數字。`
                : `The ${faqItems.length} questions below cover the situations users ask about most often. Amounts update automatically for the year of assessment selected in the header (currently: ${t2(year, lang)}). Where a question compares two years, both years' figures are shown explicitly.`}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="grid gap-4">
            {faqItems.map((item) => {
              const isOpen = openId === item.id;
              const panelId = `faq-panel-${item.id}`;
              const question = lang === "zh" ? item.questionZh : item.questionEn;
              const answer = interpolate(lang === "zh" ? item.answerZh : item.answerEn, variables);

              return (
                <div key={item.id} className="card overflow-hidden">
                  <h2>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="focus-ring flex min-h-11 w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-bold text-navy-900 transition hover:bg-warm-50 sm:px-6"
                    >
                      <span>{question}</span>
                      <span aria-hidden="true" className="flex-none text-lg leading-none text-teal-700">
                        {isOpen ? "-" : "+"}
                      </span>
                    </button>
                  </h2>
                  {isOpen ? (
                    <div id={panelId} className="px-5 pb-5 sm:px-6 sm:pb-6">
                      <p className="max-w-[65ch] text-base leading-7 text-warm-700">{answer}</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <Container>
          <p className="max-w-3xl text-xs leading-6 text-warm-600">
            {lang === "zh"
              ? "本頁內容僅供一般教育及參考用途，並非稅務意見，亦與稅務局無從屬關係。個別情況可能有例外或額外規定，實際安排請以稅務局最新指引及你本人的通知為準；如有疑問，建議諮詢執業會計師或稅務顧問。"
              : "This page is for general education and reference only. It is not tax advice and this website is not affiliated with the Inland Revenue Department. Individual situations can involve exceptions or additional rules — always rely on IRD's latest guidance and your own notices, and consult a qualified accountant or tax adviser if in doubt."}
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
    maximumFractionDigits: 2
  }).format(value);
}

function interpolate(text: string, variables: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => variables[key] ?? match);
}

function t2(year: "2024_25" | "2025_26", lang: "zh" | "en") {
  const label = year === "2024_25" ? "2024/25" : "2025/26";
  return lang === "zh" ? `${label} 課稅年度` : `YA ${label}`;
}
