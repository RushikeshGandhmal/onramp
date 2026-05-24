"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useRef, useEffect } from "react";

const EXAMPLES = [
  "React beginner issues",
  "Python API beginner issue",
  "Frontend issues for TypeScript",
  "Good first issues in Next.js",
  "Documentation issues in Django",
  "Accessibility a11y issues in React",
  "Go backend help wanted",
  "Rust beginner CLI issues"
];

const ROTATING_PLACEHOLDERS = [
  "I know React and want beginner frontend issues",
  "Python API beginner issue",
  "Good first issues in TypeScript",
  "Documentation issues for newcomers",
  "Accessibility issues in popular UI libs",
  "Help wanted in Go backend repos"
];

export function SearchInput({
  initial = "",
  autoFocus = true,
  size = "lg",
  rotating = false
}: {
  initial?: string;
  autoFocus?: boolean;
  size?: "lg" | "md";
  rotating?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const placeholder = useRotatingPlaceholder(rotating && !value);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    startTransition(() => {
      router.push(`/app/search?q=${encodeURIComponent(trimmed)}`);
    });
  }

  return (
    <div className="w-full">
      <div className="relative">
        {/* glow ring behind the input */}
        {size === "lg" && (
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-brand/40 via-ok/30 to-brand/40 opacity-60 blur-xl"
          />
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
          className={
            "relative flex items-center gap-2 rounded-2xl border border-bg-border bg-bg-card/80 backdrop-blur p-2 transition-shadow focus-within:border-brand/70 focus-within:bg-bg-card focus-within:shadow-[0_0_0_3px_rgba(124,92,255,0.25)] " +
            (size === "lg" ? "shadow-2xl shadow-brand/10" : "p-1.5")
          }
        >
          <div className="pl-3 pr-1 text-ink-dim">
            <SearchIcon />
          </div>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className={
              "search-input flex-1 min-w-0 bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none placeholder:text-ink-dim text-ink " +
              (size === "lg" ? "text-base sm:text-lg py-3" : "text-sm py-2")
            }
            aria-label="Describe what you want to work on"
          />
          <button
            type="submit"
            disabled={isPending || !value.trim()}
            className={
              "btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed " +
              (size === "lg" ? "px-5 py-3" : "")
            }
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
      <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setValue(ex);
              submit(ex);
            }}
            className="shrink-0 chip hover:bg-white/10 hover:text-ink transition cursor-pointer"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

function useRotatingPlaceholder(enabled: boolean): string {
  // Typewriter through ROTATING_PLACEHOLDERS while enabled.
  const [text, setText] = useState(ROTATING_PLACEHOLDERS[0]);
  useEffect(() => {
    if (!enabled) return;
    let phraseIdx = 0;
    let charIdx = ROTATING_PLACEHOLDERS[0].length;
    let mode: "deleting" | "typing" | "pausing" = "pausing";
    let pauseUntil = Date.now() + 1800;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      const now = Date.now();
      const phrase = ROTATING_PLACEHOLDERS[phraseIdx];
      if (mode === "pausing") {
        if (now >= pauseUntil) {
          mode = "deleting";
        }
      } else if (mode === "deleting") {
        charIdx = Math.max(0, charIdx - 1);
        if (charIdx === 0) {
          phraseIdx = (phraseIdx + 1) % ROTATING_PLACEHOLDERS.length;
          mode = "typing";
        }
      } else {
        charIdx = Math.min(phrase.length, charIdx + 1);
        if (charIdx === phrase.length) {
          mode = "pausing";
          pauseUntil = now + 1800;
        }
      }
      setText(ROTATING_PLACEHOLDERS[phraseIdx].slice(0, charIdx));
      const next =
        mode === "typing"
          ? 45 + Math.random() * 35
          : mode === "deleting"
            ? 22 + Math.random() * 20
            : 80;
      setTimeout(tick, next);
    };
    const t = setTimeout(tick, 350);
    return () => {
      stopped = true;
      clearTimeout(t);
    };
  }, [enabled]);
  return enabled
    ? text
    : "Tell us what you want to work on… e.g. ‘React beginner frontend issues’";
}

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
