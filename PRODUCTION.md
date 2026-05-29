# On-Ramp · Production Deploy Checklist

A practical, ordered guide from "works locally" to "shipped, monitored, and abuse-proof."

---

## 0 · Local sanity (5 min)

```bash
npm install
cp .env.example .env.local
npm run typecheck    # must pass
npm run build        # must pass
npm run dev          # smoke at http://localhost:3000
```

Then visit:
- `/` — hero loads, search box focuses cleanly
- `/search?q=react%20beginner%20issues` — returns real GitHub issues
- `/issue/facebook/react/<some-number>` — detail loads
- `/status` — all live checks ok
- `/privacy`, `/terms` — render
- `/robots.txt`, `/sitemap.xml` — return text

---

## 1 · Deploy to Vercel (15 min)

### 1a. CLI setup
```bash
npm i -g vercel
vercel login
vercel link               # create new project
```

### 1b. Set env vars (production + preview)
```bash
vercel env add GITHUB_TOKEN production preview
vercel env add OPENROUTER_API_KEY production preview
vercel env add OPENROUTER_MODEL production preview   # e.g. anthropic/claude-3.5-haiku
vercel env add NEXT_PUBLIC_SITE_URL production       # https://on-ramp.dev

# Sign-in / Sign-up (Clerk) — REQUIRED (search is gated behind auth)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production preview
vercel env add CLERK_SECRET_KEY production preview

# Database (Neon Postgres) — REQUIRED for Phase 2 (profiles, saved issues, personalization)
vercel env add DATABASE_URL production preview
```

> Create a Clerk application at https://dashboard.clerk.com
> — Free tier: 10,000 monthly active users.
> — Enable GitHub + Email sign-in methods in the Clerk dashboard.
> — When you promote to a "Production instance" in Clerk, swap the
>   `pk_test_…` / `sk_test_…` keys for the `pk_live_…` / `sk_live_…` pair.
> — For GitHub contribution sync, the GitHub OAuth connection in Clerk
>   must request the `read:user` scope (default is fine for public PRs).

> Create a Neon database at https://neon.tech (free tier).
> — Copy the **pooled** connection string (ends with `-pooler`).
> — `DATABASE_URL` is **optional**: without it the app still runs (search,
>   AI, intelligence all work), but profiles, saved issues, and
>   personalization silently no-op. With it, Phase 2 features turn on.
> — After setting it, run the schema push once: `npm run db:push`

### 1c. Deploy
```bash
vercel --prod
```

You now have a live URL. Hand it to anyone.

### 1d. Custom domain (optional, ~5 min)
```bash
vercel domains add on-ramp.dev
# Follow the DNS instructions Vercel prints. SSL is automatic.
```

---

## 2 · Observability (30 min)

### 2a. Vercel Analytics & Speed Insights
**Already wired** in `app/layout.tsx`. Auto-collects on Vercel deploys — zero config. View at:
- `https://vercel.com/<you>/<project>/analytics`
- `https://vercel.com/<you>/<project>/speed-insights`

### 2b. Sentry (errors)
1. Create project at https://sentry.io → choose "Next.js"
2. Copy the DSN
3. Add env vars on Vercel:
   ```bash
   vercel env add NEXT_PUBLIC_SENTRY_DSN production preview
   vercel env add SENTRY_ORG production preview
   vercel env add SENTRY_PROJECT production preview
   vercel env add SENTRY_AUTH_TOKEN production       # for source-map upload
   ```
4. Redeploy: `vercel --prod`

Errors will now flow to your Sentry inbox. Source maps are auto-uploaded by the build wrapper in `next.config.js`.

> Sentry is **fully optional** — if `NEXT_PUBLIC_SENTRY_DSN` is unset, the app skips Sentry entirely (no overhead, no errors).

---

## 3 · Abuse & cost protection (1 hour)

### 3a. Upstash Redis for rate-limiting
The in-memory rate limiter is fine for a single Vercel instance. For multi-region or high-traffic, use Upstash:

1. Create a free DB at https://console.upstash.com/redis (choose the region closest to your Vercel deploy)
2. Copy the REST URL + token
3. Add to Vercel:
   ```bash
   vercel env add UPSTASH_REDIS_REST_URL production preview
   vercel env add UPSTASH_REDIS_REST_TOKEN production preview
   vercel env add RATELIMIT_MAX production            # e.g. 30
   vercel env add RATELIMIT_WINDOW_SEC production     # e.g. 60
   ```
4. Redeploy

`/search` is now rate-limited to **30 requests per minute per IP** (configurable). If a visitor exceeds it, they get a friendly "slow down" card — not a crash.

### 3b. AI cost cap
On the OpenRouter dashboard:
1. Go to https://openrouter.ai/settings/credits
2. Set a hard monthly spend cap (e.g. $20 to start)
3. Set an email alert at 80%

Combined with the per-IP rate limit, this caps your worst-case AI spend.

### 3c. GitHub token rotation
- Use a token from a dedicated bot account (not your personal one)
- Set 90-day expiration
- Calendar a reminder to rotate before it expires

---

## 4 · CI / CD (30 min)

GitHub Actions workflow is already at `.github/workflows/ci.yml`. It runs:
1. `npm run typecheck`
2. `npm run build`
3. Playwright smoke tests (home, search, privacy, terms, status, robots, sitemap, 404)

Vercel auto-deploys on push to `main` (Production) and on PRs (Preview).

### Enable branch protection
GitHub → Settings → Branches → Add rule for `main`:
- ✅ Require status checks to pass: select `Type-check & Build` + `Playwright smoke`
- ✅ Require pull request reviews before merging

---

## 5 · Pre-launch polish (1 hour)

- [ ] Replace `hello@on-ramp.dev` in `app/page.tsx` and pages with your real address
- [ ] Replace `privacy@on-ramp.dev`, `hi@on-ramp.dev` in `app/privacy/page.tsx`, `app/terms/page.tsx`
- [ ] Update `NEXT_PUBLIC_SITE_URL` to your real domain
- [ ] Visit `/sitemap.xml` and verify URLs point to your real domain
- [ ] Test the OG image renders by sharing the URL in Slack / Twitter / Discord
- [ ] Run Lighthouse against the deployed URL — target 95+ on Performance & SEO
- [ ] Check the home page loads in **< 1.5s** on a fresh tab

---

## 6 · Post-launch (ongoing)

### Daily
- Check `/status` — should be all-green
- Glance at Vercel Analytics: page views, top countries, top referrers
- Check Sentry for any new error groups

### Weekly
- Review top search queries → identify content/feature gaps
- Check GitHub rate-limit usage on the status page
- Review AI spend on OpenRouter dashboard

### Monthly
- Review and prune the curated repo list in `lib/repos.ts` (any abandoned projects?)
- Update `OPENROUTER_MODEL` if a newer/cheaper/faster model lands
- Rotate `GITHUB_TOKEN` if approaching expiration

---

## What's Already Done ✅

| Capability | File |
| --- | --- |
| Error boundaries (root, search, issue, global) | `app/error.tsx`, `app/global-error.tsx`, etc. |
| Sentry integration (DSN-optional) | `sentry.*.config.ts`, `instrumentation.ts`, `next.config.js` |
| Vercel Analytics + Speed Insights | `app/layout.tsx` |
| Per-IP rate limiting (memory + Upstash) | `lib/rate-limit.ts`, `app/search/page.tsx` |
| 60s identical-query cache | `lib/cache.ts`, `app/search/page.tsx` |
| Security headers | `next.config.js` |
| Robots.txt + sitemap.xml | `app/robots.ts`, `app/sitemap.ts` |
| Open Graph image | `app/opengraph-image.tsx` |
| Privacy + Terms pages | `app/privacy/page.tsx`, `app/terms/page.tsx` |
| Live `/status` health page | `app/status/page.tsx` |
| Vercel project config | `vercel.json` |
| Playwright E2E smoke tests | `tests/e2e/smoke.spec.ts` |
| GitHub Actions CI | `.github/workflows/ci.yml` |
| SVG favicon | `public/favicon.svg` |
| GitHub OAuth sign-in (Clerk) | `middleware.ts`, `app/sign-in`, `app/sign-up` |
| Neon Postgres + Drizzle (guarded) | `lib/db/schema.ts`, `lib/db/client.ts` |
| User profiles | `lib/profile.ts`, `app/app/profile` |
| Saved issues (bookmarks) | `lib/saved.ts`, `app/app/saved`, `components/SaveButton.tsx` |
| Personalized re-rank | `lib/personalization.ts` |
| Issue intelligence (staleness, responsiveness, fit) | `lib/intelligence.ts` |
| AI skill understanding | `lib/skills.ts` |
| GitHub contribution sync | `lib/contributions.ts` |
| Personalized dashboard | `app/app/page.tsx` |

## What's Intentionally Out of Scope

These are planned for later phases — see the Roadmap section on the landing page:
- Recruiter marketplace / talent feed
- Public contributor ranking systems
- Messaging / social features
- Job board / payments
- Repo setup automation / CLI

---

**Ship it.** 🚢
