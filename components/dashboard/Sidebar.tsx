"use client";

import {
  EnvelopeOpenIcon,
  HomeModernIcon,
  Squares2X2Icon,
  UserGroupIcon,
  BriefcaseIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isFeatureEnabled } from "@/lib/featureFlags";
import { useEffect, useMemo, useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Squares2X2Icon;
  flag?: string;
  admin?: boolean;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Squares2X2Icon },
  { label: "Requests", href: "/dashboard/requests", icon: EnvelopeOpenIcon },
  { label: "Properties", href: "/properties", icon: HomeModernIcon },
  { label: "Clients", href: "/clients", icon: UserGroupIcon },
  { label: "Jobs", href: "/jobs", icon: BriefcaseIcon },
  { label: "Jobber", href: "/dashboard/jobber", icon: LinkIcon },
];
const navSections = [
  { label: "Main", items: [navItems[0], navItems[1]] },
  { label: "Data", items: [navItems[2], navItems[3], navItems[4]] },
  { label: "Integrations", items: [navItems[5]] },
];

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<"owner" | "viewer" | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/dev/me");
        const json = await res.json();
        if (!cancelled) {
          setRole(json.user?.role ?? null);
        }
      } catch {
        if (!cancelled) setRole(null);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredNav = useMemo(
    () =>
      navItems
        .filter((item) => !item.flag || isFeatureEnabled(item.flag))
        .filter((item) => !(item.admin && isFeatureEnabled("auth_enabled") && role === "viewer")),
    [role]
  );

  const renderNav = (
    <nav className="mt-6 flex-1 space-y-4 pb-8">
      {navSections.map((section) => {
        const items = filteredNav.filter((item) =>
          section.items.find((i) => i.href === item.href)
        );
        if (!items.length) return null;
        return (
          <div key={section.label} className="space-y-2">
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {section.label}
            </p>
            <div className="space-y-1.5">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ease-out ${
                      isActive
                        ? "bg-slate-200 text-slate-900 shadow-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-2 h-10 w-1.5 rounded-full transition ${
                        isActive ? "bg-slate-900/70" : "bg-transparent group-hover:bg-slate-300"
                      }`}
                    />
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition group-hover:border-slate-300">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="flex-1 text-slate-800">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );

  return (
    <aside className="hidden h-screen w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-6 text-slate-900 shadow-sm md:flex">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200">
          <Image src="/brand/pi-logo.png" alt="Property Insights" width={40} height={40} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Property Insights</div>
          <div className="text-base font-semibold text-slate-900">Workspace</div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-wide text-slate-500">Navigation</p>
      </div>

      {renderNav}

      <div className="mt-auto border-t border-slate-200 pt-4 text-xs text-slate-500">
        Clean workspace · Property Insights
      </div>
    </aside>
  );
}

export default Sidebar;
