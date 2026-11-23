import { PricingPage, pricingMetadata } from "@/components/marketing/pages/PricingPage";
export const metadata = pricingMetadata("de");
export default function Page() { return PricingPage({ locale: "de" }); }
