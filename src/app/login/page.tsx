import type { Metadata } from "next";
import { LoginForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };
export default function P() {
  return <LoginForm />;
}
