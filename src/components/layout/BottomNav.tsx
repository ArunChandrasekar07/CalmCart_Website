"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, Settings, ShoppingBasket, Sparkles } from "lucide-react";
import { useCart } from "@/context/cart";
import { useNotifications } from "@/context/notifications";
import { cx } from "@/lib/ui";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/for-you", label: "For You", icon: Sparkles },
  { href: "/cart", label: "Cart", icon: ShoppingBasket },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const path = usePathname();
  const { quote } = useCart();
  const { unread } = useNotifications();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          const badge = href === "/cart" ? quote.itemCount : href === "/alerts" ? unread : 0;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx("relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold", active ? "text-ink" : "text-faint")}
              >
                <span className="relative">
                  <Icon size={22} strokeWidth={active ? 2.4 : 1.9} />
                  {badge > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold leading-[18px] text-white">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </span>
                {label}
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-ink" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
