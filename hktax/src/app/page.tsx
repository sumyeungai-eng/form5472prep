"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { FeatureCard } from "@/components/FeatureCard";
import { Reveal } from "@/components/motion/Reveal";
import { useI18n } from "@/lib/i18n/useI18n";

const features = [
  {
    href: "/wizard",
    imageSrc: "/images/card-salaries.webp",
    titleKey: "home.features.salaries.title",
    descriptionKey: "home.features.salaries.description",
    altKey: "home.features.salaries.alt"
  },
  {
    href: "/calculators",
    imageSrc: "/images/card-property.webp",
    titleKey: "home.features.property.title",
    descriptionKey: "home.features.property.description",
    altKey: "home.features.property.alt"
  },
  {
    href: "/calculators",
    imageSrc: "/images/card-profits.webp",
    titleKey: "home.features.profits.title",
    descriptionKey: "home.features.profits.description",
    altKey: "home.features.profits.alt"
  },
  {
    href: "/wizard",
    imageSrc: "/images/card-family.webp",
    titleKey: "home.features.family.title",
    descriptionKey: "home.features.family.description",
    altKey: "home.features.family.alt"
  }
] as const;

const steps = [
  {
    titleKey: "home.how.step1.title",
    descriptionKey: "home.how.step1.description"
  },
  {
    titleKey: "home.how.step2.title",
    descriptionKey: "home.how.step2.description"
  },
  {
    titleKey: "home.how.step3.title",
    descriptionKey: "home.how.step3.description"
  }
] as const;

export default function Home() {
  const { lang, t } = useI18n();
  const eyebrowTracking = lang === "en" ? "tracking-[0.18em]" : "";
  const trustKeys = [
    "home.hero.trust.ird",
    "home.hero.trust.browser",
    "home.hero.trust.free"
  ] as const;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-950 text-white">
        <Image
          src="/images/og-image.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.13] mix-blend-luminosity saturate-50"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 22% 18%, rgb(212 169 78 / 0.38) 0, rgb(212 169 78 / 0.2) 19rem, transparent 39rem), radial-gradient(circle at 82% 24%, rgb(59 161 157 / 0.2) 0, transparent 30rem), linear-gradient(135deg, rgb(7 20 38 / 0.98) 0%, rgb(14 32 56 / 0.9) 48%, rgb(7 20 38 / 0.98) 100%)"
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgb(255 255 255 / 0.12) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.12) 1px, transparent 1px)",
            backgroundSize: "44px 44px"
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-warm-50 to-transparent" />

        <Container className="relative z-10 grid min-h-[calc(100svh-9rem)] items-center gap-12 py-20 sm:py-24 lg:grid-cols-[minmax(0,0.92fr)_minmax(340px,0.62fr)] lg:py-28">
          <div className="max-w-3xl">
            <p
              className={`mb-5 animate-rise-in text-xs font-bold uppercase text-gold sm:text-sm ${eyebrowTracking}`}
            >
              {t("home.hero.eyebrow")}
            </p>
            <h1
              className="display-hero max-w-4xl animate-rise-in text-white"
              style={{ animationDelay: "70ms" }}
            >
              {t("home.hero.title")}
            </h1>
            <p
              className="mt-6 max-w-2xl animate-rise-in text-lg leading-8 text-teal-50 sm:text-xl"
              style={{ animationDelay: "140ms" }}
            >
              {t("home.hero.subtitle")}
            </p>
            <div
              className="mt-9 flex animate-rise-in flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "210ms" }}
            >
              <Link href="/wizard" className="btn-primary">
                {t("home.hero.primaryCta")}
              </Link>
              <Link href="/calculators" className="btn-secondary">
                {t("home.hero.secondaryCta")}
              </Link>
            </div>
            <div
              className="mt-8 flex animate-rise-in flex-wrap gap-2.5"
              style={{ animationDelay: "280ms" }}
            >
              {trustKeys.map((key) => (
                <span
                  key={key}
                  className="inline-flex min-h-9 items-center rounded-md border border-white/15 bg-white/[0.08] px-3 text-xs font-semibold leading-5 text-white shadow-button backdrop-blur sm:text-sm"
                >
                  {t(key)}
                </span>
              ))}
            </div>
          </div>

          <div
            aria-hidden="true"
            className="relative hidden aspect-[4/3] min-h-[390px] overflow-hidden rounded-lg border border-white/[0.12] bg-white/[0.06] p-6 shadow-card backdrop-blur-xl lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-gold/10" />
            <div className="absolute left-6 right-6 top-6 h-24 rounded-md border border-white/10 bg-navy-950/45" />
            <div className="absolute left-10 top-11 h-3 w-28 rounded-full bg-gold/80" />
            <div className="absolute left-10 top-[4.25rem] h-2 w-44 rounded-full bg-white/[0.18]" />
            <div className="absolute left-10 top-24 h-2 w-32 rounded-full bg-teal-400/30" />
            <div className="absolute bottom-7 left-6 right-6 top-40 grid grid-cols-5 items-end gap-3">
              {[52, 70, 46, 86, 62].map((height, index) => (
                <div
                  key={height}
                  className="rounded-t-md border border-white/10 bg-white/[0.07]"
                  style={{ height: `${height + index * 4}%` }}
                >
                  <div className="h-1/3 rounded-t-md bg-gradient-to-b from-gold/70 to-gold/10" />
                </div>
              ))}
            </div>
            <div className="absolute bottom-6 left-6 right-6 h-px bg-white/[0.14]" />
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="max-w-4xl">
            <p
              className={`text-xs font-bold uppercase text-teal-700 sm:text-sm ${eyebrowTracking}`}
            >
              {t("home.features.eyebrow")}
            </p>
            <h2 className="display-section mt-4">
              {t("home.features.title")}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Reveal key={feature.titleKey} delayMs={index * 70}>
                <FeatureCard
                  href={feature.href}
                  imageSrc={feature.imageSrc}
                  imageAlt={t(feature.altKey)}
                  title={t(feature.titleKey)}
                  description={t(feature.descriptionKey)}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div>
              <p
                className={`text-xs font-bold uppercase text-teal-700 sm:text-sm ${eyebrowTracking}`}
              >
                {t("home.how.eyebrow")}
              </p>
              <h2 className="display-section mt-4">
                {t("home.how.title")}
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {steps.map((step, index) => (
                <Reveal key={step.titleKey} delayMs={index * 70}>
                  <article className="card h-full p-6">
                    <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-md bg-navy-950 text-sm font-black text-gold shadow-button">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <h3 className="text-lg font-bold text-navy-950">
                      {t(step.titleKey)}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-warm-700">
                      {t(step.descriptionKey)}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-navy-950 py-14 text-white sm:py-16">
        <Container>
          <div className="grid gap-5 border-y border-white/10 py-8 sm:grid-cols-[0.38fr_1fr] sm:items-center sm:py-10">
            <Reveal delayMs={0}>
              <p className="display-subsection text-gold">
                {t("home.privacy.title")}
              </p>
            </Reveal>
            <Reveal delayMs={70}>
              <p className="max-w-3xl text-base leading-7 text-teal-50 sm:text-lg">
                {t("home.privacy.note")}
              </p>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
