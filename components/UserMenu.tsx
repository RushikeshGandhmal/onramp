"use client";

import Link from "next/link";
import {
  SignInButton,
  UserButton,
  useUser
} from "@clerk/nextjs";

/**
 * Header user pill.
 *
 * - Auth UNCONFIGURED → static "Sign in" link to /sign-in (which itself
 *   renders an unconfigured notice).
 * - Auth CONFIGURED, SIGNED OUT → Clerk's <SignInButton> in modal mode.
 * - Auth CONFIGURED, SIGNED IN  → Clerk's <UserButton> (avatar + dropdown).
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
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-8 w-8 ring-1 ring-bg-border"
          }
        }}
      />
    );
  }

  return (
    <SignInButton mode="modal">
      <button type="button" className="btn btn-ghost text-xs px-3 py-1.5">
        Sign in
      </button>
    </SignInButton>
  );
}
