import Link from "next/link";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <main>
      <Header />
      <section className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight mb-3">
          We couldn't load that page.
        </h1>
        <p className="text-ink-mute mb-8">
          The issue may have been deleted, the repo may be private, or GitHub
          rate-limited us. Try searching for something else.
        </p>
        <Link href="/" className="btn btn-primary">
          Back home
        </Link>
      </section>
    </main>
  );
}
