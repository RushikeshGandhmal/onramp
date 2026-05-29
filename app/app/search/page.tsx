import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { SearchInput } from "@/components/SearchInput";
import { IssueCard } from "@/components/IssueCard";
import { ResultsSkeleton } from "@/components/Skeletons";
import { parseQuery } from "@/lib/query-parser";
import { fetchIssues } from "@/lib/github";
import { rankAndFilter } from "@/lib/ranker";
import { computeIntelligence } from "@/lib/intelligence";
import { explainIssuesBatch, hasAIConfigured } from "@/lib/ai";
import { rateLimit, clientIdFromHeaders } from "@/lib/rate-limit";
import { cached } from "@/lib/cache";
import type { RankedIssue, SearchResponse } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Auth gate enforced by Clerk middleware on /app/*.

export default async function AppSearchPage({
  searchParams
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q || "").trim();

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-brand-soft mb-2">
          Find issues
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1">
          What do you want to work on?
        </h1>
        <p className="text-sm text-ink-mute">
          Type one sentence. We'll find ranked open-source issues with AI
          explanations.
        </p>
      </div>

      <SearchInput initial={q} autoFocus={!q} size="md" />

      <Suspense
        key={q}
        fallback={
          <div className="mt-8">
            <SearchStatusBar query={q} loading />
            <ResultsSkeleton count={6} />
          </div>
        }
      >
        <Results q={q} />
      </Suspense>
    </main>
  );
}

async function Results({ q }: { q: string }) {
  if (!q) {
    return <NoQueryHint />;
  }

  // ── per-IP rate limit ─────────────────────────────────────────
  const clientId = clientIdFromHeaders(headers());
  const rl = await rateLimit(clientId, { namespace: "search" });
  if (!rl.ok) {
    const secs = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
    return (
      <section className="mt-10">
        <div className="card p-8 max-w-lg mx-auto text-center">
          <p className="inline-block mb-3 px-2.5 py-1 rounded-full bg-warn/10 text-warn text-[11px] font-semibold uppercase tracking-wider">
            Slow down
          </p>
          <h2 className="text-xl font-semibold mb-2">
            You&apos;re searching faster than we can fetch.
          </h2>
          <p className="text-ink-mute mb-4">
            Limit is {rl.limit} searches per minute per visitor. Try again in
            ~{secs}s.
          </p>
        </div>
      </section>
    );
  }

  const response = await runSearch(q);

  return (
    <section className="mt-8">
      <SearchStatusBar
        query={q}
        parsed={response.query}
        count={response.issues.length}
        meta={response.meta}
      />

      {response.meta.notice && (
        <div className="card p-4 mb-4 border-brand/40 text-sm text-ink-mute">
          {response.meta.notice}
        </div>
      )}

      {response.issues.length === 0 ? (
        <EmptyState
          query={q}
          resolvedRepos={response.meta.resolvedRepos}
          hadHints={response.query.repoHints.length > 0}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {response.issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </section>
  );
}

async function runSearch(q: string): Promise<SearchResponse> {
  const cacheKey = `search:${q.toLowerCase().trim().replace(/\s+/g, " ")}`;
  return cached(cacheKey, 60_000, async () => {
    const parsed = parseQuery(q);
    const { issues, rateLimited, notice, resolvedRepos } = await fetchIssues(parsed);
    const ranked = rankAndFilter(issues, parsed, 12);

    const aiExplanations = await explainIssuesBatch(
      ranked.map((r) => ({
        issue: r,
        rank: {
          score: r.score,
          reasons: r.reasons,
          tags: r.tags,
          difficulty: r.difficulty,
          estimatedEffort: r.estimatedEffort
        }
      })),
      parsed
    );

    const finalIssues: RankedIssue[] = ranked.map((r, i) => ({
      ...r,
      ai: aiExplanations[i],
      intelligence: computeIntelligence(r)
    }));

    return {
      query: parsed,
      issues: finalIssues,
      fetchedAt: new Date().toISOString(),
      meta: {
        repoCount: new Set(
          finalIssues.map((i) => `${i.repo.owner}/${i.repo.name}`)
        ).size,
        candidateCount: issues.length,
        usedAI:
          hasAIConfigured() && finalIssues.some((i) => i.ai.source === "ai"),
        rateLimited,
        notice,
        resolvedRepos
      }
    };
  });
}

function NoQueryHint() {
  const prompts = [
    "React beginner frontend issues",
    "Python API beginner issue",
    "Frontend issues for TypeScript",
    "Good first issues in Next.js",
    "Accessibility a11y issues in React",
    "Go backend help wanted",
    "Rust beginner CLI issues"
  ];
  return (
    <section className="mt-10">
      <div className="text-center max-w-xl mx-auto mb-6">
        <h2 className="text-lg font-semibold mb-2">
          Try one of these to get started
        </h2>
        <p className="text-sm text-ink-mute">
          Click any prompt below, or type your own sentence above.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {prompts.map((p) => (
          <Link
            key={p}
            href={`/app/search?q=${encodeURIComponent(p)}`}
            className="chip hover:bg-white/10 hover:text-ink transition"
          >
            {p}
          </Link>
        ))}
      </div>
    </section>
  );
}

function SearchStatusBar({
  query,
  parsed,
  count,
  loading,
  meta
}: {
  query: string;
  parsed?: SearchResponse["query"];
  count?: number;
  loading?: boolean;
  meta?: SearchResponse["meta"];
}) {
  const resolved = meta?.resolvedRepos || [];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="min-w-0">
        <p className="text-xs text-ink-dim">Results for</p>
        <h2 className="text-lg font-semibold tracking-tight truncate">
          “{query}”
        </h2>
        {(parsed || resolved.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {resolved.map((r) => (
              <span key={r} className="chip chip-brand">
                repo: {r}
              </span>
            ))}
            {parsed?.skillLevel !== "any" && parsed && (
              <span className="chip chip-brand">level: {parsed.skillLevel}</span>
            )}
            {parsed?.category !== "any" && parsed && (
              <span className="chip">category: {parsed.category}</span>
            )}
            {parsed?.languages.map((l) => (
              <span key={l} className="chip">
                {l}
              </span>
            ))}
            {parsed?.technologies.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
            {parsed?.intents.map((i) => (
              <span key={i} className="chip">
                intent: {i}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="text-xs text-ink-dim text-right shrink-0">
        {loading ? (
          <span>Searching GitHub…</span>
        ) : (
          <>
            <p>
              {count} match{count === 1 ? "" : "es"} from {meta?.repoCount} repo
              {meta?.repoCount === 1 ? "" : "s"}
              {resolved.length > 0 && (
                <span className="text-ink-mute"> · user-named</span>
              )}
            </p>
            <p className="mt-0.5">
              {meta?.usedAI ? (
                <span className="text-ok">AI explanations on</span>
              ) : (
                <span>Heuristic explanations</span>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  query,
  resolvedRepos,
  hadHints
}: {
  query: string;
  resolvedRepos?: string[];
  hadHints?: boolean;
}) {
  const hitUnresolvedRepo = hadHints && (!resolvedRepos || resolvedRepos.length === 0);
  return (
    <div className="card p-10 text-center">
      <h2 className="text-xl font-semibold mb-2">
        {hitUnresolvedRepo
          ? `Couldn't find that repo on GitHub`
          : `No fresh matches for “${query}”`}
      </h2>
      <p className="text-ink-mute mb-6">
        {hitUnresolvedRepo
          ? `We couldn't resolve the repo you mentioned. Try the full \`owner/repo\` form, e.g. "vercel/swr beginner issues".`
          : resolvedRepos && resolvedRepos.length > 0
          ? `No matching open issues in ${resolvedRepos.join(", ")}. Try removing constraints like "beginner" or "frontend".`
          : `Try a slightly different phrasing, or pick a related topic below.`}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {[
          "good first issues react",
          "typescript beginner frontend",
          "python docs issues",
          "go backend help wanted",
          "accessibility a11y"
        ].map((s) => (
          <Link
            key={s}
            href={`/app/search?q=${encodeURIComponent(s)}`}
            className="chip hover:bg-white/10 hover:text-ink transition cursor-pointer"
          >
            {s}
          </Link>
        ))}
      </div>
    </div>
  );
}
