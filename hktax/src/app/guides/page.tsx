"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Container } from "@/components/Container";
import { getAllPosts, type Post } from "@/lib/content/posts";
import { useI18n } from "@/lib/i18n/useI18n";
import { getParams } from "@/lib/tax/params";

type GuideCard = {
  href: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  ready: boolean;
};

type Lang = "zh" | "en";
type PostKind = Post["kind"];

const kindLabels: Record<PostKind, { zh: string; en: string }> = {
  "tax-news": { zh: "稅務消息", en: "Tax news" },
  "site-update": { zh: "網站更新", en: "Site update" },
  article: { zh: "文章", en: "Article" }
};

const guideCards: GuideCard[] = [
  {
    href: "/guides/salaries-tax",
    titleZh: "薪俸稅指南",
    titleEn: "Salaries Tax Guide",
    descriptionZh:
      "哪些人須課稅、哪些入息須計算在內、僱主提供居所的租值計算、扣除項目次序、免稅額、累進稅率與標準稅率如何取較低者，以及一次性寬減。",
    descriptionEn:
      "Who is chargeable, what counts as income, employer accommodation rental value, the order of deductions and allowances, progressive vs standard rate, and the one-off reduction.",
    ready: true
  },
  {
    href: "/guides/property-tax",
    titleZh: "物業稅指南",
    titleEn: "Property Tax Guide",
    descriptionZh:
      "應評稅淨值（NAV）如何計算、法定修葺及支出免稅額、共同擁有物業、租約溢價攤分，以及為何物業稅沒有一次性寬減。",
    descriptionEn:
      "How the net assessable value (NAV) is computed, the statutory repairs allowance, co-ownership, lease premium spreading, and why property tax gets no one-off reduction.",
    ready: true
  },
  {
    href: "/guides/profits-tax",
    titleZh: "利得稅（獨資／合夥）指南",
    titleEn: "Profits Tax (Sole Prop / Partnership) Guide",
    descriptionZh:
      "哪些人要報利得稅、應評稅利潤如何計算、常見不可扣除項目、簡化折舊免稅額，以及兩級制利得稅率與虧損結轉。",
    descriptionEn:
      "Who must file, how assessable profits are computed, common non-deductible items, simplified capital allowances, the two-tiered profits tax rate, and loss carry-forward.",
    ready: true
  },
  {
    href: "/guides/personal-assessment",
    titleZh: "個人入息課稅詳解",
    titleEn: "Personal Assessment Explained",
    descriptionZh:
      "個人入息課稅是甚麼、哪些人選擇後會節省稅款、哪些人不會受惠、夫婦選擇規則，以及我們的計算工具如何自動比較各個方案。",
    descriptionEn:
      "What Personal Assessment actually is, who benefits from electing it, who doesn't, married-couple election rules, and how our optimizer compares the options.",
    ready: true
  },
  {
    href: "/guides/provisional-tax",
    titleZh: "暫繳稅指南",
    titleEn: "Provisional Tax Guide",
    descriptionZh: "暫繳稅如何計算、如何與最終稅款合併在同一張繳稅通知書上徵收，以及申請緩繳的法定理由。",
    descriptionEn:
      "How provisional tax is assembled alongside your final assessment, and the statutory grounds for holding it over.",
    ready: true
  },
  {
    href: "/guides/deadlines",
    titleZh: "報稅及繳稅時間表",
    titleEn: "Filing & Payment Deadlines",
    descriptionZh: "BIR60 發出日期、遞交期限、電子報稅／獨資業務延期，以及一般繳稅日期。",
    descriptionEn:
      "When BIR60 is issued, filing deadlines including eTAX and sole-proprietor extensions, and typical payment dates.",
    ready: true
  },
  {
    href: "/guides/objections",
    titleZh: "反對評稅及暫緩繳稅",
    titleEn: "Objections & Holdover Basics",
    descriptionZh: "如何對評稅提出反對、時限，以及申請暫緩繳交暫繳稅的基本步驟。",
    descriptionEn:
      "How to object to an assessment, the time limit, and the basics of applying to hold over provisional tax.",
    ready: true
  },
  {
    href: "/guides/faq",
    titleZh: "常見問題",
    titleEn: "Frequently Asked Questions",
    descriptionZh: "整合大家最常問的香港個人稅務問題，一次解答。",
    descriptionEn: "Answers to the questions Hong Kong taxpayers ask most often.",
    ready: true
  },
  {
    href: "/guides/glossary",
    titleZh: "稅務詞彙中英對照",
    titleEn: "Tax Glossary",
    descriptionZh: "本網站使用的稅務術語中英對照表，一目了然。",
    descriptionEn: "A bilingual glossary of every tax term used on this site.",
    ready: true
  }
];

const posts = getAllPosts();

export default function GuidesPage() {
  const { lang, year } = useI18n();
  const eyebrowTracking = lang === "en" ? "uppercase tracking-[0.18em]" : "";
  const labelTracking = lang === "en" ? "uppercase tracking-[0.12em]" : "";
  const params = getParams(year);
  const params2024 = getParams("2024_25");
  const params2025 = getParams("2025_26");

  const variables = useMemo(
    () => ({
      reductionCap2024: hkd(params2024.taxReduction.cap, lang),
      reductionCap2025: hkd(params2025.taxReduction.cap, lang),
      reductionPercent: formatPercent(params.taxReduction.percent, lang)
    }),
    [lang, params.taxReduction.percent, params2024.taxReduction.cap, params2025.taxReduction.cap]
  );

  return (
    <main>
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="max-w-3xl">
            <p className={`text-xs font-bold text-teal-700 sm:text-sm ${eyebrowTracking}`}>
              {lang === "zh" ? "稅務指南" : "Guides"}
            </p>
            <h1 className="display-hero mt-4 max-w-4xl">
              {lang === "zh" ? "了解香港個人稅務" : "Understand Hong Kong personal tax"}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-warm-700">
              {lang === "zh"
                ? "在使用計算工具之前，建議先參閱相關指南，了解薪俸稅、物業稅、利得稅及個人入息課稅的基本概念、計算方法及常見陷阱。所有金額按頁首所選擇的課稅年度自動更新。"
                : "Before you use the calculators, it helps to read the relevant guide first — the basic concepts, how each computation works, and common pitfalls for salaries tax, property tax, profits tax, and Personal Assessment. Amounts throughout update automatically for the year of assessment selected in the header."}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="mb-12 max-w-4xl">
            <h2 className="display-section">
              {lang === "zh" ? "參考指南" : "Reference guides"}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guideCards.map((guide) => (
              <Link key={guide.href} href={guide.href} className="card focus-ring flex flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold leading-tight text-navy-900">
                    {lang === "zh" ? guide.titleZh : guide.titleEn}
                  </h2>
                  {!guide.ready ? (
                    <span className={`flex-none rounded-full bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700 ${labelTracking}`}>
                      {lang === "zh" ? "即將推出" : "Coming soon"}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 flex-1 text-sm leading-6 text-warm-700">
                  {lang === "zh" ? guide.descriptionZh : guide.descriptionEn}
                </p>
                <span className="mt-4 text-sm font-semibold text-teal-700">
                  {lang === "zh" ? "閱讀指南 →" : "Read guide →"}
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="max-w-4xl">
            <h2 className="display-section">
              {lang === "zh" ? "最新消息與文章" : "Updates & articles"}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-warm-700">
              {lang === "zh"
                ? "參考指南整理稅務規則；這裡集中記錄最新改動、網站更新及實用做法。"
                : "The reference guides explain the rules; this section covers recent changes, site updates, and practical how-tos."}
            </p>
          </div>

          {posts.length ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const title = interpolate(lang === "zh" ? post.titleZh : post.titleEn, variables);
                const summary = interpolate(lang === "zh" ? post.summaryZh : post.summaryEn, variables);

                return (
                  <Link
                    key={post.slug}
                    href={`/guides/posts/${post.slug}`}
                    className="card focus-ring flex flex-col p-6"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-md bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 ${labelTracking}`}>
                        {kindLabels[post.kind][lang]}
                      </span>
                      <span className="text-sm font-medium text-warm-600">
                        {formatDate(post.publishedISO, lang)}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold leading-tight text-navy-900">{title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-warm-700">{summary}</p>
                    <span className="mt-4 text-sm font-semibold text-teal-700">
                      {lang === "zh" ? "閱讀文章 →" : "Read post →"}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="card mt-8 p-6 text-sm leading-6 text-warm-700">
              {lang === "zh" ? "暫時未有最新文章。" : "No updates yet."}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}

function hkd(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "zh" ? "zh-HK" : "en-HK", {
    style: "currency",
    currency: "HKD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "zh" ? "zh-HK" : "en-HK", {
    style: "percent",
    maximumFractionDigits: 2
  }).format(value);
}

function formatDate(value: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-HK" : "en-HK", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00+08:00`));
}

function interpolate(text: string, variables: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => variables[key] ?? match);
}
