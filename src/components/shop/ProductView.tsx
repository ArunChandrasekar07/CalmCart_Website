"use client";

import Link from "next/link";
import { ChevronRight, Clock, Leaf, ShieldCheck, Star } from "lucide-react";
import { VariantList } from "./VariantPicker";
import { AddControl } from "./AddControl";
import { ProductGrid } from "./ProductCard";
import { WishlistButton } from "./WishlistButton";
import { Page } from "@/components/ui/States";
import { useCatalog } from "@/context/catalog";
import { useCart } from "@/context/cart";
import { startingPrice } from "@/lib/pricing";
import { inr, unitLabel } from "@/lib/format";
import { categoryHref, cx, tintClass } from "@/lib/ui";
import type { Product } from "@/lib/types";

export function ProductView({ id, initial }: { id: string; initial: Product }) {
  const { getProduct, products } = useCatalog();
  const cart = useCart();
  const product = getProduct(id) ?? initial;
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 5);
  const count = cart.qtyOfProduct(product.id);

  return (
    <Page>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-sm text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <ChevronRight size={14} aria-hidden />
        <Link href={categoryHref(product.category)} className="hover:text-ink">{product.category}</Link>
        <ChevronRight size={14} aria-hidden />
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className={cx("tint relative grid aspect-square place-items-center rounded-[28px]", tintClass(product.category))}>
          <span className="text-[9rem] leading-none md:text-[12rem]" role="img" aria-label={product.name}>{product.emoji}</span>
          <WishlistButton productId={product.id} name={product.name} className="absolute right-4 top-4 size-11" />
          {product.tag && <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-on-primary">{product.tag}</span>}
        </div>

        <div>
          <p className="text-sm font-semibold text-accent">{product.confidence}</p>
          <h1 className="mt-1 text-4xl font-bold md:text-5xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3 text-[15px] text-muted">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 font-semibold text-ink">
              <Star size={14} className="fill-[#F4B740] text-[#F4B740]" aria-hidden /> {product.rating.toFixed(1)}
            </span>
            <span>{unitLabel(product.unit)}</span>
          </div>
          <p className="mt-5 max-w-prose text-[16px] leading-relaxed text-muted">{product.description}</p>

          {product.variants.length > 0 ? (
            <section className="mt-6" aria-label="Pack sizes">
              <h2 className="text-lg font-bold">Select a pack size</h2>
              <VariantList product={product} />
            </section>
          ) : (
            <div className="mt-6 flex items-center justify-between rounded-2xl bg-card p-4">
              <p className="text-2xl font-bold">{inr(product.price)} <span className="text-sm font-medium text-muted">{unitLabel(product.unit)}</span></p>
              <AddControl product={product} />
            </div>
          )}

          {count > 0 && (
            <Link href="/cart" className="mt-5 flex h-12 items-center justify-center rounded-full bg-accent text-[15px] font-semibold text-white">
              Go to basket · {count} {count === 1 ? "item" : "items"}
            </Link>
          )}

          <ul className="mt-6 grid gap-3 text-sm text-muted sm:grid-cols-3">
            <li className="flex items-center gap-2"><Clock size={17} className="text-accent" /> Delivery in about 30 min</li>
            <li className="flex items-center gap-2"><Leaf size={17} className="text-accent" /> Sourced locally</li>
            <li className="flex items-center gap-2"><ShieldCheck size={17} className="text-accent" /> Secure checkout</li>
          </ul>
          <p className="mt-4 text-sm text-faint">From {inr(startingPrice(product))}</p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16" aria-label="Related products">
          <h2 className="mb-5 text-2xl font-bold">You might also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </Page>
  );
}
