"use client";

import { useEffect, useState } from "react";

/**
 * ContribGraphClient — 52-week × 7-day GitHub contribution graph with a
 * deterministic but realistic-looking commit pattern, animated to fill
 * in column-by-column on mount.
 *
 * Deterministic LCG seed → identical on every render → no SSR mismatch.
 */
export function ContribGraphClient({
  className = ""
}: {
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const cells = buildContribCells();

  return (
    <div
      className={"grid gap-[3px] w-full " + className}
      style={{ gridTemplateColumns: "repeat(52, minmax(0, 1fr))" }}
      aria-hidden
    >
      {cells.map((week, wi) => (
        <div
          key={wi}
          className="grid gap-[3px]"
          style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
        >
          {week.map((level, di) => (
            <span
              key={di}
              data-l={mounted ? level : 0}
              className="cgrid-cell cgrid-pulse"
              style={
                mounted
                  ? { transitionDelay: `${(wi * 7 + di) * 6}ms` }
                  : undefined
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Generate 52 weeks of contribution levels — deterministic LCG so it's the
 *  same on every render. Looks like a real commit pattern: weekdays denser,
 *  weekends lighter, a couple of "streak" weeks bright. */
function buildContribCells(): number[][] {
  const weeks: number[][] = [];
  let s = 73_249;
  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff);
  for (let w = 0; w < 52; w++) {
    const week: number[] = [];
    const isStreak = w % 9 === 5 || w === 47 || w === 17;
    for (let d = 0; d < 7; d++) {
      const isWeekend = d === 0 || d === 6;
      const r = rand();
      let level: number;
      if (isStreak) level = r > 0.2 ? (r > 0.6 ? 4 : 3) : 2;
      else if (isWeekend) level = r > 0.85 ? 2 : r > 0.6 ? 1 : 0;
      else level = r > 0.85 ? 4 : r > 0.65 ? 3 : r > 0.4 ? 2 : r > 0.2 ? 1 : 0;
      week.push(level);
    }
    weeks.push(week);
  }
  return weeks;
}
