"use client";

import Link from "next/link";
import { Container } from "@/components/Container";
import { useI18n } from "@/lib/i18n/useI18n";

type Bi = { zh: string; en: string };

const objectionSteps: Bi[] = [
  {
    zh: "留意評稅通知書上列明的發出日期；反對期限一般為該發出日起計 1 個月。",
    en: "Note the date of the notice of assessment. The objection deadline is generally 1 month from the date it was issued."
  },
  {
    zh: "以書面方式提出反對，說明反對的具體理由（例如漏報扣除項目、入息計算有誤、免稅額未包括在內）。",
    en: "Lodge your objection in writing, stating the specific grounds (e.g. an omitted deduction, an income computation error, or an allowance that was left out)."
  },
  {
    zh: "填交 IR831 表格，或透過 eTAX 帳戶在網上提交反對通知書；兩種方式均須在期限內完成。",
    en: "Submit using form IR831, or lodge the notice of objection online through your eTAX account — either channel must be completed before the deadline."
  },
  {
    zh: "保留支持你反對理由的文件（收據、僱主證明、租約等），稅務局可能要求提供補充資料。",
    en: "Keep the documents that support your grounds (receipts, employer certificates, tenancy agreements, etc.) — IRD may request supplementary information."
  }
];

const s70aPoints: Bi[] = [
  {
    zh: "適用於評稅已經「作實」（即反對期已過或評稅已根據協議定案）之後，才發現入息或利潤申報有「錯誤或遺漏」的情況。",
    en: "Applies after an assessment has become final and conclusive (the objection period has passed, or the assessment was settled by agreement) and an error or omission in the reported income or profits is then discovered."
  },
  {
    zh: "須以書面向稅務局申請更正，並須在有關課稅年度完結後 6 年內，或評稅通知書發出日起計 6 個月內（以較遲者為準）提出。",
    en: "A written application to correct the assessment must be made within 6 years after the end of the relevant year of assessment, or within 6 months of the date of the notice of assessment, whichever is later."
  },
  {
    zh: "s.70A 更正機制的門檻與一般反對不同：它一般只涵蓋客觀的計算或事實錯誤，而不包括單純與稅務局意見不同的情況。個案是否符合資格，建議諮詢專業人士。",
    en: "The s.70A correction mechanism has a different threshold from a normal objection — it generally covers objective computational or factual errors, not a mere difference of opinion with IRD's judgment. Seek professional advice to confirm whether your situation qualifies."
  }
];

export default function ObjectionsGuidePage() {
  const { lang } = useI18n();
  const eyebrowTracking = lang === "en" ? "uppercase tracking-[0.18em]" : "";

  return (
    <main>
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="max-w-3xl">
            <p className={`text-xs font-bold text-teal-700 sm:text-sm ${eyebrowTracking}`}>
              {lang === "zh" ? "報稅指南" : "Filing guide"}
            </p>
            <h1 className="display-hero mt-4 max-w-4xl">
              {lang === "zh" ? "反對評稅與更正" : "Objections and Corrections"}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-warm-700">
              {lang === "zh"
                ? "如果你認為稅務局發出的評稅通知書有誤，或發現自己申報時有遺漏，香港稅制提供兩種主要途徑作出糾正：在評稅作實前提出「反對」，或在評稅作實後按 s.70A 申請「更正」。以下概述兩者的基本流程及注意事項。"
                : "If you believe a notice of assessment is wrong, or you discover an error in what you reported, Hong Kong's tax system offers two main routes to correct it: lodging an objection before the assessment becomes final, or applying for a correction under s.70A after it has become final. This page outlines the basics of each and what to watch for."}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-20 sm:py-24 lg:py-28">
        <Container>
          <h2 className="display-section">
            {lang === "zh" ? "反對評稅：一個月期限" : "Objecting to an assessment: the 1-month deadline"}
          </h2>
          <p className="mt-4 max-w-[65ch] text-base leading-7 text-warm-700">
            {lang === "zh"
              ? "反對評稅是最常用的糾正途徑，必須在評稅通知書發出日起計 1 個月內提出，逾期一般不獲受理（除非能證明有合理原因並經稅務局酌情接納）。"
              : "Objecting is the most commonly used route and must be lodged within 1 month of the date the notice of assessment was issued. Late objections are generally not accepted unless you can show reasonable cause and IRD exercises its discretion to allow it."}
          </p>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2">
            {objectionSteps.map((step, index) => (
              <li key={step.en} className="card flex gap-4 p-5">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white"
                >
                  {index + 1}
                </span>
                <p className="text-base leading-7 text-warm-700">{step[lang]}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <h2 className="display-section">
            {lang === "zh" ? "s.70A：評稅作實後的錯誤或遺漏更正" : "s.70A: correcting an error or omission after finality"}
          </h2>
          <p className="mt-4 max-w-[65ch] text-base leading-7 text-warm-700">
            {lang === "zh"
              ? "如反對期已過，但你其後發現原本申報有錯誤或遺漏，《稅務條例》第 70A 條提供有限度的補救機制。"
              : "If the objection period has already passed but you later discover an error or omission in what was originally reported, section 70A of the Inland Revenue Ordinance provides a limited remedy."}
          </p>
          <ul className="mt-6 max-w-[65ch] space-y-3">
            {s70aPoints.map((point) => (
              <li key={point.en} className="flex gap-2 text-base leading-7 text-warm-700">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-gold" />
                <span>{point[lang]}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-warm-50 py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="card p-6">
              <h2 className="display-subsection">
                {lang === "zh" ? "反對期間仍須繼續繳稅，或申請暫緩繳稅" : "Keep paying, or apply to hold over, while you object"}
              </h2>
              <p className="mt-4 max-w-[65ch] text-base leading-7 text-warm-700">
                {lang === "zh"
                  ? "提出反對並不會自動暫停繳稅的責任。如評稅通知書列明的稅款到期，你原則上仍須按時繳付；如不希望在爭議未解決前先行繳付有爭議的部分，可同時向稅務局申請「暫緩繳稅」，惟是否批准由稅務局按情況酌情決定，並可能要求你先繳付部分稅款或提供擔保。詳見〈暫繳稅與緩繳〉指南。"
                  : "Lodging an objection does not automatically suspend your obligation to pay. If the tax shown on the notice falls due, you generally must still pay it on time. If you do not want to pay the disputed portion while the matter is unresolved, you can separately apply to hold over payment — approval is at IRD's discretion and may require partial payment or security. See the Provisional Tax and Holdover guide for more detail."}
              </p>
            </article>

            <article className="card p-6">
              <h2 className="display-subsection">
                {lang === "zh" ? "何時應該尋求專業意見" : "When to seek professional advice"}
              </h2>
              <ul className="mt-4 space-y-3 text-base leading-7 text-warm-700">
                <li className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-gold" />
                  <span>
                    {lang === "zh"
                      ? "爭議涉及金額龐大，或涉及複雜的入息來源地、稅務居民身分或商業安排問題。"
                      : "The disputed amount is significant, or involves complex source-of-income, residency, or business-structure questions."}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-gold" />
                  <span>
                    {lang === "zh"
                      ? "反對期或 s.70A 期限已經或即將屆滿，需要判斷是否仍有補救空間。"
                      : "The objection window or the s.70A deadline has passed or is about to pass, and you need to assess whether any remedy remains."}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-gold" />
                  <span>
                    {lang === "zh"
                      ? "稅務局要求提交補充文件、展開實地審核，或個案已轉介稅務上訴委員會處理。"
                      : "IRD has requested supplementary documents, initiated a field audit, or the case has been referred to the Board of Review."}
                  </span>
                </li>
              </ul>
            </article>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <Container>
          <p className="max-w-3xl text-xs leading-6 text-warm-600">
            {lang === "zh"
              ? "本頁內容僅供一般教育及參考用途，並非稅務意見；本網站與稅務局並無從屬關係。反對及更正的期限、表格編號及審批安排，均以《稅務條例》及稅務局最新指引為準，本網站不會代你向稅務局提交任何文件；如個案複雜或爭議金額較大，建議諮詢執業會計師或稅務顧問。"
              : "This page is for general education and reference only. It is not tax advice and this website is not affiliated with the Inland Revenue Department. Deadlines, form numbers, and approval processes for objections and corrections are governed by the Inland Revenue Ordinance and IRD's latest guidance; this website does not submit anything to IRD on your behalf. For complex cases or significant disputed amounts, consult a qualified accountant or tax adviser."}
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
