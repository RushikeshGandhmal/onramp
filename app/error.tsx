"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@sentry/nextjs")
        .then((Sentry) => Sentry.captureException(error))
        .catch(() => {});
    }
    // eslint-disable-next-line no-console
    console.error("[error]", error);
  }, [error]);

  return (
    <main className="min-h-screen grid place-items-center px-6 py-20">
      <div className="max-w-lg w-full text-center">
        <p className="inline-block mb-4 px-3 py-1 rounded-full bg-warn/10 text-warn text-[11px] font-semibold uppercase tracking-wider">
          Something broke
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mb-3">
          We hit a snag loading this page.
        </h1>
        <p className="text-ink-mute mb-6 leading-relaxed">
          We&apos;ve been notified and are looking into it. Most of these are
          transient — try again in a second.
        </p>
        {error.digest && (
          <p className="text-[11px] font-mono text-ink-dim mb-6">
            ref: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={() => reset()} className="btn-primary px-5">
            Try again
          </button>
          <Link href="/" className="btn-ghost px-5">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
