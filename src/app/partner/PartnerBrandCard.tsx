"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// "Get ready" card on the partner dashboard: the name the partner's clients
// see, plus how the white-label flow works. Text must match what the code
// does — portalActive is false until NEXT_PUBLIC_PARTNER_PORTAL_HOST is set.
export function PartnerBrandCard({
  brandName,
  fallbackName,
  portalActive,
}: {
  brandName: string | null;
  fallbackName: string;
  portalActive: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(brandName ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const shown = value.trim() || fallbackName;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/partner/brand", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName: value }),
      });
      const data = (await res.json().catch(() => ({}))) as { displayName?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Could not save");
      setValue(value.replace(/\s+/g, " ").trim()); // show what was stored
      setMessage({ ok: true, text: `Saved. Your clients see "${data.displayName}".` });
      router.refresh();
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Could not save" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Your clients deal only with you</h2>
      <p className="mt-1 text-sm text-slate-600">
        Set the name your clients see. We never contact your clients or show them our name or prices.
      </p>

      <form onSubmit={save} className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex min-w-[16rem] flex-1 flex-col text-sm font-medium text-slate-700">
          Name your clients see
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={120}
            placeholder={fallbackName}
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
      {message && (
        <p role="status" className={`mt-2 text-sm ${message.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {message.text}
        </p>
      )}

      <ul className="mt-5 space-y-2 text-sm text-slate-700">
        <li>
          <strong>Links:</strong> copy each intake or sign link from a filing below and send it from your own email.
          We never email your clients.
        </li>
        <li>
          <strong>Emails about a client&apos;s filing</strong> (fax confirmation, messages from our team) come to you,
          marked &ldquo;[Your client: LLC name]&rdquo;. Forward what you need.
        </li>
        <li>
          <strong>Payment:</strong> you pay for each filing at checkout and the receipt comes to you. Your clients never
          see our prices.
        </li>
        <li>
          <strong>Where &ldquo;{shown}&rdquo; appears:</strong>{" "}
          {portalActive
            ? "it heads your client's intake and signing pages, which open on a neutral domain (never form5472prep.com), and it is on the IRS fax receipt."
            : "on the IRS fax receipt and in your client's intake. For now your clients open links on form5472prep.com; a neutral domain under your name is coming."}
        </li>
      </ul>
    </section>
  );
}
