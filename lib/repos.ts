import type { RepoMeta } from "./types";

/**
 * Curated list of high-quality OSS repos known for being beginner-friendly
 * and actively maintained. We index this list and broaden as we learn.
 *
 * Categories tag the dominant work surface; the ranker still uses labels +
 * topics + the user's query to refine matches.
 */
export const CURATED_REPOS: RepoMeta[] = [
  // ───────── Frontend ─────────
  {
    owner: "facebook",
    name: "react",
    primaryLanguage: "javascript",
    topics: ["react", "javascript", "ui", "frontend"],
    category: "frontend",
    description: "The library for web and native user interfaces."
  },
  {
    owner: "vercel",
    name: "next.js",
    primaryLanguage: "typescript",
    topics: ["react", "nextjs", "typescript", "frontend", "ssr"],
    category: "fullstack",
    description: "The React framework for the web."
  },
  {
    owner: "vuejs",
    name: "core",
    primaryLanguage: "typescript",
    topics: ["vue", "javascript", "typescript", "frontend"],
    category: "frontend",
    description: "Vue.js core framework."
  },
  {
    owner: "sveltejs",
    name: "svelte",
    primaryLanguage: "typescript",
    topics: ["svelte", "javascript", "typescript", "frontend"],
    category: "frontend",
    description: "Cybernetically enhanced web apps."
  },
  {
    owner: "tailwindlabs",
    name: "tailwindcss",
    primaryLanguage: "typescript",
    topics: ["css", "tailwind", "frontend", "design"],
    category: "frontend",
    description: "A utility-first CSS framework."
  },
  {
    owner: "shadcn-ui",
    name: "ui",
    primaryLanguage: "typescript",
    topics: ["react", "typescript", "ui", "components", "frontend"],
    category: "frontend",
    description: "Beautifully designed components built with Radix UI and Tailwind CSS."
  },
  {
    owner: "mui",
    name: "material-ui",
    primaryLanguage: "typescript",
    topics: ["react", "typescript", "ui", "components", "frontend"],
    category: "frontend",
    description: "Material UI: Comprehensive React component library."
  },
  {
    owner: "withastro",
    name: "astro",
    primaryLanguage: "typescript",
    topics: ["astro", "typescript", "ssg", "frontend"],
    category: "frontend",
    description: "The web framework for content-driven websites."
  },

  // ───────── Backend / API ─────────
  {
    owner: "nestjs",
    name: "nest",
    primaryLanguage: "typescript",
    topics: ["typescript", "backend", "nodejs", "api"],
    category: "backend",
    description: "A progressive Node.js framework for building scalable server-side apps."
  },
  {
    owner: "expressjs",
    name: "express",
    primaryLanguage: "javascript",
    topics: ["javascript", "nodejs", "backend", "api", "http"],
    category: "backend",
    description: "Fast, unopinionated, minimalist web framework for Node.js."
  },
  {
    owner: "fastify",
    name: "fastify",
    primaryLanguage: "javascript",
    topics: ["javascript", "typescript", "nodejs", "backend", "api"],
    category: "backend",
    description: "Fast and low overhead web framework for Node.js."
  },
  {
    owner: "django",
    name: "django",
    primaryLanguage: "python",
    topics: ["python", "backend", "web", "django"],
    category: "backend",
    description: "The web framework for perfectionists with deadlines."
  },
  {
    owner: "pallets",
    name: "flask",
    primaryLanguage: "python",
    topics: ["python", "backend", "web", "flask"],
    category: "backend",
    description: "The Python micro framework for building web applications."
  },
  {
    owner: "tiangolo",
    name: "fastapi",
    primaryLanguage: "python",
    topics: ["python", "backend", "api", "fastapi", "asyncio"],
    category: "backend",
    description: "FastAPI framework, high performance, easy to learn."
  },
  {
    owner: "rails",
    name: "rails",
    primaryLanguage: "ruby",
    topics: ["ruby", "rails", "backend", "web"],
    category: "backend",
    description: "Ruby on Rails."
  },
  {
    owner: "gin-gonic",
    name: "gin",
    primaryLanguage: "go",
    topics: ["go", "golang", "backend", "api", "http"],
    category: "backend",
    description: "Gin is a HTTP web framework written in Go."
  },

  // ───────── Fullstack / Tools ─────────
  {
    owner: "prisma",
    name: "prisma",
    primaryLanguage: "typescript",
    topics: ["database", "orm", "typescript", "backend"],
    category: "backend",
    description: "Next-generation ORM for Node.js & TypeScript."
  },
  {
    owner: "supabase",
    name: "supabase",
    primaryLanguage: "typescript",
    topics: ["typescript", "postgres", "backend", "auth", "database"],
    category: "fullstack",
    description: "The open source Firebase alternative."
  },
  {
    owner: "TanStack",
    name: "query",
    primaryLanguage: "typescript",
    topics: ["react", "typescript", "data", "frontend"],
    category: "frontend",
    description: "Powerful asynchronous state management for TS/JS."
  },
  {
    owner: "trpc",
    name: "trpc",
    primaryLanguage: "typescript",
    topics: ["typescript", "api", "rpc", "fullstack"],
    category: "fullstack",
    description: "End-to-end typesafe APIs made easy."
  },

  // ───────── DevOps / Infra ─────────
  {
    owner: "kubernetes",
    name: "kubernetes",
    primaryLanguage: "go",
    topics: ["go", "kubernetes", "devops", "infrastructure"],
    category: "devops",
    description: "Production-Grade Container Scheduling and Management."
  },
  {
    owner: "grafana",
    name: "grafana",
    primaryLanguage: "typescript",
    topics: ["typescript", "go", "monitoring", "observability"],
    category: "devops",
    description: "The open and composable observability and data visualization platform."
  },

  // ───────── Data / ML ─────────
  {
    owner: "pandas-dev",
    name: "pandas",
    primaryLanguage: "python",
    topics: ["python", "data", "analytics"],
    category: "data",
    description: "Flexible and powerful data analysis / manipulation library for Python."
  },
  {
    owner: "scikit-learn",
    name: "scikit-learn",
    primaryLanguage: "python",
    topics: ["python", "ml", "machine-learning", "data"],
    category: "ml",
    description: "Machine learning in Python."
  },
  {
    owner: "huggingface",
    name: "transformers",
    primaryLanguage: "python",
    topics: ["python", "ml", "nlp", "ai"],
    category: "ml",
    description: "State-of-the-art Machine Learning for PyTorch, TensorFlow and JAX."
  },

  // ───────── Mobile ─────────
  {
    owner: "facebook",
    name: "react-native",
    primaryLanguage: "javascript",
    topics: ["javascript", "react", "mobile", "ios", "android"],
    category: "mobile",
    description: "A framework for building native applications using React."
  },
  {
    owner: "flutter",
    name: "flutter",
    primaryLanguage: "dart",
    topics: ["dart", "flutter", "mobile", "ios", "android"],
    category: "mobile",
    description: "Flutter makes it easy and fast to build beautiful apps."
  },

  // ───────── Editors / Productivity ─────────
  {
    owner: "microsoft",
    name: "vscode",
    primaryLanguage: "typescript",
    topics: ["typescript", "editor", "tools"],
    category: "fullstack",
    description: "Visual Studio Code."
  },
  {
    owner: "excalidraw",
    name: "excalidraw",
    primaryLanguage: "typescript",
    topics: ["typescript", "react", "drawing", "frontend"],
    category: "frontend",
    description: "Virtual whiteboard for sketching hand-drawn like diagrams."
  },
  {
    owner: "appwrite",
    name: "appwrite",
    primaryLanguage: "typescript",
    topics: ["backend", "baas", "typescript", "php"],
    category: "fullstack",
    description: "Build like a team of hundreds."
  },
  {
    owner: "PostHog",
    name: "posthog",
    primaryLanguage: "python",
    topics: ["python", "typescript", "analytics", "backend"],
    category: "fullstack",
    description: "Open-source product analytics."
  },
  {
    owner: "n8n-io",
    name: "n8n",
    primaryLanguage: "typescript",
    topics: ["typescript", "automation", "nodejs", "workflow"],
    category: "fullstack",
    description: "Free and source-available fair-code licensed workflow automation tool."
  },
  {
    owner: "vercel",
    name: "swr",
    primaryLanguage: "typescript",
    topics: ["react", "typescript", "data", "frontend"],
    category: "frontend",
    description: "React Hooks for data fetching."
  },
  {
    owner: "remix-run",
    name: "remix",
    primaryLanguage: "typescript",
    topics: ["react", "typescript", "fullstack", "framework"],
    category: "fullstack",
    description: "Build better websites with Remix."
  },

  // ───────── Rust ─────────
  {
    owner: "clap-rs",
    name: "clap",
    primaryLanguage: "rust",
    topics: ["rust", "cli", "command-line", "parser"],
    category: "backend",
    description: "A full-featured, fast Command Line Argument Parser for Rust."
  },
  {
    owner: "BurntSushi",
    name: "ripgrep",
    primaryLanguage: "rust",
    topics: ["rust", "cli", "search", "command-line"],
    category: "backend",
    description: "Recursively searches directories for a regex pattern, faster than grep."
  },
  {
    owner: "starship",
    name: "starship",
    primaryLanguage: "rust",
    topics: ["rust", "cli", "shell", "prompt", "terminal"],
    category: "backend",
    description: "The minimal, blazing-fast, infinitely customizable prompt for any shell."
  },
  {
    owner: "nushell",
    name: "nushell",
    primaryLanguage: "rust",
    topics: ["rust", "cli", "shell", "terminal"],
    category: "backend",
    description: "A new type of shell."
  },
  {
    owner: "tauri-apps",
    name: "tauri",
    primaryLanguage: "rust",
    topics: ["rust", "desktop", "tauri", "webview"],
    category: "fullstack",
    description: "Build smaller, faster, and more secure desktop applications with a web frontend."
  },
  {
    owner: "bevyengine",
    name: "bevy",
    primaryLanguage: "rust",
    topics: ["rust", "gamedev", "engine"],
    category: "any",
    description: "A refreshingly simple data-driven game engine built in Rust."
  },
  {
    owner: "helix-editor",
    name: "helix",
    primaryLanguage: "rust",
    topics: ["rust", "editor", "terminal", "cli"],
    category: "backend",
    description: "A post-modern modal text editor."
  },
  {
    owner: "biomejs",
    name: "biome",
    primaryLanguage: "rust",
    topics: ["rust", "javascript", "linter", "formatter", "tooling"],
    category: "frontend",
    description: "A toolchain for web projects, aimed to provide functionalities to maintain them."
  },
  {
    owner: "astral-sh",
    name: "ruff",
    primaryLanguage: "rust",
    topics: ["rust", "python", "linter", "formatter", "cli"],
    category: "backend",
    description: "An extremely fast Python linter and formatter, written in Rust."
  },
  {
    owner: "meilisearch",
    name: "meilisearch",
    primaryLanguage: "rust",
    topics: ["rust", "search", "search-engine", "api"],
    category: "backend",
    description: "A lightning-fast search engine API."
  },
  {
    owner: "denoland",
    name: "deno",
    primaryLanguage: "rust",
    topics: ["rust", "typescript", "javascript", "runtime"],
    category: "backend",
    description: "A modern runtime for JavaScript and TypeScript."
  },

  // ───────── Java / Kotlin / JVM ─────────
  {
    owner: "spring-projects",
    name: "spring-boot",
    primaryLanguage: "java",
    topics: ["java", "spring", "backend", "framework"],
    category: "backend",
    description: "Spring Boot helps you create stand-alone, production-grade Spring apps."
  },
  {
    owner: "JetBrains",
    name: "kotlin",
    primaryLanguage: "kotlin",
    topics: ["kotlin", "jvm", "language"],
    category: "backend",
    description: "The Kotlin Programming Language."
  },
  {
    owner: "elastic",
    name: "elasticsearch",
    primaryLanguage: "java",
    topics: ["java", "search", "backend", "database"],
    category: "backend",
    description: "Free and Open Source, Distributed, RESTful Search Engine."
  },

  // ───────── C++ / C# / .NET ─────────
  {
    owner: "microsoft",
    name: "terminal",
    primaryLanguage: "c++",
    topics: ["cpp", "windows", "terminal", "cli"],
    category: "frontend",
    description: "The new Windows Terminal and the original Windows console host."
  },
  {
    owner: "electron",
    name: "electron",
    primaryLanguage: "c++",
    topics: ["cpp", "javascript", "desktop", "framework"],
    category: "fullstack",
    description: "Build cross-platform desktop apps with JavaScript, HTML, and CSS."
  },
  {
    owner: "dotnet",
    name: "runtime",
    primaryLanguage: "c#",
    topics: ["csharp", "dotnet", "runtime"],
    category: "backend",
    description: ".NET is a cross-platform runtime for cloud, mobile, desktop, and IoT apps."
  },

  // ───────── PHP / Swift ─────────
  {
    owner: "laravel",
    name: "framework",
    primaryLanguage: "php",
    topics: ["php", "laravel", "backend", "framework"],
    category: "backend",
    description: "The Laravel Framework."
  },
  {
    owner: "vapor",
    name: "vapor",
    primaryLanguage: "swift",
    topics: ["swift", "server", "backend", "web"],
    category: "backend",
    description: "A server-side Swift HTTP web framework."
  }
];

export function reposByCategory(category: string): RepoMeta[] {
  if (category === "any") return CURATED_REPOS;
  return CURATED_REPOS.filter((r) => r.category === category);
}

export function reposByLanguage(language: string): RepoMeta[] {
  const lang = language.toLowerCase();
  return CURATED_REPOS.filter(
    (r) => r.primaryLanguage.toLowerCase() === lang || r.topics.includes(lang)
  );
}
