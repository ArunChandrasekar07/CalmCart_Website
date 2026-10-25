"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./auth";
import { useToast } from "./toast";
import { friendlyError, supabase } from "@/lib/supabase";

const KEY = "calmcart/wishlist";

type WishlistState = {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
};

const WishlistContext = createContext<WishlistState | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const toast = useToast();
  const [ids, setIds] = useState<string[]>([]);
  const uid = user?.id ?? null;

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    (async () => {
      let local: string[] = [];
      try {
        local = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      } catch {}
      if (!uid) {
        setIds(Array.isArray(local) ? local : []);
        return;
      }
      if (local.length) {
        await supabase()
          .from("wishlist_items")
          .upsert(local.map((product_id) => ({ user_id: uid, product_id })), { onConflict: "user_id,product_id", ignoreDuplicates: true });
        try {
          localStorage.removeItem(KEY);
        } catch {}
      }
      const { data } = await supabase().from("wishlist_items").select("product_id").order("created_at", { ascending: false });
      if (!cancelled && data) setIds(data.map((r) => r.product_id));
    })();
    return () => {
      cancelled = true;
    };
  }, [uid, loading]);

  const toggle = useCallback(
    (id: string) => {
      const saved = ids.includes(id);
      const next = saved ? ids.filter((x) => x !== id) : [id, ...ids];
      setIds(next);
      if (!uid) {
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {}
        return;
      }
      const sb = supabase();
      const op = saved
        ? sb.from("wishlist_items").delete().eq("user_id", uid).eq("product_id", id)
        : sb.from("wishlist_items").insert({ user_id: uid, product_id: id });
      op.then(({ error }) => {
        if (error) {
          setIds(ids);
          toast.error(friendlyError(error, "Couldn't update your saved items."));
        }
      });
    },
    [ids, uid, toast]
  );

  const value = useMemo(() => ({ ids, has: (id: string) => ids.includes(id), toggle }), [ids, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
