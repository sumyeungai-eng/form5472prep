"use client";

import "./globals.css";
import CustomerError from "./(app)/error";

export default function GlobalError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <main><CustomerError {...props} /></main>
      </body>
    </html>
  );
}
