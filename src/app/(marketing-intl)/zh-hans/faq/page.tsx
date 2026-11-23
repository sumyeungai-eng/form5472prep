import { FaqPage, faqMetadata } from "@/components/marketing/pages/FaqPage";
export const metadata = faqMetadata("zh-Hans");
export default function Page() { return FaqPage({ locale: "zh-Hans" }); }
