"use client";

import { useCart } from "@/context/cart";
import { useCatalog } from "@/context/catalog";
import { useSettings } from "@/context/settings";
import { useToast } from "@/context/toast";

// The basket is drawn from the CalmCart mark; these pantry staples drop into it once.
const ITEMS = [
  { id: "apples", fallback: "🍎", x: 64, r: -10 },
  { id: "oat-milk", fallback: "🥛", x: 118, r: 8 },
  { id: "bread", fallback: "🍞", x: 172, r: -6 },
  { id: "bananas", fallback: "🍌", x: 226, r: 12 },
];

export function HeroBasket() {
  const { products, getProduct } = useCatalog();
  const cart = useCart();
  const toast = useToast();
  const { tap } = useSettings();

  const picks = ITEMS.map((it, i) => {
    const p = getProduct(it.id) ?? products[i];
    return { ...it, product: p };
  }).filter((x) => x.product);

  return (
    <div className="relative mx-auto aspect-[1.1] w-full max-w-[380px] select-none" aria-label="A basket filling with groceries. Tap an item to add it.">
      <svg viewBox="0 0 300 270" className="absolute inset-0 size-full" aria-hidden>
        <path d="M70 122 L110 52 M230 122 L190 52" stroke="var(--primary)" strokeWidth="14" strokeLinecap="round" fill="none" />
        <ellipse cx="150" cy="252" rx="108" ry="10" fill="currentColor" className="text-ink/10" />
      </svg>
      {picks.map((it, i) => (
        <button
          key={it.id}
          style={{ ["--i" as string]: i, left: `${(it.x / 300) * 100}%`, top: "35%", rotate: `${it.r}deg` }}
          className="hero-item absolute z-10 -translate-x-1/2 text-[3.4rem] leading-none drop-shadow-sm"
          onClick={() => {
            tap();
            const p = it.product!;
            cart.add(p.id, p.variants[0]?.id ?? null);
            toast.success(`${p.name} added to your basket.`, { label: "View basket", href: "/cart" });
          }}
          aria-label={`Add ${it.product!.name} to basket`}
        >
          {it.product!.emoji}
        </button>
      ))}
      <svg viewBox="0 0 300 270" className="absolute inset-0 z-20 size-full pointer-events-none" aria-hidden>
        <path d="M44 118h212l-24 112a24 24 0 0 1-23.4 19H91.4A24 24 0 0 1 68 230z" fill="var(--primary)" />
        <path d="M104 150v70M150 150v70M196 150v70" stroke="var(--bg)" strokeWidth="9" strokeLinecap="round" opacity=".9" />
      </svg>
    </div>
  );
}
