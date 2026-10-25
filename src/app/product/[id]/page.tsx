import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { SEED_CATALOG } from "@/data/catalog.seed";
import { ProductView } from "@/components/shop/ProductView";
import { startingPrice } from "@/lib/pricing";

export function generateStaticParams() {
  return SEED_CATALOG.products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = (await getCatalog()).products.find((x) => x.id === id);
  if (!p) return {};
  return { title: p.name, description: `${p.name} from ₹${startingPrice(p)}. ${p.description}` };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = (await getCatalog()).products.find((x) => x.id === id);
  if (!product) notFound();
  return <ProductView id={product.id} initial={product} />;
}
