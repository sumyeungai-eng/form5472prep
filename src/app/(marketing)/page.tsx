import { HomePage, homeMetadata } from "@/components/marketing/pages/HomePage";
export const revalidate = 600;
export const metadata = homeMetadata("en");
export default function Page() { return HomePage({ locale: "en" }); }
