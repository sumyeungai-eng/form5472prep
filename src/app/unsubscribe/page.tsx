import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/unsubscribeToken";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Unsubscribe — Form5472 Prep",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: { t?: string };
}) {
  const token = searchParams.t ?? "";
  const userId = verifyUnsubscribeToken(token);

  let outcome: "ok" | "bad-token" | "already" = "bad-token";
  let email: string | null = null;

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      email = user.email;
      if (user.emailMarketingOptOut) {
        outcome = "already";
      } else {
        await prisma.user.update({
          where: { id: userId },
          data: { emailMarketingOptOut: true },
        });
        outcome = "ok";
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-8 text-center">
        {outcome === "bad-token" ? (
          <>
            <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
            <h1 className="mt-4 text-xl font-semibold text-slate-900">Link expired or invalid</h1>
            <p className="mt-2 text-sm text-slate-600">
              This unsubscribe link is no longer valid. To stop receiving marketing emails,
              reply to any recent email from us and we'll remove you manually.
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <h1 className="mt-4 text-xl font-semibold text-slate-900">
              {outcome === "already" ? "Already unsubscribed" : "You're unsubscribed"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {outcome === "already"
                ? `${email ?? "Your email"} is already opted out of marketing emails.`
                : `We won't send any more yearly filing reminders to ${email ?? "this address"}.`}
            </p>
            <p className="mt-4 text-xs text-slate-500">
              You'll still receive transactional emails (order receipts, fax confirmations) —
              those are required to manage your filing.
            </p>
          </>
        )}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <Link href="/" className="text-sm text-accent hover:underline">
            ← Back to Form5472 Prep
          </Link>
        </div>
      </div>
    </div>
  );
}
