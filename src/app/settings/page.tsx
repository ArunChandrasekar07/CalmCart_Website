import type { Metadata } from "next";
import { SettingsView } from "@/components/account/SettingsView";
import { Page } from "@/components/ui/States";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };
export default function P() {
  return <Page><SettingsView /></Page>;
}
