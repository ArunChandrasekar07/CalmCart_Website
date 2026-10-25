"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { MailCheck } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/context/auth";
import { safeNext } from "@/lib/nav";

function Shell({ title, sub, children, footer }: { title: string; sub: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="mx-auto grid min-h-[calc(100dvh-140px)] w-full max-w-[460px] content-center px-4 pb-28 pt-8 md:pb-12">
      <div className="mb-7 flex justify-center"><Logo /></div>
      <div className="rounded-[26px] border border-line bg-surface p-6 shadow-[var(--shadow-card)] md:p-8">
        <h1 className="text-[1.75rem] font-bold">{title}</h1>
        <p className="mt-1 text-[15px] text-muted">{sub}</p>
        <div className="mt-6">{children}</div>
      </div>
      {footer && <p className="mt-5 text-center text-[15px] text-muted">{footer}</p>}
    </main>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function useRedirectIfSignedIn(to: string) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && user) router.replace(to);
  }, [user, loading, to, router]);
}

function LoginInner() {
  const next = safeNext(useSearchParams().get("next"));
  const { signIn } = useAuth();
  useRedirectIfSignedIn(next);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Enter your password.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) setErrors({ form: error });
  }
  return (
    <Shell
      title="Welcome back"
      sub="Sign in to see your orders, saved items and addresses."
      footer={<>New to CalmCart? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-semibold text-ink underline">Create an account</Link></>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {errors.form && <p role="alert" className="rounded-xl bg-card p-3 text-sm text-danger">{errors.form}</p>}
        <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="you@example.com" />
        <Field label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <div className="text-right"><Link href="/forgot-password" className="text-sm font-semibold text-accent hover:underline">Forgot password?</Link></div>
        <Button type="submit" full loading={busy}>Sign in</Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">Just looking? <Link href={next} className="font-semibold text-ink underline">Keep browsing as a guest</Link></p>
    </Shell>
  );
}

function SignupInner() {
  const next = safeNext(useSearchParams().get("next"));
  const { signUp } = useAuth();
  useRedirectIfSignedIn("/welcome");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (name.trim().length < 2) errs.name = "Enter your name.";
    if (!EMAIL_RE.test(email.trim())) errs.email = "Enter a valid email address.";
    if (password.length < 8) errs.password = "Use at least 8 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const res = await signUp(email, password, name);
    setBusy(false);
    if (res.error) setErrors({ form: res.error });
    else if (res.needsConfirmation) setSent(true);
  }

  if (sent)
    return (
      <Shell title="Check your email" sub={`We sent a confirmation link to ${email.trim()}.`}>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-accent-soft text-accent"><MailCheck size={30} /></span>
          <p className="text-[15px] text-muted">Open the link to finish setting up your account. You can close this tab.</p>
          <ButtonLink href="/login" variant="secondary" full>Back to sign in</ButtonLink>
        </div>
      </Shell>
    );
  return (
    <Shell
      title="Create your account"
      sub="Your basket, orders and addresses stay with you on every device."
      footer={<>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-ink underline">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {errors.form && <p role="alert" className="rounded-xl bg-card p-3 text-sm text-danger">{errors.form}</p>}
        <Field label="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="you@example.com" />
        <Field label="Password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} hint="At least 8 characters." />
        <Button type="submit" full loading={busy}>Create account</Button>
      </form>
    </Shell>
  );
}

function ForgotInner() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address.");
    setBusy(true);
    const { error } = await sendPasswordReset(email);
    setBusy(false);
    if (error) setError(error);
    else setSent(true);
  }
  return (
    <Shell title="Reset your password" sub="Enter your email and we'll send you a link to choose a new one." footer={<Link href="/login" className="font-semibold text-ink underline">Back to sign in</Link>}>
      {sent ? (
        <p className="rounded-xl bg-accent-soft p-4 text-[15px]">If an account exists for {email.trim()}, a reset link is on its way.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} error={error} />
          <Button type="submit" full loading={busy}>Send reset link</Button>
        </form>
      )}
    </Shell>
  );
}

function ResetInner() {
  const { user, loading, updatePassword } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError("Use at least 8 characters.");
    setBusy(true);
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) setError(error);
    else { setDone(true); window.setTimeout(() => router.replace("/"), 1500); }
  }
  if (!loading && !user)
    return (
      <Shell title="This link has expired" sub="Reset links work once and expire after a while.">
        <ButtonLink href="/forgot-password" full>Send a new link</ButtonLink>
      </Shell>
    );
  return (
    <Shell title="Choose a new password" sub="You'll stay signed in after this.">
      {done ? (
        <p className="rounded-xl bg-accent-soft p-4 text-[15px]">Password updated. Taking you home…</p>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="New password" type="password" autoComplete="new-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} error={error} hint="At least 8 characters." />
          <Button type="submit" full loading={busy}>Update password</Button>
        </form>
      )}
    </Shell>
  );
}

const wrap = (C: () => React.ReactElement) => function Wrapped() { return <Suspense><C /></Suspense>; };
export const LoginForm = wrap(LoginInner);
export const SignupForm = wrap(SignupInner);
export const ForgotForm = wrap(ForgotInner);
export const ResetForm = wrap(ResetInner);
