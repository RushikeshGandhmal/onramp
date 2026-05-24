import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/AuthShell";

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
      {clerkConfigured ? (
        <SignIn
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/app/search"
          forceRedirectUrl="/app/search"
        />
      ) : (
        <UnconfiguredNotice mode="sign-in" />
      )}
    </AuthShell>
  );
}

function UnconfiguredNotice({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <div className="card p-6">
      <div className="text-sm font-medium text-ink mb-2">
        {mode === "sign-in" ? "Sign-in" : "Sign-up"} not configured
      </div>
      <p className="text-[12.5px] text-ink-mute leading-relaxed mb-4">
        Set <code className="text-brand">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
        and <code className="text-brand">CLERK_SECRET_KEY</code> in{" "}
        <code className="text-ink">.env.local</code> to enable auth.
      </p>
      <Link href="/app/search" className="btn btn-primary text-xs w-full justify-center">
        Continue without signing in
      </Link>
    </div>
  );
}
