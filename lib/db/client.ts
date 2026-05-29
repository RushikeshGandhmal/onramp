import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Guarded database client.
 *
 * Persistence is OPTIONAL — the entire product works without a database
 * (the Phase 1 MVP discovery flow needs no DB at all). Phase 2 features
 * (profiles, saved issues, personalization) light up only when DATABASE_URL
 * is set.
 *
 * `getDb()` returns `null` when no DATABASE_URL is configured. EVERY caller
 * must handle null and degrade gracefully — never throw, never break the app.
 *
 * We use Neon's HTTP driver (stateless fetch per query) which is the correct
 * choice for serverless/edge: no connection pool to exhaust, no cold-start
 * socket setup. Perfect for Vercel functions at scale.
 */

export type Database = NeonHttpDatabase<typeof schema>;

let cached: Database | null | undefined;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): Database | null {
  if (cached !== undefined) return cached;

  const url = process.env.DATABASE_URL;
  if (!url) {
    cached = null;
    return null;
  }

  try {
    const sql = neon(url);
    cached = drizzle(sql, { schema });
    return cached;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[db] failed to initialize Neon client:", err);
    }
    cached = null;
    return null;
  }
}

export { schema };
