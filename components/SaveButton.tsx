"use client";

import { useState, useTransition } from "react";
import { toggleSaveAction, type ToggleSaveInput } from "@/app/actions/saved";

/**
 * Bookmark toggle with optimistic UI.
 *
 * Renders nothing destructive when persistence is unavailable — the action
 * simply returns ok:false and we revert. Two visual variants:
 *   - "icon"  → compact bookmark glyph (issue cards)
 *   - "full"  → labelled button (detail view)
 */
export function SaveButton({
  input,
  initialSaved,
  variant = "icon",
  className = ""
}: {
  input: ToggleSaveInput;
  initialSaved: boolean;
  variant?: "icon" | "full";
  className?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  function onToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    const prev = saved;
    setSaved(!prev); // optimistic
    startTransition(async () => {
      const res = await toggleSaveAction(input, prev);
      setSaved(res.ok ? res.saved : prev);
    });
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save issue"}
        className={`btn ${saved ? "btn-primary" : "btn-ghost"} ${
          pending ? "opacity-70" : ""
        } ${className}`}
      >
        <BookmarkIcon filled={saved} />
        {saved ? "Saved" : "Save issue"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save issue"}
      title={saved ? "Saved — click to remove" : "Save for later"}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
        saved
          ? "border-brand/50 bg-brand/15 text-brand-soft"
          : "border-bg-border bg-bg-soft/60 text-ink-dim hover:text-ink hover:border-ink-dim"
      } ${pending ? "opacity-70" : ""} ${className}`}
    >
      <BookmarkIcon filled={saved} />
    </button>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
