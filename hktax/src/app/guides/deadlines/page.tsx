"use client";

import Link from "next/link";
import { Container } from "@/components/Container";
import { useI18n } from "@/lib/i18n/useI18n";

type Bi = { zh: string; en: string };

type TimelineStep = {
  id: string;
  when: Bi;
  title: Bi;
  detail: Bi;
};

const timeline: TimelineStep[] = [
  {
    id: "issue",
    when: { zh: "約每年五月初", en: "Typically early May" },
    title: { zh: "稅務局發出報稅表（BIR60）", en: "IRD issues the BIR60 tax return" },
    detail: {
      zh: "稅務局一般在每個課稅年度完結後不久，向已知有應課稅入息的納稅人發出個別人士報稅表（BIR60）。收到報稅表並不代表你一定須要繳稅，但必須按期填交。",
      en: "Shortly after each year of assessment ends, IRD generally issues the Individual Tax Return (BIR60) to taxpayers with known chargeable income. Receiving the form does not automatically mean tax is due, but it must be dealt with by the deadline."
    }
  },
  {
    id: "paper",
    when: { zh: "發出日起計約 1 個月", en: "About 1 month from the date of issue" },
    title: { zh: "紙本報稅表的申報期限", en: "Paper filing deadline" },
    detail: {
      zh: "如以紙本方式填交報稅表，一般限期為報稅表發出日起計約一個月內，將已簽署的報稅表連同所需附表寄回或親身遞交稅務局。",
      en: "If you file on paper, the typical deadline is about one month from the date the return was issued — you sign and return the form (with any required supplementary forms) by post or in person."
    }
  },
  {
    id: "etax",
    when: { zh: "電子報稅可自動獲得延期", en: "Automatic extension for eTAX filing" },
    title: { zh: "透過 eTAX 網上報稅", en: "Filing online through eTAX" },
    detail: {
      zh: "透過稅務局 eTAX 網上系統報稅，通常可自動獲得較紙本申報更長的期限。具體延長天數每年可能不同，請以你 eTAX 帳戶內顯示的實際限期為準。",
      en: "Filing through IRD's eTAX online system usually grants an automatic extension beyond the paper deadline. The exact number of extra days can vary year to year — always check the actual due date shown in your own eTAX account."
    }
  },
  {
    id: "sole-prop",
    when: { zh: "約發出日起計 3 個月（無帳目審計要求的獨資業務）", en: "About 3 months from issue (unaudited sole-proprietorship cases)" },
    title: { zh: "有獨資業務人士的延長限期", en: "Extended deadline for sole-proprietorship cases" },
    detail: {
      zh: "如報稅表包含須申報的獨資業務利潤（第 5 部分），稅務局一般會給予較長的申報期限，約為發出日起計三個月，方便獨資經營者預備帳目。實際延期日數請以報稅表及稅務局通知為準。",
      en: "Where the return includes sole-proprietorship business profits (Part 5), IRD generally allows a longer filing window — roughly three months from issue — to give business owners time to prepare accounts. Always confirm the exact extended date on your return or IRD's notice."
    }
  },
  {
    id: "payment",
    when: { zh: "典型繳款月份：一月及四月", en: "Typical payment months: January and April" },
    title: { zh: "繳稅日期（與申報期限分開計算）", en: "Payment dates (separate from the filing deadline)" },
    detail: {
      zh: "申報限期與繳稅日期是兩件不同的事：即使已按時報稅，稅務局評稅後仍會另行發出繳稅通知書，典型的兩期繳款日期分別在一月及四月左右（詳見〈暫繳稅與緩繳〉指南）。",
      en: "The filing deadline and the payment date are different things. Even after you file on time, IRD issues a separate demand note once the assessment is raised, typically due in two instalments around January and April (see the Provisional Tax and Holdover guide for details)."
    }
  }
];

export default function DeadlinesGuidePage() {
  const { lang } = useI18n();
  const eyebrowTracking = lang === "en" ? "uppercase tracking-[0.18em]" : "";
  const labelTracking = lang === "en" ? "uppercase tracking-[0.12em]" : "";

  return (
    <main>
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="max-w-3xl">
            <p className={`text-xs font-bold text-teal-700 sm:text-sm ${eyebrowTracking}`}>
              {lang === "zh" ? "報稅指南" : "Filing guide"}
            </p>
            <h1 className="display-hero mt-4 max-w-4xl">
              {lang === "zh" ? "報稅時間表" : "Filing Deadlines Timeline"}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-warm-700">
              {lang === "zh"
                ? "以下是香港個人報稅一年一度的典型時間表，涵蓋報稅表發出、申報限期、電子報稅延期，以及繳稅日期。所有日期均屬一般行政安排；行政安排或有變動，實際限期請以你本人的報稅表及繳稅通知書為準。"
                : "Below is the typical annual cycle for Hong Kong individual tax filing — from when the return is issued, through filing deadlines and the eTAX extension, to payment dates. All dates describe general administrative practice. Always check the actual deadlines on your own return and demand note — administrative arrangements can change."}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-20 sm:py-24 lg:py-28">
        <Container>
          <ol className="relative ml-3 space-y-8 border-l-2 border-teal-200 pl-8 sm:ml-6">
            {timeline.map((step, index) => (
              <li key={step.id} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[2.55rem] flex h-8 w-8 items-center justify-center rounded-full border-4 border-warm-50 bg-navy-900 text-xs font-bold text-white"
                >
                  {index + 1}
                </span>
                <div className="card p-6">
                  <p className={`text-xs font-bold text-teal-700 ${labelTracking}`}>
                    {step.when[lang]}
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-navy-900">{step.title[lang]}</h2>
                  <p className="mt-3 max-w-[65ch] text-base leading-7 text-warm-700">{step.detail[lang]}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="card p-6">
              <h2 className="display-subsection">
                {lang === "zh" ? "未收到報稅表但有應課稅入息？" : "No return received, but you have chargeable income?"}
              </h2>
              <p className="mt-4 max-w-[65ch] text-base leading-7 text-warm-700">
                {lang === "zh"
                  ? "即使未曾收到稅務局發出的報稅表，如你在有關課稅年度有應課稅入息（例如新受僱、新開業或新增租金收入），法例規定你必須在該課稅年度完結後的 4 個月內，主動以書面通知稅務局你須予課稅，稅務局其後會發出報稅表要求你申報。不主動通知並不能免除報稅責任。"
                  : "Even if you never receive a return from IRD, if you have chargeable income for the year (for example, a new job, a new business, or new rental income), the law requires you to notify IRD in writing within 4 months after the end of that year of assessment that you are chargeable to tax. IRD will then issue a return for you to complete. Staying silent does not remove the filing obligation."}
              </p>
            </article>

            <article className="card p-6">
              <h2 className="display-subsection">
                {lang === "zh" ? "逾期申報的後果（概述）" : "Consequences of late filing (overview)"}
              </h2>
              <ul className="mt-4 space-y-3 text-base leading-7 text-warm-700">
                <li className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-gold" />
                  <span>
                    {lang === "zh"
                      ? "稅務局可能先向你作出「估計評稅」，金額可能高於你實際應繳的稅款。"
                      : "IRD may raise an estimated assessment first, which can be higher than your actual liability."}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-gold" />
                  <span>
                    {lang === "zh"
                      ? "如持續不遵從規定而又無合理辯解，可能引致罰款、附加費，情況嚴重者甚至可被檢控；具體金額及安排由稅務局按個案及現行法例厘定，本網站不會臆測具體數字。"
                      : "Continued non-compliance without reasonable excuse can lead to penalties, additional charges, and in serious cases prosecution — the exact amounts and thresholds are set by IRD and current legislation on a case-by-case basis, and this website does not speculate on specific figures."}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-gold" />
                  <span>
                    {lang === "zh"
                      ? "即使已被估計評稅，你通常仍可在指定期限內提出反對，並提交實際數字要求更正（見〈反對評稅與更正〉指南）。"
                      : "Even after an estimated assessment, you can usually still object within the applicable deadline and correct it with your actual figures (see the Objections and Corrections guide)."}
                  </span>
                </li>
              </ul>
            </article>
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-14 sm:py-16">
        <Container>
          <p className="max-w-3xl text-xs leading-6 text-warm-600">
            {lang === "zh"
              ? "本頁內容僅供一般教育及參考用途，並非稅務意見；本網站與稅務局並無從屬關係。報稅表發出日期、申報限期、電子報稅延期天數及罰則安排，均可能因年度或個別情況而有所不同，實際安排請以你本人的報稅表、繳稅通知書及稅務局最新公布為準；如有疑問，建議諮詢執業會計師或稅務顧問。"
              : "This page is for general education and reference only. It is not tax advice and this website is not affiliated with the Inland Revenue Department. Issue dates, filing deadlines, eTAX extension lengths, and penalty arrangements can vary by year or by case — always rely on your own return, demand note, and IRD's latest announcements, and consult a qualified accountant or tax adviser if in doubt."}
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
