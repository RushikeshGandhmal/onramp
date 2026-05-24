"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animated marketing demo: shows the rotating user prompt being "typed",
 * the search button pulsing, then a result card sliding in. Pure CSS +
 * JS state, no network calls.
 */
const PROMPTS = [
  {
    query: "React beginner issues",
    result: {
      repo: "vercel/next.js",
      title: "Add helpful error when using useRouter outside of <Router>",
      summary:
        "A common confusion for newcomers — let's surface a friendly error message instead of a silent crash.",
      difficulty: "Easy",
      tags: ["good first issue", "typescript", "30–60 mins"]
    }
  },
  {
    query: "Python API beginner issue",
    result: {
      repo: "tiangolo/fastapi",
      title: "Improve docs example for path parameter validation",
      summary:
        "Polish the documentation example so the validation rules are clearer for newcomers learning FastAPI.",
      difficulty: "Easy",
      tags: ["good first issue", "docs", "30 mins"]
    }
  },
  {
    query: "Accessibility issues in React UI",
    result: {
      repo: "mui/material-ui",
      title: "Tooltip should be focusable via keyboard",
      summary:
        "Tooltips currently miss keyboard focus, breaking the a11y promise. Add focus handlers and ARIA attrs.",
      difficulty: "Medium",
      tags: ["a11y", "help wanted", "2 hours"]
    }
  }
];

export function MockSearchDemo() {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "thinking" | "result">("typing");
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = false;
    let phraseChar = 0;
    let inThinking = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (stoppedRef.current) return;
      const prompt = PROMPTS[idx].query;
      if (phase === "typing") {
        phraseChar++;
        setTyped(prompt.slice(0, phraseChar));
        if (phraseChar >= prompt.length) {
          setPhase("thinking");
          timer = setTimeout(tick, 600);
          return;
        }
        timer = setTimeout(tick, 55 + Math.random() * 30);
      } else if (phase === "thinking") {
        inThinking++;
        if (inThinking > 6) {
          setPhase("result");
          timer = setTimeout(tick, 3200);
          return;
        }
        timer = setTimeout(tick, 200);
      } else {
        // result → advance
        setTyped("");
        setPhase("typing");
        setIdx((i) => (i + 1) % PROMPTS.length);
      }
    };
    timer = setTimeout(tick, 350);
    return () => {
      stoppedRef.current = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, phase]);

  const current = PROMPTS[idx];

  return (
    <div className="relative">
      {/* terminal-style chrome */}
      <div className="rounded-2xl border border-bg-border bg-gradient-to-b from-bg-card to-bg-soft overflow-hidden shadow-2xl shadow-brand/10">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-bg-border bg-black/30">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5e6c]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffb454]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#3ecf8e]/70" />
          <span className="ml-3 text-[11px] text-ink-dim font-mono">
            on-ramp.dev / search
          </span>
        </div>

        {/* input row */}
        <div className="p-5">
          <div className="flex items-center gap-2 rounded-xl border border-bg-border bg-black/30 px-3 py-2.5">
            <span className="text-ink-dim">
              <SearchIcon />
            </span>
            <span className="text-sm sm:text-base text-ink font-medium">
              {typed}
              {phase === "typing" && <span className="cursor-blink" />}
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-ink-dim">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  phase === "thinking"
                    ? "bg-warn animate-pulse"
                    : phase === "result"
                      ? "bg-ok"
                      : "bg-brand animate-pulse"
                }`}
              />
              {phase === "typing"
                ? "Listening…"
                : phase === "thinking"
                  ? "Matching repos…"
                  : "Ready"}
            </span>
          </div>

          {/* result card area */}
          <div className="mt-4 min-h-[210px]">
            {phase === "result" && (
              <div className="animate-slide-up rounded-xl border border-bg-border bg-bg-card p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 text-xs text-ink-mute">
                    <RepoIcon />
                    <span className="font-medium">{current.result.repo}</span>
                    <span className="text-ink-dim">· just now</span>
                  </div>
                  <span
                    className={`chip ${
                      current.result.difficulty === "Easy"
                        ? "chip-ok"
                        : current.result.difficulty === "Medium"
                          ? "chip-warn"
                          : "chip-err"
                    }`}
                  >
                    {current.result.difficulty}
                  </span>
                </div>
                <h4 className="text-[15px] font-semibold leading-snug mb-1.5 text-ink">
                  {current.result.title}
                </h4>
                <p className="text-sm text-ink-mute leading-relaxed mb-3">
                  {current.result.summary}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {current.result.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {phase === "thinking" && (
              <div className="animate-fade-in space-y-2">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-5/6" />
                <div className="flex gap-2 pt-2">
                  <div className="skeleton h-5 w-20 rounded-full" />
                  <div className="skeleton h-5 w-16 rounded-full" />
                  <div className="skeleton h-5 w-24 rounded-full" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* floating "10s" callout */}
      <div className="absolute -top-3 -right-3 hidden sm:block">
        <div className="rounded-full bg-gradient-to-br from-brand to-ok px-3 py-1 text-[11px] font-bold text-white shadow-lg animate-float">
          ~10 seconds
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function RepoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 6h6M8 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
