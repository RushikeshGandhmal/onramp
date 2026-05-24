import type {
  AIExplanation,
  Difficulty,
  ParsedQuery,
  RawIssue
} from "./types";
import type { RankResult } from "./ranker";

/**
 * AI Explanation layer.
 *
 * - If OPENROUTER_API_KEY is set, uses OpenRouter (default model:
 *   anthropic/claude-3.5-haiku — override via OPENROUTER_MODEL env var).
 * - Else falls back to a deterministic heuristic that produces useful,
 *   beginner-friendly explanations using the issue body + labels.
 *
 * The fallback is intentionally strong so the product feels great even
 * without an LLM key configured.
 */

const SYSTEM = `You are On-Ramp, an assistant that helps developers find and understand good GitHub open-source issues to contribute to. You write short, friendly, beginner-aware English. You never invent facts about a codebase. When unsure, you hedge ("likely", "probably"). You never include marketing language.`;

function trimBody(body: string, max = 1800): string {
  if (!body) return "";
  if (body.length <= max) return body;
  return body.slice(0, max) + "…";
}

function strip(s: string): string {
  return s.replace(/```[\s\S]*?```/g, "").replace(/\s+/g, " ").trim();
}

function buildPrompt(
  issue: RawIssue,
  query: ParsedQuery,
  rank: RankResult,
  mode: "card" | "detail"
): string {
  const labels = issue.labels.join(", ");
  const repo = `${issue.repo.owner}/${issue.repo.name}`;
  const lang = issue.repo.primaryLanguage;
  const body = trimBody(strip(issue.body), mode === "detail" ? 3500 : 1400);
  const discussion =
    mode === "detail" && issue.recentComments?.length
      ? issue.recentComments
          .slice(0, 6)
          .map(
            (c, i) =>
              `Comment ${i + 1} by ${c.user}: ${trimBody(strip(c.body), 500)}`
          )
          .join("\n")
      : "";

  return `User query: "${query.raw}"
Detected: skill=${query.skillLevel}, category=${query.category}, languages=${query.languages.join("/") || "any"}, technologies=${query.technologies.join("/") || "any"}, intents=${query.intents.join("/") || "any"}.

Repository: ${repo} (primary language: ${lang}; topics: ${issue.repo.topics.join(", ") || "n/a"})
Issue title: ${issue.title}
Issue labels: ${labels || "none"}
Comments: ${issue.comments}

Issue body:
${body || "(empty)"}
${discussion ? `\nRecent discussion:\n${discussion}` : ""}

Heuristic difficulty hint: ${rank.difficulty}. Heuristic effort hint: ${rank.estimatedEffort}.

Return STRICT JSON (no markdown fences, no commentary) with this shape:
{
  "summary": "2-3 sentence simple English explanation of what the issue asks for",
  "difficulty": "easy" | "medium" | "hard",
  "whyItMatches": "1-2 sentences referencing the user's query",
  "whereToStart": ["3-5 short hints: likely files, components, or areas. Use real names from the issue body when possible."],
  "estimatedEffort": "natural language e.g. '30 mins', '2 hours', '1 day'"${
    mode === "detail"
      ? `,
  "technicalTerms": [{"term":"...","meaning":"one-sentence beginner-friendly definition"}],
  "discussionSummary": "2-3 sentences summarising what people said in the comments. If no comments, return ''.",
  "beginnerGuidance": ["3-5 concrete tips for a newcomer to make their first PR on this issue"]`
      : ""
  }
}`;
}

interface ParsedAI {
  summary?: string;
  difficulty?: Difficulty;
  whyItMatches?: string;
  whereToStart?: string[];
  estimatedEffort?: string;
  technicalTerms?: { term: string; meaning: string }[];
  discussionSummary?: string;
  beginnerGuidance?: string[];
}

function safeParse(raw: string): ParsedAI | null {
  try {
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?/, "")
      .replace(/```$/, "")
      .trim();
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) return null;
    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
}

async function callOpenRouter(prompt: string): Promise<string | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  const model = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-haiku";
  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
        // OpenRouter recommends these for app attribution + analytics.
        "HTTP-Referer":
          process.env.OPENROUTER_REFERER || "https://on-ramp.dev",
        "X-Title": process.env.OPENROUTER_TITLE || "On-Ramp"
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 700,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: prompt }
        ]
      })
    });
    if (!r.ok) {
      // OpenRouter returns rich errors; log just status to avoid leaking keys.
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[on-ramp] OpenRouter ${r.status} ${r.statusText}`);
      }
      return null;
    }
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content;
    return typeof text === "string" ? text : null;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[on-ramp] OpenRouter error: ${(err as Error).message}`);
    }
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────
// Heuristic fallback (works with NO API key)
// ────────────────────────────────────────────────────────────────────

const STOP = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "to",
  "of",
  "and",
  "or",
  "in",
  "on",
  "for",
  "with",
  "this",
  "that",
  "it",
  "be",
  "as",
  "by",
  "at",
  "from",
  "we",
  "i",
  "you",
  "should",
  "would",
  "could"
]);

function firstSentences(text: string, n = 2): string {
  if (!text) return "";
  const cleaned = strip(text)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[[^\]]*\]\([^)]+\)/g, "$1");
  const parts = cleaned.split(/(?<=[.!?])\s+/).slice(0, n);
  return parts.join(" ").trim();
}

function inferFiles(body: string): string[] {
  if (!body) return [];
  // backticked paths or filenames like `src/foo.tsx`
  const set = new Set<string>();
  const fileRx =
    /`?([a-zA-Z0-9._\-\/]+\.(?:tsx?|jsx?|py|go|rs|rb|java|kt|swift|md|css|scss|html|vue|svelte|json|yml|yaml))`?/g;
  let m: RegExpExecArray | null;
  while ((m = fileRx.exec(body)) !== null) {
    set.add(m[1]);
    if (set.size >= 5) break;
  }
  return [...set];
}

function heuristicWhereToStart(issue: RawIssue): string[] {
  const hints = inferFiles(issue.body);
  if (hints.length) return hints.slice(0, 5);

  const lower = issue.title.toLowerCase() + " " + (issue.body || "").toLowerCase();
  const out: string[] = [];
  if (/docs|readme/.test(lower)) out.push("README.md or docs/ folder");
  if (/test|spec/.test(lower)) out.push("Relevant *.test or *.spec files");
  if (/css|style|tailwind/.test(lower))
    out.push("Component-level styles / Tailwind classes");
  if (/component|button|modal|form/.test(lower))
    out.push("UI components folder (e.g. components/, src/components/)");
  if (/api|endpoint|route/.test(lower))
    out.push("API routes or controllers (e.g. routes/, controllers/)");
  if (/cli|command/.test(lower)) out.push("CLI entrypoint (e.g. cli.ts, main.py)");
  if (out.length === 0) {
    out.push("Search the repo for keywords from the issue title.");
    out.push("Check the project's CONTRIBUTING.md for setup steps.");
  }
  return out.slice(0, 5);
}

function heuristicWhyItMatches(
  issue: RawIssue,
  query: ParsedQuery,
  rank: RankResult
): string {
  const bits: string[] = [];
  if (query.skillLevel === "beginner" && rank.difficulty === "easy")
    bits.push("It's flagged as beginner-friendly");
  if (query.languages.includes(issue.repo.primaryLanguage.toLowerCase()))
    bits.push(
      `the repo's primary language (${issue.repo.primaryLanguage}) matches your interest`
    );
  if (
    query.category !== "any" &&
    issue.repo.category === query.category
  )
    bits.push(`it lives in the ${query.category} space you mentioned`);
  for (const t of query.technologies) {
    if (issue.repo.topics.includes(t) || issue.repo.name.toLowerCase() === t) {
      bits.push(`the project uses ${t}`);
      break;
    }
  }
  if (rank.reasons.includes("Maintainers want help"))
    bits.push("maintainers explicitly want help on it");
  if (!bits.length)
    bits.push("It's an active issue with clear scope on a curated project");
  return capitalise(bits.join(", ")) + ".";
}

function capitalise(s: string): string {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

function heuristicSummary(issue: RawIssue): string {
  const lead = firstSentences(issue.body, 2);
  if (lead && lead.length > 30) return lead;
  return `An open issue in ${issue.repo.owner}/${issue.repo.name}: "${issue.title}". The maintainers are looking for someone to investigate and propose a fix.`;
}

function heuristicTerms(issue: RawIssue): { term: string; meaning: string }[] {
  const text = `${issue.title} ${issue.body || ""}`.toLowerCase();
  const dict: Record<string, string> = {
    ssr: "Server-side rendering: HTML is produced on the server before being sent to the browser.",
    csr: "Client-side rendering: the browser builds HTML using JavaScript after loading the page.",
    a11y: "Short for accessibility — making software usable by everyone, including people with disabilities.",
    i18n: "Internationalization: preparing software so it can be translated into other languages.",
    regression: "A bug that re-appears or appears in something that used to work.",
    flaky: "An intermittent test that sometimes passes and sometimes fails without code changes.",
    eslint: "A linter that finds problems in JavaScript/TypeScript code.",
    typescript: "A typed superset of JavaScript that catches errors before you run the code.",
    hydration: "When a server-rendered page is enhanced with client-side JS so it becomes interactive.",
    refactor: "Restructuring code without changing what it does."
  };
  const out: { term: string; meaning: string }[] = [];
  for (const [k, v] of Object.entries(dict)) {
    if (text.includes(k)) out.push({ term: k, meaning: v });
    if (out.length >= 4) break;
  }
  return out;
}

function heuristicDiscussion(issue: RawIssue): string {
  if (!issue.recentComments || issue.recentComments.length === 0) return "";
  const sample = issue.recentComments
    .slice(0, 3)
    .map((c) => `${c.user} said: ${firstSentences(c.body, 1)}`)
    .join(" ");
  return sample.length > 30
    ? `Recently, ${sample}`
    : `There are ${issue.comments} comment(s) on the thread — worth skimming for context before starting.`;
}

function heuristicGuidance(issue: RawIssue, query: ParsedQuery): string[] {
  const out = [
    "Fork the repo and follow the setup steps in the README / CONTRIBUTING file.",
    "Reproduce the issue locally first — it makes the fix obvious.",
    "Write a small test that fails, then make it pass.",
    "Open a draft PR early; maintainers love a heads-up.",
    "Reference the issue number in your PR description."
  ];
  if (query.skillLevel !== "beginner") out.shift();
  return out.slice(0, 5);
}

function heuristicExplain(
  issue: RawIssue,
  query: ParsedQuery,
  rank: RankResult,
  mode: "card" | "detail"
): AIExplanation {
  const base: AIExplanation = {
    summary: heuristicSummary(issue),
    difficulty: rank.difficulty,
    whyItMatches: heuristicWhyItMatches(issue, query, rank),
    whereToStart: heuristicWhereToStart(issue),
    estimatedEffort: rank.estimatedEffort,
    source: "heuristic"
  };
  if (mode === "detail") {
    base.technicalTerms = heuristicTerms(issue);
    base.discussionSummary = heuristicDiscussion(issue);
    base.beginnerGuidance = heuristicGuidance(issue, query);
  }
  return base;
}

// ────────────────────────────────────────────────────────────────────
// Public entry
// ────────────────────────────────────────────────────────────────────

export async function explainIssue(
  issue: RawIssue,
  query: ParsedQuery,
  rank: RankResult,
  mode: "card" | "detail" = "card"
): Promise<AIExplanation> {
  const prompt = buildPrompt(issue, query, rank, mode);
  const raw = await callOpenRouter(prompt);

  if (raw) {
    const parsed = safeParse(raw);
    if (parsed && parsed.summary) {
      return {
        summary: parsed.summary,
        difficulty:
          (parsed.difficulty as Difficulty | undefined) ?? rank.difficulty,
        whyItMatches:
          parsed.whyItMatches ?? heuristicWhyItMatches(issue, query, rank),
        whereToStart:
          parsed.whereToStart && parsed.whereToStart.length
            ? parsed.whereToStart.slice(0, 5)
            : heuristicWhereToStart(issue),
        estimatedEffort: parsed.estimatedEffort ?? rank.estimatedEffort,
        technicalTerms:
          mode === "detail"
            ? parsed.technicalTerms ?? heuristicTerms(issue)
            : undefined,
        discussionSummary:
          mode === "detail"
            ? parsed.discussionSummary ?? heuristicDiscussion(issue)
            : undefined,
        beginnerGuidance:
          mode === "detail"
            ? parsed.beginnerGuidance ?? heuristicGuidance(issue, query)
            : undefined,
        source: "ai"
      };
    }
  }
  return heuristicExplain(issue, query, rank, mode);
}

export async function explainIssuesBatch(
  items: { issue: RawIssue; rank: RankResult }[],
  query: ParsedQuery
): Promise<AIExplanation[]> {
  // Run with bounded concurrency to keep latency tight.
  const CONCURRENCY = 4;
  const out: AIExplanation[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await explainIssue(items[idx].issue, query, items[idx].rank, "card");
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return out;
}

export function hasAIConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}
