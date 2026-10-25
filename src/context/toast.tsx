"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

type ToastAction = { label: string; href?: string; onClick?: () => void };
type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; message: string; action?: ToastAction };

type ToastApi = {
  success: (message: string, action?: ToastAction) => void;
  error: (message: string, action?: ToastAction) => void;
  info: (message: string, action?: ToastAction) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => setItems((cur) => cur.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (kind: ToastKind) => (message: string, action?: ToastAction) => {
      const id = ++idRef.current;
      setItems((cur) => [...cur.slice(-2), { id, kind, message, action }]);
      window.setTimeout(() => dismiss(id), action ? 6000 : 3600);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({ success: push("success"), error: push("error"), info: push("info") }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(140px+env(safe-area-inset-bottom))] z-[80] flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {items.map((t) => {
          const Icon = t.kind === "success" ? CheckCircle2 : t.kind === "error" ? TriangleAlert : Info;
          return (
            <div
              key={t.id}
              role={t.kind === "error" ? "alert" : "status"}
              className="toast-in pointer-events-auto flex max-w-[min(92vw,460px)] items-center gap-3 rounded-full bg-primary py-2.5 pl-4 pr-2.5 text-sm font-medium text-on-primary shadow-lift"
            >
              <Icon
                size={18}
                className={t.kind === "error" ? "text-[#FF8A80]" : t.kind === "success" ? "text-[#7BD6A0]" : ""}
                aria-hidden
              />
              <span className="min-w-0 flex-1">{t.message}</span>
              {t.action &&
                (t.action.href ? (
                  <Link
                    href={t.action.href}
                    onClick={() => dismiss(t.id)}
                    className="rounded-full bg-on-primary/15 px-3 py-1 text-[13px] font-semibold hover:bg-on-primary/25"
                  >
                    {t.action.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      t.action?.onClick?.();
                      dismiss(t.id);
                    }}
                    className="rounded-full bg-on-primary/15 px-3 py-1 text-[13px] font-semibold hover:bg-on-primary/25"
                  >
                    {t.action.label}
                  </button>
                ))}
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="grid size-7 place-items-center rounded-full hover:bg-on-primary/15"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
