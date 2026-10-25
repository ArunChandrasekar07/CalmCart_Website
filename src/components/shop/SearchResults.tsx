"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "./ProductCard";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageTitle } from "@/components/ui/States";
import { useCatalog } from "@/context/catalog";
import { startingPrice } from "@/lib/pricing";
import { cx } from "@/lib/ui";

type Sort = "relevance" | "price-asc" | "price-desc" | "rating";

export function ProductBrowser({ query = "", category = "All", showCategories = true }: { query?: string; category?: string; showCategories?: boolean }) {
  const { search, categories } = useCatalog();
  const [cat, setCat] = useState(category);
  const [sort, setSort] = useState<Sort>("relevance");
  const [deals, setDeals] = useState(false);

  const results = useMemo(() => {
    let r = search(query, cat);
    if (deals) r = r.filter((p) => p.variants.some((v) => v.mrp && v.mrp > v.price) || p.tag === "Price drop");
    if (sort === "price-asc") r = [...r].sort((a, b) => startingPrice(a) - startingPrice(b));
    if (sort === "price-desc") r = [...r].sort((a, b) => startingPrice(b) - startingPrice(a));
    if (sort === "rating") r = [...r].sort((a, b) => b.rating - a.rating);
    return r;
  }, [search, query, cat, sort, deals]);

  const chip = "h-10 shrink-0 rounded-full px-4 text-[14px] font-medium transition";
  return (
    <>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {showCategories ? (
          <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 py-1 md:mx-0 md:px-0" role="group" aria-label="Categories">
            {["All", ...categories.map((c) => c.name)].map((c) => (
              <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)} className={cx(chip, cat === c ? "bg-primary text-on-primary" : "bg-card text-muted hover:bg-line")}>{c}</button>
            ))}
          </div>
        ) : <span />}
        <div className="flex items-center gap-2.5">
          <button aria-pressed={deals} onClick={() => setDeals((d) => !d)} className={cx(chip, deals ? "bg-accent text-white" : "bg-card text-muted hover:bg-line")}>Deals</button>
          <label className="sr-only" htmlFor="sort">Sort by</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-10 rounded-full bg-card px-4 text-[14px] font-medium outline-none">
            <option value="relevance">Sort: Relevance</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>
      {results.length === 0 ? (
        <EmptyState emoji="🔍" title="No matches" body="Try a different search term or category." action={<Button variant="secondary" onClick={() => { setCat("All"); setDeals(false); }}>Clear filters</Button>} />
      ) : (
        <ProductGrid products={results} />
      )}
    </>
  );
}

export function SearchResults() {
  const q = useSearchParams().get("q") ?? "";
  const { search } = useCatalog();
  const count = search(q).length;
  return (
    <>
      <PageTitle sub={q ? `${count} ${count === 1 ? "result" : "results"}` : "Browse the full range"}>
        {q ? `Results for “${q}”` : "All products"}
      </PageTitle>
      <ProductBrowser key={q} query={q} />
    </>
  );
}
