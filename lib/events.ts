import { getDb } from "./db/client";
import { issueEvents } from "./db/schema";
import type { IssueEventType } from "./types";

/**
 * Lightweight behavioural event recording.
 *
 * Events are the raw signal behind personalization + inferred skill focus.
 * Recording is fire-and-forget and NEVER blocks or breaks a user action:
 *  - DB not configured → no-op
 *  - any error         → swallowed (logged in dev)
 *
 * Aggregation/signal derivation lives in `lib/personalization.ts`.
 */

export interface RecordEventInput {
  eventType: IssueEventType;
  issueKey?: string | null;
  owner?: string | null;
  name?: string | null;
  category?: string | null;
  difficulty?: string | null;
  languages?: string[];
  technologies?: string[];
  query?: string | null;
}

export async function recordEvent(
  userId: string,
  input: RecordEventInput
): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    await db.insert(issueEvents).values({
      userId,
      eventType: input.eventType,
      issueKey: input.issueKey ?? null,
      owner: input.owner ?? null,
      name: input.name ?? null,
      category: input.category ?? null,
      difficulty: input.difficulty ?? null,
      languages: input.languages ?? [],
      technologies: input.technologies ?? [],
      query: input.query ?? null
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[events] recordEvent failed:", err);
    }
  }
}
