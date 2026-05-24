"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppIssueError({
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
    console.error("[app-issue-error]", error);
  }, [error]);

  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <div className="card p-8">
        <p className="inline-block mb-3 px-2.5 py-1 rounded-full bg-warn/10 text-warn text-[11px] font-semibold uppercase tracking-wider">
          Couldn&apos;t load issue
        </p>
        <h1 className="text-2xl font-semibold mb-2">
          We couldn&apos;t fetch that issue from GitHub.
        </h1>
        <p className="text-ink-mute mb-5 leading-relaxed">
          The issue might have been moved, deleted, or GitHub is briefly
          unavailable. You can retry, or open it directly on GitHub.
        </p>
        {error.digest && (
          <p className="text-[11px] font-mono text-ink-dim mb-5">
            ref: {error.digest}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => reset()} className="btn-primary px-5">
            Retry
          </button>
          <Link href="/app/search" className="btn-ghost px-5">
            Back to search
          </Link>
        </div>
      </div>
    </section>
  );
}
