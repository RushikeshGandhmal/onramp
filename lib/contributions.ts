import type { ContributionSummary } from "./types";
import { getGithubToken } from "./user";

/**
 * GitHub contribution sync (Phase 2 — intentionally lightweight).
 *
 * Given a signed-in user, fetch a minimal summary of their open-source activity:
 *   - merged PR count + recent merged PRs
 *   - open PR count
 *   - top languages (inferred from the repos they've PR'd to)
 *
 * Uses the user's GitHub OAuth token (via Clerk) so we read THEIR data with
 * THEIR rate budget. Everything degrades gracefully:
 *   - no token / not signed in   → { available: false }
 *   - GitHub error / rate limit  → { available: false }
 * Never throws. Never blocks a render for long (hard timeout + short cache).
 */

const GITHUB_API = "https://api.github.com";

// Per-user in-process cache. Contribution data changes slowly; 10 min is plenty
// and keeps us well under GitHub's per-user budget at scale.
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { at: number; data: ContributionSummary }>();

// Bounded concurrency / cost guards.
const FETCH_TIMEOUT_MS = 6000;
const MAX_RECENT_PRS = 6;

function unavailable(login = ""): ContributionSummary {
  return {
    login,
    mergedPrCount: 0,
    openPrCount: 0,
    recentMergedPrs: [],
    topLanguages: [],
    fetchedAt: new Date().toISOString(),
    available: false
  };
}

async function ghFetch(
  url: string,
  token: string,
  signal: AbortSignal
): Promise<Response> {
  return fetch(url, {
    signal,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "on-ramp-mvp",
      Authorization: `Bearer ${token}`
    },
    // Cache at the platform level too; our in-process cache is the primary one.
    next: { revalidate: 600 }
  });
}

interface GhSearchPr {
  title: string;
  html_url: string;
  pull_request?: { merged_at: string | null };
  repository_url: string;
  closed_at: string | null;
}

function repoFromUrl(repositoryUrl: string): string {
  // https://api.github.com/repos/{owner}/{name}
  const parts = repositoryUrl.split("/repos/")[1];
  return parts || "";
}

/**
 * Fetch a minimal contribution summary for the given (internal = Clerk) user id.
 * `login` is the user's GitHub handle (from the profile/identity layer).
 */
export async function getContributionSummary(
  userId: string | null | undefined,
  login: string | null | undefined
): Promise<ContributionSummary> {
  if (!userId || !login) return unavailable(login || "");

  const cacheKey = `${userId}:${login}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.data;
  }

  const token = await getGithubToken(userId);
  if (!token) {
    const data = unavailable(login);
    cache.set(cacheKey, { at: Date.now(), data });
    return data;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    // Two cheap Search-API queries (each counts as 1 against the 30/min search
    // budget). We avoid the GraphQL contributions API to keep scopes minimal.
    const mergedUrl =
      `${GITHUB_API}/search/issues?q=` +
      encodeURIComponent(`is:pr author:${login} is:merged`) +
      `&per_page=${MAX_RECENT_PRS}&sort=updated&order=desc`;
    const openUrl =
      `${GITHUB_API}/search/issues?q=` +
      encodeURIComponent(`is:pr author:${login} is:open`) +
      `&per_page=1`;

    const [mergedRes, openRes] = await Promise.all([
      ghFetch(mergedUrl, token, controller.signal),
      ghFetch(openUrl, token, controller.signal)
    ]);

    if (!mergedRes.ok) {
      const data = unavailable(login);
      cache.set(cacheKey, { at: Date.now(), data });
      return data;
    }

    const mergedJson = (await mergedRes.json()) as {
      total_count?: number;
      items?: GhSearchPr[];
    };
    const openJson = openRes.ok
      ? ((await openRes.json()) as { total_count?: number })
      : { total_count: 0 };

    const items = Array.isArray(mergedJson.items) ? mergedJson.items : [];
    const recentMergedPrs = items.slice(0, MAX_RECENT_PRS).map((p) => ({
      title: p.title,
      repo: repoFromUrl(p.repository_url),
      url: p.html_url,
      mergedAt: p.pull_request?.merged_at ?? p.closed_at ?? null
    }));

    // Infer top languages from the repos they contributed to (best-effort,
    // capped to avoid extra round-trips at scale — we read repo languages for
    // up to 4 distinct repos).
    const topLanguages = await inferTopLanguages(
      recentMergedPrs.map((p) => p.repo),
      token,
      controller.signal
    );

    const data: ContributionSummary = {
      login,
      mergedPrCount: mergedJson.total_count ?? items.length,
      openPrCount: openJson.total_count ?? 0,
      recentMergedPrs,
      topLanguages,
      fetchedAt: new Date().toISOString(),
      available: true
    };
    cache.set(cacheKey, { at: Date.now(), data });
    return data;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[contributions] sync failed:", err);
    }
    const data = unavailable(login);
    // Cache the failure briefly so a transient error doesn't hammer GitHub.
    cache.set(cacheKey, { at: Date.now(), data });
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function inferTopLanguages(
  repos: string[],
  token: string,
  signal: AbortSignal
): Promise<string[]> {
  const distinct = Array.from(new Set(repos.filter(Boolean))).slice(0, 4);
  if (distinct.length === 0) return [];

  const counts: Record<string, number> = {};
  await Promise.all(
    distinct.map(async (repo) => {
      try {
        const res = await ghFetch(
          `${GITHUB_API}/repos/${repo}/languages`,
          token,
          signal
        );
        if (!res.ok) return;
        const langs = (await res.json()) as Record<string, number>;
        for (const [lang, bytes] of Object.entries(langs)) {
          counts[lang] = (counts[lang] ?? 0) + (Number(bytes) || 1);
        }
      } catch {
        // ignore individual repo failures
      }
    })
  );

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang]) => lang);
}
