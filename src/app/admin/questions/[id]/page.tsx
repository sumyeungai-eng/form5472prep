import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { isPaidStatus } from "@/lib/admin/websiteQuestions";
import { AdminPageHeader } from "../../_components/AdminPageHeader";
import { QuestionActions } from "./QuestionActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Question - Admin" };

export default async function AdminQuestionDetailPage({ params }: { params: { id: string } }) {
  if (!(await isAdmin())) redirect("/admin/login");

  let question = await prisma.websiteQuestion.findUnique({
    where: { id: params.id },
    include: { replies: { orderBy: { createdAt: "asc" } } },
  });
  if (!question) notFound();

  if (!question.readAt) {
    const readAt = new Date();
    await prisma.websiteQuestion.update({ where: { id: question.id }, data: { readAt } });
    question = { ...question, readAt };
  }

  // Context: is this an existing customer, and have they asked before?
  const [customer, earlier] = await Promise.all([
    prisma.user.findFirst({
      where: { email: { equals: question.email, mode: "insensitive" } },
      select: {
        filings: {
          where: { supersededAt: null },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, llcName: true, taxYears: true, status: true, createdAt: true },
        },
      },
    }),
    prisma.websiteQuestion.findMany({
      where: { email: { equals: question.email, mode: "insensitive" }, id: { not: question.id } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, createdAt: true, message: true },
    }),
  ]);

  const fmt = (d: Date) => d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <AdminPageHeader
        title={question.name || question.email}
        breadcrumb={[
          { label: "Questions", href: "/admin/questions" },
          { label: question.name || question.email, href: `/admin/questions/${question.id}` },
        ]}
        actions={
          <Link href="/admin/questions" className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Back to questions
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Asked {fmt(question.createdAt)}</span>
              {question.topic ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{question.topic}</span> : null}
            </div>
            <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-slate-900">{question.message}</p>
          </div>

          {question.replies.map((r) => (
            <div key={r.id} className="ml-6 rounded-lg border border-emerald-200 bg-emerald-50/50 p-5">
              <div className="mb-2 text-xs text-slate-500">
                Our reply · {fmt(r.createdAt)}
                {r.sentBy ? ` · ${r.sentBy}` : ""}
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800">{r.body}</p>
            </div>
          ))}

          <QuestionActions
            questionId={question.id}
            email={question.email}
            replied={!!question.repliedAt}
            archived={!!question.archivedAt}
            hasReplies={question.replies.length > 0}
          />
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">From</div>
            <div className="mt-1 font-medium text-slate-900">{question.name || "(no name given)"}</div>
            <a href={`mailto:${question.email}`} className="break-all text-accent hover:underline">{question.email}</a>
            {question.pageUrl ? (
              <>
                <div className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">Asked from page</div>
                <a href={question.pageUrl} target="_blank" rel="noreferrer" className="break-all text-slate-700 hover:underline">
                  {question.pageUrl.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </>
            ) : null}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Orders with this email</div>
            {customer && customer.filings.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {customer.filings.map((f) => {
                  const paid = isPaidStatus(f.status);
                  return (
                    <li key={f.id}>
                      <Link href={`/admin/filings/${f.id}`} className="text-accent hover:underline">
                        {f.llcName || "Untitled filing"}
                      </Link>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className={`rounded-full px-2 py-0.5 font-medium ${paid ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                          {paid ? "Paid" : "Unpaid draft"}
                        </span>
                        <span className="text-slate-500">
                          {f.taxYears.length > 0 ? f.taxYears.join(", ") : "—"} · {f.status}
                          {f.createdAt > question.createdAt ? " · started after this question" : ""}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-1 text-slate-600">{customer ? "Has an account, no orders yet." : "No orders with this email yet. If they order later with the same email, it shows here."}</p>
            )}
          </div>

          {earlier.length > 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Earlier questions</div>
              <ul className="mt-2 space-y-2">
                {earlier.map((e) => (
                  <li key={e.id}>
                    <Link href={`/admin/questions/${e.id}`} className="line-clamp-2 text-slate-700 hover:underline">{e.message}</Link>
                    <span className="text-xs text-slate-400">{e.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
