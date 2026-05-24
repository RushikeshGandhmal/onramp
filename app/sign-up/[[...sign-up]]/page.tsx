import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Header } from "@/components/Header";

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
);

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <main>
      <Header />
      <section className="mx-auto max-w-md px-5 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Join On-Ramp
          </h1>
          <p className="text-ink-mute text-sm">
            Free forever. No credit card. Find OSS issues in seconds.
          </p>
        </div>

        {clerkConfigured ? (
          <div className="flex justify-center">
            <SignUp
              signInUrl="/sign-in"
              fallbackRedirectUrl="/search?q=beginner%20issues"
            />
          </div>
        ) : (
          <div className="card p-6 text-center">
            <div className="text-sm font-medium text-ink mb-2">
              Sign-up not configured
            </div>
            <p className="text-xs text-ink-mute leading-relaxed mb-4">
              Set <code className="text-brand">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>
              {" "}and{" "}
              <code className="text-brand">CLERK_SECRET_KEY</code> in{" "}
              <code className="text-ink">.env.local</code> to enable auth.
            </p>
            <Link
              href="/search?q=beginner%20issues"
              className="btn btn-primary text-xs"
            >
              Continue without signing up
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
