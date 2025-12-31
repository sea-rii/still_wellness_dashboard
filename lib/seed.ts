export type SeedMood = {
  date: string; // ISO
  moodScore: number; // -2..2
  intensity: number; // 1..5
  tags: { tag: string }[];
  note?: string;
};

export type SeedInsight = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
};

const TAGS = ["sleep", "stress", "workload", "social", "exercise", "caffeine", "screen_time"];

function pickTags(dayIndex: number) {
  // deterministic-ish tags so it feels real
  const t1 = TAGS[dayIndex % TAGS.length];
  const t2 = TAGS[(dayIndex * 3) % TAGS.length];
  return dayIndex % 4 === 0 ? [{ tag: t1 }, { tag: t2 }] : [{ tag: t1 }];
}

export function seedMoods(days = 30): SeedMood[] {
  const out: SeedMood[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(12, 0, 0, 0);

    // gentle wave pattern with slight variance
    const wave = Math.sin((days - i) / 4);
    const moodScore = Math.max(-2, Math.min(2, Math.round(wave * 1.6)));

    const intensity = Math.max(1, Math.min(5, 3 + (moodScore === 0 ? 0 : moodScore)));

    out.push({
      date: d.toISOString(),
      moodScore,
      intensity,
      tags: pickTags(i),
      note:
        i % 7 === 0
          ? "A slower day. Tried to be kind to myself."
          : i % 9 === 0
          ? "Busy, but I handled it better than I expected."
          : "",
    });
  }

  return out;
}

export function seedInsights(): SeedInsight[] {
  const now = new Date().toISOString();
  return [
    {
      id: "seed-1",
      title: "Sleep shows up in your mood",
      message:
        "On days you tag sleep, your mood tends to be steadier the next day. Even a small routine might be helping.",
      createdAt: now,
    },
    {
      id: "seed-2",
      title: "Stress spikes are short-lived",
      message:
        "Stress appears in bursts — but your mood often rebounds within 1–2 days. You recover faster than you think.",
      createdAt: now,
    },
    {
      id: "seed-3",
      title: "Movement helps soften the edges",
      message:
        "When exercise is tagged, intensity is usually lower, even if mood isn’t perfect. It may be acting like a stabilizer.",
      createdAt: now,
    },
    {
      id: "seed-4",
      title: "Social days trend slightly upward",
      message:
        "Social shows up more on your better days. That doesn’t mean you need more plans — just the right kind of connection.",
      createdAt: now,
    },
  ];
}
