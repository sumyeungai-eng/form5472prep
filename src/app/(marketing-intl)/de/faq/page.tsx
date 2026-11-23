import { FaqPage, faqMetadata } from "@/components/marketing/pages/FaqPage";
export const metadata = faqMetadata("de");
export default function Page() { return FaqPage({ locale: "de" }); }
