import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { getDb } from "./db/client";
import { users, profiles } from "./db/schema";

/**
 * User identity + sync layer.
 *
 * Clerk owns identity. We keep a thin mirror row in our DB so that profiles,
 * saved issues, and events can foreign-key to a stable user id (= Clerk id).
 *
 * EVERYTHING degrades gracefully:
 *  - not signed in            → returns null
 *  - DB not configured        → identity still works (returns Clerk id),
 *                               persistence-backed features simply no-op
 *  - any Clerk/DB error       → caught, logged in dev, returns null/no-op
 *
 * Never throws. Never breaks a page render.
 */

function findGithubAccount(
  accounts: { provider?: string; username?: string | null; providerUserId?: string }[]
): { username: string | null; providerUserId: string | null } | null {
  if (!Array.isArray(accounts)) return null;
  const gh = accounts.find(
    (a) => a.provider === "oauth_github" || a.provider === "github"
  );
  if (!gh) return null;
  return {
    username: gh.username ?? null,
    providerUserId: gh.providerUserId ?? null
  };
}

/** Current Clerk user id (fast — from the request auth state). */
export async function getUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}

export interface CurrentUserLite {
  id: string;
  githubLogin: string | null;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

/**
 * Ensure the signed-in user exists in our DB (idempotent upsert) plus an empty
 * profile row. Returns a lightweight user object, or null when not signed in.
 *
 * Safe to call on every authenticated entry point — it's a single upsert and
 * is the natural place to keep the mirror fresh.
 */
export async function ensureUser(): Promise<CurrentUserLite | null> {
  let clerkUser: Awaited<ReturnType<typeof currentUser>> = null;
  try {
    clerkUser = await currentUser();
  } catch {
    return null;
  }
  if (!clerkUser) return null;

  const gh = findGithubAccount(
    (clerkUser.externalAccounts as unknown as {
      provider?: string;
      username?: string | null;
      providerUserId?: string;
    }[]) || []
  );
  const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? null;
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  const lite: CurrentUserLite = {
    id: clerkUser.id,
    githubLogin: gh?.username ?? null,
    email,
    name,
    avatarUrl: clerkUser.imageUrl ?? null
  };

  const db = getDb();
  if (!db) return lite; // identity works without persistence

  try {
    const githubId = gh?.providerUserId
      ? Number.parseInt(gh.providerUserId, 10)
      : null;
    await db
      .insert(users)
      .values({
        id: lite.id,
        githubLogin: lite.githubLogin,
        githubId: Number.isFinite(githubId) ? githubId : null,
        email: lite.email,
        name: lite.name,
        avatarUrl: lite.avatarUrl,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          githubLogin: lite.githubLogin,
          email: lite.email,
          name: lite.name,
          avatarUrl: lite.avatarUrl,
          updatedAt: new Date()
        }
      });
    await db
      .insert(profiles)
      .values({ userId: lite.id })
      .onConflictDoNothing({ target: profiles.userId });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[user] ensureUser upsert failed:", err);
    }
  }

  return lite;
}

/**
 * Retrieve the user's GitHub OAuth access token via Clerk (for contribution
 * sync). Returns null when unavailable. Never throws.
 */
export async function getGithubToken(userId: string): Promise<string | null> {
  try {
    const client = await clerkClient();
    const res = await client.users.getUserOauthAccessToken(userId, "github");
    const token = res.data?.[0]?.token;
    return token ?? null;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[user] getGithubToken unavailable:", err);
    }
    return null;
  }
}
