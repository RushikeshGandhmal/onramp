/**
 * Site-wide environment helpers.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://on-ramp.dev";

export const SITE_NAME = "On-Ramp";

export const SITE_TAGLINE = "From idle scroll to first PR in 10 seconds";

export const SITE_DESCRIPTION =
  "On-Ramp is the fastest way into open source. Type what you want to work on in plain English. We surface high-quality GitHub issues, explain them simply, and tell you exactly where to start.";

export function hasSentry(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
}
