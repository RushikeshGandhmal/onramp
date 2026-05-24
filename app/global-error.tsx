"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to Sentry if configured (lazy import so no hard dep at build time).
    if (typeof window !== "undefined") {
      import("@sentry/nextjs")
        .then((Sentry) => Sentry.captureException(error))
        .catch(() => {});
    }
    // eslint-disable-next-line no-console
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0a0a0f",
          color: "#e8e8f0",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem"
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <p
            style={{
              display: "inline-block",
              padding: "0.25rem 0.75rem",
              borderRadius: 999,
              background: "rgba(239,68,68,0.15)",
              color: "#fca5a5",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.4,
              textTransform: "uppercase",
              marginBottom: 16
            }}
          >
            Something broke
          </p>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              margin: "0 0 12px",
              letterSpacing: -0.5
            }}
          >
            On-Ramp hit an unexpected error.
          </h1>
          <p style={{ color: "#9ca3af", margin: "0 0 24px", lineHeight: 1.55 }}>
            We&apos;ve been notified. You can retry — most errors are transient.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: 11,
                color: "#6b7280",
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                margin: "0 0 24px"
              }}
            >
              ref: {error.digest}
            </p>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => reset()}
              style={{
                padding: "0.6rem 1.1rem",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "linear-gradient(135deg,#3fb950,#58a6ff)",
                color: "white",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                padding: "0.6rem 1.1rem",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#e8e8f0",
                textDecoration: "none",
                fontWeight: 600
              }}
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
