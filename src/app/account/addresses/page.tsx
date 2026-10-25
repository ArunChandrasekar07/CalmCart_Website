import type { Metadata } from "next";
import { AddressesView } from "@/components/account/AddressesView";
import { Page } from "@/components/ui/States";

export const metadata: Metadata = { title: "Addresses", robots: { index: false } };
export default function P() {
  return <Page><AddressesView /></Page>;
}
