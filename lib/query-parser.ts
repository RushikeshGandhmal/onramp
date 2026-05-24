import type { Category, ParsedQuery, SkillLevel } from "./types";

/**
 * Lightweight, dependency-free natural language query parser.
 *
 * Goals:
 *  - Extract technologies, languages, skill level, category, and intent
 *    from short freeform queries like "react beginner frontend issues".
 *  - Deterministic + fast (<1ms) so users feel instant feedback.
 *  - Robust to typos via simple alias maps. (Heavier NLP can plug in later.)
 */

const TECH_ALIASES: Record<string, string[]> = {
  react: ["react", "reactjs", "react.js"],
  vue: ["vue", "vuejs", "vue.js"],
  svelte: ["svelte", "sveltejs", "sveltekit"],
  angular: ["angular", "angularjs"],
  next: ["next", "nextjs", "next.js"],
  remix: ["remix"],
  astro: ["astro"],
  tailwind: ["tailwind", "tailwindcss"],
  node: ["node", "nodejs", "node.js"],
  express: ["express", "expressjs"],
  fastify: ["fastify"],
  nest: ["nest", "nestjs"],
  django: ["django"],
  flask: ["flask"],
  fastapi: ["fastapi", "fast-api"],
  rails: ["rails", "ruby-on-rails"],
  laravel: ["laravel"],
  gin: ["gin"],
  spring: ["spring", "spring-boot"],
  prisma: ["prisma"],
  supabase: ["supabase"],
  trpc: ["trpc", "t-rpc"],
  graphql: ["graphql", "gql"],
  rest: ["rest", "restful"],
  api: ["api", "apis"],
  kubernetes: ["kubernetes", "k8s"],
  docker: ["docker"],
  terraform: ["terraform"],
  pandas: ["pandas"],
  sklearn: ["sklearn", "scikit-learn", "scikit"],
  pytorch: ["pytorch", "torch"],
  tensorflow: ["tensorflow", "tf"],
  huggingface: ["huggingface", "hf", "transformers"],
  flutter: ["flutter"],
  "react-native": ["react-native", "rn"]
};

const LANGUAGE_ALIASES: Record<string, string[]> = {
  javascript: ["javascript", "js"],
  typescript: ["typescript", "ts"],
  python: ["python", "py"],
  go: ["go", "golang"],
  rust: ["rust", "rs"],
  java: ["java"],
  kotlin: ["kotlin"],
  ruby: ["ruby", "rb"],
  php: ["php"],
  csharp: ["c#", "csharp", "dotnet", ".net"],
  cpp: ["c++", "cpp"],
  c: ["c"],
  swift: ["swift"],
  dart: ["dart"],
  scala: ["scala"],
  elixir: ["elixir"]
};

const SKILL_ALIASES: Record<SkillLevel, string[]> = {
  beginner: [
    "beginner",
    "beginners",
    "newbie",
    "newcomer",
    "first-time",
    "first time",
    "starter",
    "easy",
    "simple",
    "good first",
    "good-first",
    "first issue",
    "intro",
    "introductory",
    "newbies"
  ],
  intermediate: ["intermediate", "mid", "medium", "moderate"],
  advanced: ["advanced", "hard", "expert", "deep", "complex", "challenging"],
  any: []
};

const CATEGORY_ALIASES: Record<Category, string[]> = {
  frontend: [
    "frontend",
    "front-end",
    "front end",
    "ui",
    "ux",
    "css",
    "component",
    "components",
    "design system",
    "web"
  ],
  backend: [
    "backend",
    "back-end",
    "back end",
    "api",
    "server",
    "database",
    "db",
    "auth",
    "infra api"
  ],
  fullstack: ["fullstack", "full-stack", "full stack"],
  mobile: ["mobile", "ios", "android", "rn", "react native", "flutter"],
  devops: [
    "devops",
    "dev-ops",
    "infrastructure",
    "infra",
    "ci",
    "cd",
    "kubernetes",
    "k8s",
    "docker",
    "deployment",
    "observability"
  ],
  data: ["data", "data engineering", "etl", "analytics", "pipeline", "warehouse"],
  ml: [
    "ml",
    "machine learning",
    "ai",
    "nlp",
    "llm",
    "model",
    "training",
    "embedding",
    "deep learning"
  ],
  docs: ["docs", "documentation", "readme", "tutorial", "guide", "examples"],
  testing: ["test", "tests", "testing", "qa", "coverage", "e2e", "unit"],
  design: ["design", "ux", "visual", "icons", "branding"],
  any: []
};

const INTENT_ALIASES: Record<string, string[]> = {
  bug: ["bug", "bugs", "issue", "issues", "defect", "broken", "fix"],
  feature: ["feature", "features", "enhancement", "improve", "improvement"],
  refactor: ["refactor", "cleanup", "tech debt"],
  performance: ["performance", "perf", "speed", "optimize", "optimization"],
  security: ["security", "vuln", "vulnerability", "cve"],
  accessibility: ["a11y", "accessibility", "screen reader", "aria"],
  i18n: ["i18n", "internationalization", "localization", "l10n", "translation"],
  docs: ["docs", "documentation", "readme", "tutorial"],
  testing: ["tests", "testing", "coverage"]
};

function normalize(s: string): string {
  return ` ${s.toLowerCase().replace(/[^\w.+#-]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

/**
 * Extract repository hints from the RAW user input (before normalization).
 *
 * Supports three patterns:
 *   1. `owner/repo` (e.g. "facebook/react", "vercel/swr")
 *   2. GitHub URLs (e.g. "https://github.com/facebook/react")
 *   3. Hyphenated project names (e.g. "react-hook-form", "tailwindcss-animate")
 *      — high-signal because no English word has hyphens in this density.
 *
 * Returns up to 3 hints (we cap to keep the resolver fast & rate-limit safe).
 */
function extractRepoHints(raw: string, knownAliases: Set<string>): string[] {
  if (!raw) return [];
  const hints = new Set<string>();

  // 1) Explicit github URLs first (highest confidence).
  const ghUrlRx = /github\.com\/([a-zA-Z0-9][a-zA-Z0-9-]{0,38})\/([a-zA-Z0-9._-]+?)(?:\/|\?|#|\s|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = ghUrlRx.exec(raw)) !== null) {
    hints.add(`${m[1]}/${m[2]}`.replace(/\.git$/, ""));
  }

  // 2) owner/repo slashed pattern (e.g. "facebook/react").
  //    Owner: 1-39 chars, alphanumeric + hyphen, not starting with hyphen.
  //    Repo:  alphanumeric, dot, underscore, hyphen.
  const ownerRepoRx = /\b([a-zA-Z0-9][a-zA-Z0-9-]{0,38})\/([a-zA-Z0-9._-]+)\b/g;
  while ((m = ownerRepoRx.exec(raw)) !== null) {
    hints.add(`${m[1]}/${m[2]}`);
  }

  // 3) Hyphenated bare project names (e.g. "react-hook-form").
  //    Must contain at least one hyphen and not be a known alias.
  const hyphenRx = /\b([a-z][a-z0-9.]*(?:-[a-z0-9.]+){1,4})\b/gi;
  while ((m = hyphenRx.exec(raw)) !== null) {
    const candidate = m[1].toLowerCase();
    if (knownAliases.has(candidate)) continue;
    if (candidate.length < 4 || candidate.length > 50) continue;
    hints.add(candidate);
  }

  return [...hints].slice(0, 3);
}

function findMatches(
  haystack: string,
  groups: Record<string, string[]>
): string[] {
  const found = new Set<string>();
  for (const [canonical, aliases] of Object.entries(groups)) {
    for (const alias of aliases) {
      const needle = ` ${alias.toLowerCase()} `;
      if (haystack.includes(needle)) {
        found.add(canonical);
        break;
      }
    }
  }
  return [...found];
}

function inferCategory(
  technologies: string[],
  languages: string[],
  explicit: Category | undefined
): Category {
  if (explicit) return explicit;

  const FRONTEND_TECH = new Set([
    "react",
    "vue",
    "svelte",
    "angular",
    "next",
    "remix",
    "astro",
    "tailwind"
  ]);
  const BACKEND_TECH = new Set([
    "express",
    "fastify",
    "nest",
    "django",
    "flask",
    "fastapi",
    "rails",
    "laravel",
    "gin",
    "spring",
    "prisma",
    "graphql",
    "rest",
    "api"
  ]);
  const MOBILE_TECH = new Set(["react-native", "flutter"]);
  const ML_TECH = new Set([
    "pytorch",
    "tensorflow",
    "sklearn",
    "huggingface"
  ]);
  const DEVOPS_TECH = new Set(["kubernetes", "docker", "terraform"]);

  if (technologies.some((t) => FRONTEND_TECH.has(t))) return "frontend";
  if (technologies.some((t) => MOBILE_TECH.has(t))) return "mobile";
  if (technologies.some((t) => BACKEND_TECH.has(t))) return "backend";
  if (technologies.some((t) => ML_TECH.has(t))) return "ml";
  if (technologies.some((t) => DEVOPS_TECH.has(t))) return "devops";
  if (languages.includes("python") && technologies.includes("pandas"))
    return "data";

  return "any";
}

export function parseQuery(raw: string): ParsedQuery {
  const normalized = normalize(raw || "");

  const technologies = findMatches(normalized, TECH_ALIASES);
  const languages = findMatches(normalized, LANGUAGE_ALIASES);
  const intents = findMatches(normalized, INTENT_ALIASES);

  // Repo hints (owner/repo, github URLs, hyphenated project names) extracted
  // from the RAW input — must precede normalize() to keep slashes intact.
  const knownAliases = new Set<string>([
    ...Object.values(TECH_ALIASES).flat(),
    ...Object.values(LANGUAGE_ALIASES).flat(),
    ...Object.values(INTENT_ALIASES).flat()
  ]);
  const repoHints = extractRepoHints(raw, knownAliases);

  // Skill level
  let skillLevel: SkillLevel = "any";
  for (const level of ["beginner", "advanced", "intermediate"] as SkillLevel[]) {
    if (
      SKILL_ALIASES[level].some((kw) => normalized.includes(` ${kw} `))
    ) {
      skillLevel = level;
      break;
    }
  }

  // Category (explicit mention)
  let explicitCategory: Category | undefined;
  for (const cat of Object.keys(CATEGORY_ALIASES) as Category[]) {
    if (cat === "any") continue;
    const hit = CATEGORY_ALIASES[cat].some((kw) =>
      normalized.includes(` ${kw} `)
    );
    if (hit) {
      explicitCategory = cat;
      break;
    }
  }

  const category = inferCategory(technologies, languages, explicitCategory);

  // Remaining freeform keywords (anything > 2 chars that wasn't otherwise
  // captured). Capped to 8 to avoid noise.
  const stop = new Set([
    "i",
    "want",
    "to",
    "the",
    "a",
    "an",
    "of",
    "for",
    "with",
    "and",
    "or",
    "in",
    "on",
    "issue",
    "issues",
    "find",
    "looking",
    "know",
    "knows",
    "good",
    "first",
    "help",
    "wanted",
    "me",
    "my"
  ]);
  const allCaptured = new Set([
    ...technologies,
    ...languages,
    ...intents,
    ...(Object.values(SKILL_ALIASES).flat()),
    ...(Object.values(CATEGORY_ALIASES).flat()),
    ...(Object.values(TECH_ALIASES).flat()),
    ...(Object.values(LANGUAGE_ALIASES).flat()),
    ...(Object.values(INTENT_ALIASES).flat())
  ]);
  // Tokens already accounted for by repoHints (owner, repo, hyphenated names)
  // shouldn't pollute keyword matching.
  const repoTokens = new Set<string>();
  for (const h of repoHints) {
    for (const part of h.toLowerCase().split(/[\/\-]/)) {
      if (part.length > 2) repoTokens.add(part);
    }
  }

  const keywords = normalized
    .trim()
    .split(" ")
    .map((w) => w.trim())
    .filter(
      (w) =>
        w.length > 2 &&
        !stop.has(w) &&
        !allCaptured.has(w) &&
        !repoTokens.has(w) &&
        !/^\d+$/.test(w)
    )
    .slice(0, 8);

  return {
    raw: raw.trim(),
    technologies,
    languages,
    skillLevel,
    category,
    intents,
    keywords,
    repoHints
  };
}
