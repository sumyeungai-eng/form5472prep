import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isPortalHost, portalOrigin } from "@/lib/partner/portalHost";
import { partnerOwnsFiling } from "@/lib/session";
import { partnerDisplayName } from "@/lib/partner/displayName";
import { portalMetadata } from "@/lib/partner/portalMetadata";

// On the partner portal domain the client sees the partner's name, never
// ours. Off the portal this layout renders nothing extra.
async function portalBrand(filingId: string): Promise<string | null> {
  if (!isPortalHost(headers().get("host"))) return null;
  const filing = await prisma.filing.findUnique({
    where: { id: filingId },
    select: { partner: { select: { brandName: true, company: true, name: true } } },
  });
  return filing?.partner ? partnerDisplayName(filing.partner) : "Secure filing";
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const brand = await portalBrand(params.id);
  return brand ? portalMetadata(brand) : {};
}

export default async function FilingLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  const brand = await portalBrand(params.id);
  if (!brand) {
    // A partner's client on the main site (an invite cookie from before the
    // portal existed) must not see us: send them to the portal's neutral
    // "ask your provider for a new link" page. The partner keeps access.
    const portal = portalOrigin();
    if (portal) {
      const filing = await prisma.filing.findUnique({ where: { id: params.id }, select: { partnerId: true } });
      if (filing?.partnerId && !(await partnerOwnsFiling(params.id))) redirect(`${portal}/portal/expired`);
    }
    return children;
  }
  return (
    <>
      {/* The root layout server-renders the Meta consent banner; hide it here. */}
      <style>{"[data-meta-consent]{display:none!important}"}</style>
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
          <span className="text-lg font-semibold text-slate-900">{brand}</span>
        </div>
      </header>
      {children}
    </>
  );
}
