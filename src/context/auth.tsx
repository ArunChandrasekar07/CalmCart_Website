"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { friendlyError, supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

type Result = { error?: string };

type AuthState = {
  user: User | null;
  profile: Profile | null;
  /** True until the first session lookup has finished. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (email: string, password: string, fullName: string) => Promise<Result & { needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<Profile, "full_name" | "phone" | "preferences" | "onboarded">>) => Promise<Result>;
  sendPasswordReset: (email: string) => Promise<Result>;
  updatePassword: (password: string) => Promise<Result>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = supabase();
    let active = true;
    sb.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      // Never await supabase calls inside this callback — it holds an internal lock.
      setUser((prev) => (prev?.id === session?.user?.id ? (session?.user ?? null) : (session?.user ?? null)));
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const uid = user?.id;
  useEffect(() => {
    if (!uid) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    const load = async (attempt = 0) => {
      const { data } = await supabase().from("profiles").select("*").eq("id", uid).maybeSingle();
      if (cancelled) return;
      if (data) setProfile(data as Profile);
      else if (attempt < 2) window.setTimeout(() => load(attempt + 1), 700);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const signIn = useCallback<AuthState["signIn"]>(async (email, password) => {
    const { error } = await supabase().auth.signInWithPassword({ email: email.trim(), password });
    return error ? { error: friendlyError(error) } : {};
  }, []);

  const signUp = useCallback<AuthState["signUp"]>(async (email, password, fullName) => {
    const { data, error } = await supabase().auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/welcome`,
      },
    });
    if (error) return { error: friendlyError(error) };
    // Supabase hides "already registered" behind an empty identities list.
    if (data.user && data.user.identities?.length === 0) {
      return { error: friendlyError({ message: "User already registered" }) };
    }
    return { needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    await supabase().auth.signOut();
    setProfile(null);
  }, []);

  const updateProfile = useCallback<AuthState["updateProfile"]>(
    async (patch) => {
      if (!uid) return { error: "Sign in to continue." };
      const { data, error } = await supabase().from("profiles").update(patch).eq("id", uid).select().maybeSingle();
      if (error) return { error: friendlyError(error) };
      if (data) setProfile(data as Profile);
      return {};
    },
    [uid]
  );

  const sendPasswordReset = useCallback<AuthState["sendPasswordReset"]>(async (email) => {
    const { error } = await supabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error ? { error: friendlyError(error) } : {};
  }, []);

  const updatePassword = useCallback<AuthState["updatePassword"]>(async (password) => {
    const { error } = await supabase().auth.updateUser({ password });
    return error ? { error: friendlyError(error) } : {};
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, signIn, signUp, signOut, updateProfile, sendPasswordReset, updatePassword }),
    [user, profile, loading, signIn, signUp, signOut, updateProfile, sendPasswordReset, updatePassword]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** First name for greetings, falling back to the email handle. */
export function displayName(user: User | null, profile: Profile | null) {
  const name = profile?.full_name?.trim() || (user?.user_metadata?.full_name as string | undefined)?.trim();
  if (name) return name;
  return user?.email ? user.email.split("@")[0] : "";
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "CC";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
