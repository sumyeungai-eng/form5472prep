import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { isAdmin } from "@/lib/admin/auth";
import { timeAgo } from "@/lib/admin/filingPresence";
import { prisma } from "@/lib/prisma";
import { orderSummaryByEmail } from "@/lib/admin/websiteQuestions";
import { AdminPageHeader } from "../_components/AdminPageHeader";

export const dynamic = "force-dynamic";
export const metadata = { title: "Questions - Admin" };

// Questions from the "Ask a question" widget and /contact form (/api/ask).
// "To answer" = not replied and not archived; it drives the sidebar badge.

const VIEWS = {
  open: { label: "To answer", where: { repliedAt: null, archivedAt: null } },
  answered: { label: "Answered", where: { repliedAt: { not: null }, archivedAt: null } },
  all: { label: "All", where: {} },
  archived: { label: "Archived", where: { archivedAt: { not: null } } },
} satisfies Record<string, { label: string; where: Prisma.WebsiteQuestionWhereInput }>;
type View = keyof typeof VIEWS;

const PAGE_SIZE = 50;

export default async function AdminQuestionsPage({ searchParams }: { searchParams: { view?: string; page?: string } }) {
  if (!(await isAdmin())) redirect("/admin/login");

  const view: View =
    searchParams.view && Object.prototype.hasOwnProperty.call(VIEWS, searchParams.view) ? (searchParams.view as View) : "open";
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  const where = VIEWS[view].where;

  const [questions, total, openCount] = await Promise.all([
    prisma.websiteQuestion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { replies: true } } },
    }),
    prisma.websiteQuestion.count({ where }),
    prisma.websiteQuestion.count({ where: VIEWS.open.where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const orders = await orderSummaryByEmail(questions.map((q) => q.email));

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <AdminPageHeader
        title="Questions"
        description="Questions visitors sent from the website's “Ask a question” box and contact page. Open one to reply by email."
      />

      <div className="mb-6 flex gap-1 border-b border-slate-200 overflow-x-auto">
        {(Object.keys(VIEWS) as View[]).map((tab) => (
          <Link
            key={tab}
            href={tab === "open" ? "/admin/questions" : `/admin/questions?view=${tab}`}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-md -mb-px border-b-2 transition-colors ${
              view === tab ? "border-accent text-accent" : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {VIEWS[tab].label}
            {tab === "open" && openCount > 0 ? (
              <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[11px] text-white">{openCount}</span>
            ) : null}
          </Link>
        ))}
      </div>

      {questions.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-500">
          {view === "open" ? "Nothing to answer. New questions from the website appear here." : "No questions here."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="divide-y divide-slate-100">
            {questions.map((q) => {
              const unread = !q.readAt;
              const order = orders.get(q.email.toLowerCase());
              return (
                <Link
                  key={q.id}
                  href={`/admin/questions/${q.id}`}
                  className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {unread ? <span className="h-2 w-2 shrink-0 rounded-full bg-accent" /> : null}
                      <p className={`truncate text-sm ${unread ? "font-semibold text-slate-950" : "font-medium text-slate-800"}`}>
                        {q.name || q.email}
                      </p>
                      {q.name ? <span className="truncate text-xs text-slate-500">{q.email}</span> : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{q.message}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <time title={q.createdAt.toLocaleString("en-US")}>{timeAgo(q.createdAt)}</time>
                      {q.topic ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{q.topic}</span> : null}
                      {q.repliedAt ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                          {q._count.replies > 0 ? `Replied${q._count.replies > 1 ? ` ×${q._count.replies}` : ""}` : "Marked answered"}
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800">Needs reply</span>
                      )}
                      {order && order.paidOrders > 0 ? (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                          Customer · {order.paidOrders} paid order{order.paidOrders === 1 ? "" : "s"}
                        </span>
                      ) : order && order.drafts > 0 ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">Started an order (unpaid)</span>
                      ) : null}
                      {q.archivedAt ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">Archived</span> : null}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {q.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between text-sm">
          <PageLink view={view} page={page - 1} disabled={page <= 1}>Previous</PageLink>
          <span className="text-slate-500">Page {page} of {totalPages}</span>
          <PageLink view={view} page={page + 1} disabled={page >= totalPages}>Next</PageLink>
        </div>
      ) : null}
    </div>
  );
}

function PageLink({ view, page, disabled, children }: { view: View; page: number; disabled: boolean; children: React.ReactNode }) {
  const params = new URLSearchParams();
  if (view !== "open") params.set("view", view);
  if (page > 1) params.set("page", String(page));
  const href = params.toString() ? `/admin/questions?${params.toString()}` : "/admin/questions";
  if (disabled) return <span className="rounded-md border border-slate-200 px-3 py-1.5 text-slate-300">{children}</span>;
  return <Link href={href} className="rounded-md border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50">{children}</Link>;
}
