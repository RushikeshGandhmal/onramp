/**
 * Reusable GitHub-themed decoration primitives.
 * Used across landing hero, workspace pages, and the auth shell so every
 * surface speaks the same visual language (green-leaning, terminal-flavoured).
 */

import { ContribGraphClient } from "./ContribGraphClient";

/* ────────────────────────────────────────────────────────────────
 *  Backdrop — wraps a section in the GitHub canvas + dot grid +
 *  horizontal scan beam (the exact treatment from AuthShell's left
 *  panel). Drop this anywhere you want the "GitHub workspace" vibe.
 * ──────────────────────────────────────────────────────────────── */
export function GhCanvas({
  children,
  className = "",
  showDots = true,
  showScan = true,
  showRing = false,
  variant = "default"
}: {
  children?: React.ReactNode;
  className?: string;
  showDots?: boolean;
  showScan?: boolean;
  showRing?: boolean;
  variant?: "default" | "soft";
}) {
  return (
    <div
      className={`relative overflow-hidden ${
        variant === "soft" ? "bg-bg-soft/40" : "bg-github"
      } ${className}`}
    >
      {showDots && (
        <div className="absolute inset-0 bg-grid-dots opacity-60" />
      )}
      {showScan && <div className="scanline-h" />}
      {showRing && (
        <div className="absolute inset-0 ring-1 ring-inset ring-[#21262d]/40 pointer-events-none" />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Terminal-style receipt line — the "$ on-ramp find-issue ..." vibe.
 *  Mono, green prompt, blink-caret.
 * ──────────────────────────────────────────────────────────────── */
export function TerminalReceipt({
  command = "on-ramp",
  args,
  flag,
  className = "",
  caret = true
}: {
  command?: string;
  args?: string;
  flag?: string;
  className?: string;
  caret?: boolean;
}) {
  return (
    <p
      className={
        "font-mono text-[11.5px] tracking-tight text-[#7ee787] flex items-center gap-2 " +
        className
      }
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3fb950] shadow-[0_0_8px_currentColor] animate-[pulseGlowGreen_2.6s_ease-out_infinite]" />
      <span>
        <span className="text-[#3fb950]">$</span>{" "}
        <span className="text-[#7ee787]">{command}</span>
        {args && (
          <>
            {" "}
            <span className="text-[#8b949e]">{args}</span>
          </>
        )}
        {flag && (
          <>
            {" "}
            <span className="text-[#79c0ff]">{flag}</span>
          </>
        )}
        {caret && <span className="caret" />}
      </span>
    </p>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Inline `gh-label` pill — green by default (good first issue),
 *  blue for help wanted, purple for enhancement.
 * ──────────────────────────────────────────────────────────────── */
export function GhLabel({
  variant = "good-first",
  children
}: {
  variant?: "good-first" | "help-wanted" | "docs" | "bug" | "enh";
  children: React.ReactNode;
}) {
  return (
    <span className={`gh-label gh-label-${variant}`}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Contribution graph — 52 weeks × 7 days, with animated fill-in.
 *  Used in auth shell left panel, workspace empty state, etc.
 * ──────────────────────────────────────────────────────────────── */
export function ContribGraph({ className = "" }: { className?: string }) {
  return <ContribGraphClient className={className} />;
}
