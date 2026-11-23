import { FaqPage, faqMetadata } from "@/components/marketing/pages/FaqPage";
export const metadata = faqMetadata("en");
export default function Page() { return FaqPage({ locale: "en" }); }
