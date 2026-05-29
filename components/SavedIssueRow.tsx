"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  updateSavedStatusAction,
  toggleSaveAction
} from "@/app/actions/saved";
import type { SavedIssue } from "@/lib/types";

const STATUSES: { value: SavedIssue["status"]; label: string }[] = [
  { value: "saved", label: "Saved" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" }
];

const STATUS_STYLES: Record<SavedIssue["status"], string> = {
  saved: "chip",
  in_progress: "chip chip-brand",
  done: "chip chip-ok"
};

export function SavedIssueRow({ issue }: { issue: SavedIssue }) {
  const [status, setStatus] = useState<SavedIssue["status"]>(issue.status);
  const [removed, setRemoved] = useState(false);
  const [pending, startTransition] = useTransition();

  if (removed) return null;

  function changeStatus(next: SavedIssue["status"]) {
    const prev = status;
    setStatus(next);
    startTransition(async () => {
      const r = await updateSavedStatusAction(issue.issueKey, next);
      if (!r.ok) setStatus(prev);
    });
  }

  function remove() {
    setRemoved(true);
    startTransition(async () => {
      const r = await toggleSaveAction(
        {
          owner: issue.owner,
          name: issue.name,
          number: issue.number,
          title: issue.title,
          htmlUrl: issue.htmlUrl,
          repoLanguage: issue.repoLanguage,
          category: issue.category,
          difficulty: issue.difficulty,
          labels: issue.labels,
          tags: issue.tags,
          aiSummary: issue.aiSummary
        },
        true
      );
      if (!r.ok) setRemoved(false);
    });
  }

  const detailHref = `/app/issues/${issue.owner}/${issue.name}/${issue.number}`;

  return (
    <div
      className={`card p-4 sm:p-5 transition ${pending ? "opacity-70" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-ink-dim font-mono truncate">
            {issue.owner}/{issue.name} · #{issue.number}
          </p>
          <Link
            href={detailHref}
            className="block mt-1 font-semibold leading-snug hover:text-brand-soft transition line-clamp-2"
          >
            {issue.title}
          </Link>
        </div>
        <span className={STATUS_STYLES[status]}>
          {STATUSES.find((s) => s.value === status)?.label}
        </span>
      </div>

      {issue.aiSummary && (
        <p className="mt-2 text-sm text-ink-mute line-clamp-2">
          {issue.aiSummary}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {issue.repoLanguage && <span className="chip">{issue.repoLanguage}</span>}
        {issue.difficulty && (
          <span className="chip capitalize">{issue.difficulty}</span>
        )}
        {issue.tags.slice(0, 3).map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-bg-border pt-3">
        <div className="flex items-center gap-1">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => changeStatus(s.value)}
              disabled={pending}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                status === s.value
                  ? "bg-brand/15 text-brand-soft"
                  : "text-ink-dim hover:text-ink hover:bg-white/5"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={issue.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-ink-dim hover:text-ink transition"
          >
            GitHub ↗
          </a>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-xs text-ink-dim hover:text-err transition"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
