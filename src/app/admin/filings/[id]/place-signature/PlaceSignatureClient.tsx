"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// Render the PDF at 1.5x for crisp display on retina. The display→PDF
// coordinate conversion just divides by this factor.
const RENDER_SCALE = 1.5;
const DEFAULT_SIG_CSS_WIDTH = 180;
const DEFAULT_SIG_CSS_HEIGHT = 45;

type Placement = {
  id: string;
  pageIndex: number; // 0-based
  // CSS pixel coords relative to the rendered canvas, top-left origin
  cssX: number;
  cssY: number;
  cssWidth: number;
  cssHeight: number;
};

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
  const router = useRouter();
  const [loadingState, setLoadingState] = useState<string>("Loading PDF…");
  const [pageSizes, setPageSizes] = useState<PageSize[]>([]);
  const [sigUrl, setSigUrl] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
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
    if (!sigUrl) return;
    const wrapper = e.currentTarget;
    const rect = wrapper.getBoundingClientRect();
    const cssX = e.clientX - rect.left - DEFAULT_SIG_CSS_WIDTH / 2;
    const cssY = e.clientY - rect.top - DEFAULT_SIG_CSS_HEIGHT / 2;
    const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setPlacements((arr) => [
      ...arr,
      {
        id,
        pageIndex,
        cssX: Math.max(0, cssX),
        cssY: Math.max(0, cssY),
        cssWidth: DEFAULT_SIG_CSS_WIDTH,
        cssHeight: DEFAULT_SIG_CSS_HEIGHT,
      },
    ]);
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
          // Resize: keep top-left fixed, change width + height.
          const newW = Math.max(40, start!.cssWidth + dx);
          // Preserve the signature's aspect ratio so it doesn't squish.
          const ratio = start!.cssHeight / start!.cssWidth;
          const newH = newW * ratio;
          return { ...p, cssWidth: newW, cssHeight: newH };
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
    const pdfPlacements = placements.map((p) => {
      const size = pageSizes[p.pageIndex];
      if (!size) throw new Error(`No size for page ${p.pageIndex + 1}`);
      return {
        page: p.pageIndex + 1, // server expects 1-based
        x: p.cssX / RENDER_SCALE,
        y: size.heightPts - (p.cssY + p.cssHeight) / RENDER_SCALE,
        width: p.cssWidth / RENDER_SCALE,
        height: p.cssHeight / RENDER_SCALE,
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
      setSaveMsg({ kind: "ok", text: `Saved! ${body.pagesSigned} page(s) signed.` });
      // Bounce back to admin filing detail after a beat.
      setTimeout(() => router.push(`/admin/filings/${filingId}`), 1500);
    } catch (err) {
      setSaveMsg({ kind: "err", text: err instanceof Error ? err.message : "Save failed" });
      setSaving(false);
    }
  }

  const label = llcName ?? `tax year ${taxYears.join(", ")}`;
  const pageCount = pageSizes.length;

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
          Click anywhere on a page to drop the customer&apos;s signature there.
          Drag to nudge, drag the bottom-right corner to resize, click the ✕
          to remove. When everything looks right, hit{" "}
          <strong>Save signed PDF</strong>.
          {hasExistingSignedPdf && (
            <span className="ml-1 text-amber-700">
              A signed PDF already exists — saving will replace it.
            </span>
          )}
        </p>
      </header>

      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        <span className="text-xs text-slate-500">
          {placements.length} signature{placements.length === 1 ? "" : "s"} placed across {pageCount} page{pageCount === 1 ? "" : "s"}
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
                {sigUrl && placements
                  .filter((p) => p.pageIndex === i)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="absolute group"
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
                      <img
                        src={sigUrl}
                        alt="customer signature"
                        draggable={false}
                        className="w-full h-full object-contain ring-2 ring-accent/50 ring-dashed bg-white/0 pointer-events-none"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePlacement(p.id);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white text-xs leading-none flex items-center justify-center shadow opacity-80 hover:opacity-100"
                        title="Remove signature"
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
