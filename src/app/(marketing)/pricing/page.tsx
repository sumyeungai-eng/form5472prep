import { PricingPage, pricingMetadata } from "@/components/marketing/pages/PricingPage";
export const metadata = pricingMetadata("en");
export default function Page() { return PricingPage({ locale: "en" }); }
