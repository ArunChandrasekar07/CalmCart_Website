"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Check, ChevronRight, PackageCheck, RotateCcw } from "lucide-react";
import { AddressLine } from "./AddressesView";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageTitle, Skeleton } from "@/components/ui/States";
import { PriceSummary } from "@/components/shop/PriceSummary";
import { useAuth } from "@/context/auth";
import { useCart } from "@/context/cart";
import { useCatalog } from "@/context/catalog";
import { useOrders } from "@/context/orders";
import { useToast } from "@/context/toast";
import { clock, fullDate, inr, pluralize } from "@/lib/format";
import { cx } from "@/lib/ui";
import type { Order, OrderStatus } from "@/lib/types";

const STEPS: { key: OrderStatus; label: string; sub: string }[] = [
  { key: "placed", label: "Order placed", sub: "We've got your order" },
  { key: "confirmed", label: "Confirmed", sub: "Your store accepted it" },
  { key: "packed", label: "Packed", sub: "Fresh and bagged" },
  { key: "out_for_delivery", label: "Out for delivery", sub: "On the way to you" },
  { key: "delivered", label: "Delivered", sub: "Enjoy!" },
];
const PAY: Record<string, string> = { cod: "Cash on delivery", upi_on_delivery: "UPI on delivery", card_on_delivery: "Card on delivery" };

const pill: Record<OrderStatus, string> = {
  placed: "bg-card text-ink", confirmed: "bg-card text-ink", packed: "bg-card text-ink",
  out_for_delivery: "bg-accent text-white", delivered: "bg-accent-soft text-accent", cancelled: "bg-card text-danger",
};
export const statusLabel = (s: OrderStatus) => (s === "out_for_delivery" ? "Out for delivery" : s[0].toUpperCase() + s.slice(1));

function useReorder() {
  const cart = useCart();
  const { byId } = useCatalog();
  const toast = useToast();
  const router = useRouter();
  return (o: Order) => {
    let added = 0;
    for (const i of o.order_items) {
      const p = i.product_id ? byId.get(i.product_id) : undefined;
      if (!p) continue;
      const vid = i.variant_id && p.variants.some((v) => v.id === i.variant_id) ? i.variant_id : p.variants[0]?.id ?? null;
      cart.setQty(p.id, vid, cart.qtyOf(p.id, vid) + i.qty);
      added += i.qty;
    }
    if (!added) return toast.error("These items aren't available right now.");
    toast.success(`${pluralize(added, "item")} added to your basket.`);
    router.push("/cart");
  };
}

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (!loading && !user) return <EmptyState emoji="📦" title="Sign in to see your orders" body="Your order history and live tracking live in your account." action={{ href: "/login?next=/orders", label: "Sign in" }} />;
  return <>{children}</>;
}

export function OrdersList() {
  const { orders, loading } = useOrders();
  const reorder = useReorder();
  return (
    <Guard>
      <PageTitle sub="Track current orders and reorder favourites">Your orders</PageTitle>
      {loading && orders.length === 0 ? (
        <div className="space-y-3"><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
      ) : orders.length === 0 ? (
        <EmptyState emoji="📦" title="No orders yet" body="Your first order will show up here with live tracking." action={{ href: "/", label: "Start shopping" }} />
      ) : (
        <ul className="space-y-3.5">
          {orders.map((o) => (
            <li key={o.id} className="rounded-[20px] border border-line p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{o.order_no}</p>
                  <p className="text-sm text-muted">{fullDate(o.placed_at)} · {pluralize(o.order_items.reduce((n, i) => n + i.qty, 0), "item")} · {inr(o.total)}</p>
                </div>
                <span className={cx("rounded-full px-3 py-1 text-[12px] font-bold", pill[o.status])}>{statusLabel(o.status)}</span>
              </div>
              <p className="mt-3 text-xl tracking-wide" aria-hidden>{o.order_items.slice(0, 8).map((i) => i.emoji).join(" ")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/orders/${o.id}`} className="inline-flex h-10 items-center gap-1 rounded-full bg-primary px-4 text-sm font-semibold text-on-primary">
                  {o.status === "delivered" || o.status === "cancelled" ? "View details" : "Track order"} <ChevronRight size={16} />
                </Link>
                <button onClick={() => reorder(o)} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-card px-4 text-sm font-semibold hover:bg-line"><RotateCcw size={15} /> Reorder</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Guard>
  );
}

function Eta({ order }: { order: Order }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(t);
  }, []);
  const mins = Math.max(0, Math.ceil((new Date(order.placed_at).getTime() + order.eta_minutes * 60000 - now) / 60000));
  return <>{mins <= 1 ? "Arriving any moment" : `Arriving in about ${mins} min`}</>;
}

function Detail({ id }: { id: string }) {
  const { orders, loading, cancel } = useOrders();
  const reorder = useReorder();
  const placed = useSearchParams().get("placed") === "1";
  const [busy, setBusy] = useState(false);
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return loading || orders.length === 0 ? <Skeleton className="h-96" /> : <EmptyState emoji="🔎" title="We couldn't find this order" body="It may belong to a different account." action={{ href: "/orders", label: "All orders" }} />;
  }
  const idx = STEPS.findIndex((s) => s.key === order.status);
  const live = order.status !== "delivered" && order.status !== "cancelled";
  const canCancel = order.status === "placed" || order.status === "confirmed";

  return (
    <>
      <nav className="mb-4 text-sm"><Link href="/orders" className="font-semibold text-muted hover:text-ink">← All orders</Link></nav>
      {placed && (
        <div role="status" className="pop mb-6 flex items-center gap-3 rounded-[20px] bg-accent-soft p-4">
          <span className="grid size-11 place-items-center rounded-full bg-accent text-white"><PackageCheck size={22} /></span>
          <div><p className="font-bold">Order placed</p><p className="text-sm text-muted">Thanks! We&apos;ll keep this page up to date as your order moves.</p></div>
        </div>
      )}
      <PageTitle sub={<>{fullDate(order.placed_at)} · {PAY[order.payment_method]}</>}>{order.order_no}</PageTitle>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-[22px] border border-line p-5 md:p-6" aria-label="Tracking">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">{order.status === "cancelled" ? "Order cancelled" : live ? <Eta order={order} /> : "Delivered"}</h2>
              <span className={cx("rounded-full px-3 py-1 text-[12px] font-bold", pill[order.status])}>{statusLabel(order.status)}</span>
            </div>
            {order.status === "cancelled" ? (
              <p className="text-[15px] text-muted">Cancelled {order.cancelled_at ? `at ${clock(order.cancelled_at)}` : ""}. Nothing was charged.</p>
            ) : (
              <ol className="space-y-0">
                {STEPS.map((s, i) => {
                  const done = i <= idx;
                  const t = order.status_times?.[s.key];
                  return (
                    <li key={s.key} className="relative flex gap-4 pb-6 last:pb-0" aria-current={i === idx ? "step" : undefined}>
                      {i < STEPS.length - 1 && <span className={cx("absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5", i < idx ? "bg-accent" : "bg-line")} aria-hidden />}
                      <span className={cx("relative grid size-8 shrink-0 place-items-center rounded-full border-2 transition", done ? "border-accent bg-accent text-white" : "border-line bg-bg")}>
                        {done ? <Check size={16} strokeWidth={3} /> : null}
                        {i === idx && live && <span className="absolute inset-0 animate-ping rounded-full bg-accent/40 motion-reduce:hidden" aria-hidden />}
                      </span>
                      <div className="-mt-0.5">
                        <p className={cx("font-semibold", !done && "text-faint")}>{s.label} {t && <span className="ml-1 text-[13px] font-normal text-muted">{clock(t)}</span>}</p>
                        <p className="text-sm text-muted">{s.sub}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section className="rounded-[22px] border border-line p-5 md:p-6" aria-label="Items">
            <h2 className="mb-3 text-lg font-bold">{pluralize(order.order_items.reduce((n, i) => n + i.qty, 0), "item")}</h2>
            <ul className="divide-y divide-line">
              {order.order_items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  <span className="grid size-12 place-items-center rounded-xl bg-card text-2xl">{i.emoji}</span>
                  <div className="min-w-0 flex-1"><p className="truncate font-semibold">{i.name}</p><p className="text-sm text-muted">{i.variant_label ? `${i.variant_label} · ` : ""}{i.qty} × {inr(i.unit_price)}</p></div>
                  <p className="font-semibold">{inr(i.line_total)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="h-fit space-y-5 lg:sticky lg:top-24">
          <div className="rounded-[22px] bg-card p-5">
            <h2 className="mb-4 text-lg font-bold">Bill details</h2>
            <PriceSummary totalLabel={order.status === "cancelled" ? "Total" : "Total to pay"} quote={{ itemCount: 0, subtotal: order.subtotal, deliveryFee: order.delivery_fee, autoDiscount: order.discount > 0 && !order.promo_code ? order.discount : 0, promoDiscount: order.promo_code ? order.discount : 0, promoCode: order.promo_code, promoError: null, total: order.total }} />
          </div>
          <div className="rounded-[22px] border border-line p-5 text-[15px]">
            <h2 className="mb-2 text-lg font-bold">Delivering to</h2>
            <p className="font-semibold">{order.address.label} · {order.address.recipient}</p>
            <p className="text-muted"><AddressLine a={order.address} /></p>
            {order.note && <p className="mt-3 rounded-xl bg-card p-3 text-sm">“{order.note}”</p>}
          </div>
          <div className="flex flex-col gap-2.5">
            <Button full variant="secondary" onClick={() => reorder(order)}><RotateCcw size={16} /> Reorder these items</Button>
            {canCancel && (
              <Button full variant="danger" loading={busy} onClick={async () => { if (!confirm("Cancel this order?")) return; setBusy(true); await cancel(order.id); setBusy(false); }}>Cancel order</Button>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

export function OrderDetail({ id }: { id: string }) {
  return <Guard><Suspense><Detail id={id} /></Suspense></Guard>;
}
