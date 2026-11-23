import { PenaltyPage, penaltyMetadata } from "@/components/marketing/pages/PenaltyPage";
export const metadata = penaltyMetadata("zh-Hans");
export default function Page() { return PenaltyPage({ locale: "zh-Hans" }); }
