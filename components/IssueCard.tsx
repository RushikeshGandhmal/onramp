import Link from "next/link";
import type { RankedIssue } from "@/lib/types";
import { DifficultyBadge } from "./DifficultyBadge";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function IssueCard({ issue }: { issue: RankedIssue }) {
  const detailHref = `/app/issues/${issue.repo.owner}/${issue.repo.name}/${issue.number}?q=`;
  return (
    <article className="card group p-5 animate-slide-up">
      <header className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-ink-mute">
            <RepoIcon />
            <span className="truncate font-medium">
              {issue.repo.owner}/{issue.repo.name}
            </span>
            <span className="text-ink-dim">·</span>
            <span className="text-ink-dim" title={issue.updatedAt}>
              updated {relativeTime(issue.updatedAt)}
            </span>
          </div>
          <Link href={detailHref} className="block mt-1">
            <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-ink group-hover:text-brand-soft line-clamp-2">
              {issue.title}
            </h3>
          </Link>
        </div>
        <DifficultyBadge difficulty={issue.ai.difficulty} />
      </header>

      <p className="text-sm text-ink-mute leading-relaxed line-clamp-3 mb-3">
        {issue.ai.summary}
      </p>

      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {issue.tags.slice(0, 4).map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
        <span className="chip">
          <Clock /> {issue.ai.estimatedEffort}
        </span>
        {issue.comments > 0 && (
          <span className="chip">
            <CommentIcon /> {issue.comments}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-bg-border">
        <p className="text-xs text-ink-dim line-clamp-1">
          <span className="text-ink-mute">Why:</span> {issue.ai.whyItMatches}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={detailHref} className="btn btn-ghost text-xs">
            Explain
          </Link>
          <a
            href={issue.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary text-xs"
          >
            Open <ExternalIcon />
          </a>
        </div>
      </div>
    </article>
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

function Clock() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 12a8 8 0 0 1-12.27 6.77L4 20l1.23-4.73A8 8 0 1 1 21 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 4h6v6M10 14 20 4M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
