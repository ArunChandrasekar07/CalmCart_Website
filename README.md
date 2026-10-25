# CalmCart Web

Groceries at your door in about 30 minutes. This is the full web version of the CalmCart mobile app: same catalog, same calm design, plus accounts, addresses, checkout and live order tracking, all backed by Supabase.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Auth, Realtime, pg_cron)

## What's in it

- **Shop:** home with Your Feed / Generic Feed, category chips, search with suggestions and recent searches, sort and deals filter, product pages with pack sizes ("BEST VALUE", % off, struck MRP) and related products.
- **For You:** Last 5 orders, Frequently bought, Seasonal picks and Price drops, each with a "Why this?" explanation.
- **Basket and checkout:** guest basket that merges into your account on sign-in, promo codes, address picker, cash/UPI/card on delivery, delivery note.
- **Orders:** live tracking timeline (placed → confirmed → packed → out for delivery → delivered), cancel while still early, reorder.
- **Account:** email sign-up and sign-in, password reset, onboarding, addresses, saved items, alerts grouped by Today / Yesterday / This Week / Earlier.
- **Settings:** Dark Mode, Large Text, High Contrast, haptics (on devices that vibrate), browser notifications. Preferences sync to your account.
- **Quality:** mobile bottom tab bar, keyboard and screen-reader support, reduced-motion respected, SEO metadata, sitemap, robots and web manifest.

## Run it

```bash
npm install
cp .env.example .env.local   # optional: the defaults already point at the CalmCart project
npm run dev
```

Open http://localhost:3000.

## Backend

Supabase project `CalmCart` (`lanacfovyvgciljdnltp`). The database owns the rules, so the browser can't bend them:

| Piece | What it does |
| --- | --- |
| `quote_cart(promo)` | Prices the basket on the server: ₹20 delivery, ₹15 off above ₹200, promo codes |
| `place_order(...)` | Creates the order and its item snapshot from your server-side basket |
| `cancel_order(id)` | Cancels your own order while it is still placed or confirmed |
| `advance_orders()` | Runs every minute via pg_cron and moves orders through the delivery stages |
| Row Level Security | Every user table is owner-only; the catalog and promo codes are public-read |

Promo codes: `WELCOME30` (₹30 off, first order, min ₹99), `CALM10` (10% up to ₹50, min ₹199), `FRESH50` (₹50 off, min ₹399), `FREEDEL` (free delivery, min ₹149).

The delivery stages are a **demo simulation** based on order age. Payments are collected on delivery; nothing is charged online.

The site ships with a bundled copy of the catalog and falls back to it if Supabase can't be reached.

## Before you deploy

1. In Supabase, open **Authentication → URL Configuration** and add your deployed URL (and `http://localhost:3000`) to **Redirect URLs**, so confirmation and reset-password emails return to the site.
2. Set `NEXT_PUBLIC_SITE_URL` to your deployed origin.
3. Deploy to Vercel (or any Node host) with `npm run build` / `npm start`.

Email confirmation works either way: if it's on, sign-up shows a "check your email" screen; if it's off, you're signed in straight away.

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run lint`

Designed & built by Arun C. for VIT Vellore coursework.
