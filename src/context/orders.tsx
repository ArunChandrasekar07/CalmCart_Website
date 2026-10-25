"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./auth";
import { useCart } from "./cart";
import { useToast } from "./toast";
import { friendlyError, supabase } from "@/lib/supabase";
import type { Order, PaymentMethod } from "@/lib/types";

type PlaceArgs = { addressId: string; payment: PaymentMethod; promo: string | null; note: string };

type OrdersState = {
  orders: Order[];
  loading: boolean;
  place: (args: PlaceArgs) => Promise<{ error?: string; orderId?: string }>;
  cancel: (orderId: string) => Promise<{ error?: string }>;
  reload: () => Promise<void>;
};

const OrdersContext = createContext<OrdersState | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { refresh, setHasPriorOrders } = useCart();
  const toast = useToast();
  const uid = user?.id ?? null;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!uid) return;
    const { data } = await supabase()
      .from("orders")
      .select("*, order_items(*)")
      .order("placed_at", { ascending: false })
      .limit(100);
    setOrders((data ?? []) as Order[]);
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setOrders([]);
      return;
    }
    setLoading(true);
    reload().finally(() => setLoading(false));
    // Delivery progress is pushed from the database, so tracking updates live.
    const channel = supabase()
      .channel(`orders:${uid}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${uid}` }, () => {
        void reload();
      })
      .subscribe();
    // Safety net if the socket is blocked: poll while an order is in flight.
    return () => {
      void supabase().removeChannel(channel);
    };
  }, [uid, reload]);

  const active = orders.some((o) => o.status !== "delivered" && o.status !== "cancelled");
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => void reload(), 30000);
    return () => window.clearInterval(t);
  }, [active, reload]);

  useEffect(() => {
    setHasPriorOrders(orders.some((o) => o.status !== "cancelled"));
  }, [orders, setHasPriorOrders]);

  const place = useCallback<OrdersState["place"]>(
    async ({ addressId, payment, promo, note }) => {
      const { data, error } = await supabase().rpc("place_order", {
        p_address_id: addressId,
        p_payment: payment,
        p_promo: promo,
        p_note: note.trim() || null,
      });
      if (error) return { error: friendlyError(error, "We couldn't place your order. Your basket is unchanged.") };
      await Promise.all([refresh(), reload()]);
      return { orderId: data as string };
    },
    [refresh, reload]
  );

  const cancel = useCallback<OrdersState["cancel"]>(
    async (orderId) => {
      const { error } = await supabase().rpc("cancel_order", { p_order_id: orderId });
      if (error) return { error: friendlyError(error, "This order can't be cancelled anymore.") };
      await reload();
      toast.success("Order cancelled.");
      return {};
    },
    [reload, toast]
  );

  const value = useMemo(() => ({ orders, loading, place, cancel, reload }), [orders, loading, place, cancel, reload]);
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
