import { cx } from "@/lib/ui";

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={cx("shrink-0", className)} aria-hidden>
      <rect width="64" height="64" rx="16" className="fill-primary" />
      <path d="M19 28h26l-3 18a3 3 0 0 1-3 2.5H25a3 3 0 0 1-3-2.5z" className="fill-on-primary" />
      <path d="M24 28l6-9M40 28l-6-9" className="stroke-on-primary" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M27 35v7M32 35v7M37 35v7" className="stroke-primary" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2", className)}>
      <LogoMark size={32} />
      <span className="font-display text-[1.35rem] font-bold leading-none tracking-tight">CalmCart</span>
    </span>
  );
}
