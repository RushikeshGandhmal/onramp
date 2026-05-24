import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { fetchIssueDetail } from "@/lib/github";
import { parseQuery } from "@/lib/query-parser";
import { rankIssue } from "@/lib/ranker";
import { explainIssue, hasAIConfigured } from "@/lib/ai";

export const dynamic = "force-dynamic";

// Auth gate is enforced by Clerk middleware (middleware.ts).

interface PageProps {
  params: { owner: string; name: string; number: string };
  searchParams: { q?: string };
}

export default async function IssueDetailPage({
  params,
  searchParams
}: PageProps) {
  const numberParsed = Number(params.number);
  if (!Number.isFinite(numberParsed)) notFound();

  const issue = await fetchIssueDetail(params.owner, params.name, numberParsed);
  if (!issue) notFound();

  const q = (searchParams.q || "").trim();
  const parsed = parseQuery(q || `${issue.repo.primaryLanguage} ${issue.repo.category}`);
  const rank = rankIssue(issue, parsed);
  const ai = await explainIssue(issue, parsed, rank, "detail");

  const backHref = q ? `/search?q=${encodeURIComponent(q)}` : "/";

  return (
    <main>
      <Header />

      <section className="mx-auto max-w-4xl px-5 py-8 animate-fade-in">
        <Link
          href={backHref}
          className="text-xs text-ink-dim hover:text-ink-mute inline-flex items-center gap-1"
        >
          ← {q ? "Back to results" : "Back home"}
        </Link>

        {/* ───────── Title block ───────── */}
        <div className="mt-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-ink-mute mb-2">
            <span className="font-medium">
              {issue.repo.owner}/{issue.repo.name}
            </span>
            <span>·</span>
            <span>#{issue.number}</span>
            <span>·</span>
            <span className="text-ink-dim">
              {issue.repo.primaryLanguage}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-snug">
            {issue.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={ai.difficulty} />
            <span className="chip">
              <Clock /> {ai.estimatedEffort}
            </span>
            {issue.labels.slice(0, 6).map((l) => (
              <span key={l} className="chip">
                {l}
              </span>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <a
              href={issue.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary text-sm"
            >
              Open on GitHub <ExternalIcon />
            </a>
            <a
              href={`https://github.com/${issue.repo.owner}/${issue.repo.name}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost text-sm"
            >
              View repository
            </a>
          </div>
        </div>

        {/* ───────── AI explanation ───────── */}
        <div className="space-y-4">
          <Section title="Simple explanation" icon={<BulbIcon />}>
            <p className="text-ink leading-relaxed">{ai.summary}</p>
          </Section>

          <Section title="Why this matches you" icon={<MatchIcon />}>
            <p className="text-ink leading-relaxed">{ai.whyItMatches}</p>
          </Section>

          <Section title="Where to start" icon={<PinIcon />}>
            <ul className="space-y-2">
              {ai.whereToStart.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </Section>

          {ai.beginnerGuidance && ai.beginnerGuidance.length > 0 && (
            <Section title="Beginner guidance" icon={<CompassIcon />}>
              <ol className="space-y-2 list-decimal list-inside marker:text-brand">
                {ai.beginnerGuidance.map((g, i) => (
                  <li key={i} className="text-ink leading-relaxed">
                    {g}
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {ai.technicalTerms && ai.technicalTerms.length > 0 && (
            <Section title="Tech terms, in plain English" icon={<BookIcon />}>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ai.technicalTerms.map((t, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-bg-border bg-bg-soft/40"
                  >
                    <dt className="text-sm font-semibold text-brand-soft">
                      {t.term}
                    </dt>
                    <dd className="text-sm text-ink-mute mt-1">{t.meaning}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}

          {ai.discussionSummary && (
            <Section title="What people are saying" icon={<CommentIcon />}>
              <p className="text-ink leading-relaxed">{ai.discussionSummary}</p>
              {issue.recentComments && issue.recentComments.length > 0 && (
                <details className="mt-3 group">
                  <summary className="text-xs text-ink-dim cursor-pointer hover:text-ink-mute select-none">
                    Show recent comments ({issue.recentComments.length})
                  </summary>
                  <ul className="mt-3 space-y-3">
                    {issue.recentComments.slice(0, 6).map((c, i) => (
                      <li
                        key={i}
                        className="p-3 rounded-lg border border-bg-border bg-bg-soft/40"
                      >
                        <p className="text-xs text-ink-mute mb-1">
                          <span className="font-semibold text-brand-soft">
                            @{c.user}
                          </span>{" "}
                          ·{" "}
                          <span className="text-ink-dim">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </p>
                        <p className="text-sm text-ink-mute line-clamp-5 whitespace-pre-wrap">
                          {c.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </Section>
          )}

          {/* Raw issue body, last */}
          {issue.body && (
            <Section title="Original issue (verbatim)" icon={<DocIcon />}>
              <details>
                <summary className="text-xs text-ink-dim cursor-pointer hover:text-ink-mute select-none">
                  Show original GitHub issue body
                </summary>
                <pre className="mt-3 text-xs text-ink-mute whitespace-pre-wrap break-words font-mono leading-relaxed">
                  {issue.body}
                </pre>
              </details>
            </Section>
          )}
        </div>

        {/* ───────── Footer CTA ───────── */}
        <div className="mt-10 card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold mb-1">Ready to claim this issue?</h3>
            <p className="text-sm text-ink-mute">
              Leave a polite comment on GitHub saying you'd like to take it.
            </p>
          </div>
          <a
            href={issue.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            Open on GitHub <ExternalIcon />
          </a>
        </div>

        <p className="mt-8 text-center text-[11px] text-ink-dim">
          {ai.source === "ai"
            ? "Explanations generated with AI via OpenRouter"
            : hasAIConfigured()
              ? "Heuristic fallback (OpenRouter returned no result)"
              : "Heuristic explanations — set OPENROUTER_API_KEY for richer AI output."}
        </p>
      </section>
    </main>
  );
}

function Section({
  title,
  icon,
  children
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-7 w-7 rounded-md bg-brand/15 text-brand-soft flex items-center justify-center">
          {icon}
        </span>
        <h2 className="text-sm font-semibold tracking-tight uppercase text-ink-mute">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function BulbIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18h6M10 21h4M12 3a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2v.3h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function MatchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12h6m0 0 3-3m-3 3 3 3m4-3h-2m6 0a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m15 9-4 1.5L9.5 14.5 13.5 13 15 9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3-7 3V5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 12a8 8 0 0 1-12.27 6.77L4 20l1.23-4.73A8 8 0 1 1 21 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v6h6"
        stroke="currentColor"
        strokeWidth="1.7"
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
