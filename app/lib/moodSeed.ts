export type Mood = { date: string; moodScore: number; tags?: { tag: string }[] };

export function seeded30Mood(days = 30): Mood[] {
  const out: Mood[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    // smooth-ish wave between 2..5 (then rounded)
    const base = 3.3 + Math.sin((days - 1 - i) / 3.8) * 0.9;
    const moodScore = Math.min(5, Math.max(1, Math.round(base)));

    out.push({ date: d.toISOString(), moodScore, tags: [] });
  }
  return out;
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/**
 * Always returns a full `days` length series.
 * If API has real check-ins, they overwrite the seed for that day.
 */
export function fillToNDays(apiMoods: Mood[], days = 30): { filled: Mood[]; isSample: boolean } {
  const seed = seeded30Mood(days);

  const map = new Map<string, Mood>();
  for (const m of seed) map.set(dayKey(m.date), m);

  for (const m of apiMoods ?? []) {
    map.set(dayKey(m.date), m); // overwrite seeded day with real day
  }

  const filled = Array.from(map.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // “sample” if you don't have a full month of real check-ins
  const isSample = (apiMoods?.length ?? 0) < days;

  // If somehow map got bigger, keep last N days
  const trimmed = filled.slice(Math.max(0, filled.length - days));

  return { filled: trimmed, isSample };
}
