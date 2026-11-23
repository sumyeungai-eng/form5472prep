import { PenaltyPage, penaltyMetadata } from "@/components/marketing/pages/PenaltyPage";
export const metadata = penaltyMetadata("en");
export default function Page() { return PenaltyPage({ locale: "en" }); }
