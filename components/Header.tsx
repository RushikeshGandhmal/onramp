import Link from "next/link";
import { UserMenu } from "./UserMenu";

const authConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
);

export function Header() {
  return (
    <header className="sticky top-0 z-30 glass border-b border-bg-border/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 gap-3">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <Logo />
          <span className="font-semibold tracking-tight text-[15px]">
            On-Ramp
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink href="/#features">Features</NavLink>
          <NavLink href="/#audiences">For you</NavLink>
          <NavLink href="/#pricing">Pricing</NavLink>
          <NavLink href="/#roadmap">Roadmap</NavLink>
          <NavLink href="/#faq">FAQ</NavLink>
          <div className="ml-2 flex items-center">
            <UserMenu authConfigured={authConfigured} />
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="hidden md:inline-flex px-3 py-1.5 rounded-md text-ink-mute hover:text-ink hover:bg-white/5 transition"
    >
      {children}
    </Link>
  );
}

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="drop-shadow-[0_0_12px_rgba(124,92,255,0.35)]"
    >
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0" stopColor="#7c5cff" />
          <stop offset="1" stopColor="#3ecf8e" />
        </linearGradient>
      </defs>
      <path
        d="M3 20 C 8 20, 10 16, 12 12 C 14 8, 16 4, 21 4"
        stroke="url(#logo-g)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="21" cy="4" r="1.8" fill="#3ecf8e" />
      <circle cx="3" cy="20" r="1.8" fill="#7c5cff" />
    </svg>
  );
}

