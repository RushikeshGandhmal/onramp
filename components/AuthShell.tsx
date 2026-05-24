"use client";

import Link from "next/link";

/**
 * AuthShell — the shared two-sided layout for /sign-in and /sign-up.
 *
 * Inspiration: Linear, Vercel, Resend, Cal.com — split layout where the left
 * panel sells the product visually and the right panel hosts the auth form
 * on a clean dark card.
 *
 * Layout:
 *   ┌────────────────────┬────────────────────┐
 *   │  Brand / pitch     │  Clerk widget      │
 *   │  testimonials      │  on flat dark card │
 *   │  meshy gradient    │                    │
 *   └────────────────────┴────────────────────┘
 *
 * On <md screens, stacks: brand panel becomes a small header above the form.
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
      {/* ────────────────────  LEFT (brand)  ──────────────────── */}
      <section className="relative lg:w-1/2 lg:min-h-screen flex flex-col justify-between overflow-hidden">
        {/* layered bg */}
        <div className="absolute inset-0 -z-20 bg-meshy" />
        <div className="absolute inset-0 -z-10 bg-grid opacity-40" />
        <div className="bg-mesh-noise -z-10" />
        <div className="orb orb-a -top-32 -left-32 h-96 w-96" />
        <div className="orb orb-b bottom-20 right-0 h-72 w-72" />

        {/* top: brand */}
        <div className="relative px-6 sm:px-12 pt-7 sm:pt-9">
          <Link
            href="/"
            className="inline-flex items-center gap-2 group"
            aria-label="On-Ramp home"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand/60 shadow-[0_8px_24px_-6px_rgba(124,92,255,0.6)] transition-transform group-hover:scale-105">
              <Bolt />
            </span>
            <span className="text-base font-semibold tracking-tight">
              On-Ramp
            </span>
          </Link>
        </div>

        {/* middle: pitch + bullets */}
        <div className="relative px-6 sm:px-12 py-10 lg:py-0 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-bg-border bg-white/[0.04] backdrop-blur px-3 py-1 text-[10.5px] uppercase tracking-[0.16em] text-brand-soft mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_6px_currentColor]" />
            Free forever · No credit card
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.65rem] leading-tight font-semibold tracking-tight">
            From a sentence to the
            <br />
            <span className="text-gradient-blue">perfect issue</span>
            <span className="text-ink-mute">.</span>
            <br />
            In 10 seconds.
          </h2>
          <p className="mt-5 text-[15px] text-ink-mute leading-relaxed max-w-md">
            Type what you want to work on. On-Ramp hands you ranked, beginner-friendly
            open-source issues — with AI explanations that make sense.
          </p>

          <ul className="mt-7 space-y-3.5 max-w-md">
            <Bullet>Natural-language search across <strong>54+ curated repos</strong></Bullet>
            <Bullet>AI explains every issue: difficulty, effort, where to start</Bullet>
            <Bullet>Filters out stale or assigned issues automatically</Bullet>
            <Bullet>Bring your own repo — point us at <code className="text-brand-soft">any</code> GitHub project</Bullet>
          </ul>

          {/* social proof */}
          <figure className="mt-9 hidden lg:block max-w-md">
            <blockquote className="text-[14.5px] text-ink-mute leading-relaxed italic">
              "I used to spend an hour scrolling labels. On-Ramp gave me three
              good issues in 30 seconds, all with context I'd normally have to
              read 50 comments to get."
            </blockquote>
            <figcaption className="mt-3 flex items-center gap-2.5 text-[12px] text-ink-dim">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand/50 to-ok/40 text-white font-semibold text-[11px]">
                MK
              </span>
              <span>
                <span className="text-ink">Maya K.</span> · Frontend dev · First OSS PR last week
              </span>
            </figcaption>
          </figure>
        </div>

        {/* bottom: tiny stats */}
        <div className="relative hidden lg:block px-6 sm:px-12 pb-8">
          <div className="flex items-center gap-7 text-xs">
            <Stat n="10s" label="To find an issue" />
            <Stat n={<><span className="line-through text-ink-dim">60min</span></>} label="The old way" />
            <Stat n="54+" label="Curated repos" />
          </div>
        </div>
      </section>

      {/* ────────────────────  RIGHT (auth form)  ──────────────────── */}
      <section className="relative lg:w-1/2 flex items-center justify-center px-5 sm:px-8 py-10 lg:py-16 bg-bg">
        <div className="w-full max-w-[420px]">
          <div className="mb-7">
            <h1 className="text-[26px] sm:text-[28px] font-semibold tracking-tight">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-1.5 text-[14px] text-ink-mute">
              {isSignUp
                ? "Free forever. No credit card needed."
                : "Sign in to find your next open-source issue."}
            </p>
          </div>

          {children}

          <p className="mt-6 text-[12px] text-ink-dim leading-relaxed">
            {isSignUp ? "By creating an account" : "By continuing"}, you agree to our{" "}
            <Link href="/terms" className="text-ink-mute hover:text-ink underline-offset-2 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-ink-mute hover:text-ink underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          {/* small footer link */}
          <p className="mt-4 text-[12px] text-ink-dim">
            <Link href="/" className="hover:text-ink-mute inline-flex items-center gap-1">
              ← Back to homepage
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[14px] text-ink">
      <span className="mt-[3px] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand/15 ring-1 ring-brand/30">
        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="m3 8 3 3 7-7" stroke="#7c5cff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="leading-snug text-ink-mute">{children}</span>
    </li>
  );
}

function Stat({ n, label }: { n: React.ReactNode; label: string }) {
  return (
    <div>
      <div className="text-base font-semibold text-ink">{n}</div>
      <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-dim mt-0.5">
        {label}
      </div>
    </div>
  );
}

function Bolt() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="white" />
    </svg>
  );
}
