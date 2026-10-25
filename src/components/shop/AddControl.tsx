"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Stepper } from "@/components/ui/Stepper";
import { VariantPicker } from "./VariantPicker";
import { useCart } from "@/context/cart";
import { useSettings } from "@/context/settings";
import type { Product } from "@/lib/types";

/** Add-to-basket control that handles both single-pack and multi-pack products. */
export function AddControl({ product, size = "md" }: { product: Product; size?: "sm" | "md" }) {
  const cart = useCart();
  const { tap } = useSettings();
  const [open, setOpen] = useState(false);

  if (product.variants.length === 0) {
    return (
      <Stepper
        qty={cart.qtyOf(product.id, null)}
        label={product.name}
        size={size}
        onAdd={() => {
          tap();
          cart.add(product.id, null);
        }}
        onRemove={() => {
          tap();
          cart.remove(product.id, null);
        }}
      />
    );
  }

  const count = cart.qtyOfProduct(product.id);
  return (
    <>
      <button
        onClick={() => {
          tap();
          setOpen(true);
        }}
        aria-label={count ? `${product.name}: ${count} in basket, change packs` : `Choose a pack of ${product.name}`}
        className={`${size === "sm" ? "h-9" : "h-10"} inline-flex min-w-[84px] items-center justify-center gap-1 rounded-full px-4 text-[13px] font-bold transition active:scale-95 ${
          count ? "bg-accent text-white" : "bg-primary text-on-primary hover:opacity-90"
        }`}
      >
        {count ? `${count} ADDED` : (<><Plus size={14} strokeWidth={3} aria-hidden /> ADD</>)}
      </button>
      <VariantPicker product={product} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
