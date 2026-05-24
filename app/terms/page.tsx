import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Reasonable, plain-English terms of using On-Ramp. Use it freely, don't break it, and we don't promise the moon."
};

export default function TermsPage() {
  return (
    <main>
      <Header />
      <article className="mx-auto max-w-2xl px-5 py-16">
        <p className="text-xs text-ink-dim mb-2">Last updated: May 23, 2026</p>
        <h1 className="text-4xl font-semibold tracking-tight mb-6">Terms</h1>

        <p className="text-ink-mute leading-relaxed mb-6">
          Short version: use On-Ramp freely, don&apos;t abuse it, and
          don&apos;t expect guarantees while we&apos;re early. By using the
          site you agree to the below.
        </p>

        <Section title="Use of the service">
          <ul>
            <li>
              On-Ramp is provided as-is, free of charge, for personal and
              commercial use.
            </li>
            <li>
              You may not use automated scrapers, bots, or distributed
              clients to query us at high volume. Per-IP rate limits apply.
            </li>
            <li>
              You may not use the service to violate GitHub&apos;s Terms of
              Service, harass project maintainers, or spam issue threads.
            </li>
          </ul>
        </Section>

        <Section title="No warranty">
          <p>
            On-Ramp ranks and explains issues using heuristics and AI. It
            will sometimes be wrong, miss context, or surface stale data. Do
            your own due diligence before opening a pull request.
          </p>
        </Section>

        <Section title="Liability">
          <p>
            We&apos;re not liable for any loss arising from your use of
            On-Ramp, the GitHub issues we surface, or the AI explanations we
            generate.
          </p>
        </Section>

        <Section title="Pricing & payments">
          <p>
            On-Ramp&apos;s core search is free. Paid tiers shown on the home
            page are <em>preorder</em> for features that haven&apos;t shipped
            yet. Nothing is charged until those features launch, and
            founding-member pricing locks in at signup.
          </p>
        </Section>

        <Section title="Termination">
          <p>
            We may rate-limit, throttle, or block your IP if you abuse the
            service. We try to send a 429 with a clear message before
            blocking outright.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            We may update these terms over time. The date at the top will
            change. Material changes will be banner-announced on the home
            page for at least 14 days.
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
      <div className="text-ink-mute leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_em]:text-ink">
        {children}
      </div>
    </section>
  );
}
