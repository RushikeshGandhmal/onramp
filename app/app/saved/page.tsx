import Link from "next/link";
import { ensureUser } from "@/lib/user";
import { listSavedIssues } from "@/lib/saved";
import { isDbConfigured } from "@/lib/db/client";
import { SavedIssueRow } from "@/components/SavedIssueRow";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SavedPage() {
  const user = await ensureUser();
  const saved = user ? await listSavedIssues(user.id) : [];

  const counts = {
    all: saved.length,
    saved: saved.filter((s) => s.status === "saved").length,
    in_progress: saved.filter((s) => s.status === "in_progress").length,
    done: saved.filter((s) => s.status === "done").length
  };

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-brand-soft mb-2">
          Your workspace
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1">
          Saved issues
        </h1>
        <p className="text-sm text-ink-mute">
          Bookmark issues while you search, track what you&apos;re working on,
          and revisit them anytime.
        </p>
      </div>

      {!isDbConfigured() ? (
        <UnavailableNote />
      ) : saved.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-5 text-xs text-ink-dim">
            <span className="chip">{counts.all} total</span>
            {counts.saved > 0 && (
              <span className="chip">{counts.saved} saved</span>
            )}
            {counts.in_progress > 0 && (
              <span className="chip chip-brand">
                {counts.in_progress} in progress
              </span>
            )}
            {counts.done > 0 && (
              <span className="chip chip-ok">{counts.done} done</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saved.map((issue) => (
              <SavedIssueRow key={issue.id} issue={issue} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="card p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand-soft">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">No saved issues yet</h2>
      <p className="text-ink-mute mb-6 max-w-md mx-auto">
        When you find an issue worth coming back to, hit the bookmark icon. It
        lands here so you never lose it.
      </p>
      <Link href="/app/search" className="btn btn-primary">
        Find an issue to save
      </Link>
    </div>
  );
}

function UnavailableNote() {
  return (
    <div className="card p-8 text-center">
      <h2 className="text-lg font-semibold mb-2">Saving isn&apos;t set up yet</h2>
      <p className="text-ink-mute max-w-md mx-auto">
        This deployment doesn&apos;t have a database configured, so bookmarks
        can&apos;t be stored. Search and AI explanations still work — saving
        lights up once a database is connected.
      </p>
    </div>
  );
}
