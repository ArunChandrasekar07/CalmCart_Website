"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "./auth";
import type { Preferences } from "@/lib/types";

export const PREFS_KEY = "calmcart/prefs";

const DEFAULTS: Preferences = { theme: "system", largeText: false, highContrast: false, haptics: true, push: false };

type SettingsState = {
  prefs: Preferences;
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  /** Short haptic tick on devices that support it, when enabled. */
  tap: () => void;
  canVibrate: boolean;
};

const SettingsContext = createContext<SettingsState | null>(null);

function readLocal(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function applyToDocument(p: Preferences) {
  const root = document.documentElement;
  const dark = p.theme === "dark" || (p.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.dataset.theme = dark ? "dark" : "light";
  root.dataset.large = String(p.largeText);
  root.dataset.contrast = p.highContrast ? "high" : "normal";
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user, profile, updateProfile } = useAuth();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [canVibrate, setCanVibrate] = useState(false);
  const hydratedFor = useRef<string | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setPrefs(readLocal());
    setCanVibrate(typeof navigator !== "undefined" && "vibrate" in navigator);
  }, []);

  // Once per sign-in, let the account's saved preferences win over this device's.
  useEffect(() => {
    if (!user || !profile || hydratedFor.current === user.id) return;
    hydratedFor.current = user.id;
    if (profile.preferences && Object.keys(profile.preferences).length) {
      setPrefs((cur) => ({ ...cur, ...profile.preferences }));
    }
  }, [user, profile]);
  useEffect(() => {
    if (!user) hydratedFor.current = null;
  }, [user]);

  useEffect(() => {
    applyToDocument(prefs);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  // Follow the OS setting live while the theme is "system".
  useEffect(() => {
    if (prefs.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyToDocument(prefs);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [prefs]);

  const setPref = useCallback<SettingsState["setPref"]>(
    (key, value) => {
      setPrefs((cur) => {
        const next = { ...cur, [key]: value };
        if (user) {
          window.clearTimeout(saveTimer.current);
          saveTimer.current = window.setTimeout(() => void updateProfile({ preferences: next }), 500);
        }
        return next;
      });
    },
    [user, updateProfile]
  );

  const tap = useCallback(() => {
    if (prefs.haptics && "vibrate" in navigator) navigator.vibrate(18);
  }, [prefs.haptics]);

  const value = useMemo(() => ({ prefs, setPref, tap, canVibrate }), [prefs, setPref, tap, canVibrate]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
