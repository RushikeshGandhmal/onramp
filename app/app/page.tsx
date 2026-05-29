import Link from "next/link";
import { Suspense } from "react";
import { SearchInput } from "@/components/SearchInput";
import { ensureUser, getUserId } from "@/lib/user";
import { getProfile } from "@/lib/profile";
import {
  getPersonalizationSignals,
  inferFocus
} from "@/lib/personalization";
import { getContributionSummary } from "@/lib/contributions";
import { buildSkillUnderstanding, persistInferredFocus } from "@/lib/skills";
import { listSavedIssues } from "@/lib/saved";
import type { SavedIssue } from "@/lib/types";

export const dynamic = "force-dynamic";

// The workspace home — a calm, personalized launchpad.
// Everything degrades gracefully: signed out, no DB, or no signal all render
// a clean "just search" experience without errors.
export default function AppHome() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}

async function Dashboard() {
  const user = await ensureUser();
  const userId = user?.id ?? (await getUserId());

  // No identity (DB-less / signed-out edge): show the bare search.
  if (!userId) {
    return (
      <>
        <Greeting name={null} />
        <div className="mt-6">
          <SearchInput autoFocus size="lg" rotating />
        </div>
      </>
    );
  }

  // Load everything in parallel; each call is independently graceful.
  const profile = await getProfile(userId);
  const [signals, contributions, saved] = await Promise.all([
    getPersonalizationSignals(userId, profile),
    getContributionSummary(userId, user?.githubLogin ?? null),
    listSavedIssues(userId)
  ]);

  const skill = buildSkillUnderstanding(signals, profile, contributions);

  // Best-effort: persist a freshly inferred focus so other surfaces can read it
  // cheaply. Only writes when it actually changed. Never blocks the render.
  const freshFocus = inferFocus(signals, profile);
  void persistInferredFocus(userId, freshFocus, profile.inferredFocus);

  const firstName =
    user?.name?.split(" ")[0] || user?.githubLogin || null;

  const suggestions = buildSuggestions(skill, profile);

  return (
    <>
      <Greeting name={firstName} />

      {/* Primary action — always front and center */}
      <div className="mt-6">
        <SearchInput autoFocus size="lg" rotating />
      </div>

      {/* Personalized hints */}
      {suggestions.length > 0 && (
        <section className="mt-8">
          <SectionLabel>Picked for you</SectionLabel>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <Link
                key={s.q}
                href={`/app/search?q=${encodeURIComponent(s.q)}`}
                className="chip chip-brand hover:bg-brand/20 transition cursor-pointer"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {/* Skill understanding */}
        {skill.confident && (
          <SkillCard
            focus={skill.focus}
            comfort={skill.comfort}
            topLanguages={skill.topLanguages}
            strengths={skill.strengths}
          />
        )}

        {/* Contribution summary */}
        {contributions.available && (
          <ContributionCard
            mergedPrCount={contributions.mergedPrCount}
            openPrCount={contributions.openPrCount}
            recent={contributions.recentMergedPrs}
            login={contributions.login}
          />
        )}
      </div>

      {/* Saved issues preview */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <SectionLabel>Saved issues</SectionLabel>
          {saved.length > 0 && (
            <Link
              href="/app/saved"
              className="text-[12px] text-ink-mute hover:text-ink"
            >
              View all ({saved.length}) →
            </Link>
          )}
        </div>
        {saved.length === 0 ? (
          <EmptySaved />
        ) : (
          <div className="mt-3 space-y-2">
            {saved.slice(0, 4).map((s) => (
              <SavedPreviewRow key={s.id} issue={s} />
            ))}
          </div>
        )}
      </section>

      {/* Gentle profile nudge if they haven't set preferences */}
      {!profile.onboarded && (
        <section className="mt-8">
          <Link
            href="/app/profile"
            className="block rounded-xl border border-bg-border bg-bg-soft/50 p-4 hover:border-ok/40 transition group"
          >
            <p className="text-sm font-medium text-ink flex items-center gap-2">
              <span className="text-ok">●</span>
              Tell us what you like
              <span className="text-ink-dim group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </p>
            <p className="mt-1 text-[13px] text-ink-mute">
              Set your languages and skill level so recommendations get sharper.
              Takes 30 seconds.
            </p>
          </Link>
        </section>
      )}
    </>
  );
}

/* ───────────────────────── pieces ───────────────────────── */

function Greeting({ name }: { name: string | null }) {
  const hour = new Date().getHours();
  const part =
    hour < 5
      ? "Still up"
      : hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";
  return (
    <div>
      <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink-dim">
        $ on-ramp / home
      </p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
        {part}
        {name ? (
          <>
            , <span className="text-gradient-green">{name}</span>
          </>
        ) : null}
        .
      </h1>
      <p className="mt-2 text-[15px] text-ink-mute">
        What do you want to work on today? Describe it in a sentence.
      </p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-dim">
      {children}
    </p>
  );
}

function SkillCard({
  focus,
  comfort,
  topLanguages,
  strengths
}: {
  focus: string | null;
  comfort: string;
  topLanguages: string[];
  strengths: string[];
}) {
  return (
    <div className="card p-5">
      <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink-dim mb-3">
        Your profile (inferred)
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {focus && <span className="chip chip-ok capitalize">{focus}</span>}
        <span className="chip">{comfort}</span>
      </div>
      {topLanguages.length > 0 && (
        <div className="mt-4">
          <p className="text-[12px] text-ink-dim mb-1.5">Top languages</p>
          <div className="flex flex-wrap gap-1.5">
            {topLanguages.slice(0, 5).map((l) => (
              <span key={l} className="chip text-[11px] capitalize">
                {l}
              </span>
            ))}
          </div>
        </div>
      )}
      {strengths.length > 0 && (
        <p className="mt-4 text-[12px] text-ink-mute leading-relaxed">
          {strengths.join(" · ")}
        </p>
      )}
      <p className="mt-3 text-[11px] text-ink-dim">
        Based on what you save and view. The more you use On-Ramp, the sharper
        this gets.
      </p>
    </div>
  );
}

function ContributionCard({
  mergedPrCount,
  openPrCount,
  recent,
  login
}: {
  mergedPrCount: number;
  openPrCount: number;
  recent: { title: string; repo: string; url: string; mergedAt: string | null }[];
  login: string;
}) {
  return (
    <div className="card p-5">
      <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink-dim mb-3">
        Your GitHub activity
      </p>
      <div className="flex items-baseline gap-5">
        <div>
          <span className="text-2xl font-semibold text-ok">
            {mergedPrCount}
          </span>
          <span className="ml-1.5 text-[12px] text-ink-mute">merged PRs</span>
        </div>
        <div>
          <span className="text-2xl font-semibold text-ink">{openPrCount}</span>
          <span className="ml-1.5 text-[12px] text-ink-mute">open</span>
        </div>
      </div>
      {recent.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {recent.slice(0, 3).map((p) => (
            <a
              key={p.url}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[12.5px] text-ink-mute hover:text-ink truncate"
            >
              <span className="text-ink-dim font-mono text-[11px]">
                {p.repo}
              </span>{" "}
              {p.title}
            </a>
          ))}
        </div>
      )}
      <a
        href={`https://github.com/${login}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-[11px] text-ink-dim hover:text-ink"
      >
        @{login} on GitHub →
      </a>
    </div>
  );
}

function SavedPreviewRow({ issue }: { issue: SavedIssue }) {
  return (
    <Link
      href={`/app/issues/${issue.owner}/${issue.name}/${issue.number}`}
      className="block rounded-lg border border-bg-border bg-bg-soft/40 px-4 py-3 hover:border-ok/40 transition"
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-ink-dim shrink-0">
          {issue.owner}/{issue.name}
        </span>
        {issue.difficulty && (
          <span className="chip text-[10px] capitalize">{issue.difficulty}</span>
        )}
      </div>
      <p className="mt-1 text-[13.5px] text-ink truncate">{issue.title}</p>
    </Link>
  );
}

function EmptySaved() {
  return (
    <div className="mt-3 rounded-xl border border-dashed border-bg-border p-6 text-center">
      <p className="text-[13px] text-ink-mute">
        No saved issues yet. Bookmark issues from search to revisit them here.
      </p>
      <Link href="/app/search" className="mt-3 inline-flex btn btn-ghost text-xs">
        Find your first issue →
      </Link>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-56 rounded bg-bg-soft" />
      <div className="mt-3 h-4 w-72 rounded bg-bg-soft" />
      <div className="mt-6 h-16 w-full rounded-2xl bg-bg-soft" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="h-40 rounded-xl bg-bg-soft" />
        <div className="h-40 rounded-xl bg-bg-soft" />
      </div>
    </div>
  );
}

/* ───────────────────────── suggestions ───────────────────────── */

interface Suggestion {
  q: string;
  label: string;
}

function buildSuggestions(
  skill: { focus: string | null; topLanguages: string[]; comfort: string },
  profile: {
    skillLevel: string;
    preferredCategories: string[];
    preferredTechnologies: string[];
  }
): Suggestion[] {
  const out: Suggestion[] = [];
  const seen = new Set<string>();
  const add = (q: string, label: string) => {
    const key = q.toLowerCase();
    if (seen.has(key) || out.length >= 5) return;
    seen.add(key);
    out.push({ q, label });
  };

  const level =
    profile.skillLevel && profile.skillLevel !== "any"
      ? profile.skillLevel
      : skill.comfort === "experienced"
        ? ""
        : "beginner";

  const focusCat = (skill.focus || "").replace(/-.*/, ""); // "frontend-focused" → "frontend"

  // Language-driven
  for (const lang of skill.topLanguages.slice(0, 2)) {
    const q = [lang, level, focusCat || "", "issues"].filter(Boolean).join(" ");
    add(q, titleCase(q));
  }

  // Preferred technologies
  for (const tech of profile.preferredTechnologies.slice(0, 2)) {
    const q = [tech, level, "good first issues"].filter(Boolean).join(" ");
    add(q, titleCase(q));
  }

  // Category-driven
  for (const cat of profile.preferredCategories.slice(0, 1)) {
    if (cat === "any") continue;
    const q = [level, cat, "issues"].filter(Boolean).join(" ");
    add(q, titleCase(q));
  }

  // Sensible defaults when we know little
  add("React beginner frontend issues", "React beginner frontend");
  add("Python API beginner issue", "Python API beginner");
  add("Good first issues in TypeScript", "TypeScript good first");
  add("Documentation issues for newcomers", "Docs for newcomers");

  return out.slice(0, 5);
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
