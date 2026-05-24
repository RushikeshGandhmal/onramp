"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserMenu } from "./UserMenu";

const authConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
);

const NAV: { label: string; href: string }[] = [
  { label: "Features", href: "/#features" },
  { label: "For you", href: "/#audiences" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Roadmap", href: "/#roadmap" },
  { label: "FAQ", href: "/#faq" }
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <header
      className={
        "sticky top-0 z-40 transition-all duration-300 " +
        (scrolled
          ? "border-b border-bg-border bg-bg/90 backdrop-blur-xl shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)]"
          : "border-b border-transparent bg-bg/60 backdrop-blur-md")
      }
    >
      {/* top hairline scan beam — matches AppTopBar */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ok/35 to-transparent"
      />
      {/* bottom hairline (only when scrolled) */}
      {scrolled && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-bg-border to-transparent"
        />
      )}

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        {/* ─── BRAND ─── */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 shrink-0"
          aria-label="On-Ramp home"
        >
          <BrandMark />
          <span className="flex flex-col leading-none">
            <span className="font-semibold tracking-[-0.01em] text-[15px] text-ink">
              On-Ramp
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 mt-1 font-mono text-[10px] tracking-[0.14em] uppercase text-ink-dim">
              <span className="text-ok">$</span> find-issue
            </span>
          </span>
        </Link>

        {/* ─── DESKTOP NAV ─── */}
        <nav
          className="hidden md:flex items-center gap-0.5 text-[13.5px]"
          aria-label="Primary"
        >
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* ─── RIGHT CLUSTER ─── */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center">
            <UserMenu authConfigured={authConfigured} />
          </div>

          {/* mobile only */}
          <div className="md:hidden flex items-center gap-1.5">
            <Link
              href="/sign-in"
              className="text-[13px] text-ink-mute hover:text-ink px-2.5 py-1.5 rounded-md transition"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-bg-border bg-bg-soft/60 text-ink-mute hover:text-ink hover:bg-bg-soft transition"
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── MOBILE DRAWER ─── */}
      <div
        className={
          "md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out " +
          (open ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0")
        }
      >
        <div className="border-t border-bg-border bg-bg-soft/95 backdrop-blur-xl">
          <nav className="px-3 py-3 space-y-0.5" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] text-ink-mute hover:text-ink hover:bg-white/[0.04] transition"
              >
                <span>{item.label}</span>
                <ArrowIcon />
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-bg-border/70 px-1 space-y-2">
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="block w-full text-center btn btn-ghost text-sm py-2"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className="block w-full text-center btn btn-primary text-sm py-2"
              >
                Get started — free
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────── primitives ─────────────────────────── */

function NavLink({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative inline-flex items-center px-3 py-1.5 rounded-md text-ink-mute hover:text-ink transition-colors group"
    >
      <span>{children}</span>
      <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-ok/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

/**
 * BrandMark — the On-Ramp logo mark.
 *
 * Designed as a refined squircle holding a stylized "on-ramp" curve:
 * a smooth arc that ramps from the lower-left up to the top-right,
 * terminating in a small dot at the merge point. Communicates the brand
 * (entrance/on-ramp to open source) and reads cleanly at any size.
 *
 * Treatment: matte squircle (no heavy shadow), inner highlight ring,
 * subtle green→blue gradient curve, single accent dot.
 */
function BrandMark() {
  return (
    <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-b from-[#1c2430] to-[#0d1117] ring-1 ring-bg-border shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_12px_-4px_rgba(0,0,0,0.6)] transition-transform group-hover:scale-[1.04]">
      {/* faint top highlight */}
      <span
        aria-hidden
        className="absolute inset-x-1 top-px h-px rounded-full bg-white/[0.06]"
      />
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="relative"
      >
        <defs>
          <linearGradient id="brandmark-curve" x1="3" y1="20" x2="21" y2="4" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#58a6ff" />
            <stop offset="0.55" stopColor="#56d364" />
            <stop offset="1" stopColor="#3fb950" />
          </linearGradient>
        </defs>
        {/* on-ramp arc */}
        <path
          d="M4 19 C 9 19, 11 15, 12.5 12 C 14 9, 16 5, 20 5"
          stroke="url(#brandmark-curve)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* merge dot */}
        <circle cx="20" cy="5" r="1.7" fill="#3fb950" />
        <circle cx="20" cy="5" r="3.2" fill="#3fb950" opacity="0.18" />
      </svg>
    </span>
  );
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

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 17 17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ink-dim"
      />
    </svg>
  );
}

/* ─────────────────────────── back-compat ─────────────────────────── */

/**
 * Logo — standalone SVG version of the brand mark, used in places that
 * just want the glyph without the squircle frame (e.g. footer, OG image).
 */
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient
          id="logo-g"
          x1="3"
          y1="20"
          x2="21"
          y2="4"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#58a6ff" />
          <stop offset="0.55" stopColor="#56d364" />
          <stop offset="1" stopColor="#3fb950" />
        </linearGradient>
      </defs>
      <path
        d="M4 19 C 9 19, 11 15, 12.5 12 C 14 9, 16 5, 20 5"
        stroke="url(#logo-g)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="20" cy="5" r="1.7" fill="#3fb950" />
    </svg>
  );
}
