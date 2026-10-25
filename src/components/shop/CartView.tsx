"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageTitle } from "@/components/ui/States";
import { PriceSummary } from "./PriceSummary";
import { PromoBox } from "./PromoBox";
import { useAuth } from "@/context/auth";
import { useCart } from "@/context/cart";
import { useCatalog } from "@/context/catalog";
import { findVariant, unitPrice } from "@/lib/pricing";
import { inr, unitLabel } from "@/lib/format";
import { cx, tintClass } from "@/lib/ui";

export function CartView() {
  const cart = useCart();
  const { byId } = useCatalog();
  const { user } = useAuth();
  const router = useRouter();

  if (cart.ready && cart.lines.length === 0) {
    return <EmptyState emoji="🧺" title="Your basket is empty" body="Add a few things and they'll show up here." action={{ href: "/", label: "Start shopping" }} />;
  }
  const remaining = Math.max(0, 200 - cart.quote.subtotal) + 1;
  return (
    <>
      <PageTitle sub={`${cart.quote.itemCount} ${cart.quote.itemCount === 1 ? "item" : "items"} · Delivery in about 30 min`}>Your basket</PageTitle>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <ul className="divide-y divide-line rounded-[22px] border border-line px-4">
          {cart.lines.map((l) => {
            const p = byId.get(l.productId);
            if (!p) return null;
            const v = findVariant(p, l.variantId);
            return (
              <li key={`${l.productId}-${l.variantId}`} className="flex items-center gap-3.5 py-4">
                <Link href={`/product/${p.id}`} className={cx("tint grid size-[68px] shrink-0 place-items-center rounded-2xl text-4xl", tintClass(p.category))} aria-label={p.name}>{p.emoji}</Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${p.id}`} className="block truncate font-semibold hover:underline">{p.name}</Link>
                  <p className="text-sm text-muted">{v ? v.label : unitLabel(p.unit)} · {inr(unitPrice(p, l.variantId))}</p>
                  <button onClick={() => cart.setQty(l.productId, l.variantId, 0)} className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-muted hover:text-danger"><Trash2 size={13} /> Remove</button>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Stepper qty={l.qty} label={p.name} size="sm" onAdd={() => cart.add(l.productId, l.variantId)} onRemove={() => cart.remove(l.productId, l.variantId)} />
                  <p className="text-[15px] font-bold">{inr(unitPrice(p, l.variantId) * l.qty)}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit space-y-5 rounded-[22px] bg-card p-5 lg:sticky lg:top-24">
          {cart.quote.autoDiscount === 0 && cart.quote.subtotal > 0 && (
            <p className="rounded-xl bg-bg px-3.5 py-2.5 text-[13px] text-muted">Add {inr(remaining)} more to save ₹15 on this basket.</p>
          )}
          <PromoBox />
          <PriceSummary quote={cart.quote} />
          <Button full onClick={() => router.push(user ? "/checkout" : "/login?next=/checkout")}>
            {user ? "Proceed to checkout" : "Sign in to checkout"}
          </Button>
          {!user && <p className="text-center text-[13px] text-muted">Your basket will be saved to your account when you sign in.</p>}
        </aside>
      </div>
    </>
  );
}
