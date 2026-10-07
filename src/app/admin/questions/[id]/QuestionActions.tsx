"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Check, Mail, RotateCcw, Send } from "lucide-react";

export function QuestionActions({
  questionId,
  email,
  replied,
  archived,
  hasReplies,
}: {
  questionId: string;
  email: string;
  replied: boolean;
  archived: boolean;
  hasReplies: boolean;
}) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [isPending, startTransition] = useTransition();
  const busy = sending || isPending;

  async function send() {
    if (!reply.trim() || busy) return;
    if (!window.confirm(`Email this reply to ${email}?`)) return;
    setError(null);
    setNotice(null);
    setSending(true);
    try {
      const res = await fetch(`/api/admin/questions/${questionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not send the reply.");
        return;
      }
      setReply("");
      setNotice(`Reply emailed to ${email}.`);
      startTransition(() => router.refresh());
    } catch {
      setError("Could not send the reply. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  async function act(action: "answered" | "unanswered" | "archive" | "unarchive" | "unread") {
    setError(null);
    setNotice(null);
    const res = await fetch(`/api/admin/questions/${questionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Request failed");
      return;
    }
    // The detail page marks a question read when it renders, so go back to
    // the list after "unread" (and after archiving, which clears it away).
    if (action === "unread" || action === "archive") {
      startTransition(() => router.push("/admin/questions"));
      return;
    }
    startTransition(() => router.refresh());
  }

  const btn =
    "inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <label htmlFor="reply" className="text-sm font-medium text-slate-900">
        {hasReplies ? "Send another reply" : "Reply"}
        <span className="font-normal text-slate-500"> · emailed to {email}</span>
      </label>
      <textarea
        id="reply"
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void send();
        }}
        rows={8}
        maxLength={10000}
        disabled={busy}
        placeholder="Write your answer. We greet them by first name and quote their question below your reply."
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm leading-relaxed focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      <p className="mt-1 text-xs text-slate-500">
        If they reply, it arrives in support@form5472prep.com. Shortcut: ⌘/Ctrl + Enter to send.
      </p>

      {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {notice ? <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void send()}
          disabled={busy || !reply.trim()}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {sending ? "Sending…" : "Send reply"}
        </button>

        {replied ? (
          <button type="button" className={btn} disabled={busy} onClick={() => void act("unanswered")}>
            <RotateCcw className="h-4 w-4" /> Move back to “To answer”
          </button>
        ) : (
          <button type="button" className={btn} disabled={busy} onClick={() => void act("answered")} title="Use this if you already answered by email">
            <Check className="h-4 w-4" /> Mark answered (replied by email)
          </button>
        )}
        <button type="button" className={btn} disabled={busy} onClick={() => void act("unread")}>
          <Mail className="h-4 w-4" /> Mark unread
        </button>
        {archived ? (
          <button type="button" className={btn} disabled={busy} onClick={() => void act("unarchive")}>
            <ArchiveRestore className="h-4 w-4" /> Unarchive
          </button>
        ) : (
          <button type="button" className={btn} disabled={busy} onClick={() => void act("archive")} title="Hide spam or questions that need no answer">
            <Archive className="h-4 w-4" /> Archive
          </button>
        )}
      </div>
    </div>
  );
}
