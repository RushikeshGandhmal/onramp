import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { SignInForm } from "@/components/SignInForm";

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
);

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sign in",
  description: "Sign in to On-Ramp to find your next OSS issue in seconds."
};

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      {clerkConfigured ? <SignInForm /> : <UnconfiguredNotice mode="sign-in" />}
    </AuthShell>
  );
}

function UnconfiguredNotice({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        disabled
        className="btn btn-github w-full justify-center h-11 text-[14px] gap-2.5 opacity-60 cursor-not-allowed"
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
        </svg>
        Continue with GitHub
      </button>

      <div className="rounded-lg border border-warn/30 bg-warn/10 p-3.5">
        <p className="text-[12px] font-semibold text-warn uppercase tracking-[0.14em] mb-1.5">
          {mode === "sign-in" ? "Sign-in" : "Sign-up"} not configured
        </p>
        <p className="text-[12.5px] text-ink-mute leading-relaxed">
          Set{" "}
          <code className="font-mono-tight text-ink">
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
          </code>{" "}
          and{" "}
          <code className="font-mono-tight text-ink">CLERK_SECRET_KEY</code> in{" "}
          <code className="font-mono-tight text-ink">.env.local</code> to
          enable GitHub auth.
        </p>
      </div>

      <Link
        href="/app/search"
        className="btn btn-ghost text-xs w-full justify-center"
      >
        Skip — continue without signing in
      </Link>
    </div>
  );
}
