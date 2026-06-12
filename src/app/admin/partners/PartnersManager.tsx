"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Partner = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  active: boolean;
  filingCount: number;
  createdAt: string;
};

export function PartnersManager({ partners }: { partners: Partner[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Could not create");
      }
      setName("");
      setEmail("");
      setCompany("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(p: Partner) {
    if (!confirm(`${p.active ? "Deactivate" : "Reactivate"} ${p.name} (${p.email})?`)) return;
    await fetch("/api/admin/partners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, active: !p.active }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Create */}
      <form onSubmit={create} className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="font-medium text-slate-900 mb-3">Add a partner</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contact / agency name"
            required
            className="text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="partner@agency.com"
            required
            className="text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company (optional)"
            className="text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-3 text-sm font-medium px-4 py-2 rounded-md bg-accent text-white hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Adding…" : "Add partner"}
        </button>
      </form>

      {/* List */}
      {partners.length === 0 ? (
        <p className="text-sm text-slate-500">No partners yet.</p>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-200">
          {partners.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">
                  {p.name}
                  {p.company ? <span className="text-slate-400 font-normal"> · {p.company}</span> : null}
                </p>
                <p className="text-sm text-slate-500">{p.email}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {p.filingCount} filing{p.filingCount === 1 ? "" : "s"} · added {p.createdAt}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-none">
                <span
                  className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                    p.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {p.active ? "Active" : "Inactive"}
                </span>
                <button
                  type="button"
                  onClick={() => toggleActive(p)}
                  className="text-sm text-slate-600 hover:text-slate-900 underline"
                >
                  {p.active ? "Deactivate" : "Reactivate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
