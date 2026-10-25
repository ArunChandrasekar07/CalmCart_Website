import type { Metadata } from "next";
import { SignupForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };
export default function P() {
  return <SignupForm />;
}
