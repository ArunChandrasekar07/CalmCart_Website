"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "./auth";
import { useSettings } from "./settings";
import { useToast } from "./toast";
import { supabase } from "@/lib/supabase";
import type { AppNotification } from "@/lib/types";

type NotificationState = {
  items: AppNotification[];
  unread: number;
  loading: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
};

const NotificationContext = createContext<NotificationState | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { prefs } = useSettings();
  const toast = useToast();
  const uid = user?.id ?? null;
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const pushRef = useRef(prefs.push);
  useEffect(() => {
    pushRef.current = prefs.push;
  }, [prefs.push]);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase()
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (!cancelled) setItems((data ?? []) as AppNotification[]);
        setLoading(false);
      });

    const channel = supabase()
      .channel(`notifications:${uid}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` },
        (payload) => {
          const n = payload.new as AppNotification;
          setItems((cur) => (cur.some((x) => x.id === n.id) ? cur : [n, ...cur]));
          toast.info(n.title);
          if (pushRef.current && typeof Notification !== "undefined" && Notification.permission === "granted") {
            try {
              new Notification(n.title, { body: n.body ?? undefined, icon: "/icon.svg" });
            } catch {}
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` },
        (payload) => {
          const n = payload.new as AppNotification;
          setItems((cur) => cur.map((x) => (x.id === n.id ? n : x)));
        }
      )
      .subscribe();
    return () => {
      cancelled = true;
      void supabase().removeChannel(channel);
    };
  }, [uid, toast]);

  const markRead = useCallback(async (id: string) => {
    setItems((cur) => cur.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await supabase().from("notifications").update({ read: true }).eq("id", id);
  }, []);

  const markAllRead = useCallback(async () => {
    setItems((cur) => cur.map((n) => ({ ...n, read: true })));
    await supabase().from("notifications").update({ read: true }).eq("read", false);
  }, []);

  const dismiss = useCallback(async (id: string) => {
    setItems((cur) => cur.filter((n) => n.id !== id));
    await supabase().from("notifications").delete().eq("id", id);
  }, []);

  const value = useMemo(
    () => ({ items, unread: items.filter((n) => !n.read).length, loading, markRead, markAllRead, dismiss }),
    [items, loading, markRead, markAllRead, dismiss]
  );
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
