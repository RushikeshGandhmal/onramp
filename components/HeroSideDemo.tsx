"use client";

import { useEffect, useState } from "react";

/**
 * Hero side animation.
 *
 *  ┌───────────────────────────────┐
 *  │  ▸ One sentence in            │   ← input typing animation
 *  │  ┌─────────────────────────┐  │
 *  │  │ react beginner front…|   │  │
 *  │  └─────────────────────────┘  │
 *  │                               │
 *  │  ↓ A perfect issue out        │   ← AI-explained card materialises
 *  │  ┌─────────────────────────┐  │
 *  │  │ ✨ Title                  │  │
 *  │  │ owner/repo · Easy        │  │
 *  │  │ Plain-English summary…   │  │
 *  │  │ [tag] [tag] [tag]        │  │
 *  │  └─────────────────────────┘  │
 *  └───────────────────────────────┘
 *
 * Cycles through 3 (query → result) scenes. Pure React state machine + CSS.
 */

type Scene = {
  query: string;
  result: {
    title: string;
    repo: string;
    difficulty: "Easy" | "Medium" | "Hard";
    summary: string;
    tags: string[];
    effort: string;
  };
};

const SCENES: Scene[] = [
  {
    query: "react beginner frontend issues",
    result: {
      title: "Add aria-label to icon-only buttons in Toolbar",
      repo: "facebook/react",
      difficulty: "Easy",
      summary:
        "Several icon-only buttons in the Toolbar lack aria-labels. A11y audit flagged it. Likely one-file fix in Toolbar.tsx.",
      tags: ["good first issue", "a11y", "1 file"],
      effort: "~30 min"
    }
  },
  {
    query: "python api beginner issue",
    result: {
      title: "Improve query-param validation error messages",
      repo: "tiangolo/fastapi",
      difficulty: "Easy",
      summary:
        "Current error returns 'value is not a valid integer'. Include the field name. Single-file change in exceptions.py.",
      tags: ["good first issue", "python", "docs"],
      effort: "~45 min"
    }
  },
  {
    query: "typescript bug",
    result: {
      title: "Type narrowing lost inside nested ternary",
      repo: "microsoft/TypeScript",
      difficulty: "Medium",
      summary:
        "Discriminated unions stop narrowing inside nested ternaries when the discriminator is computed. Minimal repro included.",
      tags: ["help wanted", "checker", "narrowing"],
      effort: "~2 hours"
    }
  }
];

type Phase = "typing" | "thinking" | "result" | "out";

export function HeroSideDemo() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const scene = SCENES[sceneIdx];

  // Type the query, character by character.
  useEffect(() => {
    setTyped("");
    setPhase("typing");
    const q = scene.query;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(q.slice(0, i));
      if (i >= q.length) {
        clearInterval(id);
        // Hold a beat, then move to "thinking"
        setTimeout(() => setPhase("thinking"), 350);
      }
    }, 55);
    return () => clearInterval(id);
  }, [sceneIdx, scene.query]);

  // thinking → result → out → next scene
  useEffect(() => {
    if (phase === "thinking") {
      const t = setTimeout(() => setPhase("result"), 650);
      return () => clearTimeout(t);
    }
    if (phase === "result") {
      const t = setTimeout(() => setPhase("out"), 3400);
      return () => clearTimeout(t);
    }
    if (phase === "out") {
      const t = setTimeout(() => {
        setSceneIdx((i) => (i + 1) % SCENES.length);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div
      className="relative w-full"
      aria-hidden
      role="img"
      aria-label="Demo: type a sentence, get a perfect issue."
    >
      {/* card */}
      <div className="card glass relative overflow-hidden p-5 sm:p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
        {/* glow orbs */}
        <div className="pointer-events-none absolute -top-16 -left-16 h-44 w-44 rounded-full bg-brand/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-brand-2/25 blur-3xl" />

        {/* INPUT block */}
        <div className="relative">
          <Caption icon="▸" tone="brand">
            One sentence in
          </Caption>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-bg-border bg-bg-soft/60 px-3.5 py-3 backdrop-blur-sm">
            <Magnifier />
            <div className="font-mono text-sm sm:text-[15px] text-ink flex-1 truncate">
              {typed}
              <span className="inline-block w-[1px] h-[1.05em] align-[-2px] ml-[1px] bg-brand animate-pulse" />
            </div>
          </div>
        </div>

        {/* connecting arrow */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="h-px flex-1 bg-bg-border" />
          <div
            className={`mx-3 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors ${
              phase === "thinking" ? "text-brand-soft" : "text-ink-dim"
            }`}
          >
            {phase === "thinking" ? (
              <>
                <Dots />
                <span>Finding</span>
              </>
            ) : (
              <>
                <DownArrow />
                <span>A perfect issue out</span>
              </>
            )}
          </div>
          <div className="h-px flex-1 bg-bg-border" />
        </div>

        {/* OUTPUT card */}
        <div
          className={`relative transition-all duration-500 ease-out ${
            phase === "result"
              ? "opacity-100 translate-y-0"
              : phase === "out"
              ? "opacity-0 -translate-y-1"
              : "opacity-0 translate-y-2"
          }`}
        >
          <div className="card card-glow ring-1 ring-brand/35 p-4 sm:p-5">
            {/* sparkle + title */}
            <div className="flex items-start gap-2 mb-1">
              <SparkleIcon className="mt-0.5 text-brand-soft" />
              <h3 className="text-[15px] sm:text-base font-semibold tracking-tight leading-snug">
                {scene.result.title}
              </h3>
            </div>
            {/* repo + difficulty */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-dim mb-3">
              <span className="font-mono">{scene.result.repo}</span>
              <span>·</span>
              <span
                className={`chip ${
                  scene.result.difficulty === "Easy"
                    ? "chip-ok"
                    : scene.result.difficulty === "Medium"
                    ? "chip-warn"
                    : "chip-err"
                }`}
              >
                {scene.result.difficulty}
              </span>
              <span className="text-ink-dim">· {scene.result.effort}</span>
            </div>
            {/* summary */}
            <p className="text-sm text-ink-mute leading-relaxed mb-3 line-clamp-3">
              {scene.result.summary}
            </p>
            {/* tags */}
            <div className="flex flex-wrap gap-1.5">
              {scene.result.tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* scene indicator */}
        <div className="mt-5 flex items-center justify-center gap-1.5">
          {SCENES.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === sceneIdx ? "w-6 bg-brand" : "w-1.5 bg-bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* floating mini-badges */}
      <div className="absolute -top-3 -left-3 hidden sm:flex items-center gap-1.5 chip chip-brand shadow-lg shadow-brand/20 animate-fade-in">
        <span className="h-1.5 w-1.5 rounded-full bg-ok shadow-[0_0_6px_currentColor]" />
        Live demo
      </div>
      <div className="absolute -bottom-3 -right-3 hidden sm:inline-flex chip bg-bg-card/90 border-bg-border shadow-lg backdrop-blur animate-fade-in">
        Cycles every ~5s
      </div>
    </div>
  );
}

/* ── icons + small bits ──────────────────────────────────────── */

function Caption({
  icon,
  tone,
  children
}: {
  icon: string;
  tone?: "brand";
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]">
      <span className={tone === "brand" ? "text-brand-soft" : "text-ink-dim"}>
        {icon}
      </span>
      <span className="text-ink-dim">{children}</span>
    </div>
  );
}

function Magnifier() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="text-ink-dim shrink-0"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DownArrow() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14m0 0l-5-5m5 5l5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Dots() {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="h-1 w-1 rounded-full bg-brand-soft animate-[hbeat_1s_ease-in-out_infinite]" />
      <span className="h-1 w-1 rounded-full bg-brand-soft animate-[hbeat_1s_ease-in-out_0.15s_infinite]" />
      <span className="h-1 w-1 rounded-full bg-brand-soft animate-[hbeat_1s_ease-in-out_0.3s_infinite]" />
    </span>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2l1.4 4.6L18 8l-4.6 1.4L12 14l-1.4-4.6L6 8l4.6-1.4L12 2zm6 12l.9 2.6L21.5 18l-2.6.9L18 21.5l-.9-2.6L14.5 18l2.6-.9.9-2.6z" />
    </svg>
  );
}
