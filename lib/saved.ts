import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "./db/client";
import { savedIssues, type SavedIssueRow } from "./db/schema";
import type { SavedIssue } from "./types";

/**
 * Saved issues (bookmarks) data layer.
 *
 * All reads degrade to empty, all writes degrade to false when the DB is not
 * configured. Never throws.
 */

export function issueKey(owner: string, name: string, number: number): string {
  return `${owner}/${name}#${number}`;
}

export interface SaveIssueInput {
  owner: string;
  name: string;
  number: number;
  title: string;
  htmlUrl: string;
  repoLanguage?: string | null;
  category?: string | null;
  difficulty?: string | null;
  labels?: string[];
  tags?: string[];
  aiSummary?: string | null;
}

function rowToSaved(r: SavedIssueRow): SavedIssue {
  return {
    id: r.id,
    issueKey: r.issueKey,
    owner: r.owner,
    name: r.name,
    number: r.number,
    title: r.title,
    htmlUrl: r.htmlUrl,
    repoLanguage: r.repoLanguage,
    category: r.category,
    difficulty: r.difficulty,
    labels: r.labels ?? [],
    tags: r.tags ?? [],
    aiSummary: r.aiSummary,
    note: r.note,
    status: (r.status as SavedIssue["status"]) ?? "saved",
    savedAt:
      r.savedAt instanceof Date
        ? r.savedAt.toISOString()
        : new Date(r.savedAt as unknown as string).toISOString()
  };
}

export async function listSavedIssues(userId: string): Promise<SavedIssue[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const rows = await db
      .select()
      .from(savedIssues)
      .where(eq(savedIssues.userId, userId))
      .orderBy(desc(savedIssues.savedAt));
    return rows.map(rowToSaved);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[saved] listSavedIssues failed:", err);
    }
    return [];
  }
}

/** Returns the subset of `keys` that the user has already saved. */
export async function getSavedKeys(
  userId: string,
  keys: string[]
): Promise<Set<string>> {
  const db = getDb();
  if (!db || keys.length === 0) return new Set();
  try {
    const rows = await db
      .select({ key: savedIssues.issueKey })
      .from(savedIssues)
      .where(
        and(eq(savedIssues.userId, userId), inArray(savedIssues.issueKey, keys))
      );
    return new Set(rows.map((r) => r.key));
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[saved] getSavedKeys failed:", err);
    }
    return new Set();
  }
}

export async function isSaved(userId: string, key: string): Promise<boolean> {
  const set = await getSavedKeys(userId, [key]);
  return set.has(key);
}

export async function countSaved(userId: string): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  try {
    const [row] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(savedIssues)
      .where(eq(savedIssues.userId, userId));
    return row?.c ?? 0;
  } catch {
    return 0;
  }
}

/** Insert a bookmark (idempotent on user+issue). Returns true on success. */
export async function saveIssueRow(
  userId: string,
  input: SaveIssueInput
): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    await db
      .insert(savedIssues)
      .values({
        userId,
        issueKey: issueKey(input.owner, input.name, input.number),
        owner: input.owner,
        name: input.name,
        number: input.number,
        title: input.title,
        htmlUrl: input.htmlUrl,
        repoLanguage: input.repoLanguage ?? null,
        category: input.category ?? null,
        difficulty: input.difficulty ?? null,
        labels: input.labels ?? [],
        tags: input.tags ?? [],
        aiSummary: input.aiSummary ?? null
      })
      .onConflictDoNothing({
        target: [savedIssues.userId, savedIssues.issueKey]
      });
    return true;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[saved] saveIssueRow failed:", err);
    }
    return false;
  }
}

export async function unsaveIssue(
  userId: string,
  key: string
): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    await db
      .delete(savedIssues)
      .where(
        and(eq(savedIssues.userId, userId), eq(savedIssues.issueKey, key))
      );
    return true;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[saved] unsaveIssue failed:", err);
    }
    return false;
  }
}

export async function updateSavedStatus(
  userId: string,
  key: string,
  status: SavedIssue["status"]
): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    await db
      .update(savedIssues)
      .set({ status })
      .where(
        and(eq(savedIssues.userId, userId), eq(savedIssues.issueKey, key))
      );
    return true;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[saved] updateSavedStatus failed:", err);
    }
    return false;
  }
}
