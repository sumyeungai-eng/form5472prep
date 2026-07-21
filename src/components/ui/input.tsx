"use client";

import * as React from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:bg-slate-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

// Native <select> with the same visual styling as Input. Used for country
// pickers, business-activity preset dropdowns, etc. Keeps look consistent
// across input types without a heavyweight combobox library.
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:bg-slate-50",
        className,
      )}
      {...props}
    />
  ),
);
Select.displayName = "Select";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("block text-sm font-medium text-slate-700 mb-1.5", className)}
      {...props}
    />
  ),
);
Label.displayName = "Label";

export function Field({
  label,
  hint,
  error,
  help,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  // Longer-form explainer reveals from a "?" icon next to the label.
  help?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [openHelp, setOpenHelp] = React.useState(false);
  // Programmatically tie the visible label to its control for screen readers.
  // Reuse the control's own id if the caller set one, otherwise generate a
  // stable id and inject it into the child input/select via cloneElement.
  const autoId = React.useId();
  const childId =
    React.isValidElement(children) && (children.props as { id?: string }).id
      ? (children.props as { id?: string }).id!
      : autoId;
  const errorId = error ? `${childId}-error` : undefined;
  const control = React.isValidElement(children)
    ? React.cloneElement(
        children as React.ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>,
        {
          id: childId,
          ...(error ? { "aria-invalid": true, "aria-describedby": errorId } : {}),
        },
      )
    : children;
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Label htmlFor={childId} className="mb-0">{label}</Label>
        {help && (
          <button
            type="button"
            onClick={() => setOpenHelp((v) => !v)}
            className="text-slate-400 hover:text-accent focus:outline-none focus:text-accent"
            aria-expanded={openHelp}
            aria-label={`Help: ${label}`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {help && openHelp && (
        <div className="mb-2 rounded-md border border-accent/20 bg-accent-50 p-3 text-xs text-slate-700 leading-relaxed">
          {help}
        </div>
      )}
      {control}
      {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {error && <p id={errorId} className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
