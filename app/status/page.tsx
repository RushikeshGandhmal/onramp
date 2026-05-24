import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { hasAIConfigured } from "@/lib/ai";
import { hasGithubToken } from "@/lib/github";
import { hasUpstash } from "@/lib/rate-limit";
import { hasSentry } from "@/lib/site";

const hasClerkConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY
  );

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Status",
  description: "Live operational status of On-Ramp's dependencies."
};

type Check = {
  name: string;
  ok: boolean;
  detail: string;
  ms?: number;
};

async function pingGithub(): Promise<Check> {
  const t0 = Date.now();
  try {
    const headers: HeadersInit = {
      "User-Agent": "on-ramp-status",
      Accept: "application/vnd.github+json"
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const r = await fetch("https://api.github.com/rate_limit", {
      headers,
      cache: "no-store"
    });
    const ms = Date.now() - t0;
    if (!r.ok) {
      return { name: "GitHub API", ok: false, detail: `HTTP ${r.status}`, ms };
    }
    const d = await r.json();
    const core = d?.resources?.core;
    const search = d?.resources?.search;
    return {
      name: "GitHub API",
      ok: true,
      detail: `core ${core?.remaining ?? "?"}/${core?.limit ?? "?"} · search ${
        search?.remaining ?? "?"
      }/${search?.limit ?? "?"}`,
      ms
    };
  } catch (e: any) {
    return {
      name: "GitHub API",
      ok: false,
      detail: e?.message || "fetch failed",
      ms: Date.now() - t0
    };
  }
}

async function pingOpenRouter(): Promise<Check> {
  if (!process.env.OPENROUTER_API_KEY) {
    return {
      name: "OpenRouter",
      ok: true,
      detail: "Not configured · heuristic fallback active"
    };
  }
  const t0 = Date.now();
  try {
    const r = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      cache: "no-store"
    });
    const ms = Date.now() - t0;
    if (!r.ok) {
      return {
        name: "OpenRouter",
        ok: false,
        detail: `HTTP ${r.status}`,
        ms
      };
    }
    return { name: "OpenRouter", ok: true, detail: "key valid", ms };
  } catch (e: any) {
    return {
      name: "OpenRouter",
      ok: false,
      detail: e?.message || "fetch failed",
      ms: Date.now() - t0
    };
  }
}

function configCheck(): Check[] {
  return [
    {
      name: "GITHUB_TOKEN",
      ok: hasGithubToken(),
      detail: hasGithubToken()
        ? "set · 5000 req/hr"
        : "missing · 60 req/hr cap"
    },
    {
      name: "OPENROUTER_API_KEY",
      ok: hasAIConfigured(),
      detail: hasAIConfigured()
        ? "set · AI explanations on"
        : "missing · heuristic fallback"
    },
    {
      name: "Upstash Redis (rate-limit)",
      ok: hasUpstash(),
      detail: hasUpstash() ? "set · multi-instance safe" : "memory fallback"
    },
    {
      name: "Clerk (sign-in/up)",
      ok: hasClerkConfigured(),
      detail: hasClerkConfigured()
        ? "set · users can sign in & up"
        : "unset · auth disabled"
    },
    {
      name: "Sentry (monitoring)",
      ok: hasSentry(),
      detail: hasSentry() ? "set" : "disabled"
    }
  ];
}

export default async function StatusPage() {
  const [gh, or] = await Promise.all([pingGithub(), pingOpenRouter()]);
  const cfg = configCheck();
  const liveChecks: Check[] = [gh, or];
  const overall = liveChecks.every((c) => c.ok);

  return (
    <main>
      <Header />
      <section className="mx-auto max-w-2xl px-5 py-12">
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`h-3 w-3 rounded-full ${
              overall ? "bg-ok" : "bg-warn"
            } shadow-[0_0_10px_currentColor]`}
            aria-hidden
          />
          <h1 className="text-3xl font-semibold tracking-tight">
            {overall ? "All systems normal" : "Degraded service"}
          </h1>
        </div>
        <p className="text-ink-mute mb-8 leading-relaxed">
          Live checks against the services On-Ramp depends on. Refresh this
          page anytime — it&apos;s never cached.
        </p>

        <h2 className="text-xs font-semibold tracking-wider text-ink-dim uppercase mb-3">
          Live checks
        </h2>
        <div className="card divide-y divide-bg-border mb-8">
          {liveChecks.map((c) => (
            <Row key={c.name} c={c} />
          ))}
        </div>

        <h2 className="text-xs font-semibold tracking-wider text-ink-dim uppercase mb-3">
          Environment
        </h2>
        <div className="card divide-y divide-bg-border mb-8">
          {cfg.map((c) => (
            <Row key={c.name} c={c} kind="config" />
          ))}
        </div>

        <p className="text-xs text-ink-dim">
          Checked at {new Date().toISOString()}
        </p>

        <div className="mt-10">
          <Link href="/" className="btn-ghost">← Back home</Link>
        </div>
      </section>
    </main>
  );
}

function Row({ c, kind = "live" }: { c: Check; kind?: "live" | "config" }) {
  return (
    <div className="flex items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`h-2 w-2 rounded-full ${
            c.ok ? "bg-ok" : "bg-warn"
          } shadow-[0_0_8px_currentColor]`}
          aria-hidden
        />
        <span className="font-medium truncate">{c.name}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-ink-mute shrink-0">
        <span className="truncate max-w-[260px]">{c.detail}</span>
        {kind === "live" && typeof c.ms === "number" && (
          <span className="font-mono text-ink-dim">{c.ms}ms</span>
        )}
      </div>
    </div>
  );
}
