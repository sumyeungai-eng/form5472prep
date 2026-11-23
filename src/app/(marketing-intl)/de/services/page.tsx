import { ServicesPage, servicesMetadata } from "@/components/marketing/pages/ServicesPage";
export const metadata = servicesMetadata("de");
export default function Page() { return ServicesPage({ locale: "de" }); }
