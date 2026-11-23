import { LocalizedMarketingLayout } from "@/components/marketing/LocalizedMarketingLayout";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <LocalizedMarketingLayout locale="de">{children}</LocalizedMarketingLayout>;
}
