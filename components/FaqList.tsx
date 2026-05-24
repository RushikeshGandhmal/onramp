"use client";

import { useState } from "react";

export interface FaqItem {
  q: string;
  a: React.ReactNode;
}

export function FaqList({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-bg-border border-y border-bg-border">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-5 text-left group"
              aria-expanded={isOpen}
            >
              <span className="text-base sm:text-lg font-medium tracking-tight group-hover:text-brand-soft transition">
                {it.q}
              </span>
              <span
                className={`shrink-0 h-7 w-7 rounded-full border border-bg-border flex items-center justify-center transition-transform ${
                  isOpen ? "rotate-45 bg-brand/15 border-brand/40" : ""
                }`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="text-ink-mute leading-relaxed max-w-2xl">
                  {it.a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
