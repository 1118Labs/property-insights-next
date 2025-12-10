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
import { useEffect, useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Squares2X2Icon;
  flag?: string;
  admin?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Squares2X2Icon },
  { label: "Requests", href: "/dashboard/requests", icon: EnvelopeOpenIcon },
  { label: "Jobs", href: "/jobs", icon: BriefcaseIcon },
  { label: "Clients", href: "/clients", icon: UserGroupIcon },
  { label: "Properties", href: "/properties", icon: HomeModernIcon },
  { label: "Jobber", href: "/dashboard/jobber", icon: LinkIcon },
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

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6 text-slate-900 shadow-sm md:flex md:flex-col">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200">
          <Image src="/brand/pi-logo.png" alt="Property Insights" width={40} height={40} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Property Insights
          </div>
          <div className="text-base font-semibold text-slate-900">
            Workspace
          </div>
        </div>
      </div>
      <nav className="mt-4 flex-1 space-y-1 pb-8">
        {navItems
          .filter((item) => !item.flag || isFeatureEnabled(item.flag))
          .filter((item) => !(item.admin && isFeatureEnabled("auth_enabled") && role === "viewer"))
          .map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-slate-200 text-slate-900 font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-slate-200 px-2 pt-4 text-xs text-slate-500">
        Apple-light theme · PI
      </div>
    </aside>
  );
}

export default Sidebar;
