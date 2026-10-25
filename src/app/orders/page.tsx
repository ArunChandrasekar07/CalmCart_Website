import type { Metadata } from "next";
import { OrdersList } from "@/components/account/Orders";
import { Page } from "@/components/ui/States";

export const metadata: Metadata = { title: "Your orders", robots: { index: false } };
export default function P() {
  return <Page><OrdersList /></Page>;
}
