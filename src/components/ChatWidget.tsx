"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Floating AI assistant. Appears on every page except admin and the
// signature canvas. Auto-detects the filing the customer is looking at
// from the URL — the server enriches the system prompt with a sanitized
// snapshot if (and only if) the caller actually owns that filing.

type ChatMessage = { role: "user" | "assistant"; content: string };

const HIDE_PATHS = [/^\/admin(\/|$)/, /^\/filings\/[^/]+\/sign(\/|$)/];

function filingIdFromPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const m = pathname.match(/^\/filings\/([^/]+)/);
  return m ? m[1] : null;
}

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [handoffState, setHandoffState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const filingId = filingIdFromPath(pathname);
  const hide = HIDE_PATHS.some((re) => re.test(pathname ?? ""));

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open, typing]);

  if (hide) return null;

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setBusy(true);

    // Human pacing — feels less robotic than an instant reply.
    //   1. "Reading" pause before the typing indicator appears: 5–8s, so it
    //      genuinely feels like a person noticed the message and started
    //      composing a reply.
    //   2. Once we have the reply, hold it back until a realistic typing
    //      duration has elapsed, scaled to the reply length.
    const readingDelayMs = 5000 + Math.floor(Math.random() * 3000); // 5–8s
    const typingShownAt = Date.now() + readingDelayMs;
    const typingTimer = setTimeout(() => setTyping(true), readingDelayMs);

    const fetchPromise = (async () => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next, filingId }),
        });
        const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
        return (
          data.reply ??
          data.error ??
          "Sorry, something went wrong on my end — could you try again?"
        );
      } catch {
        return "Hmm, I lost connection for a second. Could you try sending that again?";
      }
    })();

    const reply = await fetchPromise;

    // "Type" at ~22 chars/sec (≈130 wpm — a fast but realistic support
    // agent) with ±15% jitter. Clamped to 3–25s: even a one-word reply
    // takes a few seconds to "type", and very long answers don't stall
    // the user past the half-minute mark.
    const baseTypingMs = (reply.length / 22) * 1000;
    const jitter = 0.85 + Math.random() * 0.3;
    const targetTypingMs = Math.min(25000, Math.max(3000, baseTypingMs * jitter));
    const elapsedSinceTyping = Date.now() - typingShownAt;
    const remaining = Math.max(0, targetTypingMs - elapsedSinceTyping);
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));

    clearTimeout(typingTimer);
    setTyping(false);
    setMessages((m) => [...m, { role: "assistant", content: reply }]);
    setBusy(false);
  }

  async function handoff() {
    if (!filingId || handoffState === "sending") return;
    setHandoffState("sending");
    const transcript = messages
      .map((m) => `${m.role === "user" ? "Customer" : "Assistant"}: ${m.content}`)
      .join("\n\n");
    const body = `[From in-portal AI chat]\n\n${transcript || "(no chat history)"}`;
    try {
      const res = await fetch(`/api/filings/${filingId}/messages?as=customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error(await res.text());
      setHandoffState("sent");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I’ve forwarded our conversation to the Form5472 Prep team. You’ll get an email when they reply, and the thread is on your filing page.",
        },
      ]);
    } catch {
      setHandoffState("error");
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open chat assistant"
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
          className="fixed bottom-5 right-5 z-[2147483647] w-[360px] max-w-[calc(100vw-2.5rem)] h-[520px] max-h-[calc(100vh-2.5rem)] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-chat-panel-in"
        >
          <header className="bg-accent text-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold leading-tight">Form5472 Prep support</p>
              <p className="text-[11px] text-white/80 leading-tight">We usually reply right away</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-white/80 hover:text-white text-xl leading-none px-1"
            >
              ×
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-sm text-slate-600 space-y-2">
                <p className="font-medium text-slate-800">Hi! How can I help?</p>
                <p>Some things I can answer:</p>
                <ul className="list-disc pl-5 text-slate-600 space-y-1">
                  <li>Do I need to file Form 5472?</li>
                  <li>What does DIIRSP mean and when do I use it?</li>
                  <li>How do I sign and fax my filing here?</li>
                  {filingId && <li>What’s the status of my filing?</li>}
                </ul>
              </div>
            )}
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role}>{m.content}</Bubble>
            ))}
            {typing && <TypingBubble />}
          </div>

          {filingId && messages.length > 0 && handoffState !== "sent" && (
            <div className="px-3 py-2 border-t border-slate-200 bg-white">
              <button
                type="button"
                onClick={handoff}
                disabled={handoffState === "sending"}
                className="w-full text-xs text-slate-600 hover:text-accent underline disabled:opacity-50"
              >
                {handoffState === "sending"
                  ? "Sending to our team…"
                  : handoffState === "error"
                    ? "Send failed — try again"
                    : "Send this conversation to our team"}
              </button>
            </div>
          )}

          <form onSubmit={send} className="border-t border-slate-200 p-2 flex gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              disabled={busy}
              className="flex-1 text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="text-sm font-medium px-3 py-2 rounded-md bg-accent text-white hover:opacity-90 disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start animate-chat-message-in">
      <div className="bg-white border border-slate-200 rounded-lg rounded-bl-sm px-3 py-2 flex items-center gap-1">
        <Dot delay="0ms" />
        <Dot delay="160ms" />
        <Dot delay="320ms" />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      style={{ animationDelay: delay }}
      className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
    />
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex animate-chat-message-in ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] text-sm whitespace-pre-wrap rounded-lg px-3 py-2 ${
          isUser
            ? "bg-accent text-white rounded-br-sm"
            : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
