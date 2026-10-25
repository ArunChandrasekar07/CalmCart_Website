"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "./auth";
import { useCatalog } from "./catalog";
import { useToast } from "./toast";
import { friendlyError, supabase } from "@/lib/supabase";
import { computeQuote } from "@/lib/pricing";
import type { CartLine, Quote } from "@/lib/types";

const CART_KEY = "calmcart/cart";
const PROMO_KEY = "calmcart/promo";
const MAX_QTY = 50;

type CartState = {
  lines: CartLine[];
  quote: Quote;
  promoCode: string | null;
  ready: boolean;
  qtyOf: (productId: string, variantId?: string | null) => number;
  qtyOfProduct: (productId: string) => number;
  setQty: (productId: string, variantId: string | null, qty: number) => void;
  add: (productId: string, variantId?: string | null) => void;
  remove: (productId: string, variantId?: string | null) => void;
  clear: () => void;
  applyPromo: (code: string) => { ok: boolean; error?: string };
  clearPromo: () => void;
  /** Re-read the cart from the database (e.g. after placing an order). */
  refresh: () => Promise<void>;
  hasPriorOrders: boolean;
  setHasPriorOrders: (v: boolean) => void;
};

const CartContext = createContext<CartState | null>(null);

const keyOf = (productId: string, variantId: string | null) => `${productId}::${variantId ?? ""}`;

function readLocal(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    return Array.isArray(raw)
      ? raw.filter((l) => l && typeof l.productId === "string" && Number.isInteger(l.qty) && l.qty > 0)
      : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { byId, promos } = useCatalog();
  const toast = useToast();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [hasPriorOrders, setHasPriorOrders] = useState(false);
  const userId = user?.id ?? null;
  const syncedFor = useRef<string | null | undefined>(undefined);
  const writeQueue = useRef<Promise<unknown>>(Promise.resolve());

  const loadServerCart = useCallback(async () => {
    const { data, error } = await supabase().from("cart_items").select("product_id, variant_id, qty").order("created_at");
    if (error) return;
    setLines((data ?? []).map((r) => ({ productId: r.product_id, variantId: r.variant_id, qty: r.qty })));
  }, []);

  // Establish the cart once we know who is browsing: guests use this device,
  // signed-in people use their account (merging any guest items first).
  useEffect(() => {
    if (loading || syncedFor.current === userId) return;
    syncedFor.current = userId;
    try {
      setPromoCode(localStorage.getItem(PROMO_KEY));
    } catch {}
    (async () => {
      if (!userId) {
        setLines(readLocal());
        setReady(true);
        return;
      }
      const guest = readLocal();
      if (guest.length) {
        const { error } = await supabase().rpc("cart_merge", { p_lines: guest });
        if (!error) {
          try {
            localStorage.removeItem(CART_KEY);
          } catch {}
          toast.info("Your basket was saved to your account.");
        }
      }
      await loadServerCart();
      setReady(true);
    })();
  }, [loading, userId, loadServerCart, toast]);

  useEffect(() => {
    if (!ready || userId) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready, userId]);

  useEffect(() => {
    try {
      if (promoCode) localStorage.setItem(PROMO_KEY, promoCode);
      else localStorage.removeItem(PROMO_KEY);
    } catch {}
  }, [promoCode]);

  const pushServer = useCallback(
    (productId: string, variantId: string | null, qty: number) => {
      // Serialise writes so rapid taps land in order.
      writeQueue.current = writeQueue.current.then(async () => {
        const { error } = await supabase().rpc("cart_set", {
          p_product_id: productId,
          p_variant_id: variantId,
          p_qty: qty,
        });
        if (error) {
          toast.error(friendlyError(error, "Couldn't update your basket."));
          await loadServerCart();
        }
      });
    },
    [loadServerCart, toast]
  );

  const setQty = useCallback<CartState["setQty"]>(
    (productId, variantId, qty) => {
      const q = Math.max(0, Math.min(MAX_QTY, Math.floor(qty)));
      setLines((cur) => updateLine(cur, productId, variantId, q));
      if (userId) pushServer(productId, variantId, q);
    },
    [userId, pushServer]
  );

  const qtyOf = useCallback(
    (productId: string, variantId: string | null = null) =>
      lines.find((l) => l.productId === productId && l.variantId === variantId)?.qty ?? 0,
    [lines]
  );
  const qtyOfProduct = useCallback(
    (productId: string) => lines.filter((l) => l.productId === productId).reduce((n, l) => n + l.qty, 0),
    [lines]
  );
  const add = useCallback<CartState["add"]>(
    (productId, variantId = null) => setQty(productId, variantId, qtyOf(productId, variantId) + 1),
    [setQty, qtyOf]
  );
  const remove = useCallback<CartState["remove"]>(
    (productId, variantId = null) => setQty(productId, variantId, qtyOf(productId, variantId) - 1),
    [setQty, qtyOf]
  );
  const clear = useCallback(() => {
    for (const l of lines) if (userId) pushServer(l.productId, l.variantId, 0);
    setLines([]);
    setPromoCode(null);
  }, [lines, userId, pushServer]);

  const quote = useMemo(
    () => computeQuote(lines, byId, promoCode, promos, hasPriorOrders),
    [lines, byId, promoCode, promos, hasPriorOrders]
  );

  const applyPromo = useCallback<CartState["applyPromo"]>(
    (code) => {
      const c = code.trim().toUpperCase();
      if (!c) return { ok: false, error: "Enter a code." };
      const test = computeQuote(lines, byId, c, promos, hasPriorOrders);
      if (test.promoError) return { ok: false, error: test.promoError };
      setPromoCode(c);
      return { ok: true };
    },
    [lines, byId, promos, hasPriorOrders]
  );

  const value = useMemo<CartState>(
    () => ({
      lines,
      quote,
      promoCode,
      ready,
      qtyOf,
      qtyOfProduct,
      setQty,
      add,
      remove,
      clear,
      applyPromo,
      clearPromo: () => setPromoCode(null),
      refresh: loadServerCart,
      hasPriorOrders,
      setHasPriorOrders,
    }),
    [lines, quote, promoCode, ready, qtyOf, qtyOfProduct, setQty, add, remove, clear, applyPromo, loadServerCart, hasPriorOrders]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Replace (or append) one line while keeping the basket's order stable. */
function updateLine(cur: CartLine[], productId: string, variantId: string | null, qty: number): CartLine[] {
  const k = keyOf(productId, variantId);
  const idx = cur.findIndex((l) => keyOf(l.productId, l.variantId) === k);
  if (idx === -1) return [...cur, { productId, variantId, qty }];
  if (qty === 0) return cur.filter((_, i) => i !== idx);
  return cur.map((l, i) => (i === idx ? { ...l, qty } : l));
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
