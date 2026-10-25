"use client";

import type { ReactNode } from "react";
import type { Catalog } from "@/lib/types";
import { ToastProvider } from "./toast";
import { AuthProvider } from "./auth";
import { SettingsProvider } from "./settings";
import { CatalogProvider } from "./catalog";
import { CartProvider } from "./cart";
import { OrdersProvider } from "./orders";
import { NotificationProvider } from "./notifications";
import { WishlistProvider } from "./wishlist";
import { AddressProvider } from "./addresses";

export function Providers({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <SettingsProvider>
          <CatalogProvider initial={catalog}>
            <CartProvider>
              <OrdersProvider>
                <NotificationProvider>
                  <WishlistProvider>
                    <AddressProvider>{children}</AddressProvider>
                  </WishlistProvider>
                </NotificationProvider>
              </OrdersProvider>
            </CartProvider>
          </CatalogProvider>
        </SettingsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
