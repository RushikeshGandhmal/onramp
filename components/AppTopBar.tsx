"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

export function AppTopBar({
  title,
  subtitle
}: {
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname() || "";
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-derive title from path when not passed
  const computed = title || derivedTitle(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-bg-border bg-bg/85 backdrop-blur-xl overflow-hidden">
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ok/40 to-transparent scanline pointer-events-none" />
      <div className="relative flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-bg-border text-ink-mute hover:text-ink hover:bg-white/[0.04]"
            aria-label="Toggle navigation"
          >
            <MenuIcon />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-ink-dim flex items-center gap-1.5">
              <span className="text-ok">$</span>
              <span>on-ramp</span>
              <span className="text-ink-dim/60">/</span>
              <span className="text-ink-mute">{subtitle || crumb(pathname)}</span>
            </p>
            <h1 className="text-[15px] font-semibold tracking-tight truncate">
              {computed}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/status"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-ink-mute hover:text-ink"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-ok shadow-[0_0_6px_currentColor]" />
            All systems normal
          </Link>
          {clerkConfigured ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 ring-1 ring-bg-border"
                }
              }}
            />
          ) : (
            <Link
              href="/sign-in"
              className="btn btn-primary text-xs"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && <MobileDrawer onClose={() => setMobileOpen(false)} />}
    </header>
  );
}

function MobileDrawer({ onClose }: { onClose: () => void }) {
  const items: { label: string; href: string; disabled?: boolean }[] = [
    { label: "Home", href: "/app" },
    { label: "Find issues", href: "/app/search" },
    { label: "Saved issues", href: "/app/saved" },
    { label: "Profile", href: "/app/profile" },
    { label: "Status", href: "/status" },
    { label: "Landing page", href: "/" }
  ];
  return (
    <div className="md:hidden border-t border-bg-border bg-bg-soft/95 backdrop-blur-xl">
      <nav className="px-3 py-2">
        {items.map((it) =>
          it.disabled ? (
            <div
              key={it.label}
              className="flex items-center justify-between px-3 py-2.5 text-sm text-ink-dim"
            >
              <span>{it.label}</span>
              <span className="text-[9px] uppercase tracking-[0.12em]">Soon</span>
            </div>
          ) : (
            <Link
              key={it.label}
              href={it.href}
              onClick={onClose}
              className="block px-3 py-2.5 rounded-lg text-sm text-ink-mute hover:text-ink hover:bg-white/[0.04]"
            >
              {it.label}
            </Link>
          )
        )}
      </nav>
    </div>
  );
}

function derivedTitle(path: string): string {
  if (path.startsWith("/app/issues/")) return "Issue detail";
  if (path.startsWith("/app/search")) return "Find issues";
  if (path.startsWith("/app/saved")) return "Saved issues";
  if (path.startsWith("/app/profile")) return "Profile";
  if (path === "/app") return "Home";
  if (path.startsWith("/app")) return "Workspace";
  return "On-Ramp";
}

function crumb(path: string): string {
  if (path.startsWith("/app/issues/")) return "issue";
  if (path.startsWith("/app/search")) return "find-issue";
  if (path.startsWith("/app/saved")) return "saved";
  if (path.startsWith("/app/profile")) return "profile";
  if (path === "/app") return "home";
  if (path.startsWith("/app")) return "workspace";
  return "home";
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
