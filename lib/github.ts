import { CURATED_REPOS, reposByCategory, reposByLanguage } from "./repos";
import type { ParsedQuery, RawIssue, RepoMeta } from "./types";

const GITHUB_API = "https://api.github.com";

interface GhSearchItem {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: string;
  created_at: string;
  updated_at: string;
  comments: number;
  labels: { name: string }[];
  assignees: { login: string }[];
  author_association?: string;
  repository_url: string;
  pull_request?: object;
}

function authHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "on-ramp-mvp"
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Whether a GITHUB_TOKEN is currently configured. Useful for UX hints. */
export function hasGithubToken(): boolean {
  return Boolean(process.env.GITHUB_TOKEN);
}

/** Tiny in-process memo so we don't keep hammering GitHub after a 403. */
let rateLimitedUntil = 0;
function isProbablyRateLimited(): boolean {
  return Date.now() < rateLimitedUntil;
}
function markRateLimited(resetEpochSeconds?: number) {
  // Default lockout: 20s (Search API resets per minute, so don't punish too long).
  // If GitHub gave us a reset, honour it (capped at 2 minutes so a stale cache
  // can never block users for long).
  const fallback = Date.now() + 20_000;
  if (resetEpochSeconds && Number.isFinite(resetEpochSeconds)) {
    const ms = resetEpochSeconds * 1000;
    rateLimitedUntil = Math.min(ms, Date.now() + 120_000);
  } else {
    rateLimitedUntil = fallback;
  }
}
function rateLimitNotice(): string {
  const remainingSec = Math.max(
    0,
    Math.round((rateLimitedUntil - Date.now()) / 1000)
  );
  const mins = Math.ceil(remainingSec / 60);
  const tokenHint = hasGithubToken()
    ? "Your GITHUB_TOKEN is set but the limit was still hit — likely the Search-API per-minute cap (30/min). Wait a minute and retry."
    : "Add a GITHUB_TOKEN to .env.local for 5000 req/hr (60/hr without one). Restart `npm run dev` after adding.";
  return `GitHub rate limit reached. ${tokenHint} Cleared in ~${mins} min.`;
}

function repoToMeta(url: string): { owner: string; name: string } | null {
  // repository_url looks like https://api.github.com/repos/{owner}/{name}
  const m = url.match(/repos\/([^/]+)\/([^/]+)$/);
  if (!m) return null;
  return { owner: m[1], name: m[2] };
}

/* -------------------------------------------------------------------------
 * Dynamic repo resolution
 *
 * The MVP started with a curated list, but real users will name ANY repo:
 *   "issues in vercel/swr"
 *   "react-hook-form bugs"
 *   "https://github.com/vitejs/vite"
 *
 * `resolveRepoHints` takes the parsed hints and returns concrete RepoMeta
 * objects fetched from GitHub. Results are memoised in-process for 10 min so
 * we don't burn rate-limit on repeat searches.
 * ------------------------------------------------------------------------- */

const repoCache = new Map<string, { at: number; value: RepoMeta | null }>();
const REPO_CACHE_TTL = 10 * 60 * 1000;

interface GhRepo {
  owner: { login: string };
  name: string;
  language: string | null;
  topics?: string[];
  description: string | null;
}

function ghRepoToMeta(r: GhRepo): RepoMeta {
  return {
    owner: r.owner.login,
    name: r.name,
    primaryLanguage: (r.language || "unknown").toLowerCase(),
    topics: r.topics || [],
    category: "any",
    description: r.description || ""
  };
}

async function lookupRepo(owner: string, name: string): Promise<RepoMeta | null> {
  const key = `lookup:${owner}/${name}`.toLowerCase();
  const cached = repoCache.get(key);
  if (cached && Date.now() - cached.at < REPO_CACHE_TTL) return cached.value;

  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${name}`, {
      headers: authHeaders(),
      next: { revalidate: 600 }
    });
    if (res.status === 403 || res.status === 429) {
      const resetAt = Number(res.headers.get("x-ratelimit-reset")) || undefined;
      markRateLimited(resetAt);
      return null;
    }
    if (!res.ok) {
      repoCache.set(key, { at: Date.now(), value: null });
      return null;
    }
    const data = (await res.json()) as GhRepo;
    const meta = ghRepoToMeta(data);
    repoCache.set(key, { at: Date.now(), value: meta });
    return meta;
  } catch {
    return null;
  }
}

async function searchRepoByName(name: string): Promise<RepoMeta | null> {
  const key = `search:${name}`.toLowerCase();
  const cached = repoCache.get(key);
  if (cached && Date.now() - cached.at < REPO_CACHE_TTL) return cached.value;

  try {
    const url = new URL(`${GITHUB_API}/search/repositories`);
    // `in:name` matches the repo NAME (not description). `stars:>50` filters
    // out abandoned forks. We only need the top hit.
    url.searchParams.set("q", `${name} in:name stars:>50`);
    url.searchParams.set("sort", "stars");
    url.searchParams.set("order", "desc");
    url.searchParams.set("per_page", "1");

    const res = await fetch(url.toString(), {
      headers: authHeaders(),
      next: { revalidate: 600 }
    });
    if (res.status === 403 || res.status === 429) {
      const resetAt = Number(res.headers.get("x-ratelimit-reset")) || undefined;
      markRateLimited(resetAt);
      return null;
    }
    if (!res.ok) {
      repoCache.set(key, { at: Date.now(), value: null });
      return null;
    }
    const data = (await res.json()) as { items?: GhRepo[] };
    const top = data.items?.[0];
    if (!top) {
      repoCache.set(key, { at: Date.now(), value: null });
      return null;
    }
    // Heuristic: top result's repo NAME must match what user asked for (case
    // insensitive, ignoring punctuation). Avoids returning random tangential
    // repos for short generic names.
    const userKey = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const repoKey = top.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!repoKey.includes(userKey) && !userKey.includes(repoKey)) {
      repoCache.set(key, { at: Date.now(), value: null });
      return null;
    }
    const meta = ghRepoToMeta(top);
    repoCache.set(key, { at: Date.now(), value: meta });
    return meta;
  } catch {
    return null;
  }
}

/**
 * Resolve user-supplied repo hints into concrete RepoMeta. Hints can be:
 *   - "owner/repo" (resolved with a direct GET /repos lookup)
 *   - "https://github.com/owner/repo" (already split by the parser)
 *   - "react-hook-form" (resolved via GET /search/repositories?q=...+in:name)
 *
 * Up to 3 hints are processed in parallel. Returns the deduped, ordered list.
 */
export async function resolveRepoHints(hints: string[]): Promise<RepoMeta[]> {
  if (!hints?.length) return [];
  if (isProbablyRateLimited()) return [];

  const results = await Promise.all(
    hints.slice(0, 3).map(async (h) => {
      if (h.includes("/")) {
        const [owner, name] = h.split("/");
        if (!owner || !name) return null;
        return lookupRepo(owner, name);
      }
      return searchRepoByName(h);
    })
  );

  const seen = new Set<string>();
  const out: RepoMeta[] = [];
  for (const r of results) {
    if (!r) continue;
    const k = `${r.owner}/${r.name}`.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

/**
 * Build the GitHub Search API "q" string for a SINGLE label.
 *
 * GitHub treats multiple `label:` qualifiers as AND, so to fetch issues
 * matching ANY of our beginner labels we have to issue multiple parallel
 * searches (one per label) and merge results.
 *
 * Multiple `repo:` qualifiers, however, are OR'd — which is exactly what
 * we want for scoping to curated repos.
 */
function buildSearchQuery(
  query: ParsedQuery,
  repos: RepoMeta[],
  label: string | null,
  opts: { userNamed?: boolean } = {}
): string {
  const userNamed = !!opts.userNamed;
  const parts: string[] = ["is:issue", "is:open", "archived:false"];

  // For broad discovery we hide assigned issues; when the user explicitly
  // named a repo, they may want the full open issue list.
  if (!userNamed) parts.push("no:assignee");

  // Freshness guarantee: only issues touched in the last 9 months.
  // For user-named repos we open the window wider (2 years) — the user picked
  // the repo, they don't need us hiding their slightly older threads.
  const days = userNamed ? 730 : 270;
  const cutoff = new Date(Date.now() - days * 86_400_000)
    .toISOString()
    .slice(0, 10);
  parts.push(`updated:>=${cutoff}`);

  if (repos.length) {
    // Scoped to specific repos (curated OR user-named).
    parts.push(repos.map((r) => `repo:${r.owner}/${r.name}`).join(" "));
  } else if (query.languages.length) {
    // No repos at all — broaden to ALL of OSS, scoped by language qualifier.
    parts.push(`language:${query.languages[0]}`);
    parts.push("stars:>100");
  }

  if (label) parts.push(`label:"${label}"`);

  const free = query.keywords.slice(0, 3).join(" ");
  if (free) parts.push(free);

  return parts.join(" ");
}

/**
 * Pick which curated repos to search, given the parsed query. We want enough
 * variety to find good matches without blowing the GitHub rate limit.
 */
export function selectRepos(query: ParsedQuery, max = 18): RepoMeta[] {
  const buckets = new Map<string, RepoMeta>();
  const add = (r: RepoMeta) => buckets.set(`${r.owner}/${r.name}`, r);

  // 1. Language-prioritised repos
  for (const lang of query.languages) {
    reposByLanguage(lang).forEach(add);
  }

  // 2. Category-prioritised repos
  if (query.category !== "any") {
    reposByCategory(query.category).forEach(add);
  }

  // 3. Technology-topic match
  for (const tech of query.technologies) {
    CURATED_REPOS.filter(
      (r) => r.topics.includes(tech) || r.name.toLowerCase() === tech
    ).forEach(add);
  }

  // 4. Fallback strategy
  if (buckets.size === 0) {
    // If the user explicitly asked for a language we don't curate, return
    // EMPTY so the search query falls through to GitHub's `language:` qualifier
    // (see buildSearchQuery). Searching curated non-matching repos would
    // guarantee 0 results.
    if (query.languages.length > 0) return [];

    // Otherwise (generic query, no language constraint) — search broadly
    // across our curated set.
    CURATED_REPOS.slice(0, max).forEach(add);
  }

  return [...buckets.values()].slice(0, max);
}

export interface FetchResult {
  issues: RawIssue[];
  rateLimited: boolean;
  notice?: string;
  resolvedRepos?: string[];
}

export async function fetchIssues(
  query: ParsedQuery,
  opts: { perPage?: number } = {}
): Promise<FetchResult> {
  // Short-circuit if we know we're rate-limited — saves wasted round trips
  // and avoids a cascade of 403s confusing the UI.
  if (isProbablyRateLimited()) {
    return { issues: [], rateLimited: true, notice: rateLimitNotice() };
  }

  // 1) If the user explicitly named a repo, resolve those hints first and let
  //    them OVERRIDE the curated set. This is the "any repo in the world"
  //    pathway — required because the curated list is intentionally tiny.
  const userResolved =
    query.repoHints && query.repoHints.length
      ? await resolveRepoHints(query.repoHints)
      : [];

  const userNamed = userResolved.length > 0;
  const repos = userNamed ? userResolved : selectRepos(query);
  const perPage = opts.perPage ?? 25;

  // If user named repos but NONE resolved, tell them up front so they don't
  // wonder why their results don't match the repos they mentioned.
  let unresolvedNotice: string | undefined;
  if (query.repoHints?.length && !userNamed) {
    unresolvedNotice = `Couldn't find ${query.repoHints
      .map((h) => `\`${h}\``)
      .join(", ")} on GitHub — showing broader results instead.`;
  }

  // GitHub ANDs multiple `label:` qualifiers, but it's smarter to collapse our
  // 5 beginner-label variants into TWO queries instead of five — one for
  // "good first issue" style, one for "help wanted". This cuts Search-API
  // calls per page-load from 5 → 2 (huge for the 30/min limit).
  //
  // When the user explicitly named a repo, we DON'T restrict to beginner
  // labels — they probably want every open issue. One unlabeled query is
  // enough.
  let labels: (string | null)[];
  if (userNamed) {
    labels = [null];
  } else {
    const wantsBeginner =
      query.skillLevel === "beginner" || query.skillLevel === "any";
    labels = wantsBeginner ? ["good first issue", "help wanted"] : ["help wanted"];
  }

  async function runOne(label: string | null): Promise<{
    items: GhSearchItem[];
    rateLimited: boolean;
    resetAt?: number;
    notice?: string;
  }> {
    const q = buildSearchQuery(query, repos, label, { userNamed });
    const url = new URL(`${GITHUB_API}/search/issues`);
    url.searchParams.set("q", q);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("sort", "updated");
    url.searchParams.set("order", "desc");

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        headers: authHeaders(),
        next: { revalidate: 60 }
      });
    } catch (err) {
      return {
        items: [],
        rateLimited: false,
        notice: `Network error: ${(err as Error).message}`
      };
    }
    if (res.status === 403 || res.status === 429) {
      const resetAt = Number(res.headers.get("x-ratelimit-reset")) || undefined;
      return { items: [], rateLimited: true, resetAt };
    }
    if (!res.ok)
      return {
        items: [],
        rateLimited: false,
        notice: `GitHub ${res.status}: ${res.statusText}`
      };
    const data = (await res.json()) as { items: GhSearchItem[] };
    return { items: data.items || [], rateLimited: false };
  }

  const results = await Promise.all(labels.map(runOne));

  const rateLimited = results.some((r) => r.rateLimited);
  if (rateLimited) {
    const resetAt = results.find((r) => r.resetAt)?.resetAt;
    markRateLimited(resetAt);
  }
  const baseNotice = rateLimited
    ? rateLimitNotice()
    : results.find((r) => r.notice)?.notice;
  const notice = [unresolvedNotice, baseNotice].filter(Boolean).join(" ") || undefined;

  // Merge & dedupe by issue id
  const seen = new Map<number, GhSearchItem>();
  for (const r of results) {
    for (const it of r.items) {
      if (!seen.has(it.id)) seen.set(it.id, it);
    }
  }
  const merged = [...seen.values()];

  const repoIndex = new Map(repos.map((r) => [`${r.owner}/${r.name}`, r]));

  const issues: RawIssue[] = merged
    .filter((it) => !it.pull_request)
    .map((it): RawIssue | null => {
      const r = repoToMeta(it.repository_url);
      const repoMeta = r
        ? repoIndex.get(`${r.owner}/${r.name}`) || {
            owner: r.owner,
            name: r.name,
            primaryLanguage: "unknown",
            topics: [],
            category: "any" as const,
            description: ""
          }
        : null;

      if (!repoMeta) return null;

      return {
        id: it.id,
        number: it.number,
        title: it.title,
        body: it.body ?? "",
        htmlUrl: it.html_url,
        state: it.state,
        createdAt: it.created_at,
        updatedAt: it.updated_at,
        comments: it.comments,
        labels: it.labels.map((l) => l.name),
        assignees: it.assignees.map((a) => a.login),
        authorAssociation: it.author_association,
        repo: repoMeta
      };
    })
    .filter((x): x is RawIssue => x !== null);

  const resolvedRepos = userNamed
    ? userResolved.map((r) => `${r.owner}/${r.name}`)
    : undefined;

  return { issues, rateLimited, notice, resolvedRepos };
}

/**
 * Fetch the issue + recent comments for the detail view.
 */
export async function fetchIssueDetail(
  owner: string,
  name: string,
  number: number
): Promise<RawIssue | null> {
  const headers = authHeaders();
  const base = `${GITHUB_API}/repos/${owner}/${name}/issues/${number}`;

  let issueRes: Response, commentsRes: Response;
  try {
    [issueRes, commentsRes] = await Promise.all([
      fetch(base, { headers, next: { revalidate: 120 } }),
      fetch(`${base}/comments?per_page=8&sort=created&direction=desc`, {
        headers,
        next: { revalidate: 120 }
      })
    ]);
  } catch {
    return null;
  }

  if (!issueRes.ok) return null;
  const issue = await issueRes.json();

  // Prefer curated metadata when available (cheap, no extra request).
  // Otherwise fall back to a live lookup so non-curated repos still get
  // accurate language/topics for the AI explanation.
  let repoMeta = CURATED_REPOS.find(
    (r) => r.owner === owner && r.name === name
  ) as RepoMeta | undefined;
  if (!repoMeta) {
    repoMeta = (await lookupRepo(owner, name)) || {
      owner,
      name,
      primaryLanguage: "unknown",
      topics: [],
      category: "any",
      description: ""
    };
  }

  const recentComments = commentsRes.ok
    ? ((await commentsRes.json()) as {
        user: { login: string };
        body: string;
        created_at: string;
      }[]).map((c) => ({
        user: c.user?.login ?? "user",
        body: c.body ?? "",
        createdAt: c.created_at
      }))
    : [];

  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    body: issue.body ?? "",
    htmlUrl: issue.html_url,
    state: issue.state,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    comments: issue.comments,
    labels: (issue.labels || []).map((l: { name: string }) => l.name),
    assignees: (issue.assignees || []).map((a: { login: string }) => a.login),
    authorAssociation: issue.author_association,
    repo: repoMeta,
    recentComments
  };
}
