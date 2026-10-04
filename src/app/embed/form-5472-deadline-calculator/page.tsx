import type { Metadata } from "next";
import { EmbedShell } from "@/components/embed/EmbedShell";
import { DeadlineCalculator } from "@/components/tools/DeadlineCalculator";
import { SITE_URL } from "@/lib/seo";

const TOOL_URL = `${SITE_URL}/form-5472-deadline-calculator`;

export const metadata: Metadata = {
  title: { absolute: "Form 5472 Deadline Calculator (embed) · Form5472 Prep" },
  alternates: { canonical: TOOL_URL },
};

export default function EmbedDeadlineCalculatorPage() {
  return (
    <EmbedShell
      heading="Form 5472 deadline calculator"
      poweredByHref={TOOL_URL}
      poweredByLabel="Form5472 Prep — Form 5472 deadline calculator"
    >
      <DeadlineCalculator embedded siteUrl={SITE_URL} />
    </EmbedShell>
  );
}
