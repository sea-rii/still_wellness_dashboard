import { prisma } from "@/lib/prisma";
import { addDays, startOfDay } from "@/lib/utils";

type MoodRow = {
  date: Date;
  moodScore: number;
  tags: { tag: string }[];
};

type JournalRow = {
  date: Date;
};

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function stddev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const m = mean(nums);
  const v = mean(nums.map((x) => (x - m) ** 2));
  return Math.sqrt(v);
}

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function generateInsightsForUser(userId: string, rangeDays = 30) {
  const today = startOfDay(new Date());
  const from = addDays(today, -rangeDays + 1);

  // Mood data (typed)
  const moods: MoodRow[] = await prisma.moodEntry.findMany({
    where: { userId, date: { gte: from, lte: today } },
    orderBy: { date: "asc" },
    select: {
      date: true,
      moodScore: true,
      tags: { select: { tag: true } },
    },
  });

  // Journals (typed)
  const journals: JournalRow[] = await prisma.journalEntry.findMany({
    where: { userId, date: { gte: from, lte: today } },
    select: { date: true },
  });

  // Clear old insights for same range (simple approach)
  await prisma.insight.deleteMany({
    where: { userId, rangeDays },
  });

  const created: { type: string; title: string; message: string }[] = [];

  // 1) Weekday pattern
  const byWeekday: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  for (const m of moods) {
    byWeekday[m.date.getDay()].push(m.moodScore);
  }

  const weekdayMeans = Object.entries(byWeekday)
    .map(([k, arr]) => ({ wd: Number(k), avg: mean(arr), n: arr.length }))
    .filter((x) => x.n >= 2);

  if (weekdayMeans.length >= 3) {
    const sorted = [...weekdayMeans].sort((a, b) => a.avg - b.avg);
    const low = sorted[0];
    const high = sorted[sorted.length - 1];
    const diff = high.avg - low.avg;

    if (diff >= 0.8) {
      created.push({
        type: "weekday",
        title: "A weekday pattern is showing up",
        message: `Your mood tends to run lower on ${weekdayNames[low.wd]} and higher on ${weekdayNames[high.wd]} (difference ≈ ${diff.toFixed(
          1
        )}).`,
      });
    }
  }

  // 2) Tag effect
  const allTags = new Set<string>();
  moods.forEach((m) => m.tags.forEach((t) => allTags.add(t.tag)));
  const tagList = Array.from(allTags);

  const baseAvg = mean(moods.map((m) => m.moodScore));

  for (const tag of tagList) {
    const withTag = moods.filter((m) => m.tags.some((t) => t.tag === tag)).map((m) => m.moodScore);
    const withoutTag = moods.filter((m) => !m.tags.some((t) => t.tag === tag)).map((m) => m.moodScore);

    if (withTag.length >= 3 && withoutTag.length >= 3) {
      const delta = mean(withTag) - mean(withoutTag);
      if (Math.abs(delta) >= 0.7) {
        created.push({
          type: "tag",
          title: `“${tag}” days look different`,
          message: `On days tagged “${tag}”, your average mood shifts by ${delta.toFixed(
            1
          )} compared to other days (overall avg ≈ ${baseAvg.toFixed(1)}).`,
        });
      }
    }
  }

  // 3) Volatility
  const scores = moods.map((m) => m.moodScore);
  if (scores.length >= 7) {
    const vol = stddev(scores);
    created.push({
      type: "volatility",
      title: "Mood variability",
      message: `Over the last ${rangeDays} days, your mood variability is ${vol.toFixed(
        2
      )} (lower = steadier, higher = more swings).`,
    });
  }

  // 4) Journaling correlation (next-day mood change)
  const journalDays: Set<string> = new Set(journals.map((j) => startOfDay(j.date).toISOString()));

  const moodByDay = new Map<string, number>();
  moods.forEach((m) => moodByDay.set(startOfDay(m.date).toISOString(), m.moodScore));

  const deltas: number[] = [];
  for (const iso of journalDays) {
    const d = new Date(iso);
    const nextIso = startOfDay(addDays(d, 1)).toISOString();

    const m0 = moodByDay.get(iso);
    const m1 = moodByDay.get(nextIso);

    if (typeof m0 === "number" && typeof m1 === "number") {
      deltas.push(m1 - m0);
    }
  }

  if (deltas.length >= 3) {
    const avgDelta = mean(deltas);
    created.push({
      type: "journal",
      title: "Journaling + next-day shift",
      message: `On days you journal, the next day mood changes by about ${avgDelta.toFixed(
        1
      )} on average (positive means a lift).`,
    });
  }

  // Keep it gentle: max 5 insights
  const top = created.slice(0, 5);

  await prisma.insight.createMany({
    data: top.map((x) => ({
      userId,
      type: x.type,
      title: x.title,
      message: x.message,
      rangeDays,
    })),
  });

  return top;
}
