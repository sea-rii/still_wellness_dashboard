// lib/demoData.ts
export type DemoMood = {
  date: string;
  moodScore: number; // 0..5
  intensity: number; // 1..5
  tags: { tag: string }[];
  note?: string | null;
};

export type DemoInsight = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
};

export function makeDemoMoods(days = 30): DemoMood[] {
  const tagsPool = ["sleep", "stress", "workload", "social", "exercise", "caffeine", "screen_time"];
  const out: DemoMood[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);

    // smooth-ish wave + small variation
    const base = 3 + Math.sin((days - i) / 4) * 1.2;
    const moodScore = Math.max(0, Math.min(5, Math.round(base + (i % 5 === 0 ? -1 : 0))));
    const intensity = 1 + ((i * 3) % 5);

    const t1 = tagsPool[i % tagsPool.length];
    const t2 = tagsPool[(i + 2) % tagsPool.length];
    const tags = (i % 3 === 0 ? [t1, t2] : [t1]).map((tag) => ({ tag }));

    out.push({
      date: d.toISOString(),
      moodScore,
      intensity,
      tags,
      note: i % 6 === 0 ? "A quieter day. Tried to reset." : null,
    });
  }

  return out;
}

export function makeDemoInsights(): DemoInsight[] {
  const now = new Date().toISOString();
  return [
    {
      id: "i1",
      title: "Sleep shows up in your mood",
      message: "On days you tag sleep, the next day tends to feel steadier. Even a small routine might be helping.",
      createdAt: now,
    },
    {
      id: "i2",
      title: "Stress spikes are short-lived",
      message: "Stress appears in bursts — but your mood often rebounds within 1–2 days. You recover faster than you think.",
      createdAt: now,
    },
    {
      id: "i3",
      title: "Movement helps soften the edges",
      message: "When exercise is tagged, intensity is usually lower — even if mood isn’t perfect. It may be stabilizing you.",
      createdAt: now,
    },
    {
      id: "i4",
      title: "Social days trend slightly upward",
      message: "Social shows up more on your better days. That doesn’t mean more plans — just the right kind of connection.",
      createdAt: now,
    },
  ];
}
