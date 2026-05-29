import Link from "next/link";
import { Suspense } from "react";
import { ensureUser, getUserId } from "@/lib/user";
import { getProfile } from "@/lib/profile";
import { getPersonalizationSignals } from "@/lib/personalization";
import { getContributionSummary } from "@/lib/contributions";
import { buildSkillUnderstanding, persistInferredFocus } from "@/lib/skills";
import { listSavedIssues } from "@/lib/saved";
import { SearchInput } from "@/components/SearchInput";

export const dynamic = "force-dynamic";

// Suggested starter prompts, biased by inferred focus when we have one.
function suggestionsFor(focus: string | null, topLangs: string[]): string[] {
  const lang = topLangs[0];
  const base: string[] = [];
  if (focus?.startsWith("frontend")) {
    base.push("React beginner frontend issues", "Accessibility a11y issues", "CSS / UI good first issues");
  } else if (focus?.startsWith("backend")) {
    base.push("Backend API beginner issues", "Database / query help wanted", "Go backend good first issues");
  } else if (focus?.startsWith("documentation")) {
    base.push("Documentation issues for newcomers", "README / docs good first issues", "Typo & wording fixes");
  } else if (focus?.startsWith("ML") || focus?.startsWith("data")) {
    base.push("Python data beginner issues", "ML library good first issues", "Notebook / docs improvements");
  } else {
    base.push("Beginner-friendly good first issues", "Help wanted in popular repos", "Documentation issues for newcomers");
  }
  if (lang) base.unshift(`${lang} beginner issues`);
  return Array.from(new Set(base)).slice(0, 4);
}

export default async function AppHome() {
  // Guarantees the mirror user row exists; degrades gracefully otherwise.
  const user = await ensureUser();
  const userId = user?.id ?? (await getUserId());

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-7 max-w-6xl mx-auto w-full">
      <Suspense fallback={<DashboardSkeleton greeting={firstName(user?.name)} />}>
        {/* The data-heavy section streams in; the search box renders instantly. */}
        <Dashboard userId={userId} greeting={firstName(user?.name)} login={user?.githubLogin ?? null} />
      </Suspense>
    </div>
  );
}

function firstName(name: string | null | undefined): string {
  if (!name) return "there";
  return name.split(" ")[0] || "there";
}

async function Dashboard({
  userId,
  greeting,
  login
}: {
  userId: string | null;
  greeting: string;
  login: string | null;
}) {
  // Load profile + signals + contributions in parallel. All degrade gracefully.
  const profile = userId ? await getProfile(userId) : null;
  const [signals, contributions] = await Promise.all([
    getPersonalizationSignals(userId, profile),
    getContributionSummary(userId, login)
  ]);

  const skill = buildSkillUnderstanding(signals, profile, contributions);
  // Best-effort: persist the inferred focus so other surfaces can read it cheaply.
  if (userId && skill.focus !== (profile?.inferredFocus ?? null)) {
    void persistInferredFocus(userId, skill.focus, profile?.inferredFocus ?? null);
  }

  const saved = userId ? await listSavedIssues(userId) : [];
  const suggestions = suggestionsFor(skill.focus, skill.topLanguages);
  const needsProfile = !profile?.onboarded;

  return (
    <>
      {/* Hero / search */}
      <div className="mb-7">
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.01em] mb-1.5">
          {greeting === "there" ? "Welcome back" : `Welcome back, ${greeting}`}
          <span className="text-ok">.</span>
        </h1>
        <p className="text-ink-mute text-[15px] mb-5">
          {skill.confident && skill.focus ? (
            <>
              You look <span className="text-ink font-medium">{skill.focus}</span>. Here&apos;s where to start today.
            </>
          ) : (
            <>Describe what you want to work on — we&apos;ll find the right issue in seconds.</>
          )}
        </p>
        <SearchInput autoFocus={false} size="lg" rotating />
      </div>

      {/* Personalized strip */}
      <div className="grid gap-4 md:grid-cols-3 mb-7">
        <SkillCard skill={skill} />
        <SavedCard count={saved.length} recent={saved.slice(0, 3)} />
        <ContributionsCard contributions={contributions} login={login} />
      </div>

      {/* Suggested for you */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-dim">
            {skill.confident ? "Suggested for you" : "Popular starting points"}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <Link
              key={s}
              href={`/app/search?q=${encodeURIComponent(s)}`}
              className="chip hover:bg-white/10 hover:text-ink transition"
            >
              {s}
            </Link>
          ))}
        </div>
      </section>

      {/* Profile nudge */}
      {needsProfile && (
        <Link
          href="/app/profile"
          className="block rounded-xl border border-ok/25 bg-gradient-to-br from-ok/[0.10] to-transparent p-4 hover:border-ok/40 transition group"
        >
          <p className="text-[13px] font-semibold text-ok mb-0.5">
            Personalize your recommendations →
          </p>
          <p className="text-[13px] text-ink-mute">
            Tell us your preferred technologies and skill level. Takes 30 seconds and makes every search sharper.
          </p>
        </Link>
      )}
    </>
  );
}

/* ───────────── cards ───────────── */

function SkillCard({
  skill
}: {
  skill: ReturnType<typeof buildSkillUnderstanding>;
}) {
  return (
    <div className="card p-4">
      <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink-dim mb-2">
        Your focus
      </p>
      {skill.focus ? (
        <p className="text-[17px] font-semibold text-ink mb-1 capitalize">
          {skill.focus}
        </p>
      ) : (
        <p className="text-[15px] text-ink-mute mb-1">Still learning your style</p>
      )}
      <p className="text-[12px] text-ink-dim mb-2.5 capitalize">{skill.comfort}</p>
      {skill.topLanguages.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skill.topLanguages.slice(0, 4).map((l) => (
            <span key={l} className="chip text-[11px] capitalize">
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SavedCard({
  count,
  recent
}: {
  count: number;
  recent: { issueKey: string; title: string; owner: string; name: string; number: number }[];
}) {
  return (
    <Link href="/app/saved" className="card p-4 hover:border-brand/40 transition group block">
      <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink-dim mb-2">
        Saved issues
      </p>
      <p className="text-[17px] font-semibold text-ink mb-1">
        {count} {count === 1 ? "issue" : "issues"}
      </p>
      {recent.length > 0 ? (
        <ul className="mt-1.5 space-y-1">
          {recent.map((r) => (
            <li key={r.issueKey} className="text-[12px] text-ink-mute truncate">
              <span className="text-ink-dim font-mono">{r.owner}/{r.name}</span> {r.title}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12px] text-ink-dim">Bookmark issues to revisit them here.</p>
      )}
    </Link>
  );
}

function ContributionsCard({
  contributions,
  login
}: {
  contributions: Awaited<ReturnType<typeof getContributionSummary>>;
  login: string | null;
}) {
  if (!contributions.available) {
    return (
      <div className="card p-4">
        <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink-dim mb-2">
          Contributions
        </p>
        <p className="text-[13px] text-ink-mute">
          {login
            ? "Sync unavailable right now."
            : "Sign in with GitHub to see your contribution activity."}
        </p>
      </div>
    );
  }
  return (
    <div className="card p-4">
      <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink-dim mb-2">
        Contributions
      </p>
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-[17px] font-semibold text-ok">
          {contributions.mergedPrCount}
        </span>
        <span className="text-[12px] text-ink-mute">merged PRs</span>
      </div>
      <p className="text-[12px] text-ink-dim">
        {contributions.openPrCount} open · {contributions.topLanguages.slice(0, 3).join(", ") || "—"}
      </p>
    </div>
  );
}

function DashboardSkeleton({ greeting }: { greeting: string }) {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.01em] mb-1.5">
          {greeting === "there" ? "Welcome back" : `Welcome back, ${greeting}`}
          <span className="text-ok">.</span>
        </h1>
        <p className="text-ink-mute text-[15px] mb-5">
          Describe what you want to work on — we&apos;ll find the right issue in seconds.
        </p>
        <SearchInput autoFocus={false} size="lg" rotating />
      </div>
      <div className="grid gap-4 md:grid-cols-3 mb-7">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="h-3 w-20 bg-white/5 rounded mb-3" />
            <div className="h-5 w-28 bg-white/5 rounded mb-2" />
            <div className="h-3 w-24 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </>
  );
}
