import { ServicesPage, servicesMetadata } from "@/components/marketing/pages/ServicesPage";
export const metadata = servicesMetadata("zh-Hans");
export default function Page() { return ServicesPage({ locale: "zh-Hans" }); }
