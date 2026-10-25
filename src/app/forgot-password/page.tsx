import type { Metadata } from "next";
import { ForgotForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };
export default function P() {
  return <ForgotForm />;
}
