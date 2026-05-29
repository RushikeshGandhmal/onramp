"use server";

import { revalidatePath } from "next/cache";
import { getUserId, ensureUser } from "@/lib/user";
import {
  saveIssueRow,
  unsaveIssue,
  updateSavedStatus,
  issueKey,
  type SaveIssueInput
} from "@/lib/saved";
import { recordEvent } from "@/lib/events";
import type { SavedIssue } from "@/lib/types";

export interface ToggleSaveInput extends SaveIssueInput {
  technologies?: string[];
}

export interface ToggleSaveResult {
  saved: boolean;
  ok: boolean;
}

/**
 * Toggle a bookmark. Optimistic UI is driven client-side; this is the source
 * of truth. `currentlySaved` is the state BEFORE the click.
 *
 * Returns the authoritative new saved state. On failure, returns the unchanged
 * state with ok=false so the client can revert.
 */
export async function toggleSaveAction(
  input: ToggleSaveInput,
  currentlySaved: boolean
): Promise<ToggleSaveResult> {
  const userId = await getUserId();
  if (!userId) return { saved: currentlySaved, ok: false };

  // Make sure the FK target exists before writing.
  await ensureUser();

  const key = issueKey(input.owner, input.name, input.number);

  try {
    if (currentlySaved) {
      const ok = await unsaveIssue(userId, key);
      if (!ok) return { saved: currentlySaved, ok: false };
      void recordEvent(userId, {
        eventType: "unsave",
        issueKey: key,
        owner: input.owner,
        name: input.name,
        category: input.category ?? null,
        difficulty: input.difficulty ?? null,
        languages: input.repoLanguage ? [input.repoLanguage.toLowerCase()] : [],
        technologies: input.technologies ?? []
      });
      revalidatePath("/app/saved");
      revalidatePath("/app");
      return { saved: false, ok: true };
    }

    const ok = await saveIssueRow(userId, input);
    if (!ok) return { saved: currentlySaved, ok: false };
    void recordEvent(userId, {
      eventType: "save",
      issueKey: key,
      owner: input.owner,
      name: input.name,
      category: input.category ?? null,
      difficulty: input.difficulty ?? null,
      languages: input.repoLanguage ? [input.repoLanguage.toLowerCase()] : [],
      technologies: input.technologies ?? []
    });
    revalidatePath("/app/saved");
    revalidatePath("/app");
    return { saved: true, ok: true };
  } catch {
    return { saved: currentlySaved, ok: false };
  }
}

export async function updateSavedStatusAction(
  key: string,
  status: SavedIssue["status"]
): Promise<{ ok: boolean }> {
  const userId = await getUserId();
  if (!userId) return { ok: false };
  const ok = await updateSavedStatus(userId, key, status);
  if (ok) revalidatePath("/app/saved");
  return { ok };
}
