"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="px-3 py-1.5 text-sm font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800"
    >
      Print / save as PDF
    </button>
  );
}
