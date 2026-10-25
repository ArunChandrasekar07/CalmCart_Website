"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Banknote, CreditCard, Smartphone, Plus } from "lucide-react";
import { AddressForm } from "@/components/account/AddressForm";
import { AddressLine } from "@/components/account/AddressesView";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, PageTitle } from "@/components/ui/States";
import { PriceSummary } from "./PriceSummary";
import { PromoBox } from "./PromoBox";
import { useAddresses } from "@/context/addresses";
import { useAuth } from "@/context/auth";
import { useCart } from "@/context/cart";
import { useCatalog } from "@/context/catalog";
import { useOrders } from "@/context/orders";
import { useToast } from "@/context/toast";
import { supabase } from "@/lib/supabase";
import { findVariant, unitPrice } from "@/lib/pricing";
import { inr } from "@/lib/format";
import { cx } from "@/lib/ui";
import type { PaymentMethod, Quote } from "@/lib/types";

const PAYMENTS: { id: PaymentMethod; label: string; sub: string; icon: typeof Banknote }[] = [
  { id: "cod", label: "Cash on delivery", sub: "Pay in cash when your order arrives", icon: Banknote },
  { id: "upi_on_delivery", label: "UPI on delivery", sub: "Scan the delivery partner's QR code", icon: Smartphone },
  { id: "card_on_delivery", label: "Card on delivery", sub: "Pay by card with the delivery partner", icon: CreditCard },
];

export function CheckoutView() {
  const { user, loading } = useAuth();
  const cart = useCart();
  const { byId } = useCatalog();
  const { addresses, current, select } = useAddresses();
  const { place } = useOrders();
  const toast = useToast();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverQuote, setServerQuote] = useState<Quote | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/checkout");
  }, [loading, user, router]);

  // The database prices the order, so show its totals when we can get them.
  useEffect(() => {
    if (!user || !cart.ready || cart.lines.length === 0) return;
    let cancelled = false;
    supabase().rpc("quote_cart", { p_promo: cart.promoCode }).then(({ data, error }) => {
      if (!cancelled && !error && data) setServerQuote(data as Quote);
    });
    return () => { cancelled = true; };
  }, [user, cart.ready, cart.lines, cart.promoCode]);

  if (!loading && user && cart.ready && cart.lines.length === 0) {
    return <EmptyState emoji="🧺" title="Your basket is empty" body="Add something before checking out." action={{ href: "/", label: "Start shopping" }} />;
  }
  const quote = serverQuote && serverQuote.itemCount === cart.quote.itemCount ? serverQuote : cart.quote;

  async function submit() {
    if (!current) return setError("Choose where we should deliver.");
    setBusy(true);
    setError(null);
    const res = await place({ addressId: current.id, payment, promo: cart.quote.promoCode, note });
    setBusy(false);
    if (res.error || !res.orderId) return setError(res.error ?? "We couldn't place your order.");
    cart.clearPromo();
    toast.success("Order placed. Your groceries are on the way soon.");
    router.replace(`/orders/${res.orderId}?placed=1`);
  }

  const card = "rounded-[22px] border border-line p-5";
  return (
    <>
      <PageTitle sub="Delivery in about 30 minutes">Checkout</PageTitle>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className={card} aria-labelledby="addr-h">
            <div className="flex items-center justify-between"><h2 id="addr-h" className="text-lg font-bold">Delivery address</h2>
              <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1 text-sm font-semibold text-accent"><Plus size={16} /> Add new</button></div>
            {addresses.length === 0 ? (
              <p className="mt-3 text-[15px] text-muted">Add an address so we know where to deliver.</p>
            ) : (
              <ul className="mt-4 space-y-2.5" role="radiogroup" aria-label="Delivery address">
                {addresses.map((a) => (
                  <li key={a.id}>
                    <button role="radio" aria-checked={current?.id === a.id} onClick={() => select(a.id)}
                      className={cx("w-full rounded-2xl border p-4 text-left transition", current?.id === a.id ? "border-accent bg-accent-soft" : "border-line hover:bg-card")}>
                      <span className="font-semibold">{a.label}</span> <span className="text-sm text-muted">· {a.recipient}, {a.phone}</span>
                      <span className="mt-0.5 block text-sm text-muted"><AddressLine a={a} /></span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={card} aria-labelledby="pay-h">
            <h2 id="pay-h" className="text-lg font-bold">Payment</h2>
            <ul className="mt-4 space-y-2.5" role="radiogroup" aria-label="Payment method">
              {PAYMENTS.map(({ id, label, sub, icon: Icon }) => (
                <li key={id}>
                  <button role="radio" aria-checked={payment === id} onClick={() => setPayment(id)}
                    className={cx("flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition", payment === id ? "border-accent bg-accent-soft" : "border-line hover:bg-card")}>
                    <span className="grid size-10 place-items-center rounded-full bg-bg"><Icon size={19} /></span>
                    <span><span className="block font-semibold">{label}</span><span className="block text-sm text-muted">{sub}</span></span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] text-muted">You pay when your order arrives. Nothing is charged online.</p>
          </section>

          <section className={card} aria-labelledby="note-h">
            <h2 id="note-h" className="text-lg font-bold">Delivery note</h2>
            <label className="sr-only" htmlFor="note">Note for the delivery partner</label>
            <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} rows={2} placeholder="Gate code, floor, or anything that helps us find you"
              className="mt-3 w-full resize-none rounded-2xl border border-line bg-surface p-4 text-[15px] outline-none focus:border-accent" />
          </section>
        </div>

        <aside className="h-fit space-y-5 rounded-[22px] bg-card p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Order summary</h2>
          <ul className="space-y-2 text-[15px]">
            {cart.lines.map((l) => {
              const p = byId.get(l.productId);
              if (!p) return null;
              return (
                <li key={`${l.productId}-${l.variantId}`} className="flex justify-between gap-3">
                  <span className="truncate">{l.qty} × {p.name}{findVariant(p, l.variantId) ? ` (${findVariant(p, l.variantId)!.label})` : ""}</span>
                  <span>{inr(unitPrice(p, l.variantId) * l.qty)}</span>
                </li>
              );
            })}
          </ul>
          <PromoBox />
          <PriceSummary quote={quote} />
          {error && <p role="alert" className="rounded-xl bg-bg p-3 text-sm text-danger">{error}</p>}
          <Button full loading={busy} disabled={!current || cart.lines.length === 0} onClick={submit}>Place order · {inr(quote.total)}</Button>
          <p className="text-center text-[12px] text-muted">By placing this order you agree to CalmCart&apos;s delivery terms. <Link href="/cart" className="underline">Edit basket</Link></p>
        </aside>
      </div>
      <Modal open={adding} onClose={() => setAdding(false)} title="Add an address">
        <AddressForm onCancel={() => setAdding(false)} onDone={() => setAdding(false)} />
      </Modal>
    </>
  );
}
