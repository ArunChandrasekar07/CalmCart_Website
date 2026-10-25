"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Search, X } from "lucide-react";
import { useCatalog } from "@/context/catalog";
import { cx, tintClass } from "@/lib/ui";

const RECENT_KEY = "calmcart/recent-searches";

function readRecent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(v) ? v.slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function SearchBox({ className, initial = "" }: { className?: string; initial?: string }) {
  const router = useRouter();
  const { search, categories } = useCatalog();
  const [q, setQ] = useState(initial);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => setQ(initial), [initial]);
  useEffect(() => setRecent(readRecent()), [open]);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const suggestions = useMemo(() => (q.trim().length >= 1 ? search(q).slice(0, 6) : []), [q, search]);
  const catMatches = useMemo(
    () => (q.trim() ? categories.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 2) : []),
    [q, categories]
  );

  function submit(term: string) {
    const t = term.trim();
    if (!t) return;
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify([t, ...readRecent().filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 5)));
    } catch {}
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(t)}`);
  }

  return (
    <div ref={box} className={cx("relative", className)} role="search">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (active >= 0 && suggestions[active]) {
            setOpen(false);
            router.push(`/product/${suggestions[active].id}`);
          } else submit(q);
        }}
        className="flex h-12 items-center gap-2.5 rounded-full bg-card px-4 transition focus-within:ring-2 focus-within:ring-accent/40"
      >
        <Search size={18} className="shrink-0 text-muted" aria-hidden />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, suggestions.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, -1));
            } else if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Search groceries"
          aria-label="Search groceries"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-list"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); setActive(-1); }} aria-label="Clear search" className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        )}
      </form>

      {open && (suggestions.length > 0 || catMatches.length > 0 || (!q && recent.length > 0)) && (
        <div id="search-list" role="listbox" className="fade absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-2xl border border-line bg-bg py-2 shadow-lift">
          {!q &&
            recent.map((r) => (
              <button key={r} onClick={() => submit(r)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] hover:bg-card">
                <Clock size={16} className="text-muted" aria-hidden /> {r}
              </button>
            ))}
          {catMatches.map((c) => (
            <button key={c.slug} onClick={() => { setOpen(false); router.push(`/category/${encodeURIComponent(c.slug)}`); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] hover:bg-card">
              <span className="text-xl" aria-hidden>{c.emoji}</span> <span>All in <b>{c.name}</b></span>
            </button>
          ))}
          {suggestions.map((p, i) => (
            <button
              key={p.id}
              role="option"
              aria-selected={active === i}
              onClick={() => { setOpen(false); router.push(`/product/${p.id}`); }}
              className={cx("flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-card", active === i && "bg-card")}
            >
              <span className={cx("tint grid size-10 place-items-center rounded-xl text-xl", tintClass(p.category))}>{p.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium">{p.name}</span>
                <span className="block text-[13px] text-muted">{p.category}</span>
              </span>
            </button>
          ))}
          {q && (
            <button onClick={() => submit(q)} className="w-full border-t border-line px-4 py-2.5 text-left text-sm font-semibold text-accent hover:bg-card">
              See all results for “{q}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}
