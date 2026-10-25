"use client";

import Link from "next/link";
import { useState } from "react";
import { Briefcase, Home, MapPin, Pencil, Trash2 } from "lucide-react";
import { AddressForm } from "./AddressForm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, PageTitle } from "@/components/ui/States";
import { useAddresses } from "@/context/addresses";
import { useAuth } from "@/context/auth";
import { useToast } from "@/context/toast";
import type { Address } from "@/lib/types";

const icon = { Home, Work: Briefcase, Other: MapPin } as const;

export function AddressLine({ a }: { a: Pick<Address, "line1" | "line2" | "landmark" | "city" | "state" | "pincode"> }) {
  return <>{[a.line1, a.line2, a.landmark && `Near ${a.landmark}`, `${a.city}, ${a.state} ${a.pincode}`].filter(Boolean).join(", ")}</>;
}

export function AddressesView() {
  const { user, loading } = useAuth();
  const { addresses, remove, makeDefault, loading: busy } = useAddresses();
  const toast = useToast();
  const [editing, setEditing] = useState<Address | "new" | null>(null);

  if (!loading && !user)
    return <EmptyState emoji="📍" title="Sign in to manage addresses" body="Saved addresses make checkout a single tap." action={{ href: "/login?next=/account/addresses", label: "Sign in" }} />;

  return (
    <>
      <PageTitle sub="Where should we deliver?">Your addresses</PageTitle>
      {!busy && addresses.length === 0 ? (
        <EmptyState emoji="📍" title="No addresses yet" body="Add one to get delivery estimates and check out faster." action={<Button onClick={() => setEditing("new")}>Add an address</Button>} />
      ) : (
        <>
          <ul className="grid gap-4 md:grid-cols-2">
            {addresses.map((a) => {
              const Icon = icon[a.label];
              return (
                <li key={a.id} className="rounded-[20px] border border-line p-5">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className="text-accent" />
                    <h2 className="font-bold">{a.label}</h2>
                    {a.is_default && <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[12px] font-semibold text-accent">Default</span>}
                  </div>
                  <p className="mt-2 text-[15px]">{a.recipient} · {a.phone}</p>
                  <p className="mt-1 text-[15px] text-muted"><AddressLine a={a} /></p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => setEditing(a)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-card px-3.5 text-[13px] font-semibold hover:bg-line"><Pencil size={14} /> Edit</button>
                    {!a.is_default && <button onClick={async () => { const r = await makeDefault(a.id); if (r.error) toast.error(r.error); else toast.success("Default address updated."); }} className="h-9 rounded-full bg-card px-3.5 text-[13px] font-semibold hover:bg-line">Make default</button>}
                    <button onClick={async () => { if (!confirm("Delete this address?")) return; const r = await remove(a.id); if (r.error) toast.error(r.error); else toast.success("Address deleted."); }} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-card px-3.5 text-[13px] font-semibold text-danger hover:bg-line"><Trash2 size={14} /> Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-6"><Button onClick={() => setEditing("new")}>Add a new address</Button></div>
        </>
      )}
      <p className="mt-8 text-sm text-muted"><Link href="/orders" className="font-semibold underline">View your orders</Link></p>
      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add an address" : "Edit address"}>
        {editing && <AddressForm existing={editing === "new" ? undefined : editing} onCancel={() => setEditing(null)} onDone={() => { setEditing(null); toast.success("Address saved."); }} />}
      </Modal>
    </>
  );
}
