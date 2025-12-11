"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { isFeatureEnabled } from "@/lib/featureFlags";
import { navItems } from "@/components/dashboard/Sidebar";
import { NavLogo } from "./NavLogo";
import Link from "next/link";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<"owner" | "viewer" | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/dev/me");
        const json = await res.json();
        if (!cancelled) setRole(json.user?.role ?? null);
      } catch {
        if (!cancelled) setRole(null);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const filteredNav = useMemo(
    () =>
      navItems
        .filter((item) => !item.flag || isFeatureEnabled(item.flag))
        .filter((item) => !(item.admin && isFeatureEnabled("auth_enabled") && role === "viewer")),
    [role]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
        aria-label="Open navigation"
      >
        <span className="sr-only">Open navigation</span>
        <span className="h-4 w-4 rounded-sm bg-slate-700 shadow-[0_6px_0_0_rgba(0,0,0,0.65),0_-6px_0_0_rgba(0,0,0,0.65)]" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 transform bg-white px-5 py-6 text-slate-900 shadow-xl transition duration-200 ease-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <NavLogo />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>

        <nav className="mt-6 space-y-1.5">
          {filteredNav.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? "bg-slate-200 text-slate-900 shadow-sm" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition group-hover:border-slate-300">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
