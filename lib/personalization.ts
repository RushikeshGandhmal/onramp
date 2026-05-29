import { desc, eq } from "drizzle-orm";
import { getDb } from "./db/client";
import { issueEvents, type IssueEventRow } from "./db/schema";
import type {
  Category,
  Difficulty,
  PersonalizationSignals,
  RankedIssue,
  UserProfile
} from "./types";

/**
 * Personalization layer.
 *
 * Turns raw behavioural events + the explicit profile into weighted signals,
 * then exposes:
 *   - getPersonalizationSignals(userId, profile)  → aggregated signals
 *   - inferFocus(signals, profile)                → "frontend-focused" | …
 *   - personalBias(issue, signals)               → additive ranking score
 *
 * Everything degrades gracefully: no DB → empty signals → zero bias, so the
 * shared (anonymous) ranking is untouched. Never throws.
 */

const EMPTY_SIGNALS: PersonalizationSignals = {
  technologies: {},
  languages: {},
  categories: {},
  difficulties: {},
  topTechnologies: [],
  topLanguages: [],
  topCategories: [],
  preferredDifficulty: null,
  eventCount: 0,
  hasSignal: false
};

// How many recent events to consider. Bounded for predictable cost at scale.
const EVENT_LIMIT = 400;

// Per-event-type weight: an explicit save says far more than a passing view.
const EVENT_WEIGHT: Record<string, number> = {
  save: 5,
  open_github: 3,
  view: 1,
  search: 0.5,
  unsave: -4
};

// Time decay: events older than ~60d contribute less. Half-life ≈ 30 days.
function recencyWeight(createdAt: Date | string | null): number {
  if (!createdAt) return 0.5;
  const t = typeof createdAt === "string" ? Date.parse(createdAt) : createdAt.getTime();
  if (!Number.isFinite(t)) return 0.5;
  const ageDays = (Date.now() - t) / 86_400_000;
  if (ageDays <= 0) return 1;
  return Math.pow(0.5, ageDays / 30);
}

function bump(map: Record<string, number>, key: string | null | undefined, w: number) {
  if (!key) return;
  const k = key.trim().toLowerCase();
  if (!k) return;
  map[k] = (map[k] ?? 0) + w;
}

function topKeys(map: Record<string, number>, n: number, min = 0): string[] {
  return Object.entries(map)
    .filter(([, v]) => v > min)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

const CATEGORY_SET: Category[] = [
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "devops",
  "data",
  "ml",
  "docs",
  "testing",
  "design",
  "any"
];

/**
 * Build weighted signals for a user. Combines:
 *   - recent events (decayed + type-weighted)
 *   - explicit profile preferences (seeded as a strong prior)
 */
export async function getPersonalizationSignals(
  userId: string | null | undefined,
  profile?: UserProfile | null
): Promise<PersonalizationSignals> {
  const signals: PersonalizationSignals = {
    technologies: {},
    languages: {},
    categories: {},
    difficulties: {},
    topTechnologies: [],
    topLanguages: [],
    topCategories: [],
    preferredDifficulty: null,
    eventCount: 0,
    hasSignal: false
  };

  // Seed from explicit profile (a strong, stable prior).
  if (profile) {
    for (const t of profile.preferredTechnologies) bump(signals.technologies, t, 4);
    for (const l of profile.preferredLanguages) bump(signals.languages, l, 4);
    for (const c of profile.preferredCategories) bump(signals.categories, c, 4);
  }

  const db = getDb();
  if (db && userId) {
    try {
      const rows = await db
        .select()
        .from(issueEvents)
        .where(eq(issueEvents.userId, userId))
        .orderBy(desc(issueEvents.createdAt))
        .limit(EVENT_LIMIT);

      signals.eventCount = rows.length;

      for (const r of rows as IssueEventRow[]) {
        const w = (EVENT_WEIGHT[r.eventType] ?? 0) * recencyWeight(r.createdAt);
        if (w === 0) continue;
        for (const t of r.technologies ?? []) bump(signals.technologies, t, w);
        for (const l of r.languages ?? []) bump(signals.languages, l, w);
        bump(signals.categories, r.category, w);
        bump(signals.difficulties, r.difficulty, w);
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[personalization] signal build failed:", err);
      }
    }
  }

  signals.topTechnologies = topKeys(signals.technologies, 8);
  signals.topLanguages = topKeys(signals.languages, 8);
  signals.topCategories = topKeys(signals.categories, 5).filter(
    (c): c is Category => CATEGORY_SET.includes(c as Category)
  );

  const diffEntries = Object.entries(signals.difficulties).sort(
    (a, b) => b[1] - a[1]
  );
  const top = diffEntries[0]?.[0];
  signals.preferredDifficulty =
    top === "easy" || top === "medium" || top === "hard"
      ? (top as Difficulty)
      : null;

  const profileHasPrefs =
    !!profile &&
    (profile.preferredTechnologies.length > 0 ||
      profile.preferredLanguages.length > 0 ||
      profile.preferredCategories.length > 0 ||
      profile.skillLevel !== "any");

  signals.hasSignal = signals.eventCount >= 3 || profileHasPrefs;

  return signals;
}

/**
 * Infer a short human-readable focus label from signals + profile.
 * Conservative: returns null unless there's a clear lean (avoids fake confidence).
 */
export function inferFocus(
  signals: PersonalizationSignals,
  profile?: UserProfile | null
): string | null {
  const cat = { ...signals.categories };

  // Map languages/technologies into broad category leanings as a backstop.
  const frontendTech = ["react", "vue", "svelte", "angular", "css", "tailwind", "next", "typescript", "javascript"];
  const backendTech = ["node", "python", "go", "rust", "java", "django", "express", "fastapi", "spring", "ruby", "php"];
  for (const [t, w] of Object.entries(signals.technologies)) {
    if (frontendTech.includes(t)) cat["frontend"] = (cat["frontend"] ?? 0) + w * 0.4;
    if (backendTech.includes(t)) cat["backend"] = (cat["backend"] ?? 0) + w * 0.4;
  }
  for (const [l, w] of Object.entries(signals.languages)) {
    if (["javascript", "typescript", "css", "html"].includes(l))
      cat["frontend"] = (cat["frontend"] ?? 0) + w * 0.4;
    if (["python", "go", "rust", "java", "ruby", "php", "c", "c++"].includes(l))
      cat["backend"] = (cat["backend"] ?? 0) + w * 0.4;
  }

  const sorted = Object.entries(cat)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) return null;

  const [topCat, topVal] = sorted[0];
  const total = sorted.reduce((s, [, v]) => s + v, 0);

  // Need a meaningful share to claim a focus (no fake confidence).
  if (total < 6 || topVal / total < 0.4) {
    // Documentation-friendly: docs/testing interest even without dominance.
    if ((cat["docs"] ?? 0) > 4) return "documentation-friendly";
    return null;
  }

  const labelMap: Record<string, string> = {
    frontend: "frontend-focused",
    backend: "backend-focused",
    fullstack: "fullstack-oriented",
    mobile: "mobile-focused",
    devops: "devops-leaning",
    data: "data-focused",
    ml: "ML-focused",
    docs: "documentation-friendly",
    testing: "testing-minded",
    design: "design-minded"
  };

  return labelMap[topCat] ?? null;
}

/**
 * Additive personalization bias for a single issue, in the same 0..~1 scale the
 * base ranker uses for its weighted components. Caller multiplies by a small
 * weight so personalization nudges — never dominates — the base relevance.
 */
export function personalBias(
  issue: RankedIssue,
  signals: PersonalizationSignals
): number {
  if (!signals.hasSignal) return 0;

  let score = 0;

  const lang = issue.repo?.primaryLanguage?.toLowerCase();
  if (lang && signals.languages[lang]) score += 0.4;

  const cat = issue.repo?.category?.toLowerCase();
  if (cat && signals.categories[cat]) score += 0.3;

  // Tag / label overlap with preferred technologies.
  const hay = [...(issue.tags ?? []), ...(issue.labels ?? [])]
    .join(" ")
    .toLowerCase();
  for (const t of signals.topTechnologies) {
    if (hay.includes(t)) {
      score += 0.15;
      break;
    }
  }

  // Difficulty match.
  if (
    signals.preferredDifficulty &&
    issue.ai?.difficulty === signals.preferredDifficulty
  ) {
    score += 0.15;
  }

  return Math.min(1, score);
}
