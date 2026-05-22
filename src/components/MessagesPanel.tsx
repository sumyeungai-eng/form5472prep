"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";

type Message = {
  id: string;
  fromAdmin: boolean;
  body: string;
  readAt: string | null;
  createdAt: string;
};

type LoadResponse = { messages: Message[]; role: "admin" | "customer" };

type Props = {
  filingId: string;
  isAdmin: boolean;
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function MessagesPanel({ filingId, isAdmin }: Props) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Pass the view's intended role explicitly. Without this, the server
  // resolves role from cookies alone and prefers admin — so a browser that
  // holds both admin and customer cookies would label every customer-page
  // message as `fromAdmin=true`.
  const roleQuery = `?as=${isAdmin ? "admin" : "customer"}`;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/filings/${filingId}/messages${roleQuery}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as LoadResponse;
      setMessages(data.messages);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load messages");
    }
  }, [filingId, roleQuery]);

  useEffect(() => {
    load();
  }, [load]);

  // Scroll to newest message whenever the list grows.
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages?.length]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(`/api/filings/${filingId}/messages${roleQuery}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        const txt = await res.text();
        try {
          const j = JSON.parse(txt);
          throw new Error(j.error || `HTTP ${res.status}`);
        } catch {
          throw new Error(txt || `HTTP ${res.status}`);
        }
      }
      setDraft("");
      await load();
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="text-sm font-semibold text-slate-900">Messages</div>
        <div className="text-xs text-slate-500 mt-0.5">
          {isAdmin
            ? "Messages here are visible to the customer in their portal."
            : "Direct line to our team about this filing — we'll email you when there's a new reply."}
        </div>
      </div>

      <div
        ref={listRef}
        className="max-h-80 overflow-y-auto px-4 py-3 space-y-3 bg-white"
      >
        {messages === null && !loadError && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}
        {loadError && (
          <div className="text-sm text-red-600">Couldn&apos;t load messages: {loadError}</div>
        )}
        {messages && messages.length === 0 && (
          <div className="text-sm text-slate-500 italic">No messages yet.</div>
        )}
        {messages?.map((m) => {
          const mine = m.fromAdmin === isAdmin;
          const senderLabel = m.fromAdmin
            ? isAdmin ? "You (admin)" : "Form5472 Prep team"
            : isAdmin ? "Customer" : "You";
          return (
            <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words " +
                  (mine
                    ? "bg-blue-900 text-white"
                    : "bg-slate-100 text-slate-900 border border-slate-200")
                }
              >
                <div className={"text-[11px] mb-1 " + (mine ? "text-blue-200" : "text-slate-500")}>
                  {senderLabel} · {formatWhen(m.createdAt)}
                </div>
                {m.body}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-200 p-3 bg-slate-50">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={isAdmin ? "Message the customer…" : "Message the team…"}
          rows={3}
          maxLength={5000}
          disabled={sending}
          className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent disabled:bg-slate-100"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-400">⌘/Ctrl + Enter to send</span>
          <button
            type="button"
            onClick={send}
            disabled={sending || !draft.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </button>
        </div>
        {sendError && <div className="mt-2 text-xs text-red-600">{sendError}</div>}
      </div>
    </div>
  );
}
