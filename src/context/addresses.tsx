"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./auth";
import { friendlyError, supabase } from "@/lib/supabase";
import type { Address } from "@/lib/types";

export type AddressInput = Omit<Address, "id" | "is_default"> & { is_default?: boolean };

type AddressState = {
  addresses: Address[];
  loading: boolean;
  /** The address used for delivery estimates and as the checkout default. */
  current: Address | null;
  select: (id: string) => void;
  save: (input: AddressInput, id?: string) => Promise<{ error?: string; address?: Address }>;
  remove: (id: string) => Promise<{ error?: string }>;
  makeDefault: (id: string) => Promise<{ error?: string }>;
  reload: () => Promise<void>;
};

const AddressContext = createContext<AddressState | null>(null);

export function AddressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!uid) return;
    const { data } = await supabase().from("addresses").select("*").order("is_default", { ascending: false }).order("created_at");
    setAddresses((data ?? []) as Address[]);
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setAddresses([]);
      setSelectedId(null);
      return;
    }
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [uid, reload]);

  const save = useCallback<AddressState["save"]>(
    async (input, id) => {
      if (!uid) return { error: "Sign in to save an address." };
      const sb = supabase();
      const res = id
        ? await sb.from("addresses").update(input).eq("id", id).select().single()
        : await sb.from("addresses").insert({ ...input, user_id: uid }).select().single();
      if (res.error) return { error: friendlyError(res.error, "Couldn't save this address.") };
      await reload();
      if (!id) setSelectedId((res.data as Address).id);
      return { address: res.data as Address };
    },
    [uid, reload]
  );

  const remove = useCallback<AddressState["remove"]>(
    async (id) => {
      const { error } = await supabase().from("addresses").delete().eq("id", id);
      if (error) return { error: friendlyError(error, "Couldn't delete this address.") };
      setSelectedId((cur) => (cur === id ? null : cur));
      await reload();
      return {};
    },
    [reload]
  );

  const makeDefault = useCallback<AddressState["makeDefault"]>(
    async (id) => {
      const { error } = await supabase().from("addresses").update({ is_default: true }).eq("id", id);
      if (error) return { error: friendlyError(error) };
      await reload();
      return {};
    },
    [reload]
  );

  const current = useMemo(
    () => addresses.find((a) => a.id === selectedId) ?? addresses.find((a) => a.is_default) ?? addresses[0] ?? null,
    [addresses, selectedId]
  );

  const value = useMemo(
    () => ({ addresses, loading, current, select: setSelectedId, save, remove, makeDefault, reload }),
    [addresses, loading, current, save, remove, makeDefault, reload]
  );
  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}

export function useAddresses() {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddresses must be used within AddressProvider");
  return ctx;
}
