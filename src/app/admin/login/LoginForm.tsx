"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/admin/filings");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Sign-in failed");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4 bg-white border border-slate-200 rounded-lg p-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          autoFocus
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
