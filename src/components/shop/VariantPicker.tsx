"use client";

import { Modal } from "@/components/ui/Modal";
import { Stepper } from "@/components/ui/Stepper";
import { useCart } from "@/context/cart";
import { useSettings } from "@/context/settings";
import { bestDeal, discountPct } from "@/lib/pricing";
import { inr, unitLabel } from "@/lib/format";
import { tintClass, cx } from "@/lib/ui";
import type { Product } from "@/lib/types";

export function VariantList({ product }: { product: Product }) {
  const cart = useCart();
  const { tap } = useSettings();
  const best = bestDeal(product.variants);
  return (
    <ul className="divide-y divide-line">
      {product.variants.map((v) => {
        const pct = discountPct(v);
        const qty = cart.qtyOf(product.id, v.id);
        return (
          <li key={v.id} className="flex items-center gap-3 py-3.5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-semibold">{v.label}</span>
                {best === v.id && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">BEST VALUE</span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-sm">
                <span className="font-bold">{inr(v.price)}</span>
                {v.mrp && v.mrp > v.price && (
                  <>
                    <span className="text-faint line-through">{inr(v.mrp)}</span>
                    <span className="font-semibold text-accent">{pct}% OFF</span>
                  </>
                )}
              </div>
            </div>
            <Stepper
              qty={qty}
              label={`${product.name} ${v.label}`}
              size="sm"
              onAdd={() => {
                tap();
                cart.add(product.id, v.id);
              }}
              onRemove={() => {
                tap();
                cart.remove(product.id, v.id);
              }}
            />
          </li>
        );
      })}
    </ul>
  );
}

export function VariantPicker({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const cart = useCart();
  const count = cart.qtyOfProduct(product.id);
  return (
    <Modal open={open} onClose={onClose} title="Select a pack size">
      <div className="px-5 pb-2 pt-4">
        <div className="flex items-center gap-3">
          <div className={cx("tint grid size-14 place-items-center rounded-2xl text-3xl", tintClass(product.category))}>
            {product.emoji}
          </div>
          <div>
            <p className="font-bold">{product.name}</p>
            <p className="text-sm text-muted">{unitLabel(product.unit)}</p>
          </div>
        </div>
        <VariantList product={product} />
      </div>
      <div className="sticky bottom-0 border-t border-line bg-bg p-4">
        <button
          onClick={onClose}
          className="h-12 w-full rounded-full bg-primary text-[15px] font-semibold text-on-primary"
        >
          {count > 0 ? `Done · ${count} in basket` : "Close"}
        </button>
      </div>
    </Modal>
  );
}
