import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "@/components/shop/SearchResults";
import { Page } from "@/components/ui/States";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default function SearchPage() {
  return (
    <Page>
      <Suspense>
        <SearchResults />
      </Suspense>
    </Page>
  );
}
