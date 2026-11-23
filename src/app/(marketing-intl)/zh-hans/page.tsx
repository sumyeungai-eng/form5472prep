import { HomePage, homeMetadata } from "@/components/marketing/pages/HomePage";
export const revalidate = 600;
export const metadata = homeMetadata("zh-Hans");
export default function Page() { return HomePage({ locale: "zh-Hans" }); }
