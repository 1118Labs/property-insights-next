import type { ReactNode } from "react";

type PICardProps = {
  children: ReactNode;
  className?: string;
};

export default function PICard({ children, className = "" }: PICardProps) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
