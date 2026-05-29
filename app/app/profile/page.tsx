import { ensureUser } from "@/lib/user";
import { getProfile } from "@/lib/profile";
import { isDbConfigured } from "@/lib/db/client";
import { ProfileForm } from "@/components/ProfileForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilePage() {
  const user = await ensureUser();
  const profile = user
    ? await getProfile(user.id)
    : {
        userId: "",
        preferredTechnologies: [],
        preferredLanguages: [],
        preferredCategories: [],
        contributionInterests: [],
        skillLevel: "any" as const,
        inferredFocus: null,
        onboarded: false
      };

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 flex items-start gap-4">
        {user?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="h-14 w-14 rounded-full border border-bg-border"
          />
        ) : null}
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-brand-soft mb-2">
            Your profile
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {user?.name || user?.githubLogin || "Your profile"}
          </h1>
          <p className="text-sm text-ink-mute mt-1">
            {user?.githubLogin ? (
              <span className="font-mono">@{user.githubLogin}</span>
            ) : (
              "Tell us what you like — recommendations adapt to it."
            )}
          </p>
          {profile.inferredFocus && (
            <p className="mt-2 text-xs text-ink-dim">
              We&apos;ve noticed you lean{" "}
              <span className="text-brand-soft font-medium">
                {profile.inferredFocus}
              </span>
              .
            </p>
          )}
        </div>
      </div>

      <ProfileForm profile={profile} dbReady={isDbConfigured()} />
    </main>
  );
}
