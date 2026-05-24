"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * HeroChat — the centrepiece of the landing page.
 *
 * IDLE state:   auto-types a query into the input → "submits" → result
 *               card materialises below → fades out → next scene.
 *               Cycles through 3 scenes forever.
 *
 * ACTIVE state: triggered as soon as the user focuses or types in the
 *               input. The auto-typing halts, the input clears, the
 *               user can write their own sentence. On submit we push
 *               to /search — which (with Clerk configured) middleware
 *               redirects to /sign-in.
 *
 * One component, one chat box, real input, integrated demo.
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
        "Several icon-only buttons lack aria-labels. A11y audit flagged it. Likely a one-file fix in Toolbar.tsx.",
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
        "Error returns 'value is not a valid integer'. Should include the field name. Single-file change in exceptions.py.",
      tags: ["good first issue", "python", "docs"],
      effort: "~45 min"
    }
  },
  {
    query: "typescript bug help wanted",
    result: {
      title: "Type narrowing lost inside nested ternary",
      repo: "microsoft/TypeScript",
      difficulty: "Medium",
      summary:
        "Discriminated unions stop narrowing inside nested ternaries when the discriminator is computed. Repro included.",
      tags: ["help wanted", "checker", "narrowing"],
      effort: "~2 hours"
    }
  }
];

const EXAMPLES = [
  "React beginner issues",
  "Python API beginner issue",
  "Frontend issues for TypeScript",
  "Good first issues in Next.js",
  "Accessibility issues in React",
  "Go backend help wanted"
];

type Phase = "typing" | "thinking" | "result" | "out";

export function HeroChat() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Demo state machine
  const [sceneIdx, setSceneIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");

  // The actual value in the input. While idle, the demo writes here.
  // When the user takes over, we set `userActive=true` and stop touching it.
  const [value, setValue] = useState("");
  const [userActive, setUserActive] = useState(false);

  const scene = SCENES[sceneIdx];

  /** Take control away from the demo as soon as the user interacts. */
  function activate() {
    if (userActive) return;
    setUserActive(true);
    setValue("");
  }

  // ─── DEMO STATE MACHINE ─────────────────────────────────────────
  // typing → thinking → result (linger) → out → next scene
  useEffect(() => {
    if (userActive) return;
    if (phase !== "typing") return;
    setValue("");
    const q = scene.query;
    let i = 0;
    const id = setInterval(() => {
      if (userActive) {
        clearInterval(id);
        return;
      }
      i += 1;
      setValue(q.slice(0, i));
      if (i >= q.length) {
        clearInterval(id);
        setTimeout(() => {
          if (!userActive) setPhase("thinking");
        }, 400);
      }
    }, 55);
    return () => clearInterval(id);
  }, [sceneIdx, phase, scene.query, userActive]);

  useEffect(() => {
    if (userActive) return;
    if (phase === "thinking") {
      const t = setTimeout(() => setPhase("result"), 700);
      return () => clearTimeout(t);
    }
    if (phase === "result") {
      const t = setTimeout(() => setPhase("out"), 3600);
      return () => clearTimeout(t);
    }
    if (phase === "out") {
      const t = setTimeout(() => {
        setSceneIdx((i) => (i + 1) % SCENES.length);
        setPhase("typing");
      }, 550);
      return () => clearTimeout(t);
    }
  }, [phase, userActive]);

  // ─── REAL SUBMIT ────────────────────────────────────────────────
  function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setUserActive(true);
    startTransition(() => {
      router.push(`/app/search?q=${encodeURIComponent(trimmed)}`);
    });
  }

  // Show the result preview only while the demo is "live" (idle).
  const showPreview = !userActive;
  const previewVisible =
    showPreview && (phase === "result" || phase === "thinking");
  const previewLeaving = showPreview && phase === "out";

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* ─── chat input ──────────────────────────────────────── */}
      <div className="relative">
        {/* glow ring */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-brand/40 via-ok/30 to-brand/40 opacity-60 blur-xl"
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
          className="relative flex items-center gap-2 rounded-2xl border border-bg-border bg-bg-card/80 backdrop-blur p-2 shadow-2xl shadow-brand/10 transition-all focus-within:border-brand/70 focus-within:bg-bg-card focus-within:shadow-[0_0_0_3px_rgba(124,92,255,0.25)]"
        >
          <div className="pl-3 pr-1 text-ink-dim">
            <SearchIcon />
          </div>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              activate();
              setValue(e.target.value);
            }}
            onFocus={() => {
              // Only deactivate the demo if the user genuinely focuses
              // (clicks/tabs in). Auto-focus doesn't fire onFocus from
              // programmatic setValue.
              activate();
            }}
            onKeyDown={() => activate()}
            placeholder={
              userActive
                ? "Tell us what you want to work on…"
                : "Try typing your own sentence…"
            }
            aria-label="Describe what you want to work on"
            className="search-input flex-1 min-w-0 bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none placeholder:text-ink-dim text-ink text-base sm:text-lg py-3"
            // Crucial: don't autofocus, otherwise the demo never runs.
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={isPending || !value.trim()}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3"
          >
            {isPending ? (
              <>
                <Spinner /> Searching
              </>
            ) : (
              <>
                Find issues <ArrowRight />
              </>
            )}
          </button>
        </form>
      </div>

      {/* example chips */}
      <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              activate();
              setValue(ex);
              submit(ex);
            }}
            className="shrink-0 chip hover:bg-white/10 hover:text-ink transition cursor-pointer"
          >
            {ex}
          </button>
        ))}
      </div>

      {/* ─── live result preview (idle demo only) ────────────── */}
      <div
        className="relative mt-6 h-[260px] sm:h-[230px]"
        aria-hidden
      >
        {/* "thinking" indicator */}
        <div
          className={`absolute inset-x-0 top-0 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] transition-opacity duration-300 ${
            showPreview && phase === "thinking"
              ? "opacity-100"
              : "opacity-0"
          }`}
        >
          <Dots />
          <span className="text-brand-soft">Finding the right issue…</span>
        </div>

        {/* result card */}
        <div
          className={`absolute inset-x-0 top-6 transition-all duration-500 ease-out ${
            previewVisible
              ? "opacity-100 translate-y-0"
              : previewLeaving
              ? "opacity-0 -translate-y-1"
              : "opacity-0 translate-y-2"
          }`}
        >
          <div className="card card-glow ring-1 ring-brand/30 p-5 text-left">
            <div className="flex items-start gap-2 mb-1.5">
              <SparkleIcon className="mt-0.5 text-brand-soft" />
              <h3 className="text-[15px] sm:text-base font-semibold tracking-tight leading-snug">
                {scene.result.title}
              </h3>
            </div>
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
              <span>· {scene.result.effort}</span>
            </div>
            <p className="text-sm text-ink-mute leading-relaxed mb-3 line-clamp-2">
              {scene.result.summary}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {scene.result.tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* "type your own" hint when user has taken over */}
        <div
          className={`absolute inset-x-0 top-6 text-center transition-opacity duration-300 ${
            userActive ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="inline-flex items-center gap-2 chip">
            <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_6px_currentColor]" />
            Press Enter to find your issue
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── icons ─────────────────────────────────────────────────── */

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14m0 0-5-5m5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
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

function Dots() {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-soft animate-[hbeat_1s_ease-in-out_infinite]" />
      <span className="h-1.5 w-1.5 rounded-full bg-brand-soft animate-[hbeat_1s_ease-in-out_0.15s_infinite]" />
      <span className="h-1.5 w-1.5 rounded-full bg-brand-soft animate-[hbeat_1s_ease-in-out_0.3s_infinite]" />
    </span>
  );
}
