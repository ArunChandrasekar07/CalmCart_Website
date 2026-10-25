import type { Metadata } from "next";
import { CartView } from "@/components/shop/CartView";
import { Page } from "@/components/ui/States";

export const metadata: Metadata = { title: "Your basket", robots: { index: false } };
export default function CartPage() {
  return <Page><CartView /></Page>;
}
