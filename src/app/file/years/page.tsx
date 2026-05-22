"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, CalendarRange, Layers, ArrowLeft, ArrowRight } from "lucide-react";

const OPTIONS = [
  {
    id: "1",
    icon: CalendarDays,
    label: "Just this year",
    description: "Filing for the current or most recent tax year.",
    tag: null,
  },
  {
    id: "2",
    icon: CalendarRange,
    label: "Two years — catch-up",
    description: "Missed last year and need to file both together.",
    tag: "DIIRSP",
  },
  {
    id: "3",
    icon: Layers,
    label: "Three or more years",
    description: "Multiple missed years — full delinquent catch-up filing.",
    tag: "DIIRSP",
  },
];

export default function YearsStepPage() {
  const router = useRouter();

  function pick(years: string) {
    router.push(`/file/save?years=${years}`);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <StepBar current={2} total={3} onBack={() => router.push("/file/owner")} />

        {/* Question */}
        <div className="mt-10">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider">Step 2 of 3</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 text-balance leading-tight">
            How many tax years do you need to file?
          </h1>
          <p className="mt-3 text-slate-500">
            Each missed year needs its own Form 5472. Filing together under DIIRSP is the approved catch-up route.
          </p>
        </div>

        {/* Options */}
        <div className="mt-8 space-y-3">
          {OPTIONS.map((opt, i) => (
            <button
              key={opt.id}
              onClick={() => pick(opt.id)}
              className="w-full text-left group"
            >
              <div className={`rounded-2xl border-2 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-accent hover:shadow-accent/10 ${
                i === 0 ? "border-slate-200" : "border-slate-200"
              }`}>
                <div className="flex items-start gap-4">
                  <div className="flex-none w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors duration-200">
                    <opt.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900">{opt.label}</p>
                      {opt.tag && (
                        <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-100 text-amber-700 px-2 py-0.5">
                          {opt.tag}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500 leading-relaxed">{opt.description}</p>
                  </div>
                  <ArrowRight className="flex-none h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors mt-1" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-5 text-xs text-slate-400 text-center">
          Not sure how many years? Pick the higher number — you can adjust inside the form.
        </p>
      </div>
    </div>
  );
}

function StepBar({ current, total, onBack }: { current: number; total: number; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex-none w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all flex items-center justify-center"
        aria-label="Back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <div className="flex-1 flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
              i < current ? "bg-accent" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <span className="flex-none text-xs font-medium text-slate-400 tabular-nums">{current} / {total}</span>
    </div>
  );
}
