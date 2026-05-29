import type { Config } from "drizzle-kit";

/**
 * Drizzle Kit config — used by `npm run db:push` / `db:generate` / `db:studio`.
 *
 * Persistence is OPTIONAL. The app degrades gracefully when DATABASE_URL is
 * unset (see lib/db/client.ts). These commands only run when you've provisioned
 * a Neon (or any) Postgres instance and set DATABASE_URL.
 */
export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? ""
  },
  strict: true,
  verbose: true
} satisfies Config;
