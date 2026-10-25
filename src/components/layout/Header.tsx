"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Heart, LogOut, MapPin, Package, Settings, ShoppingBasket, User } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Modal } from "@/components/ui/Modal";
import { SearchBox } from "./SearchBox";
import { useAuth, displayName, initials } from "@/context/auth";
import { useCart } from "@/context/cart";
import { useNotifications } from "@/context/notifications";
import { useAddresses } from "@/context/addresses";
import { useWishlist } from "@/context/wishlist";
import { inr } from "@/lib/format";
import { cx } from "@/lib/ui";

function SearchSlot({ className }: { className?: string }) {
  const params = useSearchParams();
  const path = usePathname();
  return <SearchBox className={className} initial={path === "/search" ? (params.get("q") ?? "") : ""} />;
}

function AddressPicker() {
  const { user } = useAuth();
  const { addresses, current, select } = useAddresses();
  const [open, setOpen] = useState(false);
  const label = current ? `${current.label} · ${current.line1}` : user ? "Add delivery address" : "Sign in to set address";
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden max-w-[260px] items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-left hover:bg-card lg:flex"
        aria-label="Change delivery address"
      >
        <span className="grid size-9 place-items-center rounded-full bg-accent-soft text-accent"><MapPin size={18} /></span>
        <span className="min-w-0">
          <span className="block text-[12px] font-semibold leading-tight text-accent">Delivery in about 30 min</span>
          <span className="flex items-center gap-1 text-[13px] font-medium leading-tight">
            <span className="truncate">{label}</span> <ChevronDown size={14} className="shrink-0" />
          </span>
        </span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Deliver to">
        <div className="space-y-2 p-4">
          {!user && (
            <div className="rounded-2xl bg-card p-4 text-sm">
              <p className="font-semibold">Sign in to save addresses</p>
              <Link href="/login?next=/account/addresses" onClick={() => setOpen(false)} className="mt-2 inline-block font-semibold text-accent underline">Sign in</Link>
            </div>
          )}
          {addresses.map((a) => (
            <button
              key={a.id}
              onClick={() => { select(a.id); setOpen(false); }}
              className={cx("w-full rounded-2xl border p-4 text-left transition hover:bg-card", current?.id === a.id ? "border-accent bg-accent-soft" : "border-line")}
            >
              <span className="font-semibold">{a.label}</span>
              <span className="mt-0.5 block text-sm text-muted">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city} {a.pincode}</span>
            </button>
          ))}
          {user && (
            <Link href="/account/addresses" onClick={() => setOpen(false)} className="block rounded-2xl border border-dashed border-line p-4 text-center text-sm font-semibold hover:bg-card">
              + Manage addresses
            </Link>
          )}
        </div>
      </Modal>
    </>
  );
}

function AccountMenu() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!user)
    return (
      <Link href="/login" className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold hover:bg-card">
        <User size={18} /> <span className="hidden sm:inline">Sign in</span>
      </Link>
    );
  const name = displayName(user, profile);
  const item = "flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-card";
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu" className="grid size-11 place-items-center rounded-full bg-card text-sm font-bold hover:bg-line">
        {initials(name)}
      </button>
      {open && (
        <div role="menu" className="fade absolute right-0 top-13 z-50 w-60 overflow-hidden rounded-2xl border border-line bg-bg py-2 shadow-lift" onClick={() => setOpen(false)}>
          <div className="border-b border-line px-4 pb-2.5 pt-1">
            <p className="truncate font-semibold">{name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <Link role="menuitem" href="/orders" className={item}><Package size={17} /> Your orders</Link>
          <Link role="menuitem" href="/wishlist" className={item}><Heart size={17} /> Saved items</Link>
          <Link role="menuitem" href="/account/addresses" className={item}><MapPin size={17} /> Addresses</Link>
          <Link role="menuitem" href="/settings" className={item}><Settings size={17} /> Settings</Link>
          <button role="menuitem" onClick={() => void signOut()} className={cx(item, "text-danger")}><LogOut size={17} /> Sign out</button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { quote } = useCart();
  const { unread } = useNotifications();
  const wishlist = useWishlist();
  const path = usePathname();
  const hideMobileSearch = path.startsWith("/checkout") || path === "/cart" || path.startsWith("/settings") || path.startsWith("/login") || path.startsWith("/signup");
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-4 md:gap-5 md:px-6">
        <Link href="/" aria-label="CalmCart home" className="shrink-0"><Logo /></Link>
        <AddressPicker />
        <Suspense fallback={<div className="hidden h-12 flex-1 md:block" />}>
          <SearchSlot className="hidden flex-1 md:block" />
        </Suspense>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link href="/wishlist" aria-label="Saved items" className="relative hidden size-11 place-items-center rounded-full hover:bg-card md:grid">
            <Heart size={21} />
            {wishlist.ids.length > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger" />}
          </Link>
          <Link href="/alerts" aria-label={`Alerts${unread ? `, ${unread} unread` : ""}`} className="relative hidden size-11 place-items-center rounded-full hover:bg-card md:grid">
            <Bell size={21} />
            {unread > 0 && <span className="absolute right-1 top-1 grid min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold leading-[18px] text-white">{unread}</span>}
          </Link>
          <AccountMenu />
          <Link href="/cart" className="ml-1 hidden h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-on-primary hover:opacity-90 md:inline-flex">
            <ShoppingBasket size={19} />
            {quote.itemCount > 0 ? <span>{quote.itemCount} {quote.itemCount === 1 ? "item" : "items"} · {inr(quote.subtotal)}</span> : <span>Basket</span>}
          </Link>
        </div>
      </div>
      {!hideMobileSearch && (
        <div className="px-4 pb-3 md:hidden">
          <Suspense fallback={<div className="h-12" />}><SearchSlot /></Suspense>
        </div>
      )}
    </header>
  );
}
