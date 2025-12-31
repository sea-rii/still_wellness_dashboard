"use client";

const moods = [
  { score: 1, label: "Very low", hint: "heavy / drained" },
  { score: 2, label: "Low", hint: "off / tense" },
  { score: 3, label: "Neutral", hint: "steady" },
  { score: 4, label: "Good", hint: "lighter" },
  { score: 5, label: "Very good", hint: "bright / calm" },
];

export default function MoodPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      {moods.map((m) => {
        const active = value === m.score;
        return (
          <button
            key={m.score}
            type="button"
            onClick={() => onChange(m.score)}
            className={[
              "rounded-3xl px-5 py-4 text-left transition",
              "ring-1 ring-[rgba(0,0,0,0.08)]",
              active
                ? "bg-[rgba(255,255,255,0.85)] shadow-[0_18px_40px_rgba(0,0,0,0.10)]"
                : "bg-[rgba(var(--surface),0.85)] hover:bg-[rgba(255,255,255,0.65)]",
            ].join(" ")}
          >
            <div className="text-base font-medium">{m.label}</div>
            <div className="text-sm opacity-70 mt-1">{m.hint}</div>
            <div className="mt-3 inline-flex rounded-full bg-[rgba(0,0,0,0.06)] px-3 py-1 text-xs">
              score {m.score}
            </div>
          </button>
        );
      })}
    </div>
  );
}
