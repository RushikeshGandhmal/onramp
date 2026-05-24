"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

/**
 * Header user pill.
 *
 * - Auth UNCONFIGURED → static "Sign in" link to /sign-in (which itself
 *   renders an unconfigured notice).
 * - Auth CONFIGURED, SIGNED OUT → Link to /sign-in (the dedicated split page,
 *   NOT a modal — modals are anti-pattern for marketing→auth handoffs).
 * - Auth CONFIGURED, SIGNED IN  → "Open app" CTA + UserButton (avatar dropdown).
 */
export function UserMenu({ authConfigured }: { authConfigured: boolean }) {
  if (!authConfigured) {
    return (
      <Link href="/sign-in" className="btn btn-ghost text-xs px-3 py-1.5">
        Sign in
      </Link>
    );
  }
  return <AuthedMenu />;
}

function AuthedMenu() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    // tiny placeholder so the header layout doesn't shift on hydrate
    return <div className="h-8 w-16" aria-hidden />;
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-2.5">
        <Link href="/app/search" className="btn btn-primary text-xs">
          Open app
        </Link>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 ring-1 ring-bg-border"
            }
          }}
        />
      </div>
    );
  }

  return (
    <Link href="/sign-in" className="btn btn-ghost text-xs px-3 py-1.5">
      Sign in
    </Link>
  );
}
