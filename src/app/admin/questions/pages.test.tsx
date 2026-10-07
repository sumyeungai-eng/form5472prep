import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin/auth", () => ({ isAdmin: vi.fn(async () => true) }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
const db = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  userFindFirst: vi.fn(),
  filingFindMany: vi.fn(async (_args: { where: unknown }) => [] as unknown[]),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    websiteQuestion: { findMany: db.findMany, count: db.count, findUnique: db.findUnique, update: db.update },
    user: { findFirst: db.userFindFirst },
    filing: { findMany: db.filingFindMany },
  },
}));

import AdminQuestionsPage from "./page";
import AdminQuestionDetailPage from "./[id]/page";

const asked = new Date("2026-10-06T09:30:00Z");

describe("admin questions pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.filingFindMany.mockResolvedValue([]);
  });

  it("lists open questions with a needs-reply chip and an open-count badge", async () => {
    db.findMany.mockResolvedValue([
      { id: "q_1", name: "Ana Lopez", email: "ana@example.test", message: "Do I need to file <Form 5472>?", topic: "Pre-sales question", createdAt: asked, readAt: null, repliedAt: null, archivedAt: null, _count: { replies: 0 } },
      { id: "q_2", name: null, email: "li@example.test", message: "Refund?", topic: null, createdAt: asked, readAt: asked, repliedAt: asked, archivedAt: null, _count: { replies: 2 } },
    ]);
    db.count.mockResolvedValue(1);

    const html = renderToStaticMarkup(await AdminQuestionsPage({ searchParams: {} }));
    expect(db.findMany.mock.calls[0][0].where).toEqual({ repliedAt: null, archivedAt: null });
    expect(html).toContain('href="/admin/questions/q_1"');
    expect(html).toContain("Do I need to file &lt;Form 5472&gt;?");
    expect(html).toContain("Needs reply");
    expect(html).toContain("Replied ×2");
    expect(html).toContain("li@example.test");
    expect(html).not.toContain("paid order");
  });

  it("flags askers who later ordered with the same email (case-insensitive)", async () => {
    db.findMany.mockResolvedValue([
      { id: "q_1", name: "Ana", email: "Ana@Example.test", message: "Hi", topic: null, createdAt: asked, readAt: asked, repliedAt: asked, archivedAt: null, _count: { replies: 1 } },
      { id: "q_2", name: "Li", email: "li@example.test", message: "Hi", topic: null, createdAt: asked, readAt: asked, repliedAt: null, archivedAt: null, _count: { replies: 0 } },
    ]);
    db.count.mockResolvedValue(1);
    db.filingFindMany.mockResolvedValue([
      { status: "PAID", user: { email: "ana@example.test" } },
      { status: "FAXED", user: { email: "ana@example.test" } },
      { status: "DRAFT", user: { email: "li@example.test" } },
    ]);

    const html = renderToStaticMarkup(await AdminQuestionsPage({ searchParams: {} }));
    expect(db.filingFindMany.mock.calls[0][0].where).toEqual({
      supersededAt: null,
      user: { email: { in: ["ana@example.test", "li@example.test"], mode: "insensitive" } },
    });
    expect(html).toContain("Customer · 2 paid orders");
    expect(html).toContain("Started an order (unpaid)");
  });

  it("uses the requested tab and falls back to To answer for unknown ones", async () => {
    db.findMany.mockResolvedValue([]);
    db.count.mockResolvedValue(0);
    await AdminQuestionsPage({ searchParams: { view: "archived" } });
    expect(db.findMany.mock.calls[0][0].where).toEqual({ archivedAt: { not: null } });
    const html = renderToStaticMarkup(await AdminQuestionsPage({ searchParams: { view: "constructor" } }));
    expect(db.findMany.mock.calls[1][0].where).toEqual({ repliedAt: null, archivedAt: null });
    expect(html).toContain("Nothing to answer");
  });

  it("shows the question, past replies, customer filings and marks it read", async () => {
    db.findUnique.mockResolvedValue({
      id: "q_1", name: "Ana Lopez", email: "ana@example.test", message: "Do I need to file?", topic: "Billing or refund",
      pageUrl: "https://www.form5472prep.com/pricing", createdAt: asked, readAt: null, repliedAt: asked, archivedAt: null,
      replies: [{ id: "r_1", body: "Yes, you do.", createdAt: asked, sentBy: "admin@example.test" }],
    });
    db.userFindFirst.mockResolvedValue({
      filings: [
        { id: "f_1", llcName: "Synthetic Test LLC", taxYears: [2025], status: "PAID", createdAt: new Date("2026-10-07T08:00:00Z") },
        { id: "f_2", llcName: "Synthetic Draft LLC", taxYears: [2024], status: "DRAFT", createdAt: new Date("2026-09-01T08:00:00Z") },
      ],
    });
    db.findMany.mockResolvedValue([{ id: "q_0", createdAt: asked, message: "Earlier question" }]);

    const html = renderToStaticMarkup(await AdminQuestionDetailPage({ params: { id: "q_1" } }));
    expect(db.update).toHaveBeenCalledWith({ where: { id: "q_1" }, data: { readAt: expect.any(Date) } });
    expect(html).toContain("Do I need to file?");
    expect(html).toContain("Yes, you do.");
    expect(html).toContain('href="/admin/filings/f_1"');
    expect(html).toContain("Synthetic Test LLC");
    expect(html).toContain("Paid");
    expect(html).toContain("Unpaid draft");
    expect(html.match(/started after this question/g)).toHaveLength(1);
    expect(html).toContain("Earlier question");
    expect(html).toContain("Send another reply");
    expect(html).toContain("Move back to “To answer”");
  });
});
