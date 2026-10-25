import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { SEED_CATALOG } from "@/data/catalog.seed";
import { ProductBrowser } from "@/components/shop/SearchResults";
import { Page, PageTitle } from "@/components/ui/States";

export const dynamicParams = true;
export function generateStaticParams() {
  return SEED_CATALOG.categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = (await getCatalog()).categories.find((x) => x.slug === decodeURIComponent(slug));
  if (!c) return {};
  const description = `Shop ${c.name.toLowerCase()} on CalmCart, delivered in about 30 minutes.`;
  return {
    title: c.name,
    description,
    alternates: { canonical: `/category/${encodeURIComponent(c.slug)}` },
    openGraph: { type: "website", siteName: "CalmCart", url: `/category/${encodeURIComponent(c.slug)}`, title: `${c.name} · CalmCart`, description, images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "CalmCart" }] },
    twitter: { card: "summary_large_image", title: `${c.name} · CalmCart`, description, images: ["/twitter-image.png"] },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = (await getCatalog()).categories.find((x) => x.slug === decodeURIComponent(slug));
  if (!c) notFound();
  return (
    <Page>
      <PageTitle sub="Delivered in about 30 minutes">{c.emoji} {c.name}</PageTitle>
      <ProductBrowser category={c.slug} showCategories={false} />
    </Page>
  );
}
