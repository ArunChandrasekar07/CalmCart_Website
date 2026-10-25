"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AddControl } from "./AddControl";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, PageTitle } from "@/components/ui/States";
import { useCatalog } from "@/context/catalog";
import { useOrders } from "@/context/orders";
import { useSettings } from "@/context/settings";
import { startingPrice } from "@/lib/pricing";
import { inr } from "@/lib/format";
import { cx, tintClass } from "@/lib/ui";
import type { Product } from "@/lib/types";

const FILTERS = ["Last 5 orders", "Frequently bought", "Seasonal picks", "Price drops"] as const;
type Filter = (typeof FILTERS)[number];

export function ForYou() {
  const { products } = useCatalog();
  const { orders } = useOrders();
  const { tap } = useSettings();
  const [filter, setFilter] = useState<Filter>("Last 5 orders");
  const [why, setWhy] = useState<Product | null>(null);

  const { recent, counts } = useMemo(() => {
    const done = orders.filter((o) => o.status !== "cancelled");
    const counts = new Map<string, number>();
    for (const o of done) for (const i of o.order_items) if (i.product_id) counts.set(i.product_id, (counts.get(i.product_id) ?? 0) + 1);
    const recent = new Set(done.slice(0, 5).flatMap((o) => o.order_items.map((i) => i.product_id ?? "")));
    return { recent, counts };
  }, [orders]);

  const data = useMemo(() => {
    const byConf = (a: Product, b: Product) => b.rating - a.rating;
    switch (filter) {
      case "Last 5 orders": {
        const fromOrders = products.filter((p) => recent.has(p.id));
        return fromOrders.length ? fromOrders : products.filter((p) => p.confidence === "High Confidence").sort(byConf);
      }
      case "Frequently bought":
        return products.filter((p) => p.tag === "Frequently bought" || (counts.get(p.id) ?? 0) >= 2).sort(byConf);
      case "Seasonal picks":
        return products.filter((p) => p.seasonal || p.tag === "Seasonal");
      case "Price drops":
        return products.filter((p) => p.tag === "Price drop" || p.variants.some((v) => v.mrp && v.mrp > v.price));
    }
  }, [filter, products, recent, counts]);

  const reasonFor = (p: Product) => {
    const out: string[] = [];
    if (counts.get(p.id)) out.push(`You've ordered this ${counts.get(p.id)} ${counts.get(p.id) === 1 ? "time" : "times"} before.`);
    if (p.tag === "Frequently bought") out.push("It's one of the items shoppers buy again and again.");
    if (p.tag === "Price drop") out.push("The price just dropped.");
    if (p.seasonal || p.tag === "Seasonal") out.push("It's in season right now, so it's at its best.");
    out.push(`${p.confidence}: rated ${p.rating.toFixed(1)} out of 5 by shoppers.`);
    return out;
  };

  return (
    <>
      <PageTitle sub="Personalized picks based on your shopping habits">Recommended for you</PageTitle>
      <div className="mb-6 flex flex-wrap gap-2.5" role="radiogroup" aria-label="Recommendation filter">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="radio"
            aria-checked={filter === f}
            onClick={() => { tap(); setFilter(f); }}
            className={cx("h-10 rounded-full px-4 text-[14px] font-medium transition", filter === f ? "bg-primary text-on-primary" : "bg-card text-muted hover:bg-line")}
          >
            {f}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <EmptyState emoji="✨" title="Nothing here yet" body="Place an order and your picks will show up here." action={{ href: "/", label: "Start shopping" }} />
      ) : (
        <ul className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {data.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-[18px] bg-card p-3">
              <Link href={`/product/${p.id}`} className={cx("tint grid size-16 shrink-0 place-items-center rounded-2xl text-3xl", tintClass(p.category))} aria-label={p.name}>{p.emoji}</Link>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${p.id}`} className="block truncate font-semibold hover:underline">{p.name}</Link>
                <p className="text-sm text-muted">{p.variants.length ? `From ${inr(startingPrice(p))}` : inr(p.price)}</p>
              </div>
              <button onClick={() => setWhy(p)} className="h-9 rounded-full bg-bg px-3.5 text-[13px] font-semibold hover:bg-line">Why this?</button>
              <AddControl product={p} size="sm" />
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!why} onClose={() => setWhy(null)} title={why ? `Why ${why.name}?` : ""}>
        <ul className="space-y-3 p-5 text-[15px]">
          {why && reasonFor(why).map((r) => <li key={r} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />{r}</li>)}
        </ul>
      </Modal>
    </>
  );
}
