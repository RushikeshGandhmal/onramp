"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * Custom sign-in form — GitHub-native styling.
 *
 * Built against Clerk v7 "Signals" API (`signIn.sso`, `signIn.password`,
 * `signIn.finalize`). Two paths:
 *   1. Continue with GitHub  (preferred — OAuth redirect)
 *   2. Email + password      (fallback for password users)
 */
export function SignInForm() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect_url") || "/app/search";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"github" | "email" | null>(null);

  async function onContinueWithGitHub() {
    if (busy) return;
    setBusy("github");
    setError(null);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const result = await signIn.sso({
      strategy: "oauth_github",
      redirectUrl: redirectTo,
      redirectCallbackUrl: `${origin}/sso-callback`
    });
    if (result.error) {
      setBusy(null);
      setError(humanError(result.error, "Could not start GitHub sign-in."));
    }
    // On success, Clerk navigates away — no further code runs here.
  }

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy("email");
    setError(null);
    const createRes = await signIn.create({ identifier: email.trim() });
    if (createRes.error) {
      setBusy(null);
      setError(humanError(createRes.error, "We couldn't find that account."));
      return;
    }
    const pwRes = await signIn.password({ password });
    if (pwRes.error) {
      setBusy(null);
      setError(humanError(pwRes.error, "Invalid email or password."));
      return;
    }
    const finalRes = await signIn.finalize();
    if (finalRes.error) {
      setBusy(null);
      setError(humanError(finalRes.error, "Couldn't complete sign-in."));
      return;
    }
    router.push(redirectTo);
  }

  return (
    <div className="space-y-4">
      {/* Primary CTA — GitHub OAuth */}
      <button
        type="button"
        onClick={onContinueWithGitHub}
        disabled={!!busy}
        className="btn btn-github w-full justify-center h-11 text-[14px] gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy === "github" ? <Spinner /> : <GhIcon />}
        Continue with GitHub
      </button>

      <div className="relative my-1.5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-bg-border" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-[0.16em]">
          <span className="bg-bg px-3 text-ink-dim">or sign in with email</span>
        </div>
      </div>

      <form onSubmit={onEmailSubmit} className="space-y-3">
        <div>
          <label className="block text-[12px] font-medium text-ink mb-1.5">
            Email
          </label>
          <div className="field-shell">
            <MailIcon />
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@github.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!busy}
            />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <label className="block text-[12px] font-medium text-ink">
              Password
            </label>
          </div>
          <div className="field-shell">
            <LockIcon />
            <input
              type={showPw ? "text" : "password"}
              required
              autoComplete="current-password"
              minLength={8}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!!busy}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="text-ink-dim hover:text-ink shrink-0"
              tabIndex={-1}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {error && (
          <div className="field-error w-full justify-start">
            <ErrIcon /> {error}
          </div>
        )}

        {/* Clerk's CAPTCHA element (invisible — required by Clerk SDK) */}
        <div id="clerk-captcha" />

        <button
          type="submit"
          disabled={!!busy || !email || !password}
          className="btn btn-primary w-full justify-center h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy === "email" ? <Spinner /> : null}
          Sign in
        </button>
      </form>

      <p className="text-center text-[13px] text-ink-mute pt-1">
        New to On-Ramp?{" "}
        <Link
          href={`/sign-up${params.toString() ? `?${params.toString()}` : ""}`}
          className="text-brand-soft hover:text-brand font-medium"
        >
          Create an account →
        </Link>
      </p>
    </div>
  );
}

/* ──────────────────── helpers ──────────────────── */

function humanError(err: unknown, fallback: string): string {
  // Clerk v7 "Signals" API returns ClerkError which can be shaped as
  // `{ message }`, `{ errors: [...] }`, or a plain Error.
  const e = err as {
    errors?: Array<{ longMessage?: string; message?: string }>;
    message?: string;
  };
  return (
    e?.errors?.[0]?.longMessage || e?.errors?.[0]?.message || e?.message || fallback
  );
}

/* ──────────────────── icons ──────────────────── */

function GhIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className="text-ink-dim shrink-0">
      <rect x="1.75" y="3.25" width="12.5" height="9.5" rx="1.5" />
      <path d="m2 4 6 4 6-4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden className="text-ink-dim shrink-0">
      <path d="M4 4v2H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1V4a4 4 0 1 0-8 0Zm6 2H6V4a2 2 0 0 1 4 0v2Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.678 1.367-1.932 2.637-3.023C4.33 2.992 6.019 2 8 2Zm0 1.5C6.46 3.5 5.08 4.27 3.96 5.218 2.85 6.156 2.07 7.214 1.71 7.71c-.05.07-.05.16 0 .23.36.5 1.14 1.55 2.25 2.49C5.08 11.73 6.46 12.5 8 12.5c1.54 0 2.92-.77 4.04-1.718 1.11-.938 1.89-1.996 2.25-2.49a.18.18 0 0 0 0-.23c-.36-.5-1.14-1.55-2.25-2.49C10.92 4.27 9.54 3.5 8 3.5Zm0 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M1.7 3.05a.75.75 0 0 1 1.06 0l11.5 11.5a.75.75 0 1 1-1.06 1.06l-1.91-1.91A8.97 8.97 0 0 1 8 14c-1.98 0-3.67-.99-4.93-2.08C1.8 10.83.88 9.58.43 8.9a1.62 1.62 0 0 1 0-1.8c.31-.46.84-1.16 1.55-1.88L1.7 4.11a.75.75 0 0 1 0-1.06ZM3.95 5.22c-.62.6-1.1 1.2-1.37 1.6a.18.18 0 0 0 0 .23c.36.5 1.14 1.55 2.25 2.49C5.95 10.55 6.95 11.18 8 11.4l-1.27-1.28a2.5 2.5 0 0 1-3.34-3.34L3.95 5.22Zm6.55 4.16a2.5 2.5 0 0 0-2.85-2.85l-1.04-1.04A6.7 6.7 0 0 1 8 4.5c1.54 0 2.92.77 4.04 1.72 1.11.94 1.89 2 2.25 2.49a.18.18 0 0 1 0 .23 11.4 11.4 0 0 1-2.27 2.42L10.5 9.38Z" />
    </svg>
  );
}

function ErrIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden className="shrink-0">
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm.75 4.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 1.5 0ZM8 12a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Z" />
    </svg>
  );
}

export function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
