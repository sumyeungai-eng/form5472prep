"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// Render the PDF at 1.5x for crisp display on retina. The display→PDF
// coordinate conversion just divides by this factor.
const RENDER_SCALE = 1.5;
const DEFAULT_SIG_CSS_WIDTH = 180;
const DEFAULT_SIG_CSS_HEIGHT = 45;

type Placement =
  | {
      id: string;
      kind: "signature";
      pageIndex: number; // 0-based
      // CSS pixel coords relative to the rendered canvas, top-left origin
      cssX: number;
      cssY: number;
      cssWidth: number;
      cssHeight: number;
    }
  | {
      id: string;
      kind: "date";
      pageIndex: number;
      cssX: number;
      cssY: number;
      cssWidth: number;  // bounding box for the text, used for drag/select hit area
      cssHeight: number;
      text: string;      // editable date string
      cssFontSize: number; // CSS px; converts to PDF points by dividing by RENDER_SCALE
    }
  | {
      id: string;
      kind: "text";
      pageIndex: number;
      cssX: number;
      cssY: number;
      cssWidth: number;
      cssHeight: number;
      text: string;        // free-form admin-typed text
      cssFontSize: number;
    };

type Mode = "signature" | "date" | "text";

const DEFAULT_DATE_CSS_WIDTH = 110;
const DEFAULT_DATE_CSS_HEIGHT = 22;
const DEFAULT_DATE_CSS_FONT = 18; // ≈ 12pt PDF size at 1.5x render scale

// Text mode defaults — wider than date so multi-word notes don't immediately
// need a resize. Same font size as dates so they render at the same weight.
const DEFAULT_TEXT_CSS_WIDTH = 200;
const DEFAULT_TEXT_CSS_HEIGHT = 22;
const DEFAULT_TEXT_CSS_FONT = 18;

function todayMMDDYYYY(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

// Each rendered page's intrinsic PDF size (in points) so we can map display
// coords back to PDF coords on save. Indexed by pageIndex.
type PageSize = { widthPts: number; heightPts: number };

export function PlaceSignatureClient({
  filingId,
  llcName,
  taxYears,
  hasExistingSignedPdf,
}: {
  filingId: string;
  llcName: string | null;
  taxYears: number[];
  hasExistingSignedPdf: boolean;
}) {
  // useRouter was used to programmatically navigate after save, but the new
  // preview-on-save flow keeps the user on this page (with iframe preview)
  // and has them click "Back to filing" themselves. Kept the import comment
  // so it's easy to re-add a redirect later if we want one-click finish.
  const [loadingState, setLoadingState] = useState<string>("Loading PDF…");
  const [mode, setMode] = useState<Mode>("signature");
  const [defaultDateText, setDefaultDateText] = useState<string>(todayMMDDYYYY());
  // What new "text" placements are seeded with when clicked. Admin can edit
  // each instance after dropping it, but having a default lets them queue up
  // the same value (e.g. an EIN) and just click multiple boxes.
  const [defaultTextValue, setDefaultTextValue] = useState<string>("");
  const [pageSizes, setPageSizes] = useState<PageSize[]>([]);
  const [sigUrl, setSigUrl] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  // After Save lands the signed PDF, swap the page into preview mode so the
  // admin can visually confirm placement before walking away. previewUrl is a
  // cache-busted URL to /api/admin/filings/[id]/pdf?signed=1 — cache-bust so
  // a later re-edit + re-save shows the new PDF, not a stale cached one.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Each page gets a canvas ref so we can position overlays inside them.
  const pageCanvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  // Step 1: load pdfjs-dist (dynamic import — has a worker), fetch the PDF,
  // render every page to its own canvas, capture each page's PDF point size.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        // The bundled worker file path — Next bundles it under .next/static.
        // We point at the legacy build that doesn't require module workers,
        // since Vercel's edge bundler is finicky about modern worker types.
        const workerSrc = await import("pdfjs-dist/build/pdf.worker.min.mjs?url" as never).then(
          (m: { default: string }) => m.default,
        ).catch(() => null);
        if (workerSrc) {
          (pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = workerSrc;
        }

        setLoadingState("Fetching PDF…");
        const res = await fetch(`/api/admin/filings/${filingId}/pdf`, { cache: "no-store" });
        if (!res.ok) throw new Error(`PDF fetch failed: ${res.status}`);
        const data = await res.arrayBuffer();

        setLoadingState("Rendering pages…");
        const loadingTask = (pdfjs as unknown as { getDocument: (a: { data: ArrayBuffer }) => { promise: Promise<unknown> } }).getDocument({ data });
        const doc = (await loadingTask.promise) as {
          numPages: number;
          getPage: (n: number) => Promise<{
            getViewport: (a: { scale: number }) => { width: number; height: number };
            render: (a: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> };
          }>;
        };

        const sizes: PageSize[] = [];
        for (let i = 0; i < doc.numPages; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i + 1);
          // Native size (PDF points) = viewport at scale 1.
          const nativeViewport = page.getViewport({ scale: 1 });
          sizes.push({ widthPts: nativeViewport.width, heightPts: nativeViewport.height });

          const viewport = page.getViewport({ scale: RENDER_SCALE });
          const canvas = pageCanvasRefs.current[i];
          if (!canvas) continue;
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport }).promise;
        }

        if (!cancelled) setPageSizes(sizes);

        // Step 2: pull the customer signature PNG into a blob URL.
        if (!cancelled) setLoadingState("Loading signature…");
        const sigRes = await fetch(`/api/admin/filings/${filingId}/signature-png`, { cache: "no-store" });
        if (!sigRes.ok) throw new Error(`signature fetch failed: ${sigRes.status}`);
        const blob = await sigRes.blob();
        if (!cancelled) setSigUrl(URL.createObjectURL(blob));

        if (!cancelled) setLoadingState("");
      } catch (err) {
        if (!cancelled) setLoadingState(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
      }
    })();
    return () => {
      cancelled = true;
    };
    // We deliberately re-run only on filingId changes. pageCanvasRefs is a
    // ref so it doesn't need to be in deps; the canvases mount in the next
    // render and the loop catches them on this render's tick. We pre-render
    // enough canvas slots upfront (see render body) so they exist by the
    // time pdfjs needs them.
  }, [filingId]);

  // Pre-allocate canvas slots by guessing 1-50 pages. The actual count is
  // unknown until pdfjs returns it; we mount up to 50 and only fill what
  // the doc has. Unused canvases stay 0x0 and aren't visible.
  const MAX_PAGES = 50;
  const slots = useMemo(() => Array.from({ length: MAX_PAGES }, (_, i) => i), []);

  // ─── Click-to-place ─────────────────────────────────────────────────────
  function handlePageClick(pageIndex: number, e: React.MouseEvent<HTMLDivElement>) {
    // Signature mode needs the signature image loaded; date mode doesn't.
    if (mode === "signature" && !sigUrl) return;
    const wrapper = e.currentTarget;
    const rect = wrapper.getBoundingClientRect();
    const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    if (mode === "signature") {
      const cssX = e.clientX - rect.left - DEFAULT_SIG_CSS_WIDTH / 2;
      const cssY = e.clientY - rect.top - DEFAULT_SIG_CSS_HEIGHT / 2;
      setPlacements((arr) => [
        ...arr,
        {
          id,
          kind: "signature",
          pageIndex,
          cssX: Math.max(0, cssX),
          cssY: Math.max(0, cssY),
          cssWidth: DEFAULT_SIG_CSS_WIDTH,
          cssHeight: DEFAULT_SIG_CSS_HEIGHT,
        },
      ]);
    } else if (mode === "date") {
      const cssX = e.clientX - rect.left - DEFAULT_DATE_CSS_WIDTH / 2;
      const cssY = e.clientY - rect.top - DEFAULT_DATE_CSS_HEIGHT / 2;
      setPlacements((arr) => [
        ...arr,
        {
          id,
          kind: "date",
          pageIndex,
          cssX: Math.max(0, cssX),
          cssY: Math.max(0, cssY),
          cssWidth: DEFAULT_DATE_CSS_WIDTH,
          cssHeight: DEFAULT_DATE_CSS_HEIGHT,
          text: defaultDateText,
          cssFontSize: DEFAULT_DATE_CSS_FONT,
        },
      ]);
    } else {
      // Text mode — drops a free-form editable text box seeded with the
      // current default value (or "Text" if blank, so the new box is visible).
      const cssX = e.clientX - rect.left - DEFAULT_TEXT_CSS_WIDTH / 2;
      const cssY = e.clientY - rect.top - DEFAULT_TEXT_CSS_HEIGHT / 2;
      setPlacements((arr) => [
        ...arr,
        {
          id,
          kind: "text",
          pageIndex,
          cssX: Math.max(0, cssX),
          cssY: Math.max(0, cssY),
          cssWidth: DEFAULT_TEXT_CSS_WIDTH,
          cssHeight: DEFAULT_TEXT_CSS_HEIGHT,
          text: defaultTextValue || "Text",
          cssFontSize: DEFAULT_TEXT_CSS_FONT,
        },
      ]);
    }
  }

  // ─── Drag / resize ──────────────────────────────────────────────────────
  function startDrag(placementId: string, mode: "move" | "resize", e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const start = placements.find((p) => p.id === placementId);
    if (!start) return;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setPlacements((arr) =>
        arr.map((p) => {
          if (p.id !== placementId) return p;
          if (mode === "move") {
            return { ...p, cssX: start!.cssX + dx, cssY: start!.cssY + dy };
          }
          // Resize. For signatures: preserve aspect ratio so the strokes
          // don't squish. For dates / text: scale the font size proportionally
          // to the width change so the text stays legible relative to handle drag.
          if (p.kind === "signature") {
            const sStart = start as Extract<Placement, { kind: "signature" }>;
            const newW = Math.max(40, sStart.cssWidth + dx);
            const ratio = sStart.cssHeight / sStart.cssWidth;
            return { ...p, cssWidth: newW, cssHeight: newW * ratio };
          }
          // date and text share the same resize math
          const tStart = start as Extract<Placement, { kind: "date" | "text" }>;
          const newW = Math.max(40, tStart.cssWidth + dx);
          const fontRatio = newW / tStart.cssWidth;
          return {
            ...p,
            cssWidth: newW,
            cssHeight: Math.max(12, tStart.cssHeight * fontRatio),
            cssFontSize: Math.min(60, Math.max(8, tStart.cssFontSize * fontRatio)),
          };
        }),
      );
    }
    function onUp(ev: PointerEvent) {
      target.releasePointerCapture(ev.pointerId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function removePlacement(id: string) {
    setPlacements((arr) => arr.filter((p) => p.id !== id));
  }

  // ─── Save ──────────────────────────────────────────────────────────────
  async function save() {
    if (placements.length === 0) {
      setSaveMsg({ kind: "err", text: "Place at least one signature first." });
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    // Convert each placement from CSS (top-left, post-render scale) to PDF
    // points (bottom-left). For each page: PDF y = pageHeightPts - (cssY + cssHeight) / scale.
    // Date placements pass text + fontSize; signature placements pass width + height.
    // For dates, the PDF y is the BASELINE — pdf-lib's drawText draws above
    // the y coord. So we anchor to the bottom of the CSS bounding box.
    const pdfPlacements = placements.map((p) => {
      const size = pageSizes[p.pageIndex];
      if (!size) throw new Error(`No size for page ${p.pageIndex + 1}`);
      const pdfX = p.cssX / RENDER_SCALE;
      const pdfYBottom = size.heightPts - (p.cssY + p.cssHeight) / RENDER_SCALE;
      if (p.kind === "signature") {
        return {
          kind: "signature" as const,
          page: p.pageIndex + 1,
          x: pdfX,
          y: pdfYBottom,
          width: p.cssWidth / RENDER_SCALE,
          height: p.cssHeight / RENDER_SCALE,
        };
      }
      if (p.kind === "date") {
        return {
          kind: "date" as const,
          page: p.pageIndex + 1,
          x: pdfX,
          y: pdfYBottom + 2, // nudge up 2pt so descenders don't clip the box
          text: p.text,
          fontSize: p.cssFontSize / RENDER_SCALE,
        };
      }
      // text — same wire shape as date, just a different kind on the API
      return {
        kind: "text" as const,
        page: p.pageIndex + 1,
        x: pdfX,
        y: pdfYBottom + 2,
        text: p.text,
        fontSize: p.cssFontSize / RENDER_SCALE,
      };
    });
    try {
      const res = await fetch(`/api/admin/filings/${filingId}/place-signature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placements: pdfPlacements }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
      setSaveMsg({ kind: "ok", text: `Saved — ${body.pagesSigned} page(s) signed. Preview below.` });
      // Swap into preview mode so the admin can visually verify the embed
      // before navigating away. Cache-bust so a later re-edit + re-save
      // doesn't show stale bytes.
      setPreviewUrl(`/api/admin/filings/${filingId}/pdf?signed=1&t=${Date.now()}`);
      setSaving(false);
    } catch (err) {
      setSaveMsg({ kind: "err", text: err instanceof Error ? err.message : "Save failed" });
      setSaving(false);
    }
  }

  const label = llcName ?? `tax year ${taxYears.join(", ")}`;
  const pageCount = pageSizes.length;

  // Preview mode — shown after Save succeeds. Lets the admin verify the
  // embedded signature lands where they intended before navigating away or
  // sending to fax. "Re-edit" goes back to the placement canvas with the
  // same placements still loaded.
  if (previewUrl) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <Link href={`/admin/filings/${filingId}`} className="text-sm text-slate-500 hover:underline">
            ← Back to filing
          </Link>
          <span className="text-xs uppercase tracking-wider text-emerald-600">Saved · Preview signed PDF</span>
        </div>
        <header>
          <h1 className="text-xl font-semibold">Signed PDF preview — {label}</h1>
          <p className="mt-1 text-sm text-slate-600">
            This is the actual signed PDF that will be faxed to the IRS. Scroll
            through every page to confirm each signature landed correctly. If
            anything looks off, click <strong>Re-edit placement</strong> and
            adjust.
          </p>
        </header>
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener"
            className="text-xs text-slate-600 hover:underline"
          >
            Open in new tab ↗
          </a>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => {
              setPreviewUrl(null);
              setSaveMsg(null);
            }}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-300 bg-white hover:bg-slate-50"
          >
            ← Re-edit placement
          </button>
          <Link
            href={`/admin/filings/${filingId}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-accent text-white hover:bg-accent/90"
          >
            Looks good — back to filing
          </Link>
        </div>
        <iframe
          src={previewUrl}
          title="Signed PDF preview"
          className="w-full border border-slate-300 rounded-md shadow-sm"
          style={{ height: "85vh" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <Link href={`/admin/filings/${filingId}`} className="text-sm text-slate-500 hover:underline">
          ← Back to filing
        </Link>
        <span className="text-xs uppercase tracking-wider text-slate-400">Admin · Place signature</span>
      </div>

      <header>
        <h1 className="text-xl font-semibold">Place signature — {label}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Pick <strong>Signature</strong>, <strong>Date</strong>, or{" "}
          <strong>Text</strong> mode at the top, then click anywhere on a page
          to drop it. Date and Text placements are inline-editable — click the
          box to change what gets printed. Drag to nudge, drag the bottom-right
          corner to resize, click the ✕ to remove. When everything looks right,
          hit <strong>Save signed PDF</strong>.
          {hasExistingSignedPdf && (
            <span className="ml-1 text-amber-700">
              A signed PDF already exists — saving will replace it.
            </span>
          )}
        </p>
      </header>

      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        {/* Mode toggle — what gets dropped when you click on a page. */}
        <div className="inline-flex rounded-md border border-slate-300 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setMode("signature")}
            className={`px-3 py-1.5 font-medium ${mode === "signature" ? "bg-accent text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            Signature
          </button>
          <button
            type="button"
            onClick={() => setMode("date")}
            className={`px-3 py-1.5 font-medium border-l border-slate-300 ${mode === "date" ? "bg-accent text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            Date
          </button>
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`px-3 py-1.5 font-medium border-l border-slate-300 ${mode === "text" ? "bg-accent text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            Text
          </button>
        </div>
        {mode === "date" && (
          <label className="text-xs text-slate-600 inline-flex items-center gap-1.5">
            <span>New dates use:</span>
            <input
              type="text"
              value={defaultDateText}
              onChange={(e) => setDefaultDateText(e.target.value)}
              className="px-2 py-1 w-28 border border-slate-300 rounded text-xs font-mono"
              placeholder="MM/DD/YYYY"
            />
          </label>
        )}
        {mode === "text" && (
          <label className="text-xs text-slate-600 inline-flex items-center gap-1.5">
            <span>New text boxes use:</span>
            <input
              type="text"
              value={defaultTextValue}
              onChange={(e) => setDefaultTextValue(e.target.value)}
              className="px-2 py-1 w-56 border border-slate-300 rounded text-xs"
              placeholder="Type once, click to drop"
              maxLength={200}
            />
          </label>
        )}
        <span className="text-xs text-slate-500">
          {placements.filter((p) => p.kind === "signature").length} sig
          {" · "}
          {placements.filter((p) => p.kind === "date").length} date
          {" · "}
          {placements.filter((p) => p.kind === "text").length} text
          {" · "}
          {pageCount} page{pageCount === 1 ? "" : "s"}
        </span>
        <button
          type="button"
          onClick={() => setPlacements([])}
          disabled={placements.length === 0 || saving}
          className="text-xs text-slate-500 hover:text-rose-600 disabled:opacity-40"
        >
          Clear all
        </button>
        <div className="flex-1" />
        {saveMsg && (
          <span
            className={`text-xs px-2 py-1 rounded ${
              saveMsg.kind === "ok"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {saveMsg.text}
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving || placements.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-accent text-white hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving…" : "Save signed PDF"}
        </button>
      </div>

      {loadingState && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingState}
        </div>
      )}

      <div ref={containerRef} className="space-y-6">
        {slots.map((i) => {
          const visible = i < pageCount;
          return (
            <div
              key={i}
              className={visible ? "block" : "hidden"}
            >
              {visible && (
                <p className="text-xs text-slate-500 mb-1">Page {i + 1} of {pageCount}</p>
              )}
              <div
                className="relative inline-block border border-slate-300 shadow-sm bg-white cursor-crosshair"
                onClick={(e) => handlePageClick(i, e)}
              >
                <canvas ref={(el) => { pageCanvasRefs.current[i] = el; }} />
                {placements
                  .filter((p) => p.pageIndex === i)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="absolute"
                      style={{
                        left: p.cssX,
                        top: p.cssY,
                        width: p.cssWidth,
                        height: p.cssHeight,
                        cursor: "move",
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => startDrag(p.id, "move", e)}
                    >
                      {p.kind === "signature" && sigUrl && (
                        // eslint-disable-next-line @next/next/no-img-element -- internal admin tool: a transient blob/object URL drawn onto a PDF overlay; next/image's optimizer/loader doesn't apply to dynamic signature data URLs.
                        <img
                          src={sigUrl}
                          alt="customer signature"
                          draggable={false}
                          className="w-full h-full object-contain ring-2 ring-accent/50 ring-dashed bg-white/0 pointer-events-none"
                        />
                      )}
                      {p.kind === "date" && (
                        <input
                          type="text"
                          value={p.text}
                          onChange={(e) => {
                            const next = e.target.value;
                            setPlacements((arr) =>
                              arr.map((q) => (q.id === p.id && q.kind === "date" ? { ...q, text: next } : q)),
                            );
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full h-full px-1 bg-amber-50/60 ring-2 ring-amber-400/70 ring-dashed text-slate-900 font-serif outline-none"
                          style={{ fontSize: p.cssFontSize, lineHeight: 1.1 }}
                        />
                      )}
                      {p.kind === "text" && (
                        <input
                          type="text"
                          value={p.text}
                          onChange={(e) => {
                            const next = e.target.value;
                            setPlacements((arr) =>
                              arr.map((q) => (q.id === p.id && q.kind === "text" ? { ...q, text: next } : q)),
                            );
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          maxLength={200}
                          className="w-full h-full px-1 bg-sky-50/60 ring-2 ring-sky-400/70 ring-dashed text-slate-900 font-serif outline-none"
                          style={{ fontSize: p.cssFontSize, lineHeight: 1.1 }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePlacement(p.id);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white text-xs leading-none flex items-center justify-center shadow opacity-80 hover:opacity-100"
                        title="Remove"
                      >
                        ×
                      </button>
                      <div
                        onPointerDown={(e) => startDrag(p.id, "resize", e)}
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent rounded-sm cursor-nwse-resize shadow"
                        title="Drag to resize"
                      />
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
