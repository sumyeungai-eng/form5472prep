import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { FilingStatus } from "@prisma/client";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { findEligibleUsers, taxYearForSend } from "@/lib/reminders";

export const dynamic = "force-dynamic";

// Bucket → (heading, subtitle, query). Each StatCard on the reminders
// dashboard links here with ?bucket=… so the operator can audit which
// customers fall into each pool.
type Bucket = "past" | "opted-out" | "jan-eligible" | "mar-eligible";

const BUCKET_META: Record<Bucket, { title: string; subtitle: string }> = {
  past: {
    title: "Past customers",
    subtitle:
      "Every user whose account has at least one paid filing in any tax year. " +
      "This is the universe the Jan + Mar reminder campaigns draw from.",
  },
  "opted-out": {
    title: "Opted out",
    subtitle:
      "Customers who clicked the one-click unsubscribe link in a reminder email. " +
      "They're excluded from ALL future marketing campaigns (transactional mail still sends).",
  },
  "jan-eligible": {
    title: "Eligible — January reminder",
    subtitle:
      "Past customers who have NOT yet been sent this year's January reminder " +
      "AND have not already filed for the current tax year.",
  },
  "mar-eligible": {
    title: "Eligible — March reminder",
    subtitle:
      "Past customers who have NOT yet been sent this year's March reminder " +
      "AND have not already filed for the current tax year.",
  },
};

const PAID_STATUSES: FilingStatus[] = [
  FilingStatus.PAID,
  FilingStatus.PDF_GENERATED,
  FilingStatus.SIGNATURE_PENDING,
  FilingStatus.SIGNED_UPLOADED,
  FilingStatus.FAXED,
  FilingStatus.CONFIRMED,
  FilingStatus.FAILED,
];

type Row = {
  userId: string;
  email: string;
  previousLlcNames: string[];
  optedOut: boolean;
  remindersSent: { campaign: string; year: number; sentAt: Date }[];
};

async function loadRows(bucket: Bucket, taxYear: number): Promise<Row[]> {
  if (bucket === "past") {
    const users = await prisma.user.findMany({
      where: { filings: { some: { status: { in: PAID_STATUSES } } } },
      select: {
        id: true,
        email: true,
        emailMarketingOptOut: true,
        filings: {
          where: { status: { in: PAID_STATUSES } },
          select: { llcName: true },
        },
        reminders: {
          select: { campaign: true, year: true, sentAt: true },
          orderBy: { sentAt: "desc" },
        },
      },
      orderBy: { email: "asc" },
    });
    return users.map((u) => ({
      userId: u.id,
      email: u.email,
      previousLlcNames: distinct(u.filings.map((f) => f.llcName).filter((n): n is string => !!n && n.trim().length > 0)),
      optedOut: u.emailMarketingOptOut,
      remindersSent: u.reminders,
    }));
  }

  if (bucket === "opted-out") {
    const users = await prisma.user.findMany({
      where: { emailMarketingOptOut: true },
      select: {
        id: true,
        email: true,
        filings: {
          where: { status: { in: PAID_STATUSES } },
          select: { llcName: true },
        },
        reminders: {
          select: { campaign: true, year: true, sentAt: true },
          orderBy: { sentAt: "desc" },
        },
      },
      orderBy: { email: "asc" },
    });
    return users.map((u) => ({
      userId: u.id,
      email: u.email,
      previousLlcNames: distinct(u.filings.map((f) => f.llcName).filter((n): n is string => !!n && n.trim().length > 0)),
      optedOut: true,
      remindersSent: u.reminders,
    }));
  }

  // jan-eligible / mar-eligible — reuse the cron's own selection logic so
  // the list here matches exactly what the cron will send. Then hydrate
  // with optedOut + remindersSent for display (the eligibility query
  // already excludes opted-out, but we surface the column for context).
  const campaign = bucket === "jan-eligible" ? "january" : "march";
  const eligible = await findEligibleUsers(campaign, taxYear);
  const ids = eligible.map((e) => e.userId);
  const hydrated = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      emailMarketingOptOut: true,
      reminders: {
        select: { campaign: true, year: true, sentAt: true },
        orderBy: { sentAt: "desc" },
      },
    },
  });
  const byId = new Map(hydrated.map((u) => [u.id, u]));
  return eligible
    .map((e) => {
      const h = byId.get(e.userId);
      return {
        userId: e.userId,
        email: e.email,
        previousLlcNames: e.previousLlcNames,
        optedOut: h?.emailMarketingOptOut ?? false,
        remindersSent: h?.reminders ?? [],
      };
    })
    .sort((a, b) => a.email.localeCompare(b.email));
}

function distinct<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export default async function ReminderListPage({
  searchParams,
}: {
  searchParams: { bucket?: string };
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const bucket = (searchParams.bucket ?? "past") as Bucket;
  if (!BUCKET_META[bucket]) {
    redirect("/admin/reminders");
  }
  const taxYear = taxYearForSend();
  const meta = BUCKET_META[bucket];
  const rows = await loadRows(bucket, taxYear);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link
        href="/admin/reminders"
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to reminders dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {meta.title} <span className="text-slate-400 font-normal tabular-nums">({rows.length})</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">{meta.subtitle}</p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-sm text-slate-500">
          No customers match this bucket.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left font-semibold px-4 py-2.5">Email</th>
                <th className="text-left font-semibold px-4 py-2.5">LLC(s)</th>
                <th className="text-left font-semibold px-4 py-2.5">Opted out</th>
                <th className="text-left font-semibold px-4 py-2.5">Reminders sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((r) => (
                <tr key={r.userId}>
                  <td className="px-4 py-2.5 text-slate-900">
                    <a href={`mailto:${r.email}`} className="hover:text-accent">{r.email}</a>
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {r.previousLlcNames.length === 0 ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      r.previousLlcNames.join(", ")
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {r.optedOut ? (
                      <span className="inline-block text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        Yes
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-600">
                    {r.remindersSent.length === 0 ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      r.remindersSent
                        .slice(0, 3)
                        .map((s) => `${s.campaign} ${s.year}`)
                        .join(", ") +
                      (r.remindersSent.length > 3 ? ` +${r.remindersSent.length - 3} more` : "")
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
