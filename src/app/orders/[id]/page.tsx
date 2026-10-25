import type { Metadata } from "next";
import { OrderDetail } from "@/components/account/Orders";
import { Page } from "@/components/ui/States";

export const metadata: Metadata = { title: "Order", robots: { index: false } };
export default async function P({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Page><OrderDetail id={id} /></Page>;
}
