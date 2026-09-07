import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPageHeader(props: {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href: string }[];
  actions?: ReactNode;
}): JSX.Element {
  const { title, description, breadcrumb, actions } = props;

  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {breadcrumb && breadcrumb.length > 0 ? (
          <div className="mb-2 text-xs text-slate-500">
            {breadcrumb.map((item, index) => {
              const last = index === breadcrumb.length - 1;
              return (
                <span key={`${item.href}-${item.label}`}>
                  {index > 0 ? <span className="mx-1">&rsaquo;</span> : null}
                  {last ? (
                    <span>{item.label}</span>
                  ) : (
                    <Link href={item.href} className="hover:text-slate-900">
                      {item.label}
                    </Link>
                  )}
                </span>
              );
            })}
          </div>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
