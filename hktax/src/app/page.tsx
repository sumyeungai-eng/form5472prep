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
  const { t } = useI18n();

  return (
    <>
      <style>
        {`
          @keyframes heroZoom {
            0% {
              transform: scale(1.04);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
      <section className="relative isolate min-h-[calc(100svh-9rem)] overflow-hidden bg-navy-900 text-white">
        <Image
          src="/images/og-image.webp"
          alt={t("home.hero.imageAlt")}
          fill
          priority
          sizes="100vw"
          className="animate-[heroZoom_1.1s_cubic-bezier(0.16,1,0.3,1)_both] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/85 to-navy-800/35" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-warm-50 to-transparent" />

        <Container className="relative z-10 flex min-h-[calc(100svh-9rem)] items-center py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="mb-4 animate-rise-in text-sm font-semibold uppercase tracking-[0.16em] text-gold">
              {t("home.hero.eyebrow")}
            </p>
            <h1
              className="max-w-3xl animate-rise-in text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
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
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-16 sm:py-20">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
              {t("home.features.eyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-navy-900 sm:text-4xl">
              {t("home.features.title")}
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
                {t("home.how.eyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-navy-900 sm:text-4xl">
                {t("home.how.title")}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {steps.map((step, index) => (
                <Reveal key={step.titleKey} delayMs={index * 70}>
                  <article className="rounded-lg border border-warm-200 bg-warm-50 p-5">
                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-navy-900 text-sm font-bold text-gold">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-navy-900">
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

      <section className="bg-navy-900 py-10 text-white">
        <Container>
          <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
            <Reveal delayMs={0}>
              <p className="text-base font-semibold text-gold">
                {t("home.privacy.title")}
              </p>
            </Reveal>
            <Reveal delayMs={70}>
              <p className="text-base leading-7 text-teal-50">
                {t("home.privacy.note")}
              </p>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
