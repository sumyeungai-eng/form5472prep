import { PricingPage, pricingMetadata } from "@/components/marketing/pages/PricingPage";
export const metadata = pricingMetadata("zh-Hans");
export default function Page() { return PricingPage({ locale: "zh-Hans" }); }
