import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type BaseProps = {
  variant?: "primary" | "secondary" | "tertiary";
  children: ReactNode;
  className?: string;
};

type LinkButtonProps = BaseProps &
  { href: string } &
  AnchorHTMLAttributes<HTMLAnchorElement>;

type NativeButtonProps = BaseProps &
  { href?: undefined } &
  ButtonHTMLAttributes<HTMLButtonElement>;

type PIButtonProps = LinkButtonProps | NativeButtonProps;

const variantClasses: Record<NonNullable<PIButtonProps["variant"]>, string> = {
  primary:
    "rounded-lg bg-[#0A84FF] text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-[#006BE6] transition disabled:opacity-60 disabled:cursor-not-allowed",
  secondary:
    "rounded-lg border border-slate-300 bg-white text-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed",
  tertiary:
    "rounded-lg text-slate-500 hover:text-slate-700 text-sm underline-offset-2 hover:underline transition px-3 py-2 disabled:opacity-60 disabled:cursor-not-allowed",
};

function isLinkButtonProps(props: PIButtonProps): props is LinkButtonProps {
  return typeof props.href === "string" && props.href.length > 0;
}

export default function PIButton(props: PIButtonProps) {
  if (isLinkButtonProps(props)) {
    const { href, variant = "primary", className = "", children, ...rest } = props;
    const classes = `inline-flex items-center justify-center ${variantClasses[variant]} ${className}`.trim();
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant = "primary", className = "", children, ...rest } = props;
  const classes = `inline-flex items-center justify-center ${variantClasses[variant]} ${className}`.trim();
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
