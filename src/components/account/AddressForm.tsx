"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useAddresses, type AddressInput } from "@/context/addresses";
import { useAuth } from "@/context/auth";
import { cx } from "@/lib/ui";
import type { Address } from "@/lib/types";

const LABELS = ["Home", "Work", "Other"] as const;

export function AddressForm({ existing, onDone, onCancel }: { existing?: Address; onDone: (a: Address) => void; onCancel: () => void }) {
  const { save, addresses } = useAddresses();
  const { user, profile } = useAuth();
  const [f, setF] = useState({
    label: existing?.label ?? "Home",
    recipient: existing?.recipient ?? profile?.full_name ?? "",
    phone: existing?.phone ?? profile?.phone ?? "",
    line1: existing?.line1 ?? "",
    line2: existing?.line2 ?? "",
    landmark: existing?.landmark ?? "",
    city: existing?.city ?? "Vellore",
    state: existing?.state ?? "Tamil Nadu",
    pincode: existing?.pincode ?? "",
    is_default: existing?.is_default ?? addresses.length === 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setF((cur) => ({ ...cur, [k]: e.target.value }));
    setErrors((cur) => ({ ...cur, [k]: "", form: "" }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (f.recipient.trim().length < 2) errs.recipient = "Enter the recipient's name.";
    if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\s/g, ""))) errs.phone = "Enter a 10-digit mobile number.";
    if (f.line1.trim().length < 3) errs.line1 = "Enter the flat, house or building.";
    if (!f.city.trim()) errs.city = "Enter a city.";
    if (!f.state.trim()) errs.state = "Enter a state.";
    if (!/^\d{6}$/.test(f.pincode)) errs.pincode = "Enter a 6-digit pincode.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const input: AddressInput = {
      label: f.label as Address["label"],
      recipient: f.recipient.trim(),
      phone: f.phone.replace(/\s/g, ""),
      line1: f.line1.trim(),
      line2: f.line2.trim() || null,
      landmark: f.landmark.trim() || null,
      city: f.city.trim(),
      state: f.state.trim(),
      pincode: f.pincode,
      is_default: f.is_default,
    };
    const res = await save(input, existing?.id);
    setBusy(false);
    if (res.error || !res.address) return setErrors({ form: res.error ?? "Couldn't save this address." });
    onDone(res.address);
  }

  if (!user) return null;
  return (
    <form onSubmit={submit} className="space-y-4 p-5" noValidate>
      {errors.form && <p role="alert" className="rounded-xl bg-card p-3 text-sm text-danger">{errors.form}</p>}
      <div role="radiogroup" aria-label="Address type" className="flex gap-2">
        {LABELS.map((l) => (
          <button key={l} type="button" role="radio" aria-checked={f.label === l} onClick={() => setF((c) => ({ ...c, label: l }))}
            className={cx("h-10 flex-1 rounded-full text-sm font-semibold transition", f.label === l ? "bg-primary text-on-primary" : "bg-card text-muted")}>{l}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Recipient name" value={f.recipient} onChange={set("recipient")} error={errors.recipient} autoComplete="name" />
        <Field label="Mobile number" inputMode="numeric" value={f.phone} onChange={set("phone")} error={errors.phone} autoComplete="tel-national" />
      </div>
      <Field label="Flat, house or building" value={f.line1} onChange={set("line1")} error={errors.line1} autoComplete="address-line1" />
      <Field label="Area or street (optional)" value={f.line2} onChange={set("line2")} autoComplete="address-line2" />
      <Field label="Landmark (optional)" value={f.landmark} onChange={set("landmark")} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="City" value={f.city} onChange={set("city")} error={errors.city} autoComplete="address-level2" />
        <Field label="State" value={f.state} onChange={set("state")} error={errors.state} autoComplete="address-level1" />
        <Field label="Pincode" inputMode="numeric" maxLength={6} value={f.pincode} onChange={set("pincode")} error={errors.pincode} autoComplete="postal-code" />
      </div>
      <label className="flex items-center gap-3 text-[15px]">
        <input type="checkbox" checked={f.is_default} onChange={(e) => setF((c) => ({ ...c, is_default: e.target.checked }))} className="size-5 accent-[var(--accent)]" />
        Use as my default address
      </label>
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={busy}>Save address</Button>
      </div>
    </form>
  );
}
