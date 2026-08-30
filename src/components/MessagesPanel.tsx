"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Loader2, Paperclip, Send, X } from "lucide-react";

type Message = {
  id: string;
  fromAdmin: boolean;
  body: string;
  attachmentKey: string | null;
  attachmentName: string | null;
  attachmentType: string | null;
  readAt: string | null;
  createdAt: string;
};

type LoadResponse = { messages: Message[]; role: "admin" | "customer" };

type Props = {
  filingId: string;
  isAdmin: boolean;
};

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function MessagesPanel({ filingId, isAdmin }: Props) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if ((!body && !attachmentFile) || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const attachmentBase64 = attachmentFile ? await fileToBase64(attachmentFile) : undefined;
      const res = await fetch(`/api/filings/${filingId}/messages${roleQuery}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          attachmentBase64,
          attachmentName: attachmentFile?.name,
        }),
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
      setAttachmentFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await load();
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachmentFile(null);
      setSendError("Attachment too large (max 10MB)");
      e.target.value = "";
      return;
    }
    setAttachmentFile(file);
    setSendError(null);
  }

  function clearAttachment() {
    setAttachmentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
          const attachmentUrl = `/api/filings/${filingId}/messages/${m.id}/attachment`;
          const hasBody = m.body.trim().length > 0;
          const senderLabel = m.fromAdmin
            ? isAdmin ? "You (admin)" : "Form5472 Prep team"
            : isAdmin ? "Customer" : "You";
          return (
            <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm break-words " +
                  (mine
                    ? "bg-blue-900 text-white"
                    : "bg-slate-100 text-slate-900 border border-slate-200")
                }
              >
                <div className={"text-[11px] mb-1 " + (mine ? "text-blue-200" : "text-slate-500")}>
                  {senderLabel} · {formatWhen(m.createdAt)}
                </div>
                {m.attachmentKey && (
                  <div className={hasBody ? "mb-2" : undefined}>
                    {m.attachmentType?.startsWith("image/") ? (
                      <a href={attachmentUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={attachmentUrl}
                          alt={m.attachmentName ?? "attachment"}
                          loading="lazy"
                          className="rounded-md max-h-48 max-w-full object-contain"
                        />
                      </a>
                    ) : (
                      <a
                        href={attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={
                          "inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium hover:underline " +
                          (mine
                            ? "border-blue-700 bg-blue-800 text-white hover:bg-blue-700"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")
                        }
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{m.attachmentName ?? "attachment"}</span>
                      </a>
                    )}
                  </div>
                )}
                {hasBody && <div className="whitespace-pre-wrap">{m.body}</div>}
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
        {isAdmin && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={onFileChange}
              className="hidden"
              disabled={sending}
            />
            {attachmentFile && (
              <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700">
                <Paperclip className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{attachmentFile.name}</span>
                <button
                  type="button"
                  onClick={clearAttachment}
                  disabled={sending}
                  className="rounded-sm p-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                  aria-label="Remove attachment"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-400">⌘/Ctrl + Enter to send</span>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Paperclip className="h-4 w-4" />
                Attach
              </button>
            )}
            <button
              type="button"
              onClick={send}
              disabled={sending || (!draft.trim() && !attachmentFile)}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </button>
          </div>
        </div>
        {sendError && <div className="mt-2 text-xs text-red-600">{sendError}</div>}
      </div>
    </div>
  );
}
