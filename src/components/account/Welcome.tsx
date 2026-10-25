"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Clock, Leaf, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Logo } from "@/components/ui/Logo";
import { useAuth, displayName } from "@/context/auth";
import { useSettings } from "@/context/settings";

export function Welcome() {
  const { user, profile, loading, updateProfile } = useAuth();
  const { setPref, prefs } = useSettings();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/welcome");
  }, [loading, user, router]);
  useEffect(() => {
    if (profile) { setName(displayName(user, profile)); setPhone(profile.phone ?? ""); }
  }, [profile, user]);

  async function finish(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Enter your name.");
    if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) return setError("Enter a 10-digit mobile number.");
    setBusy(true);
    const { error } = await updateProfile({ full_name: name.trim(), phone: phone.replace(/\s/g, "") || null, onboarded: true });
    setBusy(false);
    if (error) return setError(error);
    router.replace("/");
  }

  return (
    <main className="mx-auto w-full max-w-[520px] px-4 pb-28 pt-8 md:pb-12">
      <div className="mb-7 flex justify-center"><Logo /></div>
      <div className="rounded-[26px] border border-line bg-surface p-6 md:p-8">
        <h1 className="text-[1.75rem] font-bold">Let&apos;s set up CalmCart for you</h1>
        <p className="mt-1 text-[15px] text-muted">Two quick details and you&apos;re ready to shop.</p>
        <form onSubmit={finish} className="mt-6 space-y-4" noValidate>
          <Field label="Your name" value={name} onChange={(e) => { setName(e.target.value); setError(null); }} autoComplete="name" />
          <Field label="Mobile number (optional)" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel-national" hint="Only used by the delivery partner." error={error} />
          <label className="flex items-center gap-3 rounded-2xl bg-card p-4">
            <Bell size={20} className="text-accent" />
            <span className="flex-1 text-[15px] font-medium">Tell me when my order moves</span>
            <input type="checkbox" checked={prefs.push} onChange={(e) => {
              setPref("push", e.target.checked);
              if (e.target.checked && typeof Notification !== "undefined" && Notification.permission === "default") void Notification.requestPermission();
            }} className="size-5 accent-[var(--accent)]" />
          </label>
          <Button type="submit" full loading={busy}>Start shopping</Button>
        </form>
        <ul className="mt-6 space-y-3 border-t border-line pt-5 text-sm text-muted">
          <li className="flex items-center gap-3"><Clock size={18} className="text-accent" /> Fast delivery, under 30 minutes</li>
          <li className="flex items-center gap-3"><Leaf size={18} className="text-accent" /> Fresh products sourced locally</li>
          <li className="flex items-center gap-3"><ShieldCheck size={18} className="text-accent" /> Secure payments, always protected</li>
        </ul>
      </div>
    </main>
  );
}
