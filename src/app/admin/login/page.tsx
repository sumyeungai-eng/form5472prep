import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { LoginForm } from "./LoginForm";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin/filings");
  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="text-xl font-semibold text-center">Admin sign in</h1>
      <p className="text-sm text-slate-500 text-center mt-2">
        Manage filings, customer orders, and blog content.
      </p>
      <LoginForm />
    </div>
  );
}
