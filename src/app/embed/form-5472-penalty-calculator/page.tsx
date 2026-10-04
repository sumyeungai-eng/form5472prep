import type { Metadata } from "next";
import { EmbedShell } from "@/components/embed/EmbedShell";
import { PenaltyCalculator } from "@/components/tools/PenaltyCalculator";
import { SITE_URL } from "@/lib/seo";

const TOOL_URL = `${SITE_URL}/form-5472-penalty-calculator`;

export const metadata: Metadata = {
  title: { absolute: "Form 5472 Penalty Calculator (embed) · Form5472 Prep" },
  alternates: { canonical: TOOL_URL },
};

export default function EmbedPenaltyCalculatorPage() {
  return (
    <EmbedShell
      heading="Form 5472 penalty calculator"
      poweredByHref={TOOL_URL}
      poweredByLabel="Form5472 Prep — Form 5472 penalty calculator"
    >
      <PenaltyCalculator embedded siteUrl={SITE_URL} />
    </EmbedShell>
  );
}
