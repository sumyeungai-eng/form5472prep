"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

// Floating "Ask a question" widget. Appears on every page except admin and the
// signature canvas. Collects the visitor's email + question and emails it to
// the admin inbox via /api/ask — no AI, no chat history. The operator replies
// from their own inbox (reply-to is set to the visitor's address).

const HIDE_PATHS = [/^\/admin(\/|$)/, /^\/filings\/[^/]+\/sign(\/|$)/];

type Status = "idle" | "sending" | "sent" | "error";

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");

  const hide = HIDE_PATHS.some((re) => re.test(pathname ?? ""));
  if (hide) return null;

  async function submit(e: React.FormEvent) {
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
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ask a question"
          style={{ pointerEvents: "auto" }}
          className="fixed bottom-5 right-5 z-[2147483646] rounded-full bg-accent text-white shadow-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-transform duration-150 flex items-center gap-2 pl-4 pr-5 py-3 cursor-pointer animate-chat-button-in"
        >
          <ChatIcon />
          <span className="text-sm font-medium">Ask a question</span>
        </button>
      )}

      {open && (
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
              onClick={() => setOpen(false)}
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
                  setOpen(false);
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
      )}
    </>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
