"use client";

import { Container } from "@/components/Container";
import { ContactForm } from "@/components/contact/ContactForm";
import { useI18n } from "@/lib/i18n/useI18n";

export default function ContactPage() {
  const { t } = useI18n();

  return (
    <main>
      <section className="bg-white py-14 sm:py-16">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
              {t("contact.eyebrow")}
            </p>
            <h1 className="mt-3 text-3xl font-bold text-navy-900 sm:text-4xl">
              {t("contact.title")}
            </h1>
            <p className="mt-5 text-base leading-7 text-warm-700">
              {t("contact.intro")}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-warm-50 py-12 sm:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-start">
            <div className="card p-5 sm:p-6">
              <ContactForm kind="contact" />
            </div>

            <aside className="space-y-4 text-sm leading-6 text-warm-700">
              <div>
                <h2 className="text-base font-bold text-navy-900">
                  {t("contact.safetyTitle")}
                </h2>
                <p className="mt-2">
                  {t("contact.notIrdNote")}
                </p>
              </div>
              <p>
                {t("contact.irdReferralNote")}{" "}
                <a
                  href="https://www.ird.gov.hk/"
                  className="focus-ring rounded-sm font-semibold text-teal-700 hover:text-teal-800"
                  rel="noreferrer"
                  target="_blank"
                >
                  {t("contact.irdLinkText")}
                </a>
              </p>
              <p>
                {t("contact.privacyNote")}
              </p>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
