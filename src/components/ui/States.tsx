import type { ReactNode } from "react";
import { ButtonLink } from "./Button";
import { cx } from "@/lib/ui";

export function EmptyState({
  emoji,
  title,
  body,
  action,
}: {
  emoji: string;
  title: string;
  body: string;
  action?: { href: string; label: string } | ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 grid size-20 place-items-center rounded-full bg-card text-4xl" aria-hidden>
        {emoji}
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1.5 text-[15px] text-muted">{body}</p>
      {action && (
        <div className="mt-6">
          {typeof action === "object" && action !== null && "href" in action && "label" in action ? (
            <ButtonLink href={(action as { href: string }).href}>{(action as { label: string }).label}</ButtonLink>
          ) : (
            (action as ReactNode)
          )}
        </div>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton rounded-xl", className)} aria-hidden />;
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cx("mx-auto w-full max-w-[1200px] px-4 pb-28 pt-6 md:px-6 md:pb-16", className)}>{children}</main>;
}

export function PageTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <header className="mb-6">
      <h1 className="text-[1.75rem] font-bold leading-tight md:text-4xl">{children}</h1>
      {sub && <p className="mt-1 text-[15px] text-muted">{sub}</p>}
    </header>
  );
}
