"use client";

import { useEffect, useRef, useState } from "react";

// Lightweight signature pad — HTML5 canvas with mouse + touch events. Exports
// the drawing as a PNG data URL (base64 → bytes). Intentionally no library
// dependency; the surface area is small enough to keep here.
//
// Reuse-signature support: pass `initialPngDataUrl` to pre-populate the
// canvas from a saved signature. The user can either keep it (no redraw
// required) or hit Clear and draw a fresh one.
export type SignaturePadHandle = {
  // Returns the current signature as a PNG data URL, or null if the canvas
  // is empty.
  toDataUrl: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
};

export function SignaturePad({
  initialPngDataUrl,
  onChange,
  height = 180,
}: {
  initialPngDataUrl?: string | null;
  onChange?: (dataUrl: string | null) => void;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const dirty = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  // Initialise the canvas and keep its high-DPI backing store in sync with the
  // element's CSS box. Also draws the initial signature (if any) so the user
  // can keep their saved signature without re-drawing.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    let lastW = 0;
    let lastH = 0;

    // (Re)configure the high-DPI backing store to match the element's CSS box.
    // Setting canvas.width/height clears the bitmap, so snapshot any existing
    // ink first and redraw it after — this keeps strokes aligned and intact
    // when the element resizes (e.g. a phone rotation). No background fill:
    // leaving the canvas transparent means toDataURL() exports a PNG whose only
    // opaque pixels are the strokes, so embedding it into the PDF doesn't paint
    // a white box over the "Sign Here" line or underlying form text.
    const resizeBacking = () => {
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const rect = c.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      // Skip if the CSS size hasn't actually changed (the ResizeObserver fires
      // once on observe with the initial size, which the mount call already set).
      if (Math.abs(rect.width - lastW) < 1 && Math.abs(rect.height - lastH) < 1) return;
      const snapshot = dirty.current ? c.toDataURL("image/png") : null;
      const dpr = window.devicePixelRatio || 1;
      c.width = Math.round(rect.width * dpr);
      c.height = Math.round(rect.height * dpr);
      lastW = rect.width;
      lastH = rect.height;
      ctx.scale(dpr, dpr);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#0f172a";
      if (snapshot) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
        img.src = snapshot;
      }
    };

    resizeBacking();

    if (initialPngDataUrl) {
      const ctx = c.getContext("2d");
      const rect = c.getBoundingClientRect();
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          setHasInk(true);
          dirty.current = true;
        };
        img.src = initialPngDataUrl;
      }
    }

    const ro = new ResizeObserver(() => resizeBacking());
    ro.observe(c);
    return () => ro.disconnect();
  }, [initialPngDataUrl]);

  function pointer(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    drawing.current = true;
    last.current = pointer(e);
    canvasRef.current?.setPointerCapture(e.pointerId);
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !last.current) return;
    const c = canvasRef.current!;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const p = pointer(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!dirty.current) {
      dirty.current = true;
      setHasInk(true);
    }
  }
  function end(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = false;
    last.current = null;
    if (onChange) onChange(toDataUrl());
    canvasRef.current?.releasePointerCapture(e.pointerId);
  }

  function toDataUrl(): string | null {
    if (!dirty.current) return null;
    return canvasRef.current?.toDataURL("image/png") ?? null;
  }

  function clear() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const rect = c.getBoundingClientRect();
    // clearRect (vs. fillRect with white) preserves the transparency. Same
    // reason as the init block above — we want the exported PNG to have
    // alpha=0 everywhere except the strokes.
    ctx.clearRect(0, 0, rect.width, rect.height);
    dirty.current = false;
    setHasInk(false);
    if (onChange) onChange(null);
  }

  return (
    <div>
      <div
        className="rounded-lg border border-slate-300 bg-white shadow-inner"
        style={{ height }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          className="block h-full w-full cursor-crosshair touch-none"
          style={{ height }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>Draw your signature with your mouse or finger.</span>
        <button
          type="button"
          onClick={clear}
          disabled={!hasInk}
          className="text-rose-600 hover:underline disabled:text-slate-300 disabled:no-underline"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
