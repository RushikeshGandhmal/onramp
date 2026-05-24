"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * AuthShell — GitHub-native two-sided auth layout.
 *
 * Vamo-inspired structure (left storytelling panel, right minimal form panel),
 * with the visual language pulled directly from GitHub:
 *   - true GitHub dark canvas (#0d1117) with subtle green & blue glow
 *   - animated contribution-graph (deterministic — same on every load)
 *   - mock "good first issue" card with real GitHub label styling
 *   - octocat mark + monospace receipt-style tagline
 *
 * Right panel stays a clean flat form with the Clerk widget restyled so the
 * "Continue with GitHub" button is unmistakably the hero CTA.
 */

export function AuthShell({
  mode,
  children
}: {
  mode: "sign-in" | "sign-up";
  children: React.ReactNode;
}) {
  const isSignUp = mode === "sign-up";

  return (
    <main className="relative min-h-screen lg:flex">
      {/* ──────────────  LEFT — GitHub canvas  ────────────── */}
      <section className="relative lg:w-1/2 lg:min-h-screen flex flex-col justify-between overflow-hidden bg-github">
        {/* dot grid + scanline + faint border to evoke a code surface */}
        <div className="absolute inset-0 bg-grid-dots opacity-60" />
        <div className="scanline" />
        <div className="absolute inset-0 ring-1 ring-inset ring-[#21262d]/40 pointer-events-none" />

        {/* top bar — looks like a GitHub repo header */}
        <RepoBar />

        {/* center — pitch + contribution graph + mock issue */}
        <div className="relative px-6 sm:px-10 lg:px-14 py-6 lg:py-0 max-w-xl">
          {/* monospace receipt line */}
          <p className="font-mono text-[11px] tracking-tight text-[#7ee787] mb-5 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3fb950] shadow-[0_0_8px_currentColor]" />
            $ on-ramp <span className="text-[#8b949e]">find-issue</span>{" "}
            <span className="text-[#79c0ff]">--for=&quot;you&quot;</span>
          </p>

          <h2 className="text-[2.1rem] sm:text-[2.5rem] lg:text-[2.85rem] leading-[1.05] font-semibold tracking-tight text-[#f0f6fc]">
            Open source needs
            <br />
            <span className="relative inline-block">
              your{" "}
              <span className="bg-gradient-to-r from-[#3fb950] via-[#39d353] to-[#79c0ff] bg-clip-text text-transparent">
                first PR
              </span>
              <span className="text-[#7d8590]">.</span>
            </span>
          </h2>

          <p className="mt-5 text-[15px] text-[#8b949e] leading-relaxed max-w-md">
            We read{" "}
            <span className="font-mono text-[#c9d1d9]">90M+</span>{" "}
            GitHub issues so you don&apos;t have to. Type a sentence — we hand
            back curated{" "}
            <span className="gh-label gh-label-good-first">
              <Dot /> good first issue
            </span>{" "}
            matches with AI explanations.
          </p>

          {/* contribution graph */}
          <div className="mt-9 relative">
            <div className="flex items-center justify-between mb-2 text-[11px] text-[#7d8590]">
              <span className="font-mono">contributions · last year</span>
              <span className="flex items-center gap-1.5">
                Less
                <span className="inline-flex gap-[3px]">
                  {[0, 1, 2, 3, 4].map((l) => (
                    <span
                      key={l}
                      className="cgrid-cell h-2.5 w-2.5"
                      data-l={l}
                    />
                  ))}
                </span>
                More
              </span>
            </div>
            <ContribGraph />
          </div>

          {/* mock issue card — the receipt of what they'll get */}
          <MockIssueCard className="mt-8" />
        </div>

        {/* footer — quiet meta strip */}
        <div className="relative hidden lg:flex items-center justify-between px-14 pb-6 text-[11px] text-[#7d8590] font-mono">
          <span className="inline-flex items-center gap-1.5">
            <LockIcon />
            read-only access · we never push code
          </span>
          <span>v1.0.0</span>
        </div>
      </section>

      {/* ──────────────  RIGHT — form  ────────────── */}
      <section className="relative lg:w-1/2 flex items-center justify-center px-5 sm:px-8 py-10 lg:py-16 bg-bg">
        <div className="w-full max-w-[420px]">
          {/* logo only on mobile (left panel collapses) */}
          <div className="lg:hidden mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2"
              aria-label="On-Ramp home"
            >
              <BrandMark />
              <span className="text-base font-semibold tracking-tight">
                On-Ramp
              </span>
            </Link>
          </div>

          <div className="mb-7">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ok mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-ok shadow-[0_0_6px_currentColor]" />
              {isSignUp ? "Step 1 of 1" : "Welcome back"}
            </span>
            <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-tight leading-tight">
              {isSignUp ? (
                <>
                  Ship your first{" "}
                  <span className="text-gradient-blue">open-source PR</span>.
                </>
              ) : (
                <>
                  Sign in to find your{" "}
                  <span className="text-gradient-blue">next issue</span>.
                </>
              )}
            </h1>
            <p className="mt-2 text-[14px] text-ink-mute leading-snug">
              {isSignUp
                ? "Free forever. We read GitHub — you write the code."
                : "GitHub is the only sign-in we use. We never write to your repos."}
            </p>
          </div>

          {children}

          {/* GitHub-trust footer */}
          <div className="mt-6 flex items-center gap-2.5 text-[11.5px] text-ink-dim">
            <GhMiniIcon />
            <span>
              Authenticated via GitHub OAuth · scopes:{" "}
              <code className="font-mono text-ink-mute">read:user</code>{" "}
              <code className="font-mono text-ink-mute">user:email</code>
            </span>
          </div>

          <p className="mt-5 text-[12px] text-ink-dim leading-relaxed">
            {isSignUp ? "By creating an account" : "By continuing"}, you agree
            to our{" "}
            <Link
              href="/terms"
              className="text-ink-mute hover:text-ink underline-offset-2 hover:underline"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-ink-mute hover:text-ink underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>

          <p className="mt-4 text-[12px] text-ink-dim">
            <Link
              href="/"
              className="hover:text-ink-mute inline-flex items-center gap-1"
            >
              ← Back to homepage
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Left-panel components
 * ──────────────────────────────────────────────────────────────── */

function RepoBar() {
  return (
    <div className="relative px-6 sm:px-10 lg:px-14 pt-6 sm:pt-8">
      <div className="flex items-center justify-between">
        {/* brand mark + breadcrumb-style "repo path" */}
        <Link href="/" className="flex items-center gap-2 group">
          <BrandMark />
          <span className="text-[15px] font-semibold tracking-tight text-[#f0f6fc]">
            On-Ramp
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 text-[12px] font-mono text-[#7d8590]">
            <span className="text-[#30363d]">/</span>
            <span className="text-[#7d8590]">find</span>
            <span className="text-[#30363d]">/</span>
            <span className="text-[#c9d1d9]">your-first-pr</span>
          </span>
        </Link>

        {/* stars / forks counters — Vamo-style social proof */}
        <div className="hidden sm:flex items-center gap-3 text-[11.5px] text-[#7d8590]">
          <span className="inline-flex items-center gap-1.5 font-mono">
            <StarIcon /> 1.2k
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono">
            <ForkIcon /> 89
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono">
            <EyeIcon /> 4.8k
          </span>
        </div>
      </div>
    </div>
  );
}

function ContribGraph() {
  // Hydration-safe: render an empty grid on the server, then animate after mount.
  // 52 weeks × 7 days. Deterministic intensities seeded so the visual stays
  // consistent across reloads but looks "real".
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const cells = buildContribCells();

  return (
    <div
      className="grid gap-[3px] w-full"
      style={{
        gridTemplateColumns: "repeat(52, minmax(0, 1fr))"
      }}
      aria-hidden
    >
      {cells.map((week, wi) => (
        <div key={wi} className="grid gap-[3px]" style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}>
          {week.map((level, di) => (
            <span
              key={di}
              data-l={mounted ? level : 0}
              className="cgrid-cell cgrid-pulse"
              style={
                mounted
                  ? { transitionDelay: `${(wi * 7 + di) * 6}ms` }
                  : undefined
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Generate 52 weeks of contribution levels — deterministic LCG so it's the
 *  same on every render (no SSR mismatch). Looks like a real commit pattern:
 *  weekdays denser, weekends lighter, a couple of "streak" weeks bright. */
function buildContribCells(): number[][] {
  const weeks: number[][] = [];
  let s = 73_249;
  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff);
  for (let w = 0; w < 52; w++) {
    const week: number[] = [];
    // bright "streak" weeks
    const isStreak = w % 9 === 5 || w === 47 || w === 17;
    for (let d = 0; d < 7; d++) {
      const isWeekend = d === 0 || d === 6;
      const r = rand();
      let level: number;
      if (isStreak) level = r > 0.2 ? (r > 0.6 ? 4 : 3) : 2;
      else if (isWeekend) level = r > 0.85 ? 2 : r > 0.6 ? 1 : 0;
      else level = r > 0.85 ? 4 : r > 0.65 ? 3 : r > 0.4 ? 2 : r > 0.2 ? 1 : 0;
      week.push(level);
    }
    weeks.push(week);
  }
  return weeks;
}

function MockIssueCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={
        "relative rounded-xl border border-[#30363d] bg-[#161b22]/90 backdrop-blur-sm shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)] overflow-hidden " +
        className
      }
    >
      {/* fake card chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#30363d] bg-[#0d1117]/60">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] text-[#7d8590]">
          <IssueIcon />
          <span className="text-[#c9d1d9]">facebook/react</span>
          <span className="text-[#30363d]">·</span>
          <span>#28017</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-[#3fb950]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950] shadow-[0_0_6px_currentColor]" />
          Open
        </span>
      </div>

      {/* body */}
      <div className="p-4">
        <p className="text-[13.5px] text-[#f0f6fc] leading-snug font-medium">
          Add{" "}
          <code className="font-mono text-[12px] text-[#79c0ff] bg-[#388bfd1a] px-1 rounded">
            aria-label
          </code>{" "}
          to icon-only buttons in DevTools panel
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="gh-label gh-label-good-first">
            <Dot /> good first issue
          </span>
          <span className="gh-label gh-label-help-wanted">
            <Dot /> help wanted
          </span>
          <span className="gh-label gh-label-docs">
            <Dot /> a11y
          </span>
        </div>

        {/* AI explainer row — what On-Ramp adds */}
        <div className="mt-3.5 pt-3 border-t border-[#30363d] flex items-start gap-2.5">
          <span className="shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-md bg-brand/20 text-brand-soft ring-1 ring-brand/40">
            <SparkleIcon />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.14em] text-brand-soft font-semibold mb-1">
              On-Ramp · AI
            </p>
            <p className="text-[12.5px] text-[#c9d1d9] leading-relaxed">
              Easy · ~30 min · start in{" "}
              <code className="font-mono text-[11.5px] text-[#7ee787]">
                packages/react-devtools-shared/src
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Icons (tiny, inline, GitHub-style)
 * ──────────────────────────────────────────────────────────────── */

function BrandMark() {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#161b22] border border-[#30363d] shadow-[0_4px_18px_-6px_rgba(0,0,0,0.7)] octo-float">
      <Octocat />
    </span>
  );
}

function Octocat() {
  // Compact octocat mark in white — instantly says "GitHub"
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden>
      <path
        fill="#f0f6fc"
        d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  );
}

function Dot() {
  return (
    <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
  );
}

function StarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 .25a.75.75 0 0 1 .67.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.61L7.327.667A.75.75 0 0 1 8 .25Z" />
    </svg>
  );
}

function ForkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h1.5v2.128a2.251 2.251 0 1 0 1.5 0V8.5h1.5a2.25 2.25 0 0 0 2.25-2.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878Zm3.75 7.378a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm3-8.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.678 1.367-1.932 2.637-3.023C4.33 2.992 6.019 2 8 2Zm0 1.5C6.46 3.5 5.08 4.27 3.96 5.218 2.85 6.156 2.07 7.214 1.71 7.71c-.05.07-.05.16 0 .23.36.5 1.14 1.55 2.25 2.49C5.08 11.73 6.46 12.5 8 12.5c1.54 0 2.92-.77 4.04-1.718 1.11-.938 1.89-1.996 2.25-2.49a.18.18 0 0 0 0-.23c-.36-.5-1.14-1.55-2.25-2.49C10.92 4.27 9.54 3.5 8 3.5Zm0 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
    </svg>
  );
}

function IssueIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="#3fb950" aria-hidden>
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm0 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M4 4v2H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1V4a4 4 0 1 0-8 0Zm6 2H6V4a2 2 0 0 1 4 0v2Z" />
    </svg>
  );
}

function GhMiniIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden className="shrink-0">
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2 13.5 8 19 9.5 13.5 11 12 17 10.5 11 5 9.5 10.5 8 12 2Z" />
    </svg>
  );
}
