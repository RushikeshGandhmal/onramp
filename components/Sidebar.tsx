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
    label: "Home",
    href: "/app",
    icon: <HomeIcon />,
    active: (p) => p === "/app"
  },
  {
    label: "Find issues",
    href: "/app/search",
    icon: <SearchIcon />,
    active: (p) => p.startsWith("/app/search") || p.startsWith("/app/issues")
  },
  {
    label: "Saved issues",
    href: "/app/saved",
    icon: <BookmarkIcon />,
    active: (p) => p.startsWith("/app/saved")
  },
  {
    label: "Profile",
    href: "/app/profile",
    icon: <UserIcon />,
    active: (p) => p.startsWith("/app/profile")
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
      className="hidden md:flex md:flex-col w-60 lg:w-64 shrink-0 border-r border-bg-border bg-bg-soft/60 backdrop-blur sticky top-0 h-screen overflow-hidden"
      aria-label="Primary navigation"
    >
      <div className="absolute inset-0 bg-grid-dots opacity-40 pointer-events-none" />
      <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-ok/[0.07] blur-[80px] pointer-events-none" />
      <div className="relative px-5 pt-5 pb-4">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="On-Ramp home">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-b from-[#1c2430] to-[#0d1117] ring-1 ring-bg-border shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_12px_-4px_rgba(0,0,0,0.6)] transition-transform group-hover:scale-[1.04]">
            <span aria-hidden className="absolute inset-x-1 top-px h-px rounded-full bg-white/[0.06]" />
            <RampMark />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.01em]">
            On-Ramp
          </span>
        </Link>
      </div>

      <nav className="relative flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
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

      <div className="relative border-t border-bg-border px-3 py-3">
        <div className="rounded-xl bg-gradient-to-br from-ok/[0.12] to-ok/[0.03] border border-ok/25 p-3.5">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-ok mb-1 flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ok animate-pulse" />
            Founding member
          </p>
          <p className="text-[12px] text-ink-mute leading-relaxed mb-2.5">
            Lock in 50% off Pro before public launch.
          </p>
          <a
            href="mailto:hello@on-ramp.dev?subject=Pro%20founding%20member"
            className="block text-center text-[11px] font-semibold rounded-md bg-ok text-white py-1.5 hover:bg-ok/90 transition-colors shadow-[0_6px_18px_-4px_rgba(63,185,80,0.45)]"
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
      ? "bg-ok/[0.13] text-ink ring-1 ring-ok/30 shadow-[inset_0_0_0_1px_rgba(63,185,80,0.06)]"
      : item.disabled
      ? "text-ink-dim cursor-not-allowed"
      : "text-ink-mute hover:text-ink hover:bg-white/[0.04]");
  const content = (
    <>
      <span
        className={
          "shrink-0 " +
          (active
            ? "text-ok-soft"
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

function RampMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="relative"
    >
      <defs>
        <linearGradient
          id="sidebar-ramp"
          x1="3"
          y1="20"
          x2="21"
          y2="4"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#58a6ff" />
          <stop offset="0.55" stopColor="#56d364" />
          <stop offset="1" stopColor="#3fb950" />
        </linearGradient>
      </defs>
      <path
        d="M4 19 C 9 19, 11 15, 12.5 12 C 14 9, 16 5, 20 5"
        stroke="url(#sidebar-ramp)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="20" cy="5" r="1.7" fill="#3fb950" />
      <circle cx="20" cy="5" r="3.2" fill="#3fb950" opacity="0.18" />
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

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 11.5 12 4l8 7.5M6 10v9h12v-9"
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
