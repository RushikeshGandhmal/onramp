"use client";

import { useState, useTransition } from "react";
import { saveProfileAction } from "@/app/actions/profile";
import type { Category, SkillLevel, UserProfile } from "@/lib/types";

const SKILL_OPTIONS: { value: SkillLevel; label: string; hint: string }[] = [
  { value: "beginner", label: "Beginner", hint: "New to open source" },
  { value: "intermediate", label: "Intermediate", hint: "A few PRs in" },
  { value: "advanced", label: "Advanced", hint: "Comfortable anywhere" },
  { value: "any", label: "No preference", hint: "Show me everything" }
];

const CATEGORY_OPTIONS: Category[] = [
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "devops",
  "data",
  "ml",
  "docs",
  "testing",
  "design"
];

const INTEREST_OPTIONS = [
  "bug fixes",
  "new features",
  "documentation",
  "tests",
  "refactoring",
  "accessibility",
  "performance",
  "design"
];

export function ProfileForm({
  profile,
  dbReady,
  githubLanguages = []
}: {
  profile: UserProfile;
  dbReady: boolean;
  githubLanguages?: string[];
}) {
  const [technologies, setTechnologies] = useState<string[]>(
    profile.preferredTechnologies
  );
  const [languages, setLanguages] = useState<string[]>(
    profile.preferredLanguages
  );
  const [categories, setCategories] = useState<string[]>(
    profile.preferredCategories
  );
  const [interests, setInterests] = useState<string[]>(
    profile.contributionInterests
  );
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(profile.skillLevel);

  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function toggle(
    list: string[],
    setList: (v: string[]) => void,
    value: string
  ) {
    setStatus("idle");
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setStatus("idle");
    setErrorMsg(null);
    startTransition(async () => {
      const res = await saveProfileAction({
        preferredTechnologies: technologies,
        preferredLanguages: languages,
        preferredCategories: categories,
        contributionInterests: interests,
        skillLevel
      });
      if (res.ok) {
        setStatus("ok");
      } else {
        setStatus("error");
        setErrorMsg(res.error ?? "Something went wrong.");
      }
    });
  }

  const suggestedLangs = githubLanguages.filter(
    (l) => !languages.includes(l.toLowerCase())
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {!dbReady && (
        <div className="card p-4 border-warn/40 text-sm text-ink-mute">
          Heads up: this deployment doesn&apos;t have a database connected, so
          changes won&apos;t be saved. Everything else still works.
        </div>
      )}

      {/* Skill level */}
      <section className="card p-5">
        <h2 className="text-sm font-semibold mb-1">Skill level</h2>
        <p className="text-xs text-ink-mute mb-3">
          We use this to bias difficulty — nothing is hidden from you.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SKILL_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                setSkillLevel(o.value);
                setStatus("idle");
              }}
              className={`text-left rounded-lg border px-3 py-2.5 transition ${
                skillLevel === o.value
                  ? "border-brand/60 bg-brand/10"
                  : "border-bg-border bg-bg-soft/50 hover:border-ink-dim"
              }`}
            >
              <span className="block text-sm font-medium">{o.label}</span>
              <span className="block text-[11px] text-ink-dim mt-0.5">
                {o.hint}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="card p-5">
        <h2 className="text-sm font-semibold mb-1">Areas you enjoy</h2>
        <p className="text-xs text-ink-mute mb-3">
          Pick any that feel like you. These nudge recommendations up.
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((c) => (
            <ChipToggle
              key={c}
              active={categories.includes(c)}
              onClick={() => toggle(categories, setCategories, c)}
            >
              {c}
            </ChipToggle>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="card p-5">
        <h2 className="text-sm font-semibold mb-1">Languages</h2>
        <p className="text-xs text-ink-mute mb-3">
          Add the languages you want to work in.
        </p>
        <TagInput
          values={languages}
          onChange={(v) => {
            setLanguages(v);
            setStatus("idle");
          }}
          placeholder="e.g. typescript, python, go"
        />
        {suggestedLangs.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] text-ink-dim mb-1.5">
              From your GitHub — tap to add:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedLangs.slice(0, 8).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    setLanguages([...languages, l.toLowerCase()]);
                    setStatus("idle");
                  }}
                  className="chip hover:border-brand/50 hover:text-brand-soft transition"
                >
                  + {l}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Technologies */}
      <section className="card p-5">
        <h2 className="text-sm font-semibold mb-1">
          Frameworks &amp; technologies
        </h2>
        <p className="text-xs text-ink-mute mb-3">
          Libraries, frameworks, or tools you know.
        </p>
        <TagInput
          values={technologies}
          onChange={(v) => {
            setTechnologies(v);
            setStatus("idle");
          }}
          placeholder="e.g. react, django, docker"
        />
      </section>

      {/* Contribution interests */}
      <section className="card p-5">
        <h2 className="text-sm font-semibold mb-1">
          What you like to contribute
        </h2>
        <p className="text-xs text-ink-mute mb-3">
          The kind of work that energizes you.
        </p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((i) => (
            <ChipToggle
              key={i}
              active={interests.includes(i)}
              onClick={() => toggle(interests, setInterests, i)}
            >
              {i}
            </ChipToggle>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className={`btn btn-primary ${pending ? "opacity-70" : ""}`}
        >
          {pending ? "Saving…" : "Save profile"}
        </button>
        {status === "ok" && (
          <span className="text-sm text-ok">Saved ✓</span>
        )}
        {status === "error" && (
          <span className="text-sm text-err">{errorMsg}</span>
        )}
      </div>
    </form>
  );
}

function ChipToggle({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize border transition ${
        active
          ? "border-brand/60 bg-brand/15 text-brand-soft"
          : "border-bg-border bg-bg-soft/50 text-ink-mute hover:text-ink hover:border-ink-dim"
      }`}
    >
      {children}
    </button>
  );
}

function TagInput({
  values,
  onChange,
  placeholder
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const v = raw.trim().toLowerCase().slice(0, 40);
    if (!v || values.includes(v) || values.length >= 24) {
      setDraft("");
      return;
    }
    onChange([...values, v]);
    setDraft("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-bg-border bg-bg-soft/50 p-2 focus-within:border-brand/60 transition">
      {values.map((v) => (
        <span
          key={v}
          className="inline-flex items-center gap-1 rounded-md bg-brand/15 px-2 py-1 text-xs text-brand-soft"
        >
          {v}
          <button
            type="button"
            onClick={() => onChange(values.filter((x) => x !== v))}
            aria-label={`Remove ${v}`}
            className="text-brand-soft/70 hover:text-brand-soft"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(draft)}
        placeholder={values.length === 0 ? placeholder : "Add more…"}
        className="flex-1 min-w-[120px] bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-ink-dim"
      />
    </div>
  );
}
