import type { IssueIntelligence } from "@/lib/types";

/**
 * Compact, honest at-a-glance signals for an issue. Renders only the signals
 * worth surfacing (we keep it minimal — product principle: no clutter).
 *
 * These are metadata-derived estimates, never guarantees.
 */
export function IntelligenceSignals({
  intel,
  className = "",
  detailed = false
}: {
  intel: IssueIntelligence;
  className?: string;
  detailed?: boolean;
}) {
  const chips: { label: string; tone: string; title: string }[] = [];

  if (intel.stale) {
    chips.push({
      label: `stale · ${intel.staleDays}d`,
      tone: "chip chip-warn",
      title: `No activity for ~${intel.staleDays} days — may be abandoned.`
    });
  } else if (intel.maintainerResponsiveness === "high") {
    chips.push({
      label: "active repo",
      tone: "chip chip-ok",
      title: "Maintainers appear responsive (recent updates)."
    });
  }

  if (intel.beginnerFriendliness === "high") {
    chips.push({
      label: "beginner-friendly",
      tone: "chip chip-ok",
      title: "Tagged or shaped like a good first issue."
    });
  } else if (intel.beginnerFriendliness === "low") {
    chips.push({
      label: "needs experience",
      tone: "chip",
      title: "Looks involved — better with some experience."
    });
  }

  if (intel.acceptanceLikelihood === "high") {
    chips.push({
      label: "likely to merge",
      tone: "chip chip-brand",
      title: "Good odds a clean PR gets merged."
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {chips.map((c) => (
        <span key={c.label} className={c.tone} title={c.title}>
          {c.label}
        </span>
      ))}
      {detailed && intel.notes.length > 0 && (
        <ul className="mt-2 w-full space-y-1">
          {intel.notes.map((n, i) => (
            <li key={i} className="text-xs text-ink-dim flex gap-1.5">
              <span aria-hidden className="text-ink-dim">
                •
              </span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
