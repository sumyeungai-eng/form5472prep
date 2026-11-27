"use client";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import { effectiveLocale, localeFromAcceptLanguage, type Locale } from "@/i18n/locales";
import common from "../../../messages/en/common.json";
import domain from "../../../messages/en/domain.json";
import portal from "../../../messages/en/portal.json";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isPortalHost } from "@/lib/partner/portalHost";

function ErrorContent({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();
  const [portalHost, setPortalHost] = useState(false);

  useEffect(() => {
    setPortalHost(isPortalHost(window.location.host));
  }, []);

  useEffect(() => {
    fetch("/api/client-error", {
      method: "POST",
      keepalive: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ digest: error.digest, path: location.pathname }),
    }).catch(() => {});
    // Report once when this boundary is displayed, including via GlobalError.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm" aria-labelledby="error-heading">
        <h1 id="error-heading" className="text-xl font-semibold text-slate-900">{t("portal.layout.somethingWentWrongLoadingThisPage")}</h1>
        <p className="mt-3 text-sm text-slate-600">{t("portal.layout.yourFilingAndDocumentsAreSafe")}</p>
        {portalHost ? (
          <p className="mt-3 text-sm text-slate-600">{t("portal.layout.pleaseTryAgainOrContactTheProviderWhoSent")}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={reset} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
            {t("portal.layout.tryAgain")}
          </button>
          {!portalHost ? <Link href="/dashboard" className="text-sm font-medium text-accent underline">{t("portal.layout.backToDashboard")}</Link> : null}
        </div>
        {!portalHost ? <p className="mt-6 text-sm text-slate-600 break-words">
          {t("portal.layout.email")} <a href="mailto:support@form5472prep.com" className="text-accent underline">support@form5472prep.com</a>
          {error.digest ? <> {t("portal.layout.andQuoteReference")} <span className="font-mono">{error.digest}</span></> : null}.
        </p> : null}
      </section>
    </div>
  );
}

// GlobalError also uses this component when the root layout itself fails, so
// it must work without the portal provider. Load only static dictionaries here;
// the root/marketing layout never reads request cookies or becomes dynamic.
export default function CustomerError(props: { error: Error & { digest?: string }; reset: () => void }) {
  const [language, setLanguage] = useState<{ locale: Locale; messages: { common: typeof common; domain: typeof domain; portal: typeof portal } }>({
    locale: "en", messages: { common, domain, portal },
  });
  useEffect(() => {
    let active = true;
    const cookie = document.cookie.split(";").find((part) => part.trim().startsWith("NEXT_LOCALE="));
    const locale = effectiveLocale(cookie ? cookie.trim().slice("NEXT_LOCALE=".length) : localeFromAcceptLanguage(navigator.languages.join(",")));
    if (locale === "en") return;
    Promise.all([
      import(`../../../messages/${locale}/common.json`),
      import(`../../../messages/${locale}/domain.json`),
      import(`../../../messages/${locale}/portal.json`),
    ]).then(([common, domain, portal]) => {
      if (active) setLanguage({ locale, messages: { common: common.default, domain: domain.default, portal: portal.default } });
    }).catch((error) => console.warn("[i18n] Could not load error translations", error));
    return () => { active = false; };
  }, []);
  return (
    <NextIntlClientProvider locale={language.locale} messages={language.messages} timeZone="UTC" onError={(error: unknown) => console.warn("[i18n]", error)}>
      <ErrorContent {...props} />
    </NextIntlClientProvider>
  );
}
