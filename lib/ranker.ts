import type { ParsedQuery, RawIssue, Difficulty } from "./types";

/**
 * Compute a quality score for an issue given the parsed user query.
 *
 * Signals (higher is better):
 *   - Freshness (recent updates beat stale)
 *   - Beginner-friendly labels when the user asked for beginner content
 *   - Label/topic relevance to the user's query
 *   - Repo activity proxy (we trust curation but boost recently-updated repos)
 *   - Comment count is treated as ambiguous: small (1-10) is healthy, very
 *     high counts often mean contentious / hard issues.
 *
 * The output is intentionally bounded so the UI can show a meaningful
 * relative ranking; we don't need calibrated probabilities.
 */

const NOW = () => Date.now();
const DAY_MS = 86_400_000;

const BEGINNER_LABEL_RX =
  /good[\s-]?first[\s-]?issue|good[\s-]?first[\s-]?bug|first[\s-]?timers?[\s-]?only|beginner|starter|easy|low[\s-]?hanging|onboarding/i;

const HELP_LABEL_RX = /help[\s-]?wanted|up[\s-]?for[\s-]?grabs/i;

const HARD_LABEL_RX =
  /\b(epic|architecture|design[\s-]?proposal|breaking|refactor)\b/i;

const BUG_LABEL_RX = /\b(bug|defect|regression)\b/i;
const DOCS_LABEL_RX = /\b(docs?|documentation|readme)\b/i;
const PERF_LABEL_RX = /\b(perf|performance)\b/i;
const A11Y_LABEL_RX = /\b(a11y|accessibility)\b/i;

function daysSince(iso: string): number {
  return (NOW() - new Date(iso).getTime()) / DAY_MS;
}

function freshnessScore(updatedAt: string): number {
  const d = daysSince(updatedAt);
  // sigmoid-ish: 1.0 if updated today, ~0.6 at 14d, ~0.3 at 60d, ~0.1 at 180d
  return Math.max(0, 1 / (1 + d / 14));
}

function isLikelyStale(issue: RawIssue): boolean {
  const updated = daysSince(issue.updatedAt);
  const created = daysSince(issue.createdAt);
  // Aggressively dropped: untouched for 180d AND >365d old.
  if (updated > 180 && created > 365) return true;
  // Assigned issues are already being worked on – we exclude those upstream
  // but double-check here.
  if (issue.assignees.length > 0) return true;
  return false;
}

function labelScore(issue: RawIssue, query: ParsedQuery): number {
  let s = 0;
  const labels = issue.labels.map((l) => l.toLowerCase());
  for (const l of labels) {
    if (BEGINNER_LABEL_RX.test(l))
      s += query.skillLevel === "beginner" ? 1.4 : 0.6;
    else if (HELP_LABEL_RX.test(l)) s += 0.5;
    else if (HARD_LABEL_RX.test(l))
      s -= query.skillLevel === "beginner" ? 0.6 : 0.1;

    if (query.intents.includes("bug") && BUG_LABEL_RX.test(l)) s += 0.4;
    if (query.intents.includes("docs") && DOCS_LABEL_RX.test(l)) s += 0.6;
    if (query.intents.includes("performance") && PERF_LABEL_RX.test(l)) s += 0.5;
    if (query.intents.includes("accessibility") && A11Y_LABEL_RX.test(l))
      s += 0.6;
  }
  return s;
}

function relevanceScore(issue: RawIssue, query: ParsedQuery): number {
  const haystack = `${issue.title} ${issue.body || ""} ${issue.labels.join(" ")} ${issue.repo.topics.join(" ")}`.toLowerCase();
  let s = 0;
  for (const tech of query.technologies) if (haystack.includes(tech)) s += 0.7;
  for (const lang of query.languages) {
    if (haystack.includes(lang)) s += 0.5;
    if (issue.repo.primaryLanguage.toLowerCase() === lang) s += 0.4;
  }
  for (const kw of query.keywords) if (haystack.includes(kw)) s += 0.3;
  if (query.category !== "any" && issue.repo.category === query.category)
    s += 0.5;
  return s;
}

function commentHealth(issue: RawIssue): number {
  // Small healthy discussion is good. Zero comments slight penalty (might
  // be ignored). Very heated issues penalised.
  if (issue.comments === 0) return -0.1;
  if (issue.comments <= 10) return 0.2;
  if (issue.comments <= 25) return 0.0;
  if (issue.comments <= 60) return -0.2;
  return -0.4;
}

export interface RankResult {
  score: number;
  reasons: string[];
  tags: string[];
  difficulty: Difficulty;
  estimatedEffort: string;
}

export function rankIssue(issue: RawIssue, query: ParsedQuery): RankResult {
  const fresh = freshnessScore(issue.updatedAt);
  const labels = labelScore(issue, query);
  const rel = relevanceScore(issue, query);
  const ch = commentHealth(issue);

  const score = +(fresh * 1.0 + labels * 1.0 + rel * 1.2 + ch).toFixed(3);

  const reasons: string[] = [];
  if (fresh > 0.6) reasons.push("Recently active");
  else if (fresh > 0.3) reasons.push("Moderately active");

  const lowerLabels = issue.labels.map((l) => l.toLowerCase());
  if (lowerLabels.some((l) => BEGINNER_LABEL_RX.test(l)))
    reasons.push("Beginner-friendly");
  if (lowerLabels.some((l) => HELP_LABEL_RX.test(l)))
    reasons.push("Maintainers want help");

  if (rel > 0.6) reasons.push("Strong match to your query");
  else if (rel > 0.2) reasons.push("Relevant to your query");

  // ── Difficulty heuristic ───────────────────────────────────────────
  let difficulty: Difficulty = "medium";
  const beginner = lowerLabels.some((l) => BEGINNER_LABEL_RX.test(l));
  const hard = lowerLabels.some((l) => HARD_LABEL_RX.test(l));
  const longBody = (issue.body || "").length > 1800;
  const manyComments = issue.comments > 15;

  if (beginner && !hard) difficulty = "easy";
  else if (hard || (longBody && manyComments)) difficulty = "hard";
  else if (longBody || manyComments) difficulty = "medium";
  else difficulty = "medium";

  // ── Estimated effort ───────────────────────────────────────────────
  let effort = "2 hours";
  if (difficulty === "easy") effort = "30–60 mins";
  else if (difficulty === "medium") effort = "2–4 hours";
  else effort = "1+ day";

  // ── Tags for the card ──────────────────────────────────────────────
  const tags = new Set<string>();
  for (const l of lowerLabels) {
    if (BEGINNER_LABEL_RX.test(l)) tags.add("good first issue");
    else if (HELP_LABEL_RX.test(l)) tags.add("help wanted");
    else if (BUG_LABEL_RX.test(l)) tags.add("bug");
    else if (DOCS_LABEL_RX.test(l)) tags.add("docs");
    else if (PERF_LABEL_RX.test(l)) tags.add("perf");
    else if (A11Y_LABEL_RX.test(l)) tags.add("a11y");
  }
  if (issue.repo.primaryLanguage)
    tags.add(issue.repo.primaryLanguage.toLowerCase());

  return {
    score,
    reasons,
    tags: [...tags].slice(0, 5),
    difficulty,
    estimatedEffort: effort
  };
}

export function rankAndFilter(
  issues: RawIssue[],
  query: ParsedQuery,
  limit = 12
): (RawIssue & RankResult)[] {
  const ranked = issues
    .filter((i) => !isLikelyStale(i))
    .map((i) => ({ ...i, ...rankIssue(i, query) }))
    .sort((a, b) => b.score - a.score);

  // Diversify: avoid showing 5 cards all from the same repo
  const out: (RawIssue & RankResult)[] = [];
  const perRepo = new Map<string, number>();
  for (const it of ranked) {
    const key = `${it.repo.owner}/${it.repo.name}`;
    const seen = perRepo.get(key) || 0;
    if (seen >= 2) continue;
    perRepo.set(key, seen + 1);
    out.push(it);
    if (out.length >= limit) break;
  }

  // If diversification dropped too many, top up from the rest.
  if (out.length < limit) {
    for (const it of ranked) {
      if (out.length >= limit) break;
      if (!out.includes(it)) out.push(it);
    }
  }

  return out;
}
