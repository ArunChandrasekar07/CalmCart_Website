// The URL and publishable key are public by design (they ship to every browser;
// Row Level Security is what protects the data), so sensible defaults for the
// CalmCart Supabase project are baked in and can be overridden per deployment.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://lanacfovyvgciljdnltp.supabase.co";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_6C0p70qYSw9jPBhD9089uQ_yuEVg-3Q";
