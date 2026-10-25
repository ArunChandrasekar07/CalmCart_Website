import Link from "next/link";
import { Clock, Leaf, ShieldCheck } from "lucide-react";
import type { Category, PromoCode } from "@/lib/types";
import { categoryHref, cx, tintClass } from "@/lib/ui";

export function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <section aria-label="Shop by category">
      <h2 className="mb-4 text-xl font-bold md:text-2xl">Shop by category</h2>
      <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-8 md:overflow-visible md:px-0">
        {categories.map((c) => (
          <li key={c.slug} className="shrink-0">
            <Link href={categoryHref(c.slug)} className="group flex w-[88px] flex-col items-center gap-2 md:w-auto">
              <span className={cx("tint grid size-[84px] place-items-center rounded-[22px] text-4xl transition group-hover:scale-105 md:size-full md:aspect-square md:text-5xl", tintClass(c.slug))}>
                {c.emoji}
              </span>
              <span className="text-[13px] font-semibold">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function OfferStrip({ promos }: { promos: PromoCode[] }) {
  return (
    <section aria-label="Offers">
      <h2 className="mb-4 text-xl font-bold md:text-2xl">Offers for your basket</h2>
      <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
        {promos.map((p) => (
          <li key={p.code} className="w-[250px] shrink-0 rounded-[18px] border border-dashed border-accent/60 bg-accent-soft p-4 md:w-auto">
            <p className="font-display text-lg font-bold">{p.title}</p>
            <p className="mt-1 min-h-[2.6rem] text-sm text-muted">{p.description}</p>
            <p className="mt-3 inline-block rounded-lg bg-bg px-2.5 py-1 text-[13px] font-bold tracking-wide text-accent">{p.code}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const WHY = [
  { icon: Clock, title: "Fast Delivery", body: "Under 30 minutes from the store near you to your door." },
  { icon: Leaf, title: "Fresh Products", body: "Sourced locally and packed the same day." },
  { icon: ShieldCheck, title: "Secure Payments", body: "Your details are always protected." },
];

export function WhyCalmCart() {
  return (
    <section aria-label="Why CalmCart" className="rounded-[26px] bg-accent-soft px-5 py-8 md:px-10 md:py-12">
      <h2 className="text-2xl font-bold md:text-3xl">Why CalmCart?</h2>
      <ul className="mt-6 grid gap-5 md:grid-cols-3">
        {WHY.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-bg text-accent"><Icon size={22} /></span>
            <div>
              <h3 className="font-bold">{title}</h3>
              <p className="mt-0.5 text-[15px] text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
