import { ComparisonTable } from "@/components/ComparisonTable";

export function EinItinTable(): JSX.Element {
  return (
    <ComparisonTable
      caption="EIN vs ITIN at a glance"
      columns={["Question", "EIN", "ITIN"]}
      className="mt-4 mb-6"
      rows={[
        ["Who it identifies", "Business entity (your LLC)", "Individual"],
        ["Who issues it", "IRS", "IRS"],
        ["Needed for Form 5472?", "Required for Form 5472", "Not always"],
        ["How you apply through us", "We prepare Form SS-4", "Form W-7 package preparation"],
        ["Typical timing", "1–5 business days", "7 weeks; 9–11 weeks peak/overseas"],
      ]}
    />
  );
}
