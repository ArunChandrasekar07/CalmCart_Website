"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/context/wishlist";
import { useToast } from "@/context/toast";
import { cx } from "@/lib/ui";

export function WishlistButton({ productId, name, className }: { productId: string; name: string; className?: string }) {
  const w = useWishlist();
  const toast = useToast();
  const saved = w.has(productId);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        w.toggle(productId);
        toast.success(saved ? `Removed ${name} from saved items.` : `Saved ${name}.`, saved ? undefined : { label: "View", href: "/wishlist" });
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved items` : `Save ${name}`}
      className={cx("grid size-9 place-items-center rounded-full bg-bg/85 backdrop-blur transition hover:scale-105 active:scale-90", className)}
    >
      <Heart size={18} className={saved ? "fill-danger text-danger" : "text-ink"} />
    </button>
  );
}
