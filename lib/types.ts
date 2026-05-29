export type Difficulty = "easy" | "medium" | "hard";

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "any";

export type Category =
  | "frontend"
  | "backend"
  | "fullstack"
  | "mobile"
  | "devops"
  | "data"
  | "ml"
  | "docs"
  | "testing"
  | "design"
  | "any";

export interface ParsedQuery {
  raw: string;
  technologies: string[]; // e.g. ["react", "typescript"]
  languages: string[]; // e.g. ["javascript", "python"]
  skillLevel: SkillLevel;
  category: Category;
  intents: string[]; // e.g. ["bug", "feature", "docs"]
  keywords: string[]; // remaining freeform keywords
  repoHints: string[]; // user-mentioned repos: ["facebook/react", "react-hook-form"]
}

export interface RepoMeta {
  owner: string;
  name: string;
  primaryLanguage: string;
  topics: string[];
  category: Category;
  description: string;
}

export interface RawIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  htmlUrl: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  comments: number;
  labels: string[];
  assignees: string[];
  authorAssociation?: string;
  repo: RepoMeta;
  // populated lazily for detail view
  recentComments?: { user: string; body: string; createdAt: string }[];
}

export interface AIExplanation {
  summary: string; // simple english summary
  difficulty: Difficulty;
  whyItMatches: string;
  whereToStart: string[];
  estimatedEffort: string; // e.g. "30 mins", "2 hours", "1 day"
  technicalTerms?: { term: string; meaning: string }[];
  discussionSummary?: string;
  beginnerGuidance?: string[];
  source: "ai" | "heuristic";
}

/**
 * Issue intelligence — heuristic signals computed from issue/repo metadata.
 * These are deterministic estimates (NOT AI hallucinations) used to help a
 * contributor decide whether an issue is worth their time.
 */
export interface IssueIntelligence {
  stale: boolean; // no meaningful activity in a long while
  staleDays: number; // days since last update
  maintainerResponsiveness: "high" | "medium" | "low" | "unknown";
  beginnerFriendliness: "high" | "medium" | "low";
  acceptanceLikelihood: "high" | "medium" | "low";
  notes: string[]; // short human-readable explanations of the above
}

export interface RankedIssue extends RawIssue {
  score: number;
  reasons: string[];
  tags: string[];
  ai: AIExplanation;
  intelligence: IssueIntelligence;
  saved?: boolean; // set per-user at render time
}

export interface SearchResponse {
  query: ParsedQuery;
  issues: RankedIssue[];
  fetchedAt: string;
  meta: {
    repoCount: number;
    candidateCount: number;
    usedAI: boolean;
    rateLimited?: boolean;
    notice?: string;
    resolvedRepos?: string[]; // user-named repos we actually scoped the search to
    personalized?: boolean; // ranking was biased by the user's signals
  };
}

// ─── Phase 2: identity, profile, saved, personalization ───────────────────

export interface UserProfile {
  userId: string;
  preferredTechnologies: string[];
  preferredLanguages: string[];
  preferredCategories: Category[];
  contributionInterests: string[];
  skillLevel: SkillLevel;
  inferredFocus: string | null;
  onboarded: boolean;
}

export interface SavedIssue {
  id: string;
  issueKey: string; // "owner/name#number"
  owner: string;
  name: string;
  number: number;
  title: string;
  htmlUrl: string;
  repoLanguage: string | null;
  category: string | null;
  difficulty: string | null;
  labels: string[];
  tags: string[];
  aiSummary: string | null;
  note: string | null;
  status: "saved" | "in_progress" | "done";
  savedAt: string;
}

export type IssueEventType =
  | "view"
  | "save"
  | "unsave"
  | "open_github"
  | "search";

/**
 * Aggregated signals derived from a user's events + explicit profile.
 * Drives personalized recommendations and inferred skill focus.
 */
export interface PersonalizationSignals {
  technologies: Record<string, number>; // weighted counts
  languages: Record<string, number>;
  categories: Record<string, number>;
  difficulties: Record<string, number>;
  topTechnologies: string[];
  topLanguages: string[];
  topCategories: Category[];
  preferredDifficulty: Difficulty | null;
  eventCount: number;
  hasSignal: boolean;
}

/**
 * Minimal GitHub contribution summary (Phase 2 keeps this lightweight).
 */
export interface ContributionSummary {
  login: string;
  mergedPrCount: number;
  openPrCount: number;
  recentMergedPrs: {
    title: string;
    repo: string;
    url: string;
    mergedAt: string | null;
  }[];
  topLanguages: string[];
  fetchedAt: string;
  available: boolean; // false when token/data unavailable
}
