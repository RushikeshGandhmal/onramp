import type { IssueIntelligence, RawIssue } from "./types";

/**
 * Issue intelligence — deterministic, metadata-only heuristics.
 *
 * IMPORTANT (product philosophy): these are HONEST ESTIMATES derived from
 * public issue/repo metadata (labels, dates, comment counts, assignees). We do
 * NOT claim to know repository internals or guarantee outcomes. Every estimate
 * comes with a short human-readable note so the user understands the basis.
 *
 * Signals:
 *   - staleness               (days since last update)
 *   - maintainer responsiveness (recency of activity as a proxy)
 *   - beginner friendliness   (labels + body length + discussion size)
 *   - acceptance likelihood   (beginner/help labels + freshness − contention)
 */

const DAY_MS = 86_400_000;

const BEGINNER_RX =
  /good[\s-]?first[\s-]?issue|good[\s-]?first[\s-]?bug|first[\s-]?timers?[\s-]?only|beginner|starter|easy|low[\s-]?hanging|onboarding/i;
const HELP_RX = /help[\s-]?wanted|up[\s-]?for[\s-]?grabs/i;
const HARD_RX =
  /\b(epic|architecture|design[\s-]?proposal|breaking|refactor|rfc|discussion)\b/i;

function daysSince(iso: string): number {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 9999;
  return Math.max(0, (Date.now() - t) / DAY_MS);
}

export function computeIntelligence(issue: RawIssue): IssueIntelligence {
  const labels = issue.labels.map((l) => l.toLowerCase());
  const hasBeginner = labels.some((l) => BEGINNER_RX.test(l));
  const hasHelp = labels.some((l) => HELP_RX.test(l));
  const hasHard = labels.some((l) => HARD_RX.test(l));
  const assigned = issue.assignees.length > 0;

  const staleDays = Math.round(daysSince(issue.updatedAt));
  const bodyLen = (issue.body || "").length;
  const comments = issue.comments;

  const notes: string[] = [];

  // ── Staleness ──────────────────────────────────────────────────────
  const stale = staleDays > 120;
  if (stale) {
    notes.push(`No activity for ~${staleDays} days — may be abandoned.`);
  } else if (staleDays <= 14) {
    notes.push(`Active recently (updated ~${staleDays} days ago).`);
  }

  // ── Maintainer responsiveness (recency as a proxy) ─────────────────
  let maintainerResponsiveness: IssueIntelligence["maintainerResponsiveness"];
  if (staleDays <= 21) maintainerResponsiveness = "high";
  else if (staleDays <= 60) maintainerResponsiveness = "medium";
  else if (staleDays <= 365) maintainerResponsiveness = "low";
  else maintainerResponsiveness = "unknown";
  if (maintainerResponsiveness === "high")
    notes.push("Maintainers appear responsive (recent updates).");
  else if (maintainerResponsiveness === "low")
    notes.push("Slow recent activity — responses may take a while.");

  // ── Beginner friendliness ──────────────────────────────────────────
  let beginnerFriendliness: IssueIntelligence["beginnerFriendliness"] = "medium";
  if (hasBeginner && !hasHard) {
    beginnerFriendliness = "high";
    notes.push("Tagged as beginner-friendly.");
  } else if (hasHard || (bodyLen > 2200 && comments > 20)) {
    beginnerFriendliness = "low";
    notes.push("Looks involved — better with some experience.");
  } else if (hasHelp || bodyLen < 1200) {
    beginnerFriendliness = "medium";
  }

  // ── Acceptance likelihood ───────────────────────────────────────────
  let points = 0;
  if (hasHelp) points += 2; // maintainers explicitly want contributions
  if (hasBeginner) points += 1;
  if (staleDays <= 30) points += 1;
  if (staleDays > 180) points -= 2;
  if (assigned) points -= 2; // someone may already be on it
  if (comments > 40) points -= 1; // contentious / heavily debated
  if (hasHard) points -= 1;

  let acceptanceLikelihood: IssueIntelligence["acceptanceLikelihood"];
  if (points >= 3) acceptanceLikelihood = "high";
  else if (points >= 1) acceptanceLikelihood = "medium";
  else acceptanceLikelihood = "low";

  if (assigned)
    notes.push("Someone may already be assigned — check before starting.");
  if (acceptanceLikelihood === "high")
    notes.push("Good odds a clean PR gets merged.");

  return {
    stale,
    staleDays,
    maintainerResponsiveness,
    beginnerFriendliness,
    acceptanceLikelihood,
    notes: notes.slice(0, 4)
  };
}
