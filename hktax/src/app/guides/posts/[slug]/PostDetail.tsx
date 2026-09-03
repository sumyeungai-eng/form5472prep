"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/motion/Reveal";
import { useI18n } from "@/lib/i18n/useI18n";
import type { Post, PostBlock } from "@/lib/content/posts";
import { getParams } from "@/lib/tax/params";

type Lang = "zh" | "en";
type PostKind = Post["kind"];

const kindLabels: Record<PostKind, { zh: string; en: string }> = {
  "tax-news": { zh: "稅務消息", en: "Tax news" },
  "site-update": { zh: "網站更新", en: "Site update" },
  article: { zh: "文章", en: "Article" }
};

export function PostDetail({ post }: { post: Post }) {
  const { lang, t, year } = useI18n();
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

  const title = interpolate(lang === "zh" ? post.titleZh : post.titleEn, variables);
  const summary = interpolate(lang === "zh" ? post.summaryZh : post.summaryEn, variables);
  const body = lang === "zh" ? post.bodyZh : post.bodyEn;

  return (
    <main>
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="max-w-3xl">
            <Link
              href="/guides"
              className="focus-ring inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              {lang === "zh" ? "← 返回稅務指南" : "← Back to guides"}
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className={`rounded-md bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 ${labelTracking}`}>
                {kindLabels[post.kind][lang]}
              </span>
              <span className="text-sm font-medium text-warm-600">
                {formatDate(post.publishedISO, lang)}
              </span>
            </div>
            <h1 className="display-hero mt-4 max-w-4xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-warm-700">{summary}</p>
            <dl className="mt-6 grid gap-3 text-sm text-warm-700 sm:grid-cols-2">
              <div className="card px-4 py-3">
                <dt className="font-semibold text-navy-900">
                  {lang === "zh" ? "發布日期" : "Published"}
                </dt>
                <dd className="mt-1">{formatDate(post.publishedISO, lang)}</dd>
              </div>
              <div className="card px-4 py-3">
                <dt className="font-semibold text-navy-900">
                  {lang === "zh" ? "最後覆核" : "Last reviewed"}
                </dt>
                <dd className="mt-1">{formatDate(post.reviewedISO, lang)}</dd>
              </div>
            </dl>
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-20 sm:py-24 lg:py-28">
        <Container>
          <Reveal>
            <article className="card max-w-4xl p-6 sm:p-8">
              <div className="max-w-[65ch] space-y-5 text-base leading-7 text-warm-700 sm:leading-8">
                {body.map((block, index) => renderBlock(block, index, variables))}
              </div>
            </article>
          </Reveal>
        </Container>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <Container>
          <div className="max-w-3xl space-y-6">
            {post.sources?.length ? (
              <div className="card p-5">
                <h2 className={`text-sm font-bold text-navy-900 ${labelTracking}`}>
                  {lang === "zh" ? "官方來源" : "Official sources"}
                </h2>
                <ul className="mt-4 space-y-2 text-sm leading-6">
                  {post.sources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-ring text-teal-700 hover:text-teal-800 hover:underline"
                      >
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {post.tags?.length ? (
              <div className="flex flex-wrap gap-2" aria-label={lang === "zh" ? "標籤" : "Tags"}>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-warm-200 bg-warm-50 px-3 py-1 text-xs font-semibold text-warm-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="card bg-warm-50 p-5 text-sm leading-6 text-warm-700">
              <p>{t("disclaimer.banner")}</p>
              <p className="mt-3">
                {lang === "zh"
                  ? `本文內容以發布日期（${formatDate(post.publishedISO, lang)}）當時已核對的資料為基礎；現行規則請以稅務局最新公布為準。`
                  : `This post reflects the position checked as at its published date (${formatDate(post.publishedISO, lang)}); check the IRD for the current rules.`}
              </p>
              <Link href="/guides" className="mt-4 inline-block font-semibold text-teal-700 hover:underline">
                {lang === "zh" ? "← 返回稅務指南" : "← Back to guides"}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

function renderBlock(block: PostBlock, index: number, variables: Record<string, string>) {
  if (block.type === "heading") {
    return (
      <h2 key={index} className="display-subsection pt-3">
        {interpolate(block.text, variables)}
      </h2>
    );
  }

  if (block.type === "list") {
    return (
      <ul key={index} className="list-disc space-y-2 pl-5">
        {block.items.map((item) => (
          <li key={item}>{interpolate(item, variables)}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "callout") {
    return (
      <div key={index} className="rounded-md border border-teal-100 bg-teal-50 p-4 font-medium leading-7 text-navy-900">
        {interpolate(block.text, variables)}
      </div>
    );
  }

  return <p key={index}>{interpolate(block.text, variables)}</p>;
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
