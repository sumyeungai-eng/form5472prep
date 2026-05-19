import { redirect } from "next/navigation";
import { verifyMagicLinkToken } from "@/lib/magicLink";
import { setUserCookie } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

// Click target for magic-link emails. Verifies the signed token, sets the
// long-lived user cookie, and redirects to the dashboard.
export default async function MagicLinkConsume({
  params,
}: {
  params: { token: string };
}) {
  const userId = verifyMagicLinkToken(decodeURIComponent(params.token));
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-sm text-center bg-white border border-slate-200 rounded-lg p-8">
          <h1 className="text-lg font-semibold">Link expired</h1>
          <p className="mt-2 text-sm text-slate-600">
            That access link is invalid or has expired. Magic links are good for 7 days.
            Contact support@form5472prep.com to get a new one.
          </p>
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-sm text-center bg-white border border-slate-200 rounded-lg p-8">
          <h1 className="text-lg font-semibold">Account not found</h1>
          <p className="mt-2 text-sm text-slate-600">
            We couldn&apos;t find that account. Contact support@form5472prep.com.
          </p>
        </div>
      </div>
    );
  }

  setUserCookie(user.id);
  redirect("/dashboard");
}
