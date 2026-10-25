import type { Metadata } from "next";
import { AlertsView } from "@/components/account/Alerts";
import { Page } from "@/components/ui/States";

export const metadata: Metadata = { title: "Alerts", robots: { index: false } };
export default function P() {
  return <Page><AlertsView /></Page>;
}
