"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export type PostEditorInitial = {
  slug?: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string;
  draft: boolean;
  content: string;
};

export function PostEditor({
  mode,
  initial,
  originalSlug,
}: {
  mode: "create" | "edit";
  initial: PostEditorInitial;
  originalSlug?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");

  function set<K extends keyof PostEditorInitial>(key: K, value: PostEditorInitial[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    const payload = {
      slug: state.slug?.trim() || undefined,
      title: state.title.trim(),
      description: state.description.trim(),
      date: state.date,
      author: state.author.trim() || undefined,
      tags: state.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      draft: state.draft,
      content: state.content,
    };

    const url = mode === "create" ? "/api/admin/posts" : `/api/admin/posts/${originalSlug}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Save failed");
      setSaving(false);
      return;
    }
    const { slug } = await res.json();
    router.push(mode === "create" ? "/admin/posts" : `/admin/posts/${slug}`);
    router.refresh();
  }

  async function destroy() {
    if (!originalSlug) return;
    if (!confirm(`Delete "${state.title}" permanently? This removes the file from disk.`)) return;
    setSaving(true);
    const res = await fetch(`/api/admin/posts/${originalSlug}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Delete failed");
      setSaving(false);
      return;
    }
    router.push("/admin/posts");
    router.refresh();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          {mode === "create" ? "New post" : "Edit post"}
        </h1>
        <div className="flex items-center gap-3">
          {mode === "edit" && (
            <a
              href={`/blog/${originalSlug}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              View live →
            </a>
          )}
          {mode === "edit" && (
            <Button variant="outline" size="sm" onClick={destroy} disabled={saving}>
              Delete
            </Button>
          )}
          <Button onClick={save} disabled={saving || !state.title}>
            {saving ? "Saving…" : state.draft ? "Save draft" : "Publish"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <Field label="Title">
            <Input value={state.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Description" hint="One or two sentences. Used as meta description and on the post index card.">
            <textarea
              value={state.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </Field>

          <div className="border border-slate-200 rounded-md bg-white">
            <div className="flex items-center border-b border-slate-200">
              <button
                type="button"
                onClick={() => setTab("write")}
                className={`px-4 py-2 text-sm border-b-2 -mb-px ${
                  tab === "write"
                    ? "border-accent text-slate-900 font-medium"
                    : "border-transparent text-slate-500"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`px-4 py-2 text-sm border-b-2 -mb-px ${
                  tab === "preview"
                    ? "border-accent text-slate-900 font-medium"
                    : "border-transparent text-slate-500"
                }`}
              >
                Preview
              </button>
            </div>
            {tab === "write" ? (
              <textarea
                value={state.content}
                onChange={(e) => set("content", e.target.value)}
                rows={24}
                placeholder="# Heading&#10;&#10;Markdown body goes here. Tables, lists, code, links — all standard GFM."
                className="block w-full px-4 py-3 text-sm font-mono leading-relaxed focus:outline-none rounded-b-md"
              />
            ) : (
              <div className="prose prose-slate max-w-none px-6 py-4 min-h-[400px]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {state.content || "_Nothing to preview yet._"}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={state.draft}
                  onChange={(e) => set("draft", e.target.checked)}
                />
                Save as draft (not visible publicly)
              </label>
            </div>
            <Field label="Slug" hint="lowercase, hyphens. Empty = auto from title.">
              <Input
                value={state.slug ?? ""}
                placeholder="auto from title"
                onChange={(e) => set("slug", e.target.value)}
              />
            </Field>
            <Field label="Date">
              <Input type="date" value={state.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field label="Author">
              <Input value={state.author} onChange={(e) => set("author", e.target.value)} />
            </Field>
            <Field label="Tags" hint="Comma-separated">
              <Input
                value={state.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="form-5472, diirsp"
              />
            </Field>
          </div>
        </aside>
      </div>
    </div>
  );
}
