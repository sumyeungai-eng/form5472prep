import { ServicesPage, servicesMetadata } from "@/components/marketing/pages/ServicesPage";
export const metadata = servicesMetadata("en");
export default function Page() { return ServicesPage({ locale: "en" }); }
