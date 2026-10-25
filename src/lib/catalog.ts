import { SEED_CATALOG } from "@/data/catalog.seed";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";
import type { Catalog, Product, ProductVariant } from "./types";

type RawVariant = ProductVariant & { sort_order: number };
type RawProduct = Omit<Product, "variants"> & { product_variants?: RawVariant[] };

/** Shared by the server fetch and the browser refresh so both shape rows identically. */
export function normalizeCatalog(raw: {
  categories: Catalog["categories"];
  products: RawProduct[];
  promos: Catalog["promos"];
}): Catalog {
  return {
    categories: [...raw.categories].sort((a, b) => a.sort_order - b.sort_order),
    products: raw.products
      .map((p) => {
        const { product_variants, ...rest } = p;
        return {
          ...rest,
          variants: [...(product_variants ?? [])]
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((v) => ({ id: v.id, label: v.label, price: v.price, mrp: v.mrp })),
        };
      })
      .sort((a, b) => a.sort_order - b.sort_order),
    promos: raw.promos,
  };
}

async function rest<T>(path: string): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`Catalog request failed (${res.status})`);
  return res.json() as Promise<T>;
}

/** Server-side catalog read (revalidated every minute). Falls back to the bundled copy. */
export async function getCatalog(): Promise<Catalog> {
  try {
    const [categories, products, promos] = await Promise.all([
      rest<Catalog["categories"]>("categories?select=*&order=sort_order"),
      rest<RawProduct[]>("products?select=*,product_variants(*)&is_active=eq.true&order=sort_order"),
      rest<Catalog["promos"]>("promo_codes?select=*"),
    ]);
    if (!products.length) return SEED_CATALOG;
    return normalizeCatalog({ categories, products, promos });
  } catch {
    return SEED_CATALOG;
  }
}
