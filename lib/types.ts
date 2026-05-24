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

export interface RankedIssue extends RawIssue {
  score: number;
  reasons: string[];
  tags: string[];
  ai: AIExplanation;
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
  };
}
