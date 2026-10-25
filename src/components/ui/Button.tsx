import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/ui";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger";
const styles: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:opacity-90",
  accent: "bg-accent text-white hover:opacity-90",
  secondary: "bg-card text-ink hover:bg-line",
  ghost: "text-ink hover:bg-card",
  danger: "bg-card text-danger hover:bg-line",
};
const base =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean; full?: boolean };

export function Button({ variant = "primary", loading, full, className, children, disabled, ...rest }: Props) {
  return (
    <button {...rest} disabled={disabled || loading} className={cx(base, styles[variant], full && "w-full", className)}>
      {loading && <Loader2 size={18} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  full,
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  full?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cx(base, styles[variant], full && "w-full", className)}>
      {children}
    </Link>
  );
}
