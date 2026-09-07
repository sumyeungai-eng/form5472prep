import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../_components/AdminPageHeader";
import { PartnersManager } from "./PartnersManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Partners · Admin" };

export default async function AdminPartnersPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { filings: true } } },
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <AdminPageHeader
        title="Partners"
        description="Reseller and accountant accounts that file on behalf of their clients."
      />
      <PartnersManager
        partners={partners.map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          company: p.company,
          phone: p.phone,
          wantsWhiteLabel: p.wantsWhiteLabel,
          whiteLabelEnabled: p.whiteLabelEnabled,
          brandName: p.brandName,
          brandReplyTo: p.brandReplyTo,
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
