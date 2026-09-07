"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV, type NavBadgeKey, type NavChild, type NavItem } from "./adminNavConfig";
import { useAdminCounters } from "./useAdminCounters";

type Props = {
  onNavigate?: () => void;
};

function badgeValue(counters: ReturnType<typeof useAdminCounters>, key?: NavBadgeKey) {
  if (!counters || !key) return null;
  const value = counters[key];
  return value > 0 ? value : null;
}

function Badge({ value }: { value: number | null }) {
  if (value === null) return null;
  return (
    <span className="ml-auto inline-flex min-w-[1.25rem] justify-center rounded-full bg-slate-900 px-1.5 text-[11px] font-medium leading-5 text-white">
      {value}
    </span>
  );
}

export function AdminNav({ onNavigate }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const counters = useAdminCounters();

  function parentMatches(item: NavItem) {
    if (item.match === "exact") return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  function childMatches(parent: NavItem, child: NavChild) {
    return parentMatches(parent) && child.param
      ? searchParams.get(child.param.key) === child.param.value
      : false;
  }

  return (
    <nav className="space-y-1 px-3 py-4">
      {ADMIN_NAV.map((group, groupIndex) => (
        <div key={group.label ?? `group-${groupIndex}`}>
          {group.label ? (
            <div className="px-2.5 mt-5 mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              {group.label}
            </div>
          ) : null}
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const childActive = item.children?.some((child) => childMatches(item, child)) ?? false;
              const active = parentMatches(item) || childActive;
              const testOrder = item.href === "/admin/test-order";

              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      active && "bg-slate-100 text-slate-900 font-medium",
                      testOrder && "text-amber-700 hover:text-amber-800",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                    <Badge value={badgeValue(counters, item.badge)} />
                  </Link>
                  {active && item.children ? (
                    <div className="mt-1 space-y-1">
                      {item.children.map((child) => {
                        const childActiveNow = childMatches(item, child);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onNavigate}
                            className={cn(
                              "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 pl-9 text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                              childActiveNow && "bg-slate-100 text-slate-900 font-medium",
                            )}
                          >
                            <span className="truncate">{child.label}</span>
                            <Badge value={badgeValue(counters, child.badge)} />
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
