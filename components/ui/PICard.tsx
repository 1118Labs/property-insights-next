import type { ReactNode } from "react";

type PICardProps = {
  children: ReactNode;
  className?: string;
};

export default function PICard({ children, className = "" }: PICardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:shadow-md ${className}`}
    >
      {children}
    </div>
  );
}
