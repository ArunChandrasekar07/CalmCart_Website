import { inr } from "@/lib/format";
import type { Quote } from "@/lib/types";

export function PriceSummary({ quote, totalLabel = "To pay" }: { quote: Quote; totalLabel?: string }) {
  const row = "flex items-center justify-between text-[15px]";
  return (
    <dl className="space-y-2.5">
      <div className={row}><dt className="text-muted">Item total</dt><dd>{inr(quote.subtotal)}</dd></div>
      <div className={row}>
        <dt className="text-muted">Delivery fee</dt>
        <dd>{quote.deliveryFee === 0 ? <span className="font-semibold text-accent">FREE</span> : inr(quote.deliveryFee)}</dd>
      </div>
      {quote.autoDiscount > 0 && <div className={row}><dt className="text-muted">Basket discount</dt><dd className="font-semibold text-accent">−{inr(quote.autoDiscount)}</dd></div>}
      {quote.promoDiscount > 0 && <div className={row}><dt className="text-muted">Promo {quote.promoCode}</dt><dd className="font-semibold text-accent">−{inr(quote.promoDiscount)}</dd></div>}
      <div className="flex items-center justify-between border-t border-line pt-3 text-lg font-bold"><dt>{totalLabel}</dt><dd>{inr(quote.total)}</dd></div>
    </dl>
  );
}
