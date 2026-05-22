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

  // Initialise the canvas: white background, then draw the initial signature
  // (if any) so the user can keep their saved signature without re-drawing.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    // Set up a high-DPI backing store so strokes don't look pixelated.
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = Math.round(rect.width * dpr);
    c.height = Math.round(rect.height * dpr);
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";

    if (initialPngDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasInk(true);
        dirty.current = true;
      };
      img.src = initialPngDataUrl;
    }
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
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
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
