/**
 * Rate limiter — Upstash Redis (REST) when configured, in-memory fallback otherwise.
 *
 * Strategy: fixed window per-key (per-IP) using INCR + EXPIRE pipelined over REST.
 * No SDK dependency — we call the Upstash REST API directly via fetch.
 */

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number; // unix ms
  limit: number;
};

const memBuckets = new Map<string, { count: number; resetAt: number }>();
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < 30_000) return;
  lastSweep = now;
  for (const [k, v] of memBuckets) {
    if (v.resetAt <= now) memBuckets.delete(k);
  }
}

function memLimit(
  key: string,
  max: number,
  windowSec: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);
  let b = memBuckets.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + windowSec * 1000 };
    memBuckets.set(key, b);
  }
  b.count += 1;
  return {
    ok: b.count <= max,
    remaining: Math.max(0, max - b.count),
    resetAt: b.resetAt,
    limit: max
  };
}

async function upstashLimit(
  url: string,
  token: string,
  key: string,
  max: number,
  windowSec: number
): Promise<RateLimitResult> {
  try {
    // Atomic INCR + (set EXPIRE only on first hit). Single round-trip via pipeline.
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(windowSec), "NX"],
        ["PTTL", key]
      ]),
      // never cache rate-limit calls
      cache: "no-store"
    });
    if (!res.ok) throw new Error(`upstash ${res.status}`);
    const data = (await res.json()) as Array<{ result: number }>;
    const count = data[0]?.result ?? 1;
    const pttl = data[2]?.result ?? windowSec * 1000;
    const resetAt = Date.now() + (pttl > 0 ? pttl : windowSec * 1000);
    return {
      ok: count <= max,
      remaining: Math.max(0, max - count),
      resetAt,
      limit: max
    };
  } catch (e) {
    // On Upstash failure: fail open via in-memory (don't lock users out for infra).
    if (process.env.NODE_ENV !== "production") {
      console.warn("[rate-limit] Upstash error, falling back to memory:", e);
    }
    return memLimit(key, max, windowSec);
  }
}

export async function rateLimit(
  identifier: string,
  opts?: { max?: number; windowSec?: number; namespace?: string }
): Promise<RateLimitResult> {
  const max = opts?.max ?? Number(process.env.RATELIMIT_MAX || 30);
  const windowSec =
    opts?.windowSec ?? Number(process.env.RATELIMIT_WINDOW_SEC || 60);
  const ns = opts?.namespace ?? "rl";
  const key = `${ns}:${identifier}`;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return upstashLimit(url, token, key, max, windowSec);
  }
  return memLimit(key, max, windowSec);
}

/** Extract a best-effort client identifier from Next.js request headers. */
export function clientIdFromHeaders(h: Headers): string {
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return "anonymous";
}

export function hasUpstash(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}
