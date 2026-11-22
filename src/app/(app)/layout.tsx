import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SignOutLink } from "./SignOutLink";
import { getCurrentUser } from "@/lib/session";
import { headers } from "next/headers";
import { isPortalHost } from "@/lib/partner/portalHost";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations("portal.layout");
  const clientMessages = pick(messages, ["common", "domain", "portal"]);
  const authoritative = locale !== "en" ? (
    <footer className="px-6 py-4 text-center text-xs text-slate-500">{t("authoritative")}</footer>
  ) : null;
  // Partner portal domain: no Form5472 header; filings/[id]/layout.tsx shows
  // the partner's name instead.
  if (isPortalHost(headers().get("host"))) {
    return (
      <NextIntlClientProvider locale={locale} messages={clientMessages}>
        <main lang={locale} className="min-h-screen bg-slate-50">
          <header className="border-b border-slate-200 bg-white">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-end"><LanguageSwitcher /></div>
          </header>
          {children}
          {authoritative}
        </main>
      </NextIntlClientProvider>
    );
  }
  const user = await getCurrentUser();
  return (
    <NextIntlClientProvider locale={locale} messages={clientMessages}>
    <div lang={locale} className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label={t("home")}>
            <Logo />
          </Link>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            {user && <span className="hidden sm:inline">{user.email}</span>}
            <LanguageSwitcher />
            {user && <SignOutLink />}
          </div>
        </div>
      </header>
      <main className="flex-1 bg-slate-50">{children}</main>
      {authoritative}
    </div>
    </NextIntlClientProvider>
  );
}

function pick<T extends Record<string, unknown>, K extends keyof T>(messages: T, keys: readonly K[]): Pick<T, K> {
  return Object.fromEntries(keys.map((key) => [key, messages[key]])) as Pick<T, K>;
}
