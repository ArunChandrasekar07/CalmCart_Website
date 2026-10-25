import type { Metadata } from "next";
import { CheckoutView } from "@/components/shop/CheckoutView";
import { Page } from "@/components/ui/States";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };
export default function P() {
  return <Page><CheckoutView /></Page>;
}
