"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { useCart } from "@/context/cart";
import { useCatalog } from "@/context/catalog";
import { useToast } from "@/context/toast";
import { computeQuote } from "@/lib/pricing";

export function PromoBox() {
  const cart = useCart();
  const { promos, byId } = useCatalog();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (cart.promoCode && !cart.quote.promoError) {
    return (
      <div className="flex items-center justify-between rounded-2xl bg-accent-soft p-3.5">
        <p className="flex items-center gap-2 text-sm font-semibold"><Tag size={17} className="text-accent" /> {cart.promoCode} applied</p>
        <button onClick={() => cart.clearPromo()} aria-label="Remove promo code" className="grid size-8 place-items-center rounded-full hover:bg-bg"><X size={16} /></button>
      </div>
    );
  }
  const apply = (c: string) => {
    const r = cart.applyPromo(c);
    if (r.ok) { setCode(""); setError(null); toast.success(`${c.toUpperCase()} applied.`); }
    else setError(r.error ?? "Couldn't apply this code.");
  };
  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); apply(code); }} className="flex gap-2">
        <label className="sr-only" htmlFor="promo">Promo code</label>
        <input id="promo" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }} placeholder="Promo code" className="h-12 min-w-0 flex-1 rounded-full border border-line bg-surface px-5 text-[15px] uppercase outline-none focus:border-accent" />
        <button className="h-12 rounded-full bg-primary px-6 text-sm font-semibold text-on-primary">Apply</button>
      </form>
      {error && <p className="mt-2 text-[13px] text-danger" role="alert">{error}</p>}
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {promos.map((p) => {
          const t = computeQuote(cart.lines, byId, p.code, promos, cart.hasPriorOrders);
          return (
            <button key={p.code} onClick={() => apply(p.code)} disabled={!!t.promoError} title={t.promoError ?? p.description} className="shrink-0 rounded-full border border-dashed border-accent/60 px-3 py-1.5 text-[12px] font-bold text-accent disabled:border-line disabled:text-faint">
              {p.code}
            </button>
          );
        })}
      </div>
    </div>
  );
}
