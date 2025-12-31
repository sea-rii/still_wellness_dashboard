// components/TagChips.tsx
"use client";

const defaultTags = ["sleep", "stress", "workload", "social", "exercise", "caffeine", "screen_time"];

export default function TagChips({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (tag: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {defaultTags.map((t) => {
        const active = selected.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => onToggle(t)}
            className={[
              "rounded-full px-4 py-2 text-sm transition ring-1",
              active
                ? "bg-[rgba(255,255,255,0.85)] ring-[rgba(0,0,0,0.10)]"
                : "bg-[rgba(255,255,255,0.30)] ring-[rgba(0,0,0,0.06)] hover:bg-[rgba(255,255,255,0.45)]",
            ].join(" ")}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
