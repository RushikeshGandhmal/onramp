/**
 * In-process search result cache.
 *
 * Caches identical normalised queries for 60s. Reduces GitHub + OpenRouter
 * spend during traffic spikes (e.g. someone refreshing or many people
 * searching the same trending query).
 *
 * Per-instance (serverless cold start clears). Good enough for MVP scale.
 * For multi-instance prod, swap to Upstash with the same interface.
 */

type Entry<T> = { value: T; expiresAt: number };
const store = new Map<string, Entry<unknown>>();
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < 30_000) return;
  lastSweep = now;
  for (const [k, v] of store) {
    if (v.expiresAt <= now) store.delete(k);
  }
}

export function cacheGet<T>(key: string): T | undefined {
  const now = Date.now();
  sweep(now);
  const e = store.get(key);
  if (!e) return undefined;
  if (e.expiresAt <= now) {
    store.delete(key);
    return undefined;
  }
  return e.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export async function cached<T>(
  key: string,
  ttlMs: number,
  produce: () => Promise<T>
): Promise<T> {
  const hit = cacheGet<T>(key);
  if (hit !== undefined) return hit;
  const value = await produce();
  cacheSet(key, value, ttlMs);
  return value;
}
