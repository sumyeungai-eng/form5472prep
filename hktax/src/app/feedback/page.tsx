"use client";

import { Container } from "@/components/Container";
import { ContactForm } from "@/components/contact/ContactForm";
import { useI18n } from "@/lib/i18n/useI18n";

export default function FeedbackPage() {
  const { lang, t } = useI18n();
  const eyebrowTracking = lang === "en" ? "tracking-[0.18em]" : "";
  const eyebrowCase = lang === "en" ? "uppercase" : "";

  return (
    <main>
      <section className="bg-warm-50 py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="max-w-4xl">
            <p className={`text-xs font-bold text-teal-700 sm:text-sm ${eyebrowCase} ${eyebrowTracking}`}>
              {t("feedback.eyebrow")}
            </p>
            <h1 className="display-hero mt-4 max-w-5xl">
              {t("feedback.title")}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-warm-700 sm:text-xl">
              {t("feedback.intro")}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-start">
            <ContactForm kind="feedback" />

            <aside className="card p-6 text-sm leading-6 text-warm-700 sm:p-7">
              <div>
                <h2 className="display-subsection text-xl sm:text-2xl">
                  {t("feedback.notesTitle")}
                </h2>
                <p className="mt-2">
                  {t("feedback.notPublishedNote")}
                </p>
              </div>
              <p className="mt-4">
                {t("feedback.privacyNote")}
              </p>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
