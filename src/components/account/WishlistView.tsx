"use client";

import { ProductGrid } from "@/components/shop/ProductCard";
import { EmptyState, PageTitle } from "@/components/ui/States";
import { useCatalog } from "@/context/catalog";
import { useWishlist } from "@/context/wishlist";

export function WishlistView() {
  const { ids } = useWishlist();
  const { getProduct } = useCatalog();
  const products = ids.map((id) => getProduct(id)).filter((p): p is NonNullable<typeof p> => !!p);
  return (
    <>
      <PageTitle sub="Things you want to buy again">Saved items</PageTitle>
      {products.length === 0 ? (
        <EmptyState emoji="🤍" title="Nothing saved yet" body="Tap the heart on any product to keep it here." action={{ href: "/", label: "Browse groceries" }} />
      ) : (
        <ProductGrid products={products} />
      )}
    </>
  );
}
