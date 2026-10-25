import type { Metadata } from "next";
import { ResetForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "New password", robots: { index: false } };
export default function P() {
  return <ResetForm />;
}
