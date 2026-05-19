"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Filing = {
  id: string;
  status: string;
  generatedPdfKey: string | null;
  signedPdfKey: string | null;
  faxJobId: string | null;
  faxStatus: string | null;
};

export function FilingActions({ filing }: { filing: Filing }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function generate() {
    setBusy("generate");
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filingId: filing.id }),
      });
      if (!res.ok) {
        alert(`Generation failed: ${await res.text()}`);
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function uploadSigned(file: File) {
    setBusy("upload");
    try {
      const fd = new FormData();
      fd.append("filingId", filing.id);
      fd.append("file", file);
      const res = await fetch("/api/upload-signed", { method: "POST", body: fd });
      if (!res.ok) {
        alert(`Upload failed: ${await res.text()}`);
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function sendFax() {
    setBusy("fax");
    try {
      const res = await fetch("/api/fax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filingId: filing.id }),
      });
      if (!res.ok) {
        alert(`Fax submission failed: ${await res.text()}`);
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <Step
        n={1}
        title="Generate filing PDFs"
        done={!!filing.generatedPdfKey}
        active={filing.status === "PAID" && !filing.generatedPdfKey}
      >
        <p className="text-sm text-slate-600 mb-3">
          Cover letter, reasonable cause statement (if DIIRSP), filled Form 1120 and Form 5472,
          plus the Part V supporting statement — combined into one PDF.
        </p>
        {!filing.generatedPdfKey ? (
          <Button onClick={generate} disabled={busy === "generate"}>
            {busy === "generate" ? "Generating…" : "Generate PDF"}
          </Button>
        ) : (
          <a href={`/api/filings/${filing.id}/pdf`} target="_blank" rel="noreferrer">
            <Button variant="outline">Download unsigned PDF</Button>
          </a>
        )}
      </Step>

      <Step
        n={2}
        title="Sign and re-upload"
        done={!!filing.signedPdfKey}
        active={!!filing.generatedPdfKey && !filing.signedPdfKey}
      >
        <p className="text-sm text-slate-600 mb-3">
          Print the unsigned PDF, sign on the indicated pages in pen, scan, and upload.
        </p>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadSigned(file);
          }}
          disabled={busy === "upload" || !filing.generatedPdfKey}
          className="block text-sm"
        />
        {filing.signedPdfKey && (
          <a
            href={`/api/filings/${filing.id}/signed-pdf`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-accent hover:underline mt-2 inline-block"
          >
            View signed PDF
          </a>
        )}
      </Step>

      <Step
        n={3}
        title="Fax to IRS Ogden PIN Unit"
        done={!!filing.faxJobId}
        active={!!filing.signedPdfKey && !filing.faxJobId}
      >
        <p className="text-sm text-slate-600 mb-3">
          We&apos;ll fax to <span className="font-mono">+1-855-887-7737</span> on your behalf.
        </p>
        {filing.faxJobId ? (
          <p className="text-sm">
            <span className="font-medium">Job:</span>{" "}
            <span className="font-mono">{filing.faxJobId}</span> ·{" "}
            <span className="font-medium">Status:</span> {filing.faxStatus}
          </p>
        ) : (
          <Button onClick={sendFax} disabled={busy === "fax" || !filing.signedPdfKey}>
            {busy === "fax" ? "Submitting…" : "Send fax"}
          </Button>
        )}
      </Step>
    </div>
  );
}

function Step({
  n,
  title,
  done,
  active,
  children,
}: {
  n: number;
  title: string;
  done: boolean;
  active: boolean;
  children: React.ReactNode;
}) {
  const tone = done
    ? "border-emerald-200 bg-emerald-50"
    : active
      ? "border-accent bg-accent-50"
      : "border-slate-200 bg-white";
  return (
    <section className={`rounded-lg border p-5 ${tone}`}>
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center ${
            done ? "bg-emerald-600 text-white" : active ? "bg-accent text-white" : "bg-slate-200 text-slate-600"
          }`}
        >
          {done ? "✓" : n}
        </span>
        <h2 className="font-medium">{title}</h2>
      </div>
      {children}
    </section>
  );
}
