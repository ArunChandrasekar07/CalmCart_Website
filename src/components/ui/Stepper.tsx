"use client";

import { Minus, Plus } from "lucide-react";
import { cx } from "@/lib/ui";

type Props = {
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  label: string;
  size?: "sm" | "md";
  max?: number;
};

/** The "+ ADD" pill that becomes "− qty +" once something is in the basket. */
export function Stepper({ qty, onAdd, onRemove, label, size = "md", max = 50 }: Props) {
  const h = size === "sm" ? "h-9" : "h-10";
  if (qty === 0) {
    return (
      <button
        onClick={onAdd}
        aria-label={`Add ${label}`}
        className={cx(
          h,
          "inline-flex min-w-[84px] items-center justify-center gap-1 rounded-full bg-primary px-4 text-[13px] font-bold text-on-primary transition hover:opacity-90 active:scale-95"
        )}
      >
        <Plus size={14} strokeWidth={3} aria-hidden /> ADD
      </button>
    );
  }
  return (
    <div className={cx(h, "inline-flex min-w-[84px] items-center justify-between rounded-full bg-primary text-on-primary")}>
      <button onClick={onRemove} aria-label={`Remove one ${label}`} className="grid h-full w-9 place-items-center rounded-full hover:bg-on-primary/15">
        <Minus size={15} strokeWidth={3} />
      </button>
      <span className="pop min-w-5 text-center text-sm font-bold tabular-nums" key={qty} aria-live="polite">
        {qty}
      </span>
      <button
        onClick={onAdd}
        disabled={qty >= max}
        aria-label={`Add one more ${label}`}
        className="grid h-full w-9 place-items-center rounded-full hover:bg-on-primary/15 disabled:opacity-40"
      >
        <Plus size={15} strokeWidth={3} />
      </button>
    </div>
  );
}
