"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { NavLogo } from "./NavLogo";
import { MobileNav } from "./MobileNav";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import SettingsDrawer from "@/components/settings/SettingsDrawer";

const titleMap: { match: string; title: string }[] = [
  { match: "/dashboard", title: "Dashboard" },
  { match: "/properties", title: "Properties" },
  { match: "/jobs", title: "Jobs" },
  { match: "/clients", title: "Clients" },
  { match: "/jobber", title: "Jobber" },
];

export function GlobalHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
   const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const title = useMemo(() => {
    const found = titleMap.find((t) => pathname?.startsWith(t.match));
    return found?.title || "Property Insights";
  }, [pathname]);

  const initial = "U";
  const showSettings = useMemo(
    () => ["/dashboard", "/properties", "/jobs", "/clients", "/jobber"].some((prefix) => pathname?.startsWith(prefix)),
    [pathname]
  );

  return (
    <>
      <header
        className={`sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 transition-all duration-200 ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="flex items-center gap-4">
          <MobileNav />
          <NavLogo />
        </div>
        <div className="hidden text-sm font-semibold text-slate-800 sm:block">{title}</div>
        <div className="flex items-center gap-3">
          {showSettings && (
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open quick settings"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-100"
            >
              <Cog6ToothIcon className="h-5 w-5" aria-hidden />
            </button>
          )}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            {initial}
          </div>
        </div>
      </header>
      {showSettings && (
        <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      )}
    </>
  );
}
