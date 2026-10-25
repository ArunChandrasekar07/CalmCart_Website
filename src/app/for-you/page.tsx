import type { Metadata } from "next";
import { ForYou } from "@/components/shop/ForYou";
import { Page } from "@/components/ui/States";

export const metadata: Metadata = { title: "For You" };
export default function Page_() {
  return <Page><ForYou /></Page>;
}
