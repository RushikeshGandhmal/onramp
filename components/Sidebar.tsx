"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: (path: string) => boolean;
  badge?: string;
  disabled?: boolean;
};

const NAV: NavItem[] = [
  {
    label: "Find issues",
    href: "/app/search",
    icon: <SearchIcon />,
    active: (p) => p.startsWith("/app/search") || p.startsWith("/app/issues")
  },
  {
    label: "Saved searches",
    href: "#",
    icon: <BookmarkIcon />,
    badge: "Soon",
    disabled: true
  },
  {
    label: "My contributions",
    href: "#",
    icon: <TrophyIcon />,
    badge: "Soon",
    disabled: true
  },
  {
    label: "Profile",
    href: "#",
    icon: <UserIcon />,
    badge: "Soon",
    disabled: true
  }
];

const SECONDARY: NavItem[] = [
  { label: "Status", href: "/status", icon: <PulseIcon /> },
  { label: "Help", href: "mailto:hello@on-ramp.dev", icon: <HelpIcon /> }
];

export function Sidebar() {
  const pathname = usePathname() || "";
  return (
    <aside
      className="hidden md:flex md:flex-col w-60 lg:w-64 shrink-0 border-r border-bg-border bg-bg-soft/60 backdrop-blur sticky top-0 h-screen"
      aria-label="Primary navigation"
    >
      <div className="px-5 pt-5 pb-4">
        <Link href="/" className="flex items-center gap-2 group" aria-label="On-Ramp home">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand/60 shadow-[0_8px_24px_-6px_rgba(124,92,255,0.6)]">
            <BoltIcon />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            On-Ramp
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
        <p className="px-3 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-dim">
          Workspace
        </p>
        {NAV.map((item) => {
          const active = item.active ? item.active(pathname) : pathname === item.href;
          return (
            <SidebarLink
              key={item.label}
              item={item}
              active={active}
            />
          );
        })}

        <p className="px-3 pt-6 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-dim">
          Support
        </p>
        {SECONDARY.map((item) => (
          <SidebarLink
            key={item.label}
            item={item}
            active={pathname === item.href}
          />
        ))}
      </nav>

      <div className="border-t border-bg-border px-3 py-3">
        <div className="rounded-xl bg-gradient-to-br from-brand/15 to-brand/5 border border-brand/20 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-soft mb-1">
            Founding member
          </p>
          <p className="text-[12px] text-ink-mute leading-relaxed mb-2.5">
            Lock in 50% off Pro before public launch.
          </p>
          <a
            href="mailto:hello@on-ramp.dev?subject=Pro%20founding%20member"
            className="block text-center text-[11px] font-semibold rounded-md bg-brand text-white py-1.5 hover:bg-brand/90 transition-colors"
          >
            Reserve price
          </a>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const className =
    "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] transition-all " +
    (active
      ? "bg-brand/15 text-ink ring-1 ring-brand/30 shadow-[inset_0_0_0_1px_rgba(124,92,255,0.05)]"
      : item.disabled
      ? "text-ink-dim cursor-not-allowed"
      : "text-ink-mute hover:text-ink hover:bg-white/[0.04]");
  const content = (
    <>
      <span
        className={
          "shrink-0 " +
          (active
            ? "text-brand-soft"
            : item.disabled
            ? "text-ink-dim"
            : "text-ink-mute group-hover:text-ink")
        }
      >
        {item.icon}
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] rounded-full bg-white/[0.06] text-ink-dim px-1.5 py-0.5">
          {item.badge}
        </span>
      )}
    </>
  );
  if (item.disabled) {
    return (
      <div className={className} aria-disabled>
        {content}
      </div>
    );
  }
  return (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  );
}

/* ───────────── icons ───────────── */

function BoltIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="white" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 3h12v18l-6-4-6 4V3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 4h10v4a5 5 0 1 1-10 0V4ZM4 5h3v3H5a1 1 0 0 1-1-1V5Zm16 0v2a1 1 0 0 1-1 1h-2V5h3ZM10 14h4l-1 4h-2l-1-4Zm-2 7h8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M4 21a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 12h4l3-7 4 14 3-7h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.4V13M12 16.5h.01"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
