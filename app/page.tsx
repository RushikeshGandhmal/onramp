import Link from "next/link";
import { Header, Logo } from "@/components/Header";
import { SearchInput } from "@/components/SearchInput";
import { MockSearchDemo } from "@/components/MockSearchDemo";
import { ScrollReveal } from "@/components/ScrollReveal";
import { FaqList } from "@/components/FaqList";
import { HeroSideDemo } from "@/components/HeroSideDemo";

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <Header />

      <Hero />
      <SocialProofStrip />
      <TimeCompare />
      <ValueBento />
      <DemoSection />
      <HowItWorks />
      <Audiences />
      <Pricing />
      <Roadmap />
      <Faq />
      <FinalCTA />
      <Footer />
    </main>
  );
}

/* ────────────────────────────────────────────────────────────
   HERO — 21st.dev-inspired blue meshy background
   ──────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* layered meshy background */}
      <div className="absolute inset-0 -z-20 bg-meshy" />
      <div className="absolute inset-0 -z-10 bg-grid opacity-50" />
      <div className="bg-mesh-noise -z-10" />

      {/* drifting orbs */}
      <div className="orb orb-a -left-32 top-10 h-72 w-72" />
      <div className="orb orb-b right-0 top-20 h-64 w-64" />
      <div className="orb orb-c left-1/2 top-80 h-72 w-72" />

      {/* vertical beams */}
      <div className="absolute inset-y-0 left-[18%] -z-10">
        <div className="beam" />
      </div>
      <div className="absolute inset-y-0 left-[48%] -z-10">
        <div className="beam beam-2" />
      </div>
      <div className="absolute inset-y-0 left-[78%] -z-10">
        <div className="beam beam-3" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pt-16 sm:pt-24 pb-20 sm:pb-28 animate-fade-in">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* LEFT — copy + input */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <Link
              href="#audiences"
              className="hero-pill mb-7 mx-auto lg:mx-0"
            >
              <span className="hero-pill-dot">New</span>
              From a sentence to the perfect issue — in 10 seconds
              <ArrowRight />
            </Link>

            <h1 className="text-[40px] leading-[1.04] sm:text-7xl font-semibold tracking-tight">
              Make meaningful
              <br />
              <span className="text-gradient-blue">contributions.</span>
            </h1>

            <p className="mt-6 text-base sm:text-xl text-ink-mute max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Spent an hour hunting for an issue you can actually solve? Type
              one sentence. On-Ramp hands you the right open-source issue —
              explained like a friend would. The PR is still up to you.
            </p>

            <div className="mt-9 max-w-2xl mx-auto lg:mx-0">
              <SearchInput rotating />
            </div>

            <p className="mt-5 text-xs text-ink-dim">
              Free · Sign in to search · Takes 5 seconds
            </p>

            {/* hero stats */}
            <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto lg:mx-0">
              <Stat value="10s" label="To find an issue" />
              <Stat value="60min" label="The old way · gone" strike />
              <Stat value="50+" label="Curated OSS projects" />
            </div>
          </div>

          {/* RIGHT — live animated demo */}
          <div className="lg:col-span-5">
            <HeroSideDemo />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  value,
  label,
  strike
}: {
  value: string;
  label: string;
  strike?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={`text-2xl sm:text-4xl font-semibold tracking-tight ${
          strike ? "text-ink-dim line-through decoration-err/60" : "text-gradient-static"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] sm:text-xs uppercase tracking-wider text-ink-dim">
        {label}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   SOCIAL PROOF / MARQUEE
   ──────────────────────────────────────────────────────────── */

function SocialProofStrip() {
  const repos = [
    "facebook/react",
    "vercel/next.js",
    "vuejs/core",
    "sveltejs/svelte",
    "django/django",
    "tiangolo/fastapi",
    "kubernetes/kubernetes",
    "microsoft/vscode",
    "supabase/supabase",
    "huggingface/transformers",
    "TanStack/query",
    "tailwindlabs/tailwindcss",
    "shadcn-ui/ui",
    "excalidraw/excalidraw"
  ];
  const track = [...repos, ...repos];
  return (
    <section className="border-y border-bg-border/60 bg-bg-soft/40">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <p className="text-center text-[11px] uppercase tracking-[0.18em] text-ink-dim mb-5">
          Indexing issues from world-class open-source projects
        </p>
        <div className="overflow-hidden relative [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
          <div className="marquee text-sm text-ink-mute font-mono">
            {track.map((r, i) => (
              <span key={`${r}-${i}`} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-brand/60" />
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   TIME COMPARISON  —  "1 hour → 10 seconds"
   ──────────────────────────────────────────────────────────── */

function TimeCompare() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
      <ScrollReveal>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-soft mb-3">
            Time, reclaimed
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
            The hour you used to waste —
            <br />
            <span className="text-gradient-blue">now spent shipping.</span>
          </h2>
          <p className="mt-5 text-ink-mute">
            Most developers spend an hour scrolling, filtering, and bookmarking
            issues before writing a single line. On-Ramp collapses that into
            one sentence.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ScrollReveal>
          <div className="card p-7 h-full relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-err/10 blur-3xl" />
            <div className="flex items-center gap-2 mb-4">
              <span className="chip chip-err">Before</span>
              <span className="text-xs text-ink-dim">~60 min</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight mb-4">
              The old way
            </h3>
            <ul className="space-y-2.5 text-sm text-ink-mute">
              {[
                "Open 12 GitHub tabs, lose half of them",
                "Filter by label · star · language · activity · …",
                "Read 80-comment threads to understand context",
                "Bookmark issues you'll never come back to",
                "Give up. Watch a tutorial instead."
              ].map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <DashIcon className="text-err/70" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <div className="card card-glow p-7 h-full relative overflow-hidden ring-1 ring-brand/40">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-brand/15 blur-3xl" />
            <div className="flex items-center gap-2 mb-4">
              <span className="chip chip-brand">On-Ramp</span>
              <span className="text-xs text-ink-dim">~10 sec</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight mb-4">
              The new way
            </h3>
            <ul className="space-y-2.5 text-sm text-ink-mute">
              {[
                "Type one sentence in plain English",
                "Get a ranked shortlist of fitting issues",
                "Read an AI summary, difficulty, and where to start",
                "Open the issue you'll actually finish",
                "Ship your first PR before lunch."
              ].map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <CheckIcon className="text-brand-soft" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   BENTO FEATURE GRID
   ──────────────────────────────────────────────────────────── */

function ValueBento() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-24">
      <ScrollReveal>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-soft mb-3">
            How it feels
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
            Built to feel <span className="text-gradient">instant</span>,
            confident, and kind.
          </h2>
          <p className="mt-5 text-ink-mute">
            We obsess over the experience because contributing to open source
            shouldn't feel like a research project.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-12 gap-4 auto-rows-[180px]">
        <BentoCard
          className="col-span-12 md:col-span-7 row-span-2"
          icon={<MicIcon />}
          eyebrow="Speak naturally"
          title="Type like you'd ask a friend"
          body="‘React beginner issues’. ‘Python API bug for newcomers’. We parse intent, tech, skill level, and category in milliseconds — no dropdowns, no checkboxes."
          visual={<HeroPromptVisual />}
        />
        <BentoCard
          className="col-span-12 md:col-span-5"
          icon={<BoltIcon />}
          eyebrow="Lightning fast"
          title="Results in seconds"
          body="Parallel GitHub queries, smart ranking, AI explanations — all behind one input."
        />
        <BentoCard
          className="col-span-12 md:col-span-5"
          icon={<BulbIcon />}
          eyebrow="AI guidance"
          title="Explained in plain English"
          body="Summary, difficulty, why it fits you, where to start. No more reading 80-comment threads."
        />
        <BentoCard
          className="col-span-12 md:col-span-7 row-span-2"
          icon={<StarIcon />}
          eyebrow="Curated, never stale"
          title="Only the issues worth your time"
          body="We score for freshness, repo activity, complexity, and beginner-friendliness — and quietly drop abandoned threads."
          visual={<RepoListVisual />}
        />
        <BentoCard
          className="col-span-12 md:col-span-6"
          icon={<ShieldIcon />}
          eyebrow="No noise"
          title="No clutter. No upsell."
          body="No 18-filter sidebars. One-click sign-in with GitHub or email. The product respects your attention."
        />
        <BentoCard
          className="col-span-12 md:col-span-6"
          icon={<HeartIcon />}
          eyebrow="Confidence boosting"
          title="Made for first-timers and pros"
          body="Beginner guidance, technical glossary, and ‘where to start’ hints turn an intimidating repo into a clear next step."
        />
      </div>
    </section>
  );
}

function BentoCard({
  className = "",
  icon,
  eyebrow,
  title,
  body,
  visual
}: {
  className?: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  visual?: React.ReactNode;
}) {
  return (
    <ScrollReveal className={className}>
      <div className="card card-glow p-6 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-8 w-8 rounded-lg bg-brand/15 text-brand-soft flex items-center justify-center">
            {icon}
          </span>
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-dim">
            {eyebrow}
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-sm text-ink-mute leading-relaxed">{body}</p>
        {visual && <div className="mt-auto pt-5">{visual}</div>}
      </div>
    </ScrollReveal>
  );
}

function HeroPromptVisual() {
  return (
    <div className="rounded-xl border border-bg-border bg-black/40 px-4 py-3 font-mono text-sm">
      <p className="text-ok">
        <span className="text-ink-dim">$</span> I know React and want{" "}
        <span className="text-brand-soft">beginner frontend</span> issues
      </p>
      <p className="text-ink-dim mt-2 text-xs">
        → tech: react · level: beginner · category: frontend
      </p>
    </div>
  );
}

function RepoListVisual() {
  const lines = [
    { repo: "vercel/next.js", label: "good first issue", glow: true },
    { repo: "mui/material-ui", label: "help wanted", glow: false },
    { repo: "tiangolo/fastapi", label: "docs", glow: false }
  ];
  return (
    <div className="space-y-2">
      {lines.map((l) => (
        <div
          key={l.repo}
          className="flex items-center justify-between rounded-lg border border-bg-border bg-black/30 px-3 py-2"
        >
          <div className="flex items-center gap-2 text-sm text-ink-mute font-mono">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                l.glow ? "bg-ok animate-pulse" : "bg-brand/60"
              }`}
            />
            {l.repo}
          </div>
          <span className="chip">{l.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   LIVE DEMO
   ──────────────────────────────────────────────────────────── */

function DemoSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.18em] text-brand-soft mb-3">
            Watch it work
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
            One sentence in.
            <br />
            <span className="text-gradient">A perfect issue out.</span>
          </h2>
          <p className="mt-5 text-ink-mute leading-relaxed max-w-md">
            Sign in, type your sentence, and On-Ramp hands back
            curated issues with AI-generated explanations, difficulty ratings,
            and concrete starting points.
          </p>
          <ul className="mt-7 space-y-3 text-sm">
            {[
              "Parses tech stack, skill level, and intent",
              "Searches 35+ hand-picked, active repos in parallel",
              "Ranks by freshness, fit, and beginner-friendliness",
              "Explains every issue in plain English"
            ].map((p) => (
              <li key={p} className="flex items-start gap-2 text-ink-mute">
                <CheckIcon />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex gap-3">
            <Link
              href="/search?q=react%20beginner%20issues"
              className="btn btn-primary"
            >
              Try it free <ArrowRight />
            </Link>
            <Link href="#audiences" className="btn btn-ghost">
              Who it's for
            </Link>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={120}>
          <MockSearchDemo />
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   HOW IT WORKS
   ──────────────────────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      n: 1,
      title: "Describe what you want",
      body: "Tell us the tech you know and how much challenge you’re up for. Plain English only.",
      example: "“I know TypeScript and want a beginner frontend issue.”"
    },
    {
      n: 2,
      title: "We do the heavy lifting",
      body: "On-Ramp parses your intent, queries curated repos in parallel, and ranks every issue for fit.",
      example: "Freshness · Relevance · Complexity · Beginner-friendliness"
    },
    {
      n: 3,
      title: "Open a PR with confidence",
      body: "Each issue is explained simply with where-to-start hints, glossary, and beginner guidance.",
      example: "→ from confused to your first contribution in minutes"
    }
  ];
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-24">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-aurora-soft" />
      <ScrollReveal>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-soft mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
            Three steps. <span className="text-gradient">Under a minute.</span>
          </h2>
        </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {steps.map((s, i) => (
          <ScrollReveal key={s.n} delay={i * 100}>
            <div className="card card-glow p-7 h-full">
              <div className="flex items-center gap-3 mb-5">
                <span className="h-10 w-10 rounded-xl border border-brand/40 bg-brand/10 text-brand-soft font-mono text-lg flex items-center justify-center">
                  {s.n}
                </span>
                <div className="h-px flex-1 divider-grad" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-ink-mute leading-relaxed mb-5">
                {s.body}
              </p>
              <p className="text-xs italic text-ink-dim border-l-2 border-brand/40 pl-3">
                {s.example}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   AUDIENCES  —  Devs + Maintainers + Recruiters
   ──────────────────────────────────────────────────────────── */

function Audiences() {
  const audiences = [
    {
      icon: <CodeIcon />,
      eyebrow: "For developers",
      title: "Land your first (or next) PR",
      body: "Stop bookmarking issues you'll never open. Type once, ship today.",
      bullets: [
        "Personalised by tech stack & skill",
        "AI explains every issue simply",
        "Where-to-start hints save hours"
      ],
      cta: { label: "Find an issue", href: "/search?q=react%20beginner%20issues" }
    },
    {
      icon: <SparkIcon />,
      eyebrow: "For maintainers",
      title: "Get the right contributors",
      body: "Surface your repo to motivated devs who already know they want to help.",
      bullets: [
        "Beginner-friendly issues get attention",
        "Less hand-holding in review",
        "More PRs that actually merge"
      ],
      cta: { label: "Featured repos", href: "mailto:hello@on-ramp.dev?subject=Feature%20my%20repo" }
    },
    {
      icon: <EyeIcon />,
      eyebrow: "For recruiters",
      title: "Spot cracked candidates fast",
      body: "Hours of resume-skimming → seconds of seeing what they actually shipped.",
      bullets: [
        "Real PRs · real code · real impact",
        "Filter by stack, signal, and recency",
        "Coming soon — opt-in talent feed"
      ],
      cta: { label: "Join the waitlist", href: "mailto:hello@on-ramp.dev?subject=Recruiter%20waitlist" },
      soon: true
    }
  ];

  return (
    <section id="audiences" className="relative mx-auto max-w-6xl px-5 py-24">
      <ScrollReveal>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-soft mb-3">
            Who it's for
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
            One product.
            <br />
            <span className="text-gradient-blue">Three lives, easier.</span>
          </h2>
          <p className="mt-5 text-ink-mute">
            Whether you're shipping your first PR, maintaining a repo, or
            hunting for talented engineers — On-Ramp gives you the same
            unfair advantage: time.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {audiences.map((a, i) => (
          <ScrollReveal key={a.title} delay={i * 100}>
            <div className="card card-glow p-7 h-full flex flex-col relative overflow-hidden">
              {a.soon && (
                <span className="badge-soon absolute top-4 right-4">
                  Coming soon
                </span>
              )}
              <div className="h-10 w-10 rounded-xl bg-brand/15 text-brand-soft flex items-center justify-center mb-5">
                {a.icon}
              </div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink-dim mb-2">
                {a.eyebrow}
              </p>
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight mb-2">
                {a.title}
              </h3>
              <p className="text-sm text-ink-mute leading-relaxed mb-5">
                {a.body}
              </p>
              <ul className="space-y-2 mb-7">
                {a.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-ink-mute"
                  >
                    <CheckIcon className="text-brand-soft mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link href={a.cta.href} className="btn btn-ghost mt-auto">
                {a.cta.label}
                <ArrowRight />
              </Link>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   PRICING  —  Honest, transparent. Available-today vs preorder.
   ──────────────────────────────────────────────────────────── */

function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      cadence: "forever",
      tagline: "Everything On-Ramp does today — for every developer.",
      cta: { label: "Start searching", href: "/search?q=react%20beginner%20issues" },
      available: "today" as const,
      features: [
        "Unlimited natural-language search",
        "AI explanations on every issue",
        "Difficulty · effort · where-to-start hints",
        "35+ curated, actively-maintained repos",
        "Free sign-in (GitHub or email). No filters. No credit card."
      ]
    },
    {
      name: "Pro",
      price: "$9",
      cadence: "/month",
      tagline: "For contributors who want streaks, profiles, and faster AI.",
      cta: { label: "Reserve founding price", href: "mailto:hello@on-ramp.dev?subject=Pro%20founding%20member" },
      available: "preorder" as const,
      highlight: true,
      badge: "Founding member · 50% off",
      features: [
        "Everything in Free",
        "Saved searches & weekly digests",
        "Contribution tracking & streaks",
        "Public contributor profile",
        "Faster AI (latest Claude / GPT / Gemini via OpenRouter)",
        "Priority issue ranking"
      ]
    },
    {
      name: "Team",
      price: "Custom",
      cadence: "",
      tagline: "For OSPOs, DevRel, and hiring teams who recruit from OSS.",
      cta: { label: "Book a call", href: "mailto:hello@on-ramp.dev?subject=Team%20plan" },
      available: "preorder" as const,
      features: [
        "Everything in Pro",
        "Private curated repo collections",
        "Recruiter / OSPO talent feed",
        "SSO, audit logs & seat management",
        "Custom ranking & branded portal",
        "Dedicated support"
      ]
    }
  ];

  const availLabel = {
    today: { text: "Available today", chip: "chip-ok" },
    preorder: { text: "Preorder · ships 2026", chip: "chip-warn" }
  };

  return (
    <section id="pricing" className="relative mx-auto max-w-6xl px-5 py-24">
      <ScrollReveal>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-soft mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
            Honest pricing.
            <br />
            <span className="text-gradient-blue">Free where it counts.</span>
          </h2>
          <p className="mt-5 text-ink-mute">
            Finding your next open-source issue is free, forever — that part
            should never have a paywall. Pro &amp; Team are for power features
            we're building now; lock in founding-member pricing today.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((t, i) => (
          <ScrollReveal key={t.name} delay={i * 100}>
            <div
              className={`relative card card-glow p-7 h-full flex flex-col ${
                t.highlight ? "ring-1 ring-brand/50" : ""
              }`}
            >
              {t.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge-soon">{t.badge}</span>
                </div>
              )}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm uppercase tracking-[0.16em] text-ink-mute">
                  {t.name}
                </h3>
                <span className={`chip ${availLabel[t.available].chip}`}>
                  {availLabel[t.available].text}
                </span>
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl sm:text-5xl font-semibold tracking-tight">
                  {t.price}
                </span>
                <span className="text-sm text-ink-dim mb-2">{t.cadence}</span>
              </div>
              <p className="text-sm text-ink-mute mb-6">{t.tagline}</p>
              <ul className="space-y-2.5 mb-7">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-ink"
                  >
                    <CheckIcon className="text-brand-soft mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={t.cta.href}
                className={`btn mt-auto ${t.highlight ? "btn-primary" : "btn-ghost"}`}
              >
                {t.cta.label}
                <ArrowRight />
              </Link>
            </div>
          </ScrollReveal>
        ))}
      </div>
      <p className="text-center text-xs text-ink-dim mt-8 max-w-xl mx-auto">
        Pro &amp; Team launch with the features above — until then, you'll be
        billed $0. Founding-member pricing locks in for life. Cancel anytime.
      </p>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   ROADMAP
   ──────────────────────────────────────────────────────────── */

function Roadmap() {
  const items = [
    {
      quarter: "Now",
      status: "shipped",
      title: "Natural-language issue discovery",
      body: "Type, get curated issues, get AI explanations. All shipped."
    },
    {
      quarter: "Q1 2026",
      status: "next",
      title: "Saved searches & weekly digests",
      body: "Pin a search like ‘React beginner a11y’ and we’ll email you the freshest matches."
    },
    {
      quarter: "Q2 2026",
      status: "soon",
      title: "Contribution tracking & streaks",
      body: "Watch your PRs, your favourite repos, and your contribution streak grow."
    },
    {
      quarter: "Q2 2026",
      status: "soon",
      title: "Public contributor profiles",
      body: "A clean, shareable page that shows what you’ve shipped — beats any LinkedIn bullet."
    },
    {
      quarter: "Q3 2026",
      status: "later",
      title: "Smart notifications",
      body: "“A fresh React a11y issue just dropped.” Slack / Discord / email — your call."
    },
    {
      quarter: "Q3 2026",
      status: "later",
      title: "Repo setup automation",
      body: "One-click clone, dev-container spin-up, scripts wired — go from issue to running locally in 30 seconds."
    },
    {
      quarter: "Q3 2026",
      status: "later",
      title: "Achievements & gentle gamification",
      body: "Light, optional, never spammy. Streak badges, first-PR confetti, a kind leaderboard."
    },
    {
      quarter: "H2 2026",
      status: "later",
      title: "Recruiter / OSPO talent feed",
      body: "Opt-in only. Companies see what you’ve actually shipped, not what your resume claims."
    }
  ];

  const statusColor: Record<string, string> = {
    shipped: "chip-ok",
    next: "chip-brand",
    soon: "chip-warn",
    later: "chip"
  };
  const statusLabel: Record<string, string> = {
    shipped: "Shipped",
    next: "Up next",
    soon: "Coming soon",
    later: "On the roadmap"
  };

  return (
    <section
      id="roadmap"
      className="relative mx-auto max-w-6xl px-5 py-24 overflow-hidden"
    >
      <div className="absolute inset-x-0 top-1/2 -z-10 h-96 bg-aurora-soft -translate-y-1/2" />
      <ScrollReveal>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-soft mb-3">
            What's next
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
            Today is just the on-ramp.
            <br />
            <span className="text-gradient">Here's the highway.</span>
          </h2>
          <p className="mt-5 text-ink-mute">
            We're building the full open-source contribution flywheel. Today
            we ship discovery + AI explanations. Tomorrow: profiles, streaks,
            automation, and a hiring layer that actually rewards what you
            build.
          </p>
        </div>
      </ScrollReveal>

      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((it, i) => (
          <ScrollReveal key={i} delay={i * 60}>
            <div className="card card-glow p-5 h-full">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono text-ink-dim">
                  {it.quarter}
                </span>
                <span className={`chip ${statusColor[it.status]}`}>
                  {statusLabel[it.status]}
                </span>
              </div>
              <h3 className="text-base font-semibold tracking-tight mb-1.5">
                {it.title}
              </h3>
              <p className="text-sm text-ink-mute leading-relaxed">
                {it.body}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   FAQ
   ──────────────────────────────────────────────────────────── */

function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-24">
      <ScrollReveal>
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-soft mb-3">
            Questions
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
            Honest answers.
          </h2>
        </div>
      </ScrollReveal>
      <ScrollReveal>
        <FaqList
          items={[
            {
              q: "Is On-Ramp really free?",
              a: (
                <>
                  Yes — the full discovery experience (search, AI explanations,
                  curated repos) is free, today and forever. Pro &amp; Team
                  unlock features we're shipping next (streaks, profiles,
                  recruiter feed); reserve them now at 50% founding-member
                  pricing.
                </>
              )
            },
            {
              q: "Do I need to sign up?",
              a: "No. Just type and search. You'll only need an account later if you want to save searches, track contributions, or sync streaks."
            },
            {
              q: "Where do issues come from?",
              a: "We index a curated set of high-quality, actively-maintained open-source projects (35+ at launch, growing). We prioritise good-first-issue and help-wanted labels, and quietly drop stale or assigned issues."
            },
            {
              q: "How do AI explanations work?",
              a: "We summarise the issue, infer difficulty and effort, and suggest concrete starting points. We route through OpenRouter (default model: Claude 3.5 Haiku, configurable) with a deterministic heuristic fallback so the product works even without an API key."
            },
            {
              q: "I'm a recruiter — can I use this today?",
              a: "Use it the same way developers do — search by stack, see what's getting shipped, follow the contributors who do interesting work. The dedicated talent feed (opt-in only, real PRs only) is coming H2 2026."
            },
            {
              q: "I'm a maintainer — can I get my repo featured?",
              a: (
                <>
                  Absolutely. Email{" "}
                  <a
                    href="mailto:hello@on-ramp.dev"
                    className="underline underline-offset-2 hover:text-brand-soft"
                  >
                    hello@on-ramp.dev
                  </a>{" "}
                  with your repo and we'll review it for the curated set.
                </>
              )
            }
          ]}
        />
      </ScrollReveal>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   FINAL CTA
   ──────────────────────────────────────────────────────────── */

function FinalCTA() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-24">
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-3xl border border-bg-border bg-gradient-to-br from-brand/15 via-bg-card to-ok/10 p-10 sm:p-16 text-center">
          <div className="absolute inset-0 -z-10 bg-dots opacity-50" />
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight max-w-3xl mx-auto">
            Make a contribution that{" "}
            <span className="text-gradient-blue">actually matters.</span>
          </h2>
          <p className="mt-5 text-ink-mute max-w-xl mx-auto">
            One sentence. Ten seconds. A real PR by tonight. Stop bookmarking
            issues you'll never open.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/search?q=react%20beginner%20issues"
              className="btn btn-primary px-6 py-3.5"
            >
              Launch On-Ramp <ArrowRight />
            </Link>
            <Link href="#pricing" className="btn btn-ghost px-6 py-3.5">
              See pricing
            </Link>
          </div>
          <p className="mt-6 text-xs text-ink-dim">
            Free · Sign in once · No credit card · No fluff
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   FOOTER
   ──────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-bg-border mt-12">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col md:flex-row gap-10 justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <Logo />
              <span className="font-semibold tracking-tight">On-Ramp</span>
            </div>
            <p className="text-sm text-ink-mute leading-relaxed">
              The fastest way into open source. Make meaningful contributions —
              without losing an hour to filters.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 text-sm">
            <FooterCol
              title="Product"
              links={[
                { label: "Features", href: "#features" },
                { label: "Who it's for", href: "#audiences" },
                { label: "Pricing", href: "#pricing" },
                { label: "Roadmap", href: "#roadmap" },
                { label: "Launch app", href: "/search?q=react%20beginner%20issues" }
              ]}
            />
            <FooterCol
              title="Resources"
              links={[
                { label: "FAQ", href: "#faq" },
                { label: "How it works", href: "#features" },
                { label: "Status", href: "/status" },
                { label: "Maintainers", href: "mailto:hello@on-ramp.dev" }
              ]}
            />
            <FooterCol
              title="Company"
              links={[
                { label: "Contact", href: "mailto:hello@on-ramp.dev" },
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" }
              ]}
            />
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-bg-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-dim">
          <p>© {new Date().getFullYear()} On-Ramp. Made for open source.</p>
          <p>Live data via GitHub API. Not affiliated with GitHub.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-ink-dim mb-3">
        {title}
      </p>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-ink-mute hover:text-ink transition"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   ICONS
   ──────────────────────────────────────────────────────────── */

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="3" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
function BulbIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18h6M10 21h4M12 3a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2v.3h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m12 3 2.7 5.6 6.2.6-4.7 4.1 1.4 6L12 16.8 6.4 19.3l1.4-6L3.1 9.2l6.2-.6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4l-4 16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14m0 0-5-5m5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="m5 12 4.5 4.5L20 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function DashIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M6 12h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
