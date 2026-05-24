import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How On-Ramp handles your data — short version: we don't track you across the web, we don't sell anything, and we don't need an account."
};

export default function PrivacyPage() {
  return (
    <main>
      <Header />
      <article className="mx-auto max-w-2xl px-5 py-16 prose-on">
        <p className="text-xs text-ink-dim mb-2">Last updated: May 23, 2026</p>
        <h1 className="text-4xl font-semibold tracking-tight mb-6">
          Privacy
        </h1>

        <p className="text-ink-mute leading-relaxed mb-6">
          Short version: On-Ramp doesn&apos;t require an account, doesn&apos;t
          sell anything, and doesn&apos;t track you across the web. The long
          version is below — mostly for legal reasons.
        </p>

        <Section title="What we collect">
          <ul>
            <li>
              <strong>Your search queries.</strong> They&apos;re sent to our
              servers so we can fetch results. We don&apos;t link them to you.
            </li>
            <li>
              <strong>Standard server logs.</strong> Request paths, user
              agents, response codes. Used to debug and prevent abuse. Rotated
              after 30 days.
            </li>
            <li>
              <strong>Anonymous analytics.</strong> Via Vercel Analytics —
              page views and load performance only. No cookies, no
              cross-site tracking.
            </li>
            <li>
              <strong>Error reports.</strong> If the app crashes, we receive
              the stack trace via Sentry (no personal data attached).
            </li>
          </ul>
        </Section>

        <Section title="What we don't collect">
          <ul>
            <li>Your identity. There&apos;s no signup.</li>
            <li>Your location beyond country-level (from your IP, by our
              CDN — used only for rate-limiting).</li>
            <li>Anything from your GitHub account. We only read public data.</li>
            <li>Third-party tracking pixels or ad-network cookies.</li>
          </ul>
        </Section>

        <Section title="Third parties we use">
          <ul>
            <li>
              <strong>GitHub API</strong> — to fetch public issues you ask
              for. Your query terms travel to GitHub.
            </li>
            <li>
              <strong>OpenRouter</strong> — to generate AI explanations.
              Issue text + a brief context are sent. Your IP is not.
            </li>
            <li>
              <strong>Vercel</strong> — hosting + analytics + speed insights.
            </li>
            <li>
              <strong>Sentry</strong> — error monitoring (optional).
            </li>
            <li>
              <strong>Upstash</strong> — Redis for rate-limiting (optional).
            </li>
          </ul>
        </Section>

        <Section title="Your rights">
          <p>
            Because we don&apos;t hold an account for you, there&apos;s
            nothing to delete or export. If you&apos;d like a server log line
            scrubbed, email{" "}
            <a href="mailto:privacy@on-ramp.dev" className="text-brand-300 underline">
              privacy@on-ramp.dev
            </a>{" "}
            with the approximate time of the request and we&apos;ll remove
            it.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If this policy changes, the date at the top updates. Material
            changes will be announced in a banner on the home page for at
            least 14 days.
          </p>
        </Section>

        <p className="text-ink-mute mt-10">
          Questions:{" "}
          <a href="mailto:hi@on-ramp.dev" className="text-brand-300 underline">
            hi@on-ramp.dev
          </a>
          .
        </p>

        <div className="mt-12">
          <Link href="/" className="btn-ghost">← Back home</Link>
        </div>
      </article>
    </main>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold tracking-tight mb-3">{title}</h2>
      <div className="text-ink-mute leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-ink">
        {children}
      </div>
    </section>
  );
}
