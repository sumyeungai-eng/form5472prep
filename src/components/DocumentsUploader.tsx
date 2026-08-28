"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type DocumentRow = {
  id: string;
  fileName: string;
  size: number;
  createdAt: string;
  uploadedBy?: string;
};

type UploadState = {
  id: string;
  name: string;
  status: "uploading" | "error";
  error?: string;
};

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DocumentsUploader({
  filingId,
  title = "Documents",
  description,
}: {
  filingId: string;
  title?: string;
  description?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadDocuments() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/filings/${filingId}/documents`, { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Could not load documents (${res.status})`);
      setDocuments(body.documents ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filingId]);

  async function uploadFiles(files: File[]) {
    setError(null);
    const queued = files.map((file, index) => ({
      file,
      id: `${Date.now()}_${index}_${file.name}`,
    }));
    setUploads(queued.map(({ id, file }) => ({ id, name: file.name, status: "uploading" })));

    for (const { id, file } of queued) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch(`/api/filings/${filingId}/documents`, {
          method: "POST",
          body: fd,
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || `Upload failed (${res.status})`);
        setDocuments((docs) => [...docs, body.document]);
        setUploads((all) => all.filter((u) => u.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setUploads((all) =>
          all.map((u) => (u.id === id ? { ...u, status: "error", error: message } : u)),
        );
      }
    }
  }

  async function removeDocument(doc: DocumentRow) {
    if (!window.confirm(`Remove "${doc.fileName}"?`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/filings/${filingId}/documents/${doc.id}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Remove failed (${res.status})`);
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove document");
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-1.5" />
          Add document
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        multiple
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) void uploadFiles(files);
          e.target.value = "";
        }}
      />

      <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
        {loading ? (
          <p className="py-3 text-sm text-slate-500">Loading documents…</p>
        ) : documents.length === 0 ? (
          <p className="py-3 text-sm text-slate-500">No documents uploaded yet.</p>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0 flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 flex-none text-slate-400" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{doc.fileName}</p>
                  <p className="text-xs text-slate-500">
                    {formatSize(doc.size)} · {formatDate(doc.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex flex-none items-center gap-2">
                <a
                  href={`/api/filings/${filingId}/documents/${doc.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                >
                  View <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  type="button"
                  onClick={() => void removeDocument(doc)}
                  className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {uploads.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {uploads.map((upload) => (
            <p
              key={upload.id}
              className={upload.status === "error" ? "text-xs text-red-600" : "text-xs text-slate-500"}
            >
              {upload.name}: {upload.status === "uploading" ? "Uploading…" : upload.error}
            </p>
          ))}
        </div>
      )}
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </div>
  );
}
