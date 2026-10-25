"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { normalizeCatalog } from "@/lib/catalog";
import { supabase } from "@/lib/supabase";
import type { Catalog, Product } from "@/lib/types";

type CatalogState = Catalog & {
  byId: Map<string, Product>;
  getProduct: (id: string) => Product | undefined;
  search: (query: string, category?: string | "All") => Product[];
};

const CatalogContext = createContext<CatalogState | null>(null);

export function CatalogProvider({ initial, children }: { initial: Catalog; children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog>(initial);

  // Server data can be up to a minute old; pull a fresh copy once the page is live.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb = supabase();
      const [c, p, pr] = await Promise.all([
        sb.from("categories").select("*").order("sort_order"),
        sb.from("products").select("*, product_variants(*)").eq("is_active", true).order("sort_order"),
        sb.from("promo_codes").select("*"),
      ]);
      if (cancelled || c.error || p.error || pr.error || !p.data?.length) return;
      setCatalog(normalizeCatalog({ categories: c.data, products: p.data, promos: pr.data }));
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<CatalogState>(() => {
    const byId = new Map(catalog.products.map((p) => [p.id, p]));
    return {
      ...catalog,
      byId,
      getProduct: (id) => byId.get(id),
      search: (query, category = "All") => {
        const q = query.trim().toLowerCase();
        return catalog.products.filter((p) => {
          const okQuery =
            !q ||
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q);
          return okQuery && (category === "All" || p.category === category);
        });
      },
    };
  }, [catalog]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
