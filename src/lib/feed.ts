import type { Product } from "./types";

/** Lower sorts first. Re-orders the catalog; never hides anything. */
export function personalizedRank(p: Product, ordered: Set<string>) {
  if (ordered.has(p.id)) return -1;
  if (p.tag) return 0;
  if (p.confidence === "High Confidence") return 1;
  if (p.confidence === "Good Match") return 2;
  return 3;
}

export function rankFeed(products: Product[], ordered: Set<string>) {
  return [...products].sort((a, b) => personalizedRank(a, ordered) - personalizedRank(b, ordered));
}
