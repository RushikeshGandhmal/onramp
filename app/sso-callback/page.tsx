import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * OAuth round-trip landing page.
 *
 * Clerk's `authenticateWithRedirect` sends the user here after they come back
 * from the OAuth provider (GitHub). This component finalises the session and
 * forwards them to `redirectUrlComplete` (the original `/app/search?q=...`).
 */
export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="flex items-center gap-3 text-ink-mute text-sm font-mono">
        <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
        Finishing sign-in…
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
