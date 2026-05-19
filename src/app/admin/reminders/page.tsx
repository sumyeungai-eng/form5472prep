import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { findEligibleUsers, taxYearForSend } from "@/lib/reminders";
import { CampaignControls } from "./CampaignControls";

export const dynamic = "force-dynamic";

export default async function AdminRemindersPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const taxYear = taxYearForSend();

  const [janEligible, marEligible, optOuts, totalCustomers, recentSends] = await Promise.all([
    findEligibleUsers("january", taxYear),
    findEligibleUsers("march", taxYear),
    prisma.user.count({ where: { emailMarketingOptOut: true } }),
    prisma.user.count({
      where: {
        filings: {
          some: {
            status: { in: ["PAID", "PDF_GENERATED", "SIGNATURE_PENDING", "SIGNED_UPLOADED", "FAXED", "CONFIRMED", "FAILED"] },
          },
        },
      },
    }),
    prisma.reminderSent.findMany({
      orderBy: { sentAt: "desc" },
      take: 20,
      include: { user: { select: { email: true } } },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Reminder campaigns</h1>
        <p className="text-sm text-slate-500 mt-1">
          Yearly emails reminding past customers to file their next return. Auto-fired by Vercel Cron
          on Jan 7 (early-year nudge) and Mar 15 (30 days before the April 15 deadline).
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Past customers" value={totalCustomers.toString()} />
        <StatCard label="Opted out" value={optOuts.toString()} tone={optOuts > 0 ? "muted" : "default"} />
        <StatCard label={`Eligible — Jan (${taxYear})`} value={janEligible.length.toString()} />
        <StatCard label={`Eligible — Mar (${taxYear})`} value={marEligible.length.toString()} />
      </div>

      {/* Campaign controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <CampaignCard
          title="January reminder"
          subtitle={`"Time to file your ${taxYear} Form 5472" · Cron: Jan 7, 14:00 UTC`}
          eligibleCount={janEligible.length}
          campaign="january"
          taxYear={taxYear}
        />
        <CampaignCard
          title="March reminder"
          subtitle={`"30 days until April 15 deadline" · Cron: Mar 15, 14:00 UTC`}
          eligibleCount={marEligible.length}
          campaign="march"
          taxYear={taxYear}
        />
      </div>

      {/* Recent sends */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-900">Recent sends</h2>
        </div>
        {recentSends.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No reminder emails sent yet. The first January cron will fire automatically.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left font-semibold px-4 py-2.5">Customer</th>
                <th className="text-left font-semibold px-4 py-2.5">Campaign</th>
                <th className="text-left font-semibold px-4 py-2.5">Tax year</th>
                <th className="text-left font-semibold px-4 py-2.5">Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentSends.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2.5 text-slate-700">{r.user.email}</td>
                  <td className="px-4 py-2.5 text-slate-700 capitalize">{r.campaign}</td>
                  <td className="px-4 py-2.5 text-slate-700 tabular-nums">{r.year}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{r.sentAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "muted";
}) {
  const valueColor = tone === "muted" ? "text-slate-500" : "text-slate-900";
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${valueColor}`}>{value}</div>
    </div>
  );
}

function CampaignCard({
  title,
  subtitle,
  eligibleCount,
  campaign,
  taxYear,
}: {
  title: string;
  subtitle: string;
  eligibleCount: number;
  campaign: "january" | "march";
  taxYear: number;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      <div className="mt-4 mb-4 text-sm text-slate-700">
        <span className="font-medium">{eligibleCount}</span> {eligibleCount === 1 ? "person" : "people"} eligible right now
      </div>
      <CampaignControls campaign={campaign} taxYear={taxYear} />
    </div>
  );
}
