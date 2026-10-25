import type { Metadata, Viewport } from "next";
import { Providers } from "@/context/providers";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { CartBar } from "@/components/layout/CartBar";
import { getCatalog } from "@/lib/catalog";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "CalmCart · Groceries in about 30 minutes", template: "%s · CalmCart" },
  description:
    "CalmCart delivers fresh fruit, vegetables, dairy, bakery and pantry staples in about 30 minutes, with a calm, clutter-free way to shop.",
  applicationName: "CalmCart",
  alternates: { canonical: "/" },
  keywords: ["CalmCart", "grocery delivery", "online grocery", "30 minute delivery", "fresh fruits", "vegetables", "dairy", "bakery"],
  authors: [{ name: "Arun C." }],
  openGraph: {
    type: "website",
    siteName: "CalmCart",
    url: "/",
    title: "CalmCart · Groceries in about 30 minutes",
    description: "Fresh fruit, vegetables, dairy, bakery and pantry staples at your door in about 30 minutes.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "CalmCart · Groceries in about 30 minutes",
    description: "Fresh fruit, vegetables, dairy, bakery and pantry staples at your door in about 30 minutes.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Runs before first paint so a saved theme never flashes the wrong colours.
const prePaint = `(function(){try{var p=JSON.parse(localStorage.getItem('calmcart/prefs')||'{}');var d=p.theme==='dark'||((!p.theme||p.theme==='system')&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.dataset.theme=d?'dark':'light';r.dataset.large=String(!!p.largeText);r.dataset.contrast=p.highContrast?'high':'normal';}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const catalog = await getCatalog();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prePaint }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              { "@context": "https://schema.org", "@type": "Organization", name: "CalmCart", url: SITE_URL, logo: `${SITE_URL}/icon-512.png` },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "CalmCart",
                url: SITE_URL,
                potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/search?q={search_term_string}`, "query-input": "required name=search_term_string" },
              },
            ]),
          }}
        />
      </head>
      <body>
        <Providers catalog={catalog}>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary">
            Skip to content
          </a>
          <Header />
          <div id="main">{children}</div>
          <Footer />
          <CartBar />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
