"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Package, ReceiptIndianRupee, Sparkles, TrendingDown, X } from "lucide-react";
import { EmptyState, PageTitle, Skeleton } from "@/components/ui/States";
import { useAuth } from "@/context/auth";
import { useNotifications } from "@/context/notifications";
import { dateGroup, timeAgo, type DateGroup } from "@/lib/format";
import { cx } from "@/lib/ui";
import type { AppNotification } from "@/lib/types";

const ICONS = { price_drop: TrendingDown, restock: Package, order: ReceiptIndianRupee, summary: Sparkles, system: Bell } as const;
const ORDER: DateGroup[] = ["Today", "Yesterday", "This Week", "Earlier"];

export function AlertsView() {
  const { user, loading: authLoading } = useAuth();
  const { items, unread, loading, markRead, markAllRead, dismiss } = useNotifications();
  const router = useRouter();

  if (!authLoading && !user)
    return <EmptyState emoji="🔔" title="Sign in for alerts" body="Price drops and order updates show up here." action={{ href: "/login?next=/alerts", label: "Sign in" }} />;

  const groups = ORDER.map((g) => ({ g, rows: items.filter((n) => dateGroup(n.created_at) === g) })).filter((x) => x.rows.length);

  function open(n: AppNotification) {
    void markRead(n.id);
    if (n.order_id) router.push(`/orders/${n.order_id}`);
    else if (n.product_id) router.push(`/product/${n.product_id}`);
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <PageTitle sub={unread ? `${unread} unread` : "You're all caught up"}>Alerts</PageTitle>
        {unread > 0 && (
          <button onClick={() => void markAllRead()} className="mt-1 inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-card px-4 text-sm font-semibold hover:bg-line"><CheckCheck size={16} /> Mark all as read</button>
        )}
      </div>
      {loading && items.length === 0 ? (
        <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
      ) : items.length === 0 ? (
        <EmptyState emoji="🔔" title="No alerts yet" body="We'll tell you about price drops and order updates." action={{ href: "/", label: "Browse groceries" }} />
      ) : (
        <div className="max-w-2xl space-y-7">
          {groups.map(({ g, rows }) => (
            <section key={g} aria-label={g}>
              <h2 className="mb-2.5 text-sm font-bold text-muted">{g}</h2>
              <ul className="space-y-2.5">
                {rows.map((n) => {
                  const Icon = ICONS[n.kind] ?? Bell;
                  const clickable = !!(n.order_id || n.product_id);
                  return (
                    <li key={n.id} className={cx("group flex items-start gap-3.5 rounded-[18px] p-4", n.read ? "bg-card" : "bg-accent-soft ring-1 ring-accent/30")}>
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-bg text-accent"><Icon size={19} /></span>
                      <button onClick={() => open(n)} className="min-w-0 flex-1 text-left" disabled={!clickable && n.read}>
                        <span className="flex items-center gap-2"><span className="font-semibold">{n.title}</span>{!n.read && <span className="size-2 rounded-full bg-accent" aria-label="Unread" />}</span>
                        {n.body && <span className="mt-0.5 block text-[15px] text-muted">{n.body}</span>}
                        <span className="mt-1 block text-[12px] text-faint">{timeAgo(n.created_at)}</span>
                      </button>
                      <button onClick={() => void dismiss(n.id)} aria-label={`Dismiss ${n.title}`} className="grid size-8 place-items-center rounded-full text-faint hover:bg-bg hover:text-ink"><X size={16} /></button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
      <p className="mt-8 text-sm text-muted"><Link href="/settings" className="font-semibold underline">Notification settings</Link></p>
    </>
  );
}
