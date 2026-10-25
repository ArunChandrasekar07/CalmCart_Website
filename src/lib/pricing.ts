import type { CartLine, Product, ProductVariant, PromoCode, Quote } from "./types";

// These mirror public.quote_cart() in the database. The database is the source
// of truth at checkout; this copy only powers instant totals while browsing.
export const DELIVERY_FEE = 20;
export const AUTO_DISCOUNT = 15;
export const AUTO_DISCOUNT_ABOVE = 200;

export function findVariant(product: Product, variantId: string | null): ProductVariant | undefined {
  return variantId ? product.variants.find((v) => v.id === variantId) : undefined;
}

export function unitPrice(product: Product, variantId: string | null) {
  return findVariant(product, variantId)?.price ?? product.price;
}

export function startingPrice(product: Product) {
  return product.variants.length ? Math.min(...product.variants.map((v) => v.price)) : product.price;
}

export function discountPct(v: Pick<ProductVariant, "price" | "mrp">) {
  return v.mrp ? Math.round((1 - v.price / v.mrp) * 100) : 0;
}

/** The pack with the steepest discount — the one worth calling out. */
export function bestDeal(variants: ProductVariant[]): string | undefined {
  let bestId: string | undefined;
  let best = 0;
  for (const v of variants) {
    if (!v.mrp) continue;
    const pct = 1 - v.price / v.mrp;
    if (pct > best) {
      best = pct;
      bestId = v.id;
    }
  }
  return bestId;
}

export function evaluatePromo(
  code: string | null,
  promos: PromoCode[],
  subtotal: number,
  hasPriorOrders: boolean
): { promo: PromoCode | null; error: string | null } {
  const c = code?.trim().toUpperCase();
  if (!c) return { promo: null, error: null };
  const promo = promos.find((p) => p.code === c);
  if (!promo) return { promo: null, error: "This code isn't valid." };
  if (subtotal < promo.min_subtotal) {
    return { promo: null, error: `Add ₹${promo.min_subtotal - subtotal} more to use ${promo.code}.` };
  }
  if (promo.first_order_only && hasPriorOrders) {
    return { promo: null, error: "This code is only for your first order." };
  }
  return { promo, error: null };
}

export function computeQuote(
  lines: CartLine[],
  products: Map<string, Product>,
  promoCode: string | null,
  promos: PromoCode[],
  hasPriorOrders: boolean
): Quote {
  let subtotal = 0;
  let itemCount = 0;
  for (const l of lines) {
    const p = products.get(l.productId);
    if (!p) continue;
    subtotal += unitPrice(p, l.variantId) * l.qty;
    itemCount += l.qty;
  }
  let deliveryFee = itemCount > 0 ? DELIVERY_FEE : 0;
  const autoDiscount = subtotal > AUTO_DISCOUNT_ABOVE ? AUTO_DISCOUNT : 0;
  const { promo, error } = evaluatePromo(promoCode, promos, subtotal, hasPriorOrders);
  let promoDiscount = 0;
  if (promo) {
    if (promo.kind === "percent") {
      promoDiscount = Math.min(promo.max_discount ?? Infinity, Math.floor((subtotal * promo.value) / 100));
    } else if (promo.kind === "flat") {
      promoDiscount = Math.min(promo.value, subtotal);
    } else {
      deliveryFee = 0;
    }
  }
  return {
    itemCount,
    subtotal,
    deliveryFee,
    autoDiscount,
    promoDiscount,
    promoCode: promo?.code ?? null,
    promoError: error,
    total: Math.max(0, subtotal + deliveryFee - autoDiscount - promoDiscount),
  };
}
