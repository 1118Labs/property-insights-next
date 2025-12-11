"use client";

import { usePathname } from "next/navigation";
import { GlobalHeader } from "./GlobalHeader";

const SHOW_HEADER_PREFIXES = ["/dashboard", "/properties", "/jobs", "/clients", "/jobber"];

export default function GlobalNavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showHeader = SHOW_HEADER_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  if (!showHeader) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <GlobalHeader />
      {children}
    </div>
  );
}
