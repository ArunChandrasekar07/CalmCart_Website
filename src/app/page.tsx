import { Clock } from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { HeroBasket } from "@/components/shop/HeroBasket";
import { HomeFeed } from "@/components/shop/HomeFeed";
import { CategoryTiles, OfferStrip, WhyCalmCart } from "@/components/shop/Sections";
import { ButtonLink } from "@/components/ui/Button";
import { MobileFooterNote } from "@/components/layout/Footer";

export default async function Home() {
  const { categories, promos } = await getCatalog();
  return (
    <>
      <main className="mx-auto w-full max-w-[1200px] space-y-12 px-4 pt-4 md:space-y-16 md:px-6 md:pt-8">
        <section className="grid grid-cols-1 items-center gap-6 overflow-hidden rounded-[28px] bg-accent-soft px-6 py-8 md:grid-cols-[1.1fr_1fr] md:px-12 md:py-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-bg px-3.5 py-1.5 text-[13px] font-semibold text-accent">
              <Clock size={15} aria-hidden /> Delivery in about 30 min
            </p>
            <h1 className="mt-4 text-[2.4rem] font-bold leading-[1.02] md:text-6xl">Groceries at your door before the kettle cools.</h1>
            <p className="mt-4 max-w-md text-[17px] text-muted">
              Fresh fruit, dairy, bakery and pantry staples from a store near you. A calm way to shop, with no clutter and no surprises at checkout.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="#shop">Start shopping</ButtonLink>
              <ButtonLink href="/for-you" variant="secondary" className="bg-bg hover:bg-card">See picks for you</ButtonLink>
            </div>
          </div>
          <HeroBasket />
        </section>

        <CategoryTiles categories={categories} />
        <HomeFeed />
        <OfferStrip promos={promos} />
        <WhyCalmCart />
      </main>
      <MobileFooterNote />
    </>
  );
}
