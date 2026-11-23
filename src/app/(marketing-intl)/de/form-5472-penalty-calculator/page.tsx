import { PenaltyPage, penaltyMetadata } from "@/components/marketing/pages/PenaltyPage";
export const metadata = penaltyMetadata("de");
export default function Page() { return PenaltyPage({ locale: "de" }); }
