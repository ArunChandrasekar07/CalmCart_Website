import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

let client: SupabaseClient | undefined;

/** Browser-side singleton. Only call from effects / event handlers. */
export function supabase(): SupabaseClient {
  client ??= createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" },
  });
  return client;
}

/** Turns Postgres / PostgREST / auth errors into a sentence a shopper can act on. */
export function friendlyError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!err) return fallback;
  const e = err as { message?: string; code?: string; status?: number };
  const msg = e.message ?? "";
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return "Can't reach CalmCart right now. Check your connection and try again.";
  }
  if (e.code === "28000" || /not authenticated|jwt/i.test(msg)) return "Sign in to continue.";
  if (/invalid login credentials/i.test(msg)) return "That email and password don't match.";
  if (/user already registered/i.test(msg)) return "An account with this email already exists. Try signing in.";
  if (/email not confirmed/i.test(msg)) return "Confirm your email first — check your inbox for the link.";
  if (/rate limit|too many/i.test(msg)) return "Too many attempts. Wait a minute and try again.";
  if (/password should be at least/i.test(msg)) return "Use a password with at least 6 characters.";
  return msg && msg.length < 160 ? msg : fallback;
}
