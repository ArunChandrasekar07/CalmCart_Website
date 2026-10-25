"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cx } from "@/lib/ui";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** "right" renders a side drawer on desktop (used for the basket). */
  side?: "center" | "right";
  footer?: ReactNode;
};

/** Bottom sheet on phones, centered dialog or side drawer on larger screens. */
export function Modal({ open, onClose, title, children, side = "center", footer }: Props) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="fade absolute inset-0 bg-black/45" onClick={onClose} aria-hidden />
      <div
        className={cx(
          "absolute inset-0 flex",
          side === "right" ? "items-end justify-end md:items-stretch" : "items-end justify-center md:items-center"
        )}
        onClick={onClose}
      >
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className={cx(
            "sheet-up flex max-h-[90dvh] w-full flex-col bg-bg shadow-lift outline-none",
            side === "right"
              ? "rounded-t-[22px] md:max-h-none md:h-full md:max-w-[440px] md:rounded-none"
              : "rounded-t-[22px] md:max-w-[520px] md:rounded-[22px]"
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-lg font-bold">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid size-9 place-items-center rounded-full bg-card hover:bg-line"
            >
              <X size={18} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer && <div className="border-t border-line p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
