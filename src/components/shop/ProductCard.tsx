import Link from "next/link";
import { Star } from "lucide-react";
import { AddControl } from "./AddControl";
import { WishlistButton } from "./WishlistButton";
import { bestDeal, discountPct, startingPrice } from "@/lib/pricing";
import { inr, unitLabel } from "@/lib/format";
import { cx, tintClass } from "@/lib/ui";
import type { Product } from "@/lib/types";

const tagStyle: Record<string, string> = {
  "Price drop": "bg-accent text-white",
  "Frequently bought": "bg-primary text-on-primary",
  Seasonal: "bg-[#F4B740] text-[#2a1d00]",
  New: "bg-[#7C5CFF] text-white",
};

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const best = product.variants.find((v) => v.id === bestDeal(product.variants));
  const pct = best ? discountPct(best) : 0;
  const hasVariants = product.variants.length > 0;
  return (
    <article className="group relative flex flex-col">
      <Link href={`/product/${product.id}`} className="block rounded-[18px]" aria-label={`${product.name}, ${unitLabel(product.unit)}`}>
        <div className={cx("tint relative grid aspect-square place-items-center overflow-hidden rounded-[18px]", tintClass(product.category))}>
          <span
            className="text-[4.5rem] leading-none transition-transform duration-300 group-hover:scale-110 md:text-[5.25rem]"
            role="img"
            aria-label={product.name}
            data-priority={priority ? "" : undefined}
          >
            {product.emoji}
          </span>
          {product.tag && (
            <span className={cx("absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-bold", tagStyle[product.tag])}>
              {product.tag}
            </span>
          )}
          {pct > 0 && (
            <span className="absolute bottom-2.5 left-2.5 rounded-full bg-bg/90 px-2 py-0.5 text-[11px] font-bold text-accent">
              Up to {pct}% off
            </span>
          )}
        </div>
      </Link>
      <WishlistButton productId={product.id} name={product.name} className="absolute right-2 top-2" />
      <div className="mt-2.5 flex flex-1 flex-col px-0.5">
        <Link href={`/product/${product.id}`} className="line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-snug hover:underline">
          {product.name}
        </Link>
        <div className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted">
          <span>{unitLabel(product.unit)}</span>
          <span aria-hidden>•</span>
          <Star size={12} className="fill-[#F4B740] text-[#F4B740]" aria-hidden />
          <span>{product.rating.toFixed(1)}</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <p className="text-[15px] font-bold">
            {hasVariants && <span className="mr-1 text-xs font-medium text-muted">from</span>}
            {inr(startingPrice(product))}
          </p>
          <AddControl product={product} size="sm" />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: Product[]; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3.5 gap-y-6 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}
