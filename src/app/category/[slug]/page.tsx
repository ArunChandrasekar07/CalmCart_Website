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
  return c ? { title: c.name, description: `Shop ${c.name.toLowerCase()} on CalmCart, delivered in about 30 minutes.` } : {};
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
