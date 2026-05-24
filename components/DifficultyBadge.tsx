import type { Difficulty } from "@/lib/types";

const STYLES: Record<Difficulty, string> = {
  easy: "chip-ok",
  medium: "chip-warn",
  hard: "chip-err"
};

const LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard"
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`chip ${STYLES[difficulty]}`}>
      <Dot />
      {LABEL[difficulty]}
    </span>
  );
}

function Dot() {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-current"
      aria-hidden
    />
  );
}
