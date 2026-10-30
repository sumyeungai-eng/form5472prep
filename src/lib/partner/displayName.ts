// The name a partner's client sees wherever we would otherwise show ours
// (portal header, fax receipt, wizard copy). Admin-set brand name first.
export function partnerDisplayName(p: { brandName?: string | null; company?: string | null; name: string }): string {
  return p.brandName?.trim() || p.company?.trim() || p.name.trim();
}
