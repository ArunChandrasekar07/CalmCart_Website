import type { MetadataRoute } from "next";
import { SEED_CATALOG } from "@/data/catalog.seed";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base },
    { url: `${base}/for-you` },
    ...SEED_CATALOG.categories.map((c) => ({ url: `${base}/category/${encodeURIComponent(c.slug)}` })),
    ...SEED_CATALOG.products.map((p) => ({ url: `${base}/product/${p.id}` })),
  ];
}
