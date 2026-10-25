"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProductGrid } from "./ProductCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { useAuth, displayName } from "@/context/auth";
import { useCatalog } from "@/context/catalog";
import { useOrders } from "@/context/orders";
import { useSettings } from "@/context/settings";
import { rankFeed } from "@/lib/feed";
import { cx } from "@/lib/ui";

export function Greeting() {
  const { user, profile } = useAuth();
  const name = displayName(user, profile).split(" ")[0];
  return (
    <div>
      <h2 className="text-2xl font-bold md:text-3xl">{name ? `Hi, ${name}` : "Hi there"}</h2>
      <p className="text-[15px] text-muted">What do you need today?</p>
    </div>
  );
}

export function HomeFeed() {
  const { products, categories } = useCatalog();
  const { orders } = useOrders();
  const { tap } = useSettings();
  const [feed, setFeed] = useState<"your" | "generic">("your");
  const [category, setCategory] = useState("All");

  const ordered = useMemo(() => new Set(orders.flatMap((o) => o.order_items.map((i) => i.product_id ?? ""))), [orders]);
  const results = useMemo(() => {
    const base = category === "All" ? products : products.filter((p) => p.category === category);
    return feed === "generic" ? base : rankFeed(base, ordered);
  }, [products, category, feed, ordered]);

  const chip = "inline-flex h-10 min-w-[86px] shrink-0 items-center justify-center rounded-full px-4 text-[14px] font-medium transition";
  return (
    <section id="shop" aria-label="Shop" className="scroll-mt-32">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Greeting />
        <div className="flex gap-2.5 md:w-80" role="group" aria-label="Feed">
          {(
            [
              ["your", "Your Feed"],
              ["generic", "Generic Feed"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              aria-pressed={feed === key}
              onClick={() => {
                tap();
                setFeed(key);
              }}
              className={cx("h-11 flex-1 rounded-full text-[14px] font-semibold transition", feed === key ? "bg-accent text-white" : "bg-card text-muted hover:bg-line")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mb-6 flex gap-2.5 overflow-x-auto px-4 py-1 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Categories">
        {["All", ...categories.map((c) => c.name)].map((c) => (
          <button
            key={c}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={cx(chip, category === c ? "bg-primary text-on-primary" : "bg-card text-muted hover:bg-line")}
          >
            {c}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <EmptyState emoji="🔍" title="No matches" body="Try a different category." action={<Button variant="secondary" onClick={() => setCategory("All")}>Clear filters</Button>} />
      ) : (
        <ProductGrid products={results} priorityCount={5} />
      )}
      <p className="mt-8 text-center text-sm text-muted">
        Looking for something specific? <Link href="/search" className="font-semibold text-ink underline">Search the full range</Link>
      </p>
    </section>
  );
}
