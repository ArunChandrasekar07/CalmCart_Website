import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/ui";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string | null; hint?: ReactNode };

export function Field({ label, error, hint, className, id, ...rest }: Props) {
  const fid = id ?? `f-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className={className}>
      <label htmlFor={fid} className="mb-1.5 block text-[13px] font-semibold text-ink">
        {label}
      </label>
      <input
        id={fid}
        aria-invalid={!!error}
        aria-describedby={error ? `${fid}-err` : undefined}
        {...rest}
        className={cx(
          "h-12 w-full rounded-xl border bg-surface px-4 text-[15px] outline-none transition placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/25",
          error ? "border-danger" : "border-line"
        )}
      />
      {error ? (
        <p id={`${fid}-err`} className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-[13px] text-muted">{hint}</p>
      )}
    </div>
  );
}
