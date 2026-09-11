import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BellRing,
  ClipboardList,
  FileText,
  FlaskConical,
  Globe,
  Handshake,
  LayoutDashboard,
  Newspaper,
} from "lucide-react";
import type { AdminCounters } from "@/lib/admin/counters";

export type NavBadgeKey = keyof AdminCounters;
export type NavChild = {
  label: string;
  href: string;
  badge?: NavBadgeKey;
  param?: { key: string; value: string };
};
export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: NavBadgeKey;
  match?: "exact" | "prefix";
  children?: NavChild[];
};
export type NavGroup = { label?: string; items: NavItem[] };

export const ADMIN_NAV: NavGroup[] = [
  {
    items: [
      {
        label: "Overview",
        href: "/admin",
        icon: LayoutDashboard,
        match: "exact",
      },
    ],
  },
  {
    label: "Work",
    items: [
      {
        label: "Filings",
        href: "/admin/filings",
        icon: FileText,
        badge: "filingsInReview",
        match: "prefix",
        children: [
          {
            label: "Needs review",
            href: "/admin/filings?review=1",
            param: { key: "review", value: "1" },
          },
          {
            label: "Unfinished drafts",
            href: "/admin/filings?status=DRAFT",
            badge: "unfinishedDrafts",
            param: { key: "status", value: "DRAFT" },
          },
          {
            label: "Archive",
            href: "/admin/filings?hidden=1",
            param: { key: "hidden", value: "1" },
          },
        ],
      },
      {
        label: "Applications",
        href: "/admin/applications",
        icon: ClipboardList,
        badge: "applicationsAwaiting",
        match: "prefix",
        children: [
          {
            label: "EIN",
            href: "/admin/applications?type=ein",
            param: { key: "type", value: "ein" },
          },
          {
            label: "ITIN",
            href: "/admin/applications?type=itin",
            param: { key: "type", value: "itin" },
          },
        ],
      },
    ],
  },
  {
    label: "Growth",
    items: [
      {
        label: "Traffic",
        href: "/admin/traffic",
        icon: Globe,
        match: "prefix",
      },
      {
        label: "Partners",
        href: "/admin/partners",
        icon: Handshake,
        match: "prefix",
      },
      {
        label: "Sales by source",
        href: "/admin/sources",
        icon: BarChart3,
        match: "prefix",
      },
      {
        label: "Reminders",
        href: "/admin/reminders",
        icon: BellRing,
        match: "prefix",
      },
      {
        label: "Blog posts",
        href: "/admin/posts",
        icon: Newspaper,
        match: "prefix",
      },
    ],
  },
  {
    label: "Tools",
    items: [
      {
        label: "Test order",
        href: "/admin/test-order",
        icon: FlaskConical,
        match: "prefix",
      },
    ],
  },
];
