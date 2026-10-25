"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBasket } from "lucide-react";
import { useCart } from "@/context/cart";
import { inr } from "@/lib/format";

/** Floating basket summary on phones, above the tab bar. */
export function CartBar() {
  const { quote } = useCart();
  const path = usePathname();
  if (quote.itemCount === 0 || path.startsWith("/cart") || path.startsWith("/checkout") || path.startsWith("/login") || path.startsWith("/signup")) return null;
  return (
    <Link
      href="/cart"
      className="pop fixed inset-x-4 bottom-[calc(76px+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-lg items-center justify-between rounded-full bg-accent px-5 py-3.5 text-white shadow-lift md:hidden"
    >
      <span className="flex items-center gap-2 text-sm font-bold">
        <ShoppingBasket size={19} /> {quote.itemCount} {quote.itemCount === 1 ? "item" : "items"} · {inr(quote.subtotal)}
      </span>
      <span className="text-sm font-bold">View basket</span>
    </Link>
  );
}
