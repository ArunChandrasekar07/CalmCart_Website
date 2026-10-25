"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Contrast, ExternalLink, Globe, Hammer, Hand, LogOut, Moon, ShoppingBasket, Type, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PageTitle } from "@/components/ui/States";
import { useAuth, displayName, initials } from "@/context/auth";
import { useSettings } from "@/context/settings";
import { useToast } from "@/context/toast";
import type { ReactNode } from "react";

function Card({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-[13px] font-semibold text-muted">{label}</h2>
      <div className="divide-y divide-line overflow-hidden rounded-[18px] border border-line bg-surface">{children}</div>
    </section>
  );
}

function Row({ icon, label, sub, right }: { icon: ReactNode; label: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card">{icon}</span>
      <span className="min-w-0 flex-1"><span className="block text-[15px] font-medium">{label}</span>{sub && <span className="block text-[13px] text-muted">{sub}</span>}</span>
      {right}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-accent" : "bg-line"}`}>
      <span className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function GithubMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" /></svg>
  );
}

const LINKS = [
  { icon: <GithubMark />, label: "GitHub", value: "ArunChandrasekar07", url: "https://github.com/ArunChandrasekar07" },
  { icon: <Globe size={17} />, label: "Portfolio", value: "arunc.vercel.app", url: "https://arunc.vercel.app" },
];

export function SettingsView() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { prefs, setPref, tap, canVibrate } = useSettings();
  const toast = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => { if (profile) { setName(profile.full_name ?? ""); setPhone(profile.phone ?? ""); } }, [profile]);
  useEffect(() => setDark(document.documentElement.dataset.theme === "dark"), [prefs.theme]);

  const shown = displayName(user, profile);
  const toggle = <K extends "largeText" | "highContrast" | "haptics">(k: K) => (v: boolean) => { setPref(k, v as never); if (k !== "haptics" || v) tap(); };

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (phone && !/^[6-9]\d{9}$/.test(phone)) return toast.error("Enter a 10-digit mobile number.");
    setSaving(true);
    const { error } = await updateProfile({ full_name: name.trim(), phone: phone || null });
    setSaving(false);
    if (error) toast.error(error); else toast.success("Profile saved.");
  }

  async function togglePush(v: boolean) {
    if (v && typeof Notification !== "undefined" && Notification.permission === "default") {
      const res = await Notification.requestPermission();
      if (res !== "granted") toast.info("Browser notifications are blocked. Alerts will still show in the app.");
    }
    setPref("push", v);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle>Settings</PageTitle>

      <section className="mb-8 rounded-[22px] bg-card p-6">
        {user ? (
          <>
            <div className="flex flex-col items-center text-center">
              <span className="grid size-16 place-items-center rounded-full bg-bg text-xl font-bold">{initials(shown)}</span>
              <p className="mt-3 text-lg font-bold">{shown}</p>
              <p className="text-[13px] text-muted">{user.email}</p>
            </div>
            <form onSubmit={saveProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Field label="Mobile number" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\s/g, ""))} />
              <Button type="submit" loading={saving} className="sm:col-span-2" variant="primary">Save profile</Button>
            </form>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
              <Link href="/orders" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-bg px-3.5 font-semibold"><Package size={15} /> Orders</Link>
              <Link href="/account/addresses" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-bg px-3.5 font-semibold"><MapPin size={15} /> Addresses</Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-lg font-bold">You&apos;re browsing as a guest</p>
            <p className="mt-1 text-[15px] text-muted">Sign in to save your basket, addresses and orders.</p>
            <div className="mt-4 flex justify-center gap-3"><Link href="/login?next=/settings" className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-on-primary">Sign in</Link><Link href="/signup" className="inline-flex h-11 items-center rounded-full bg-bg px-6 text-sm font-semibold">Create account</Link></div>
          </div>
        )}
      </section>

      <Card label="Links">
        {LINKS.map((l) => (
          <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="block hover:bg-card">
            <Row icon={l.icon} label={l.label} sub={l.value} right={<ExternalLink size={16} className="text-faint" />} />
          </a>
        ))}
      </Card>

      <Card label="Appearance">
        <Row icon={<Moon size={17} />} label="Dark Mode" sub={prefs.theme === "system" ? "Following your device" : undefined} right={<Toggle label="Dark Mode" checked={dark} onChange={(v) => { setPref("theme", v ? "dark" : "light"); tap(); }} />} />
        <Row icon={<Type size={17} />} label="Large Text" right={<Toggle label="Large Text" checked={prefs.largeText} onChange={toggle("largeText")} />} />
        <Row icon={<Contrast size={17} />} label="High Contrast" right={<Toggle label="High Contrast" checked={prefs.highContrast} onChange={toggle("highContrast")} />} />
        {prefs.theme !== "system" && <button onClick={() => setPref("theme", "system")} className="w-full p-3.5 text-center text-[13px] font-semibold text-accent hover:bg-card">Use my device&apos;s setting</button>}
      </Card>

      <Card label="Notifications & feedback">
        <Row icon={<Bell size={17} />} label="Push Notifications" sub="Browser alerts when your order moves" right={<Toggle label="Push Notifications" checked={prefs.push} onChange={togglePush} />} />
        <Row icon={<Hand size={17} />} label="Haptic Feedback (Interaction Mode)" sub={canVibrate ? undefined : "Works on phones that support vibration"} right={<Toggle label="Haptic Feedback" checked={prefs.haptics} onChange={toggle("haptics")} />} />
      </Card>

      <Card label="About">
        <Row icon={<ShoppingBasket size={17} />} label="CalmCart" right={<span className="text-[13px] text-muted">Web v1.0.0</span>} />
        <Row icon={<Hammer size={17} />} label="Built with" right={<span className="text-[13px] text-muted">Next.js + Supabase</span>} />
      </Card>

      {user && <Button full variant="danger" onClick={() => void signOut().then(() => toast.success("Signed out."))}><LogOut size={17} /> Sign out</Button>}
      <p className="mt-6 text-center text-[12px] text-faint">Designed &amp; built by Arun C. for VIT Vellore coursework.</p>
    </div>
  );
}
