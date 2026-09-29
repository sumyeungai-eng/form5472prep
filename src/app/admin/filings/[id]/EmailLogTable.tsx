// "Emails" card on the admin filing page: every email handed to Resend for
// this filing (EmailLog), newest first, with its delivery status. Server
// component — rows come from page.tsx.

export type EmailLogRow = {
  id: string;
  createdAt: Date;
  kind: string;
  to: string;
  subject: string;
  status: string;
  error: string | null;
  lastEventAt: Date | null;
};

const EMAIL_STATUS_STYLE: Record<string, string> = {
  sent: "bg-slate-50 text-slate-700 border-slate-200",
  delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  delivery_delayed: "bg-amber-50 text-amber-800 border-amber-200",
  bounced: "bg-red-50 text-red-800 border-red-200",
  complained: "bg-red-50 text-red-800 border-red-200",
  failed: "bg-red-50 text-red-800 border-red-200",
};

function formatUtc(d: Date): string {
  return `${d.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

export function EmailLogTable({ rows }: { rows: EmailLogRow[] | null }) {
  if (rows === null) {
    return <p className="text-sm text-red-700">Could not load the email log.</p>;
  }
  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No emails recorded for this filing. (Logging started with the EmailLog release; earlier emails are not listed.)
      </p>
    );
  }
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-slate-200">
              <th className="py-1.5 px-1 font-medium">Time</th>
              <th className="py-1.5 px-1 font-medium">Kind</th>
              <th className="py-1.5 px-1 font-medium">To</th>
              <th className="py-1.5 px-1 font-medium w-full">Subject</th>
              <th className="py-1.5 px-1 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="align-top">
                <td className="py-1.5 px-1 whitespace-nowrap text-slate-600 tabular-nums">{formatUtc(row.createdAt)}</td>
                <td className="py-1.5 px-1 font-mono text-xs text-slate-700">{row.kind}</td>
                <td className="py-1.5 px-1 text-slate-700 whitespace-nowrap">{row.to}</td>
                <td className="py-1.5 px-1 text-slate-700">{row.subject}</td>
                <td className="py-1.5 px-1">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      EMAIL_STATUS_STYLE[row.status] ?? "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {row.status}
                  </span>
                  {row.lastEventAt && (
                    <div className="mt-0.5 text-[11px] text-slate-400 whitespace-nowrap">{formatUtc(row.lastEventAt)}</div>
                  )}
                  {row.error && <div className="mt-0.5 text-xs text-red-700 break-words">{row.error}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">
        &ldquo;sent&rdquo; = accepted by Resend. Delivered / bounced / complained updates arrive from the Resend
        webhook (needs RESEND_WEBHOOK_SECRET).
      </p>
    </div>
  );
}
