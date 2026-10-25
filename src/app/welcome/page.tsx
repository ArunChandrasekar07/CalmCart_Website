import type { Metadata } from "next";
import { Welcome } from "@/components/account/Welcome";

export const metadata: Metadata = { title: "Welcome", robots: { index: false } };
export default function P() {
  return <Welcome />;
}
