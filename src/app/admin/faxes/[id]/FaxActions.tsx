"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Link as LinkIcon, Save, Trash2, Unlink, MailOpen } from "lucide-react";

export type CurrentFaxLink = {
  type: "ein" | "itin" | "filing";
  id: string;
  label: string;
  sublabel: string;
} | null;

type SearchResult = Exclude<CurrentFaxLink, null>;

export function FaxActions({
  faxId,
  currentLink,
  initialNote,
  initiallyRead,
  initiallyArchived,
}: {
  faxId: string;
  currentLink: CurrentFaxLink;
  initialNote: string;
  initiallyRead: boolean;
  initiallyArchived: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      setResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/admin/faxes/link-search?q=${encodeURIComponent(trimmed)}`);
        const data = (await response.json()) as { results?: SearchResult[] };
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  async function mutate(body: Record<string, unknown>) {
    setError(null);
    const response = await fetch(`/api/admin/faxes/${faxId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Request failed");
      return;
    }
    // The detail page marks a fax read when it renders, so refreshing after
    // "unread" would immediately mark it read again. Go back to the inbox.
    if (body.action === "unread") {
      startTransition(() => router.push("/admin/faxes"));
      return;
    }
    startTransition(() => router.refresh());
  }

  async function deleteFax() {
    if (!window.confirm("Delete this fax permanently? This cannot be undone.")) return;
    setError(null);
    const response = await fetch(`/api/admin/faxes/${faxId}`, { method: "DELETE" });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Delete failed");
      return;
    }
    router.push("/admin/faxes");
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-slate-900">Actions</h2>

      <div className="space-y-5">
        <section>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500" htmlFor="fax-link-search">
            Linked record
          </label>
          {currentLink ? (
            <div className="mb-3 rounded-md border border-blue-100 bg-blue-50 p-3">
              <p className="text-sm font-medium text-blue-950">{currentLink.label}</p>
              <p className="text-xs text-blue-700">{currentLink.sublabel}</p>
              <button
                type="button"
                onClick={() => mutate({ action: "link", target: null })}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-800 hover:underline"
              >
                <Unlink className="h-3.5 w-3.5" />
                Unlink
              </button>
            </div>
          ) : null}
          <input
            id="fax-link-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search records"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {results.length > 0 ? (
            <div className="mt-2 divide-y divide-slate-100 rounded-md border border-slate-200">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  onClick={() => mutate({ action: "link", target: { type: result.type, id: result.id } })}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-slate-50"
                >
                  <LinkIcon className="mt-0.5 h-4 w-4 flex-none text-slate-400" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900">{result.label}</span>
                    <span className="block truncate text-xs text-slate-500">{result.sublabel}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500" htmlFor="fax-note">
            Note
          </label>
          <textarea
            id="fax-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={5}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            type="button"
            onClick={() => mutate({ action: "note", note })}
            disabled={isPending}
            className="mt-2 inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </section>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {initiallyRead ? (
            <button
              type="button"
              onClick={() => mutate({ action: "unread" })}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <MailOpen className="h-4 w-4" />
              Mark unread
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => mutate({ action: initiallyArchived ? "unarchive" : "archive" })}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            {initiallyArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
            {initiallyArchived ? "Unarchive" : "Archive"}
          </button>
          <button
            type="button"
            onClick={deleteFax}
            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>

        {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
