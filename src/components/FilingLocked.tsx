import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";

export function FilingLocked({ ownerEmail }: { ownerEmail: string | null }) {
  const masked = ownerEmail ? maskEmail(ownerEmail) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-accent" />
          </div>
        </div>
        <h1 className="mt-5 text-xl font-semibold text-slate-900 text-center">
          Sign in to continue your filing
        </h1>
        <p className="mt-3 text-sm text-slate-600 text-center leading-relaxed">
          This filing is linked to an email account
          {masked ? <> (<span className="font-medium text-slate-900">{masked}</span>)</> : null}.
          Sign in with that email to pick up where you left off.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-accent text-white text-sm font-semibold shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all hover:-translate-y-0.5"
        >
          Sign in by email
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-4 text-xs text-slate-400 text-center leading-relaxed">
          We&apos;ll email you a one-click link — no password needed.
        </p>
      </div>
    </div>
  );
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.length <= 2 ? local[0] ?? "" : local.slice(0, 2);
  const stars = "•".repeat(Math.max(1, local.length - visible.length));
  return `${visible}${stars}@${domain}`;
}
