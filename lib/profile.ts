import { eq } from "drizzle-orm";
import { getDb } from "./db/client";
import { profiles, type ProfileRow } from "./db/schema";
import type { Category, SkillLevel, UserProfile } from "./types";

/**
 * User profile data layer.
 *
 * Profiles are lightweight, developer-focused preference records. All reads
 * degrade to a sensible empty default; all writes degrade to false when the DB
 * is not configured. Never throws.
 *
 * `inferredFocus` is written by the personalization layer, NOT the user form.
 */

const VALID_CATEGORIES: Category[] = [
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "devops",
  "data",
  "ml",
  "docs",
  "testing",
  "design",
  "any"
];

const VALID_SKILL: SkillLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
  "any"
];

export function emptyProfile(userId: string): UserProfile {
  return {
    userId,
    preferredTechnologies: [],
    preferredLanguages: [],
    preferredCategories: [],
    contributionInterests: [],
    skillLevel: "any",
    inferredFocus: null,
    onboarded: false
  };
}

function rowToProfile(r: ProfileRow): UserProfile {
  return {
    userId: r.userId,
    preferredTechnologies: r.preferredTechnologies ?? [],
    preferredLanguages: r.preferredLanguages ?? [],
    preferredCategories: (r.preferredCategories ?? []).filter((c): c is Category =>
      VALID_CATEGORIES.includes(c as Category)
    ),
    contributionInterests: r.contributionInterests ?? [],
    skillLevel: VALID_SKILL.includes(r.skillLevel as SkillLevel)
      ? (r.skillLevel as SkillLevel)
      : "any",
    inferredFocus: r.inferredFocus ?? null,
    onboarded: r.onboarded ?? false
  };
}

export async function getProfile(userId: string): Promise<UserProfile> {
  const db = getDb();
  if (!db) return emptyProfile(userId);
  try {
    const [row] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    return row ? rowToProfile(row) : emptyProfile(userId);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[profile] getProfile failed:", err);
    }
    return emptyProfile(userId);
  }
}

export interface ProfileUpdate {
  preferredTechnologies?: string[];
  preferredLanguages?: string[];
  preferredCategories?: string[];
  contributionInterests?: string[];
  skillLevel?: string;
}

/** Normalize a free-form string list: trim, lowercase, dedupe, cap length. */
function cleanList(list: unknown, max = 24): string[] {
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    if (typeof raw !== "string") continue;
    const v = raw.trim().toLowerCase().slice(0, 40);
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Upsert the user-editable parts of a profile. Caller must have ensured the
 * user row exists (FK). Returns the persisted profile or false on failure.
 */
export async function updateProfile(
  userId: string,
  update: ProfileUpdate
): Promise<UserProfile | false> {
  const db = getDb();
  if (!db) return false;

  const skill = VALID_SKILL.includes(update.skillLevel as SkillLevel)
    ? (update.skillLevel as SkillLevel)
    : "any";
  const categories = cleanList(update.preferredCategories).filter((c) =>
    VALID_CATEGORIES.includes(c as Category)
  );

  const values = {
    userId,
    preferredTechnologies: cleanList(update.preferredTechnologies),
    preferredLanguages: cleanList(update.preferredLanguages),
    preferredCategories: categories,
    contributionInterests: cleanList(update.contributionInterests),
    skillLevel: skill,
    onboarded: true,
    updatedAt: new Date()
  };

  try {
    const [row] = await db
      .insert(profiles)
      .values(values)
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          preferredTechnologies: values.preferredTechnologies,
          preferredLanguages: values.preferredLanguages,
          preferredCategories: values.preferredCategories,
          contributionInterests: values.contributionInterests,
          skillLevel: values.skillLevel,
          onboarded: true,
          updatedAt: values.updatedAt
        }
      })
      .returning();
    return row ? rowToProfile(row) : false;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[profile] updateProfile failed:", err);
    }
    return false;
  }
}

/** Write the inferred focus (personalization layer only). Never throws. */
export async function setInferredFocus(
  userId: string,
  focus: string | null
): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    await db
      .update(profiles)
      .set({ inferredFocus: focus, inferredAt: new Date() })
      .where(eq(profiles.userId, userId));
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[profile] setInferredFocus failed:", err);
    }
  }
}
