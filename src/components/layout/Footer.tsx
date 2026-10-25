import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const GROUPS = [
  { title: "Shop", links: [["Home", "/"], ["For You", "/for-you"], ["Saved items", "/wishlist"], ["Basket", "/cart"]] },
  { title: "Account", links: [["Orders", "/orders"], ["Alerts", "/alerts"], ["Addresses", "/account/addresses"], ["Settings", "/settings"]] },
  { title: "Categories", links: [["Fruits", "/category/Fruits"], ["Vegetables", "/category/Vegetables"], ["Dairy", "/category/Dairy"], ["Bakery", "/category/Bakery"]] },
];

export function Footer() {
  return (
    <footer className="mt-10 hidden border-t border-line bg-card/50 md:block">
      <div className="mx-auto grid max-w-[1200px] grid-cols-4 gap-8 px-6 py-12">
        <div>
          <Logo />
          <p className="mt-3 max-w-[230px] text-sm text-muted">Groceries at your door in about 30 minutes, without the noise.</p>
        </div>
        {GROUPS.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2 className="mb-3 text-sm font-bold">{g.title}</h2>
            <ul className="space-y-2 text-sm text-muted">
              {g.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-ink hover:underline">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line py-5 text-center text-[13px] text-muted">
        Designed &amp; built by Arun C. for VIT Vellore coursework.
      </div>
    </footer>
  );
}

export function MobileFooterNote() {
  return <p className="px-6 pb-28 pt-4 text-center text-[12px] text-faint md:hidden">Designed &amp; built by Arun C. for VIT Vellore coursework.</p>;
}
