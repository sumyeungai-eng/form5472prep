"use client";

import type { FormEvent } from "react";

// The open "Ask us a question" panel. Loaded on demand by ChatWidget (dynamic
// import) so its markup + submit logic stay out of the JavaScript every page
// runs before first paint. All state lives in ChatWidget so a half-typed
// question survives closing and reopening the panel, exactly as before the
// split.

export type ChatStatus = "idle" | "sending" | "sent" | "error";

export type ChatWidgetPanelProps = {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  company: string; // honeypot
  setCompany: (v: string) => void;
  status: ChatStatus;
  setStatus: (v: ChatStatus) => void;
  onClose: () => void;
};

export function ChatWidgetPanel({
  name,
  setName,
  email,
  setEmail,
  message,
  setMessage,
  company,
  setCompany,
  status,
  setStatus,
  onClose,
}: ChatWidgetPanelProps) {
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    if (!email.trim() || !email.includes("@") || !message.trim()) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          company, // honeypot
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      style={{ pointerEvents: "auto" }}
      className="fixed bottom-5 right-5 z-[2147483647] w-[360px] max-w-[calc(100vw-2.5rem)] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-chat-panel-in"
    >
      <header className="bg-accent text-white px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold leading-tight">Ask us a question</p>
          <p className="text-[11px] text-white/80 leading-tight">We usually reply within a few hours</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-white/80 hover:text-white text-xl leading-none px-1"
        >
          ×
        </button>
      </header>

      {status === "sent" ? (
        <div className="px-5 py-8 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <CheckIcon />
          </div>
          <p className="text-sm font-medium text-slate-900">Question sent!</p>
          <p className="mt-1 text-sm text-slate-600">
            We&apos;ll reply to <strong>{email}</strong> shortly.
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              // Reset for next time.
              setName("");
              setMessage("");
              setStatus("idle");
            }}
            className="mt-5 text-sm font-medium text-accent hover:underline"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="px-4 py-4 space-y-3 bg-white">
          <p className="text-sm text-slate-600">
            Send us your question and we&apos;ll email you back.
          </p>

          {/* Honeypot — hidden from humans, catches bots. */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            disabled={status === "sending"}
            className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            disabled={status === "sending"}
            className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help?"
            disabled={status === "sending"}
            className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />

          {status === "error" && (
            <p className="text-xs text-red-600">
              Please enter a valid email and your question, then try again. Or email{" "}
              <a href="mailto:support@form5472prep.com" className="underline">support@form5472prep.com</a>.
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full text-sm font-medium px-3 py-2.5 rounded-md bg-accent text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {status === "sending" ? "Sending…" : "Send question"}
          </button>
          <p className="text-[11px] text-slate-400 text-center">
            We&apos;ll only use your email to reply to this question.
          </p>
        </form>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
