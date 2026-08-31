"use client";

import { Container } from "@/components/Container";
import { useI18n } from "@/lib/i18n/useI18n";

export default function WizardPage() {
  const { t } = useI18n();

  return (
    <Container className="py-16 sm:py-24">
      <section className="mx-auto max-w-3xl rounded-lg border border-warm-200 bg-white p-8 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase text-teal-700">
          {t("placeholder.comingSoon")}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-navy-900">
          {t("placeholder.wizard.title")}
        </h1>
        <p className="mt-4 text-base leading-7 text-warm-700">
          {t("placeholder.description")}
        </p>
      </section>
    </Container>
  );
}
