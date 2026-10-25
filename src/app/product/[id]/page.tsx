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
  const description = `${p.name} from ₹${startingPrice(p)}. ${p.description}`;
  return {
    title: p.name,
    description,
    alternates: { canonical: `/product/${p.id}` },
    openGraph: { type: "website", siteName: "CalmCart", url: `/product/${p.id}`, title: `${p.name} · CalmCart`, description, images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "CalmCart" }] },
    twitter: { card: "summary_large_image", title: `${p.name} · CalmCart`, description, images: ["/twitter-image.png"] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = (await getCatalog()).products.find((x) => x.id === id);
  if (!product) notFound();
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    offers: { "@type": "Offer", priceCurrency: "INR", price: startingPrice(product), availability: "https://schema.org/InStock" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ProductView id={product.id} initial={product} />
    </>
  );
}
