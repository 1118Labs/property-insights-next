import { ReactNode } from "react";
import { AdminShell } from "@/components/AdminShell";
import { AdminErrorBoundary } from "@/components/AdminErrorBoundary";

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Active tab is set by each page through props; fallback is dashboard.
  return (
    <AdminShell>
      <AdminErrorBoundary>{children}</AdminErrorBoundary>
    </AdminShell>
  );
}
