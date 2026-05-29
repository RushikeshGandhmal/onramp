import type {
  ContributionSummary,
  PersonalizationSignals,
  UserProfile
} from "./types";
import { getDb } from "./db/client";
import { profiles } from "./db/schema";
import { eq } from "drizzle-orm";
import { inferFocus } from "./personalization";

/**
 * AI skill understanding (Phase 2 — conservative, no fake confidence).
 *
 * Combines three honest signals into a gentle skill picture:
 *   1. explicit profile preferences (strongest)
 *   2. behavioural events (saves/views/searches) → inferFocus()
 *   3. real GitHub contribution languages (when token available)
 *
 * Produces:
 *   - focus label ("frontend-focused", …) or null when unclear
 *   - comfort level ("exploring" | "getting comfortable" | "experienced")
 *   - top languages merged from behaviour + contributions
 *
 * Persists the inferred focus back to the profile (best-effort) so the rest of
 * the app can read it cheaply. Never throws.
 */

export interface SkillUnderstanding {
  focus: string | null;
  comfort: "exploring" | "getting comfortable" | "experienced";
  topLanguages: string[];
  strengths: string[];
  confident: boolean; // whether we have enough signal to show this prominently
}

function mergeLanguages(
  signals: PersonalizationSignals,
  contributions: ContributionSummary | null
): string[] {
  const weights: Record<string, number> = {};
  for (const [lang, w] of Object.entries(signals.languages)) {
    weights[lang.toLowerCase()] = (weights[lang.toLowerCase()] ?? 0) + w;
  }
  // Real merged-PR languages are the strongest evidence of actual ability.
  if (contributions?.available) {
    contributions.topLanguages.forEach((lang, i) => {
      const k = lang.toLowerCase();
      weights[k] = (weights[k] ?? 0) + (6 - i) * 2; // 12,10,8,6,4
    });
  }
  return Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang]) => lang);
}

function deriveComfort(
  signals: PersonalizationSignals,
  contributions: ContributionSummary | null,
  profile: UserProfile | null
): SkillUnderstanding["comfort"] {
  const merged = contributions?.available ? contributions.mergedPrCount : 0;
  if (merged >= 10 || profile?.skillLevel === "advanced") return "experienced";
  if (
    merged >= 2 ||
    signals.eventCount >= 15 ||
    profile?.skillLevel === "intermediate"
  ) {
    return "getting comfortable";
  }
  return "exploring";
}

function deriveStrengths(
  focus: string | null,
  topLanguages: string[],
  contributions: ContributionSummary | null
): string[] {
  const out: string[] = [];
  if (focus) out.push(focus);
  if (topLanguages.length > 0) {
    out.push(`${topLanguages.slice(0, 3).join(", ")}`);
  }
  if (contributions?.available && contributions.mergedPrCount > 0) {
    out.push(
      `${contributions.mergedPrCount} merged PR${
        contributions.mergedPrCount === 1 ? "" : "s"
      }`
    );
  }
  return out;
}

/**
 * Build the skill understanding for a user. Pure (does not write).
 */
export function buildSkillUnderstanding(
  signals: PersonalizationSignals,
  profile: UserProfile | null,
  contributions: ContributionSummary | null
): SkillUnderstanding {
  const focus = inferFocus(signals, profile);
  const topLanguages = mergeLanguages(signals, contributions);
  const comfort = deriveComfort(signals, contributions, profile);
  const strengths = deriveStrengths(focus, topLanguages, contributions);

  const confident =
    signals.hasSignal ||
    (!!contributions?.available && contributions.mergedPrCount > 0);

  return { focus, comfort, topLanguages, strengths, confident };
}

/**
 * Persist the inferred focus to the profile row (best-effort, debounced by the
 * caller via cache). Only writes when it actually changes, to avoid churn.
 */
export async function persistInferredFocus(
  userId: string,
  focus: string | null,
  previous: string | null
): Promise<void> {
  if (focus === previous) return;
  const db = getDb();
  if (!db || !userId) return;
  try {
    await db
      .update(profiles)
      .set({
        inferredFocus: focus,
        inferredAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(profiles.userId, userId));
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[skills] persistInferredFocus failed:", err);
    }
  }
}
