"use server";

import { revalidatePath } from "next/cache";
import { getUserId, ensureUser } from "@/lib/user";
import { updateProfile, type ProfileUpdate } from "@/lib/profile";

export interface SaveProfileResult {
  ok: boolean;
  error?: string;
}

/**
 * Persist the user-editable profile fields. Source of truth for preferences.
 *
 * Ensures the FK target (user row) exists before writing. Returns ok:false with
 * a friendly message when persistence is unavailable so the form can surface it.
 */
export async function saveProfileAction(
  update: ProfileUpdate
): Promise<SaveProfileResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, error: "Not signed in." };

  await ensureUser();

  const result = await updateProfile(userId, update);
  if (result === false) {
    return {
      ok: false,
      error:
        "Couldn't save right now — this deployment may not have a database connected yet."
    };
  }

  revalidatePath("/app/profile");
  revalidatePath("/app");
  return { ok: true };
}
