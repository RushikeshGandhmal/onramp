import {
  pgTable,
  text,
  bigint,
  timestamp,
  jsonb,
  uuid,
  boolean,
  integer,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";

/**
 * On-Ramp Phase 2 schema.
 *
 * Design goals:
 *  - Clerk owns identity; `users.id` IS the Clerk user id (text).
 *  - Everything else hangs off that id.
 *  - JSONB for flexible arrays (technologies/labels) — no join tables for an MVP.
 *  - Wide-but-shallow: optimized for "load my profile + saved + recent events"
 *    in a couple of indexed reads.
 */

export const users = pgTable(
  "users",
  {
    // Clerk user id (e.g. "user_2abc...").
    id: text("id").primaryKey(),
    githubLogin: text("github_login"),
    githubId: bigint("github_id", { mode: "number" }),
    email: text("email"),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (t) => ({
    githubLoginIdx: index("users_github_login_idx").on(t.githubLogin)
  })
);

export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  // Explicit preferences (set by user in the profile form).
  preferredTechnologies: jsonb("preferred_technologies")
    .$type<string[]>()
    .default([])
    .notNull(),
  preferredLanguages: jsonb("preferred_languages")
    .$type<string[]>()
    .default([])
    .notNull(),
  preferredCategories: jsonb("preferred_categories")
    .$type<string[]>()
    .default([])
    .notNull(),
  contributionInterests: jsonb("contribution_interests")
    .$type<string[]>()
    .default([])
    .notNull(),
  skillLevel: text("skill_level").default("any").notNull(),
  // AI/heuristic-inferred focus (e.g. "frontend-focused"). Read-only to user.
  inferredFocus: text("inferred_focus"),
  inferredAt: timestamp("inferred_at", { withTimezone: true }),
  onboarded: boolean("onboarded").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
});

export const savedIssues = pgTable(
  "saved_issues",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    // Stable key: "owner/name#number".
    issueKey: text("issue_key").notNull(),
    owner: text("owner").notNull(),
    name: text("name").notNull(),
    number: integer("number").notNull(),
    title: text("title").notNull(),
    htmlUrl: text("html_url").notNull(),
    repoLanguage: text("repo_language"),
    category: text("category"),
    difficulty: text("difficulty"),
    labels: jsonb("labels").$type<string[]>().default([]).notNull(),
    tags: jsonb("tags").$type<string[]>().default([]).notNull(),
    aiSummary: text("ai_summary"),
    note: text("note"),
    // Lightweight "organization" — user-defined status.
    status: text("status").default("saved").notNull(), // saved | in_progress | done
    savedAt: timestamp("saved_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (t) => ({
    userIdx: index("saved_user_idx").on(t.userId),
    uniqUserIssue: uniqueIndex("saved_user_issue_uniq").on(
      t.userId,
      t.issueKey
    )
  })
);

export const issueEvents = pgTable(
  "issue_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    // view | save | unsave | open_github | search
    eventType: text("event_type").notNull(),
    issueKey: text("issue_key"),
    owner: text("owner"),
    name: text("name"),
    category: text("category"),
    difficulty: text("difficulty"),
    languages: jsonb("languages").$type<string[]>().default([]).notNull(),
    technologies: jsonb("technologies").$type<string[]>().default([]).notNull(),
    // For "search" events.
    query: text("query"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (t) => ({
    userCreatedIdx: index("events_user_created_idx").on(
      t.userId,
      t.createdAt
    ),
    userTypeIdx: index("events_user_type_idx").on(t.userId, t.eventType)
  })
);

export type UserRow = typeof users.$inferSelect;
export type ProfileRow = typeof profiles.$inferSelect;
export type SavedIssueRow = typeof savedIssues.$inferSelect;
export type IssueEventRow = typeof issueEvents.$inferSelect;
