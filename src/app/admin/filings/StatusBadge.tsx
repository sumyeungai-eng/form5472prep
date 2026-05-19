type Tone = { bg: string; text: string; label: string };

const TONES: Record<string, Tone> = {
  DRAFT:             { bg: "bg-slate-100",   text: "text-slate-700",  label: "Draft" },
  PAID:              { bg: "bg-blue-100",    text: "text-blue-800",   label: "Paid" },
  PDF_GENERATED:     { bg: "bg-indigo-100",  text: "text-indigo-800", label: "PDF ready" },
  SIGNATURE_PENDING: { bg: "bg-amber-100",   text: "text-amber-800",  label: "Awaiting signature" },
  SIGNED_UPLOADED:   { bg: "bg-violet-100",  text: "text-violet-800", label: "Signed" },
  FAXED:             { bg: "bg-cyan-100",    text: "text-cyan-800",   label: "Faxing" },
  CONFIRMED:         { bg: "bg-emerald-100", text: "text-emerald-800",label: "Delivered" },
  FAILED:            { bg: "bg-red-100",     text: "text-red-800",    label: "Failed" },
};

export function StatusBadge({ status }: { status: string }) {
  const tone = TONES[status] ?? { bg: "bg-slate-100", text: "text-slate-700", label: status };
  return (
    <span className={`inline-block text-[11px] font-medium rounded-full px-2 py-0.5 ${tone.bg} ${tone.text}`}>
      {tone.label}
    </span>
  );
}
