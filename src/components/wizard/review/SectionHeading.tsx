import type { LucideIcon } from "lucide-react";

// Shared heading for the Review step's left-column sections: a small navy
// icon tile, the section title, an optional right-aligned slot (a tag such as
// "Optional", or a live status line) and an optional one-line description.
export function SectionHeading({
  id,
  icon: Icon,
  title,
  aside,
  description,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  aside?: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-accent-50 text-accent ring-1 ring-inset ring-accent-100"
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
          <h3 id={id} className="text-base font-semibold tracking-tight text-ink">
            {title}
          </h3>
        </div>
        {aside}
      </div>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      )}
    </div>
  );
}
