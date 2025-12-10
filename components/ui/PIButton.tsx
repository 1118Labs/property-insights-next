import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type PIButtonProps = {
  variant?: "primary" | "secondary" | "tertiary";
  href?: string;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses: Record<NonNullable<PIButtonProps["variant"]>, string> = {
  primary:
    "rounded-lg bg-[#0A84FF] text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-[#006BE6] transition disabled:opacity-60 disabled:cursor-not-allowed",
  secondary:
    "rounded-lg border border-slate-300 bg-white text-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed",
  tertiary:
    "rounded-lg text-slate-500 hover:text-slate-700 text-sm underline-offset-2 hover:underline transition px-3 py-2 disabled:opacity-60 disabled:cursor-not-allowed",
};

export default function PIButton({
  variant = "primary",
  href,
  children,
  className = "",
  ...rest
}: PIButtonProps) {
  const classes = `inline-flex items-center justify-center ${variantClasses[variant]} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
