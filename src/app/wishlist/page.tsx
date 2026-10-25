import type { Metadata } from "next";
import { WishlistView } from "@/components/account/WishlistView";
import { Page } from "@/components/ui/States";

export const metadata: Metadata = { title: "Saved items", robots: { index: false } };
export default function P() {
  return <Page><WishlistView /></Page>;
}
