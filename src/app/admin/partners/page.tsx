import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { PartnersManager } from "./PartnersManager";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { filings: true } } },
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Partners</h1>
      <p className="text-sm text-slate-500 mb-8">
        Reseller / agency accounts that batch filings under one login. They sign in at{" "}
        <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">/partner/sign-in</code> with a
        magic link.
      </p>
      <PartnersManager
        partners={partners.map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          company: p.company,
          active: p.active,
          filingCount: p._count.filings,
          createdAt: p.createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        }))}
      />
    </div>
  );
}
