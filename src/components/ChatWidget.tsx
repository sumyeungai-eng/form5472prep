"use client";

import { useEffect, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";
// Type-only import: erased at build time, so it does NOT pull the panel into
// this (eager) chunk. The panel module itself is loaded with import() below.
import type { ChatStatus, ChatWidgetPanelProps } from "./ChatWidgetPanel";

// Floating "Ask a question" widget. Appears on every page except admin and the
// signature canvas. Collects the visitor's email + question and emails it to
// the admin inbox via /api/ask — no AI, no chat history. The operator replies
// from their own inbox (reply-to is set to the visitor's address).
//
// Performance split (2026-10-16): only the launcher pill and the form state
// live here, because this file runs on every page before first paint. The open
// panel (form markup + submit) is ChatWidgetPanel, fetched as its own chunk
// after the page has loaded and gone idle — or immediately on hover/focus/
// click of the launcher. The launcher stays visible until the panel code is
// ready, so a click is never lost and nothing blinks. If the chunk cannot be
// fetched after a click, the visitor is sent to /contact instead.

// Hidden on admin, the sign page, and the wizard edit page — on the last, the
// floating button can overlap the bottom-right Continue/Pay control at 375px.
const HIDE_PATHS = [
  /^\/admin(\/|$)/,
  /^\/filings\/[^/]+\/sign(\/|$)/,
  /^\/filings\/[^/]+\/edit(\/|$)/,
];

type Panel = ComponentType<ChatWidgetPanelProps>;

let panelPromise: Promise<Panel> | null = null;

/** Fetch the panel chunk once; a failed fetch (offline) is retried next time. */
function loadPanel(): Promise<Panel> {
  if (!panelPromise) {
    panelPromise = import("./ChatWidgetPanel").then(
      (m) => m.ChatWidgetPanel,
      (err) => {
        panelPromise = null;
        throw err;
      },
    );
  }
  return panelPromise;
}

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [PanelComponent, setPanelComponent] = useState<Panel | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<ChatStatus>("idle");

  const hide = HIDE_PATHS.some((re) => re.test(pathname ?? ""));

  function ensurePanel() {
    if (PanelComponent) return;
    loadPanel()
      .then((P) => setPanelComponent(() => P))
      .catch(() => {
        // Chunk failed to load (offline / deploy swap). The launcher stays on
        // screen; the next hover or click retries.
      });
  }

  // Warm the panel chunk once the page has fully loaded and the main thread is
  // idle, so the first click opens instantly. Never earlier: this keeps the
  // panel code off the first-paint path.
  useEffect(() => {
    if (hide || PanelComponent) return;
    let cancelled = false;
    let idleId: number | undefined;
    let timerId: number | undefined;
    const warm = () => {
      loadPanel()
        .then((P) => {
          if (!cancelled) setPanelComponent(() => P);
        })
        .catch(() => {});
    };
    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(warm, { timeout: 4000 });
      } else {
        timerId = window.setTimeout(warm, 1500);
      }
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, [hide, PanelComponent]);

  if (hide) return null;

  const showPanel = open && PanelComponent !== null;

  return (
    <>
      {!showPanel && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            if (PanelComponent) return;
            loadPanel()
              .then((P) => setPanelComponent(() => P))
              .catch(() => {
                // The panel chunk could not be fetched (offline, or a deploy
                // replaced it before the idle prefetch ran). Never leave a dead
                // button after an explicit click: fall back to the contact page.
                window.location.assign("/contact");
              });
          }}
          onPointerEnter={ensurePanel}
          onFocus={ensurePanel}
          aria-label="Ask a question"
          style={{ pointerEvents: "auto" }}
          className="fixed bottom-5 right-5 z-[2147483646] rounded-full bg-accent text-white shadow-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-transform duration-150 flex items-center gap-2 pl-4 pr-5 py-3 cursor-pointer animate-chat-button-in"
        >
          <ChatIcon />
          <span className="text-sm font-medium">Ask a question</span>
        </button>
      )}

      {showPanel && PanelComponent && (
        <PanelComponent
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          message={message}
          setMessage={setMessage}
          company={company}
          setCompany={setCompany}
          status={status}
          setStatus={setStatus}
          onClose={() => setOpen(false)}
        />
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
