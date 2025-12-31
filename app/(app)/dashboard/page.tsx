"use client";

import { useEffect, useMemo, useState } from "react";
import ChartMoodTrend from "../../../components/ChartMoodTrend";
// import { StillCard, StillCardInner } from "@/app/ui"; // adjust path if needed


type MoodRow = {
  date: string; // ISO
  moodScore: number; // 1..5
  intensity: number; // 1..5
  tags: { tag: string }[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function makeSeed30Days(): MoodRow[] {
  const tagsPool = ["sleep", "stress", "workload", "social", "exercise", "caffeine", "screen_time"];
  const today = new Date();
  const base = 3.2;

  const rows: MoodRow[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    // gentle wave + randomness
    const wave = Math.sin((29 - i) / 4) * 0.6;
    const noise = (Math.random() - 0.5) * 0.9;
    let mood = clamp(Math.round(base + wave + noise), 1, 5);

    // tag logic that makes insights feel "earned"
    const tags: string[] = [];
    if (Math.random() < 0.35) tags.push("sleep");
    if (Math.random() < 0.28) tags.push("stress");
    if (Math.random() < 0.22) tags.push("exercise");
    if (Math.random() < 0.18) tags.push("screen_time");
    if (Math.random() < 0.16) tags.push("social");
    if (Math.random() < 0.12) tags.push("caffeine");
    if (Math.random() < 0.10) tags.push("workload");

    // small correlations
    if (tags.includes("sleep")) mood = clamp(mood + 1, 1, 5);
    if (tags.includes("stress")) mood = clamp(mood - 1, 1, 5);

    const intensity = clamp(Math.round(2.5 + (Math.random() * 2.5)), 1, 5);

    rows.push({
      date: d.toISOString(),
      moodScore: mood,
      intensity,
      tags: tags.length ? tags.map((t) => ({ tag: t })) : [{ tag: tagsPool[(Math.random() * tagsPool.length) | 0] }],
    });
  }

  return rows;
}

export default function DashboardPage() {
  const [rows, setRows] = useState<MoodRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/mood?range=30", { cache: "no-store" });
        const j = await res.json();
        const apiRows: MoodRow[] = j.data ?? [];

        // normalize (if your DB has old -2..2 values, map them to 1..5)
        const normalized = apiRows.map((r) => {
          let m = r.moodScore;

          // if it looks like old scale (-2..2), convert to 1..5:
          if (m <= 2 && m >= -2) {
            // -2..2 -> 1..5
            m = clamp(Math.round(m + 3), 1, 5);
          }

          return { ...r, moodScore: clamp(m, 1, 5), intensity: clamp(r.intensity ?? 3, 1, 5) };
        });

        if (normalized.length < 10) {
          setRows(makeSeed30Days());
          setSeeded(true);
        } else {
          setRows(normalized);
          setSeeded(false);
        }
      } catch {
        setRows(makeSeed30Days());
        setSeeded(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [rows]);

  const chartData = useMemo(() => {
    return sorted.map((r) => ({
      date: new Date(r.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      mood: r.moodScore,
    }));
  }, [sorted]);

  const avg = useMemo(() => {
    if (!sorted.length) return 0;
    return sorted.reduce((a, b) => a + b.moodScore, 0) / sorted.length;
  }, [sorted]);

  const daysLogged = sorted.length;

  const lastUpdated = useMemo(() => {
    const d = new Date();
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-5xl tracking-tight text-[rgba(var(--text),0.95)]">Dashboard</h1>
          <p className="mt-2 text-[rgba(var(--text),0.70)]">
            A calm overview of your last 30 days — a steady month.
          </p>
          <p className="mt-3 text-sm text-[rgba(var(--text),0.55)]">
            Last updated today at {lastUpdated}
            {seeded ? " · showing sample data" : ""}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="rounded-[28px] bg-[rgba(var(--surface),0.85)] shadow-[0_18px_50px_rgba(0,0,0,0.10)] ring-1 ring-[rgba(0,0,0,0.06)] p-7">
          <div className="text-sm text-[rgba(var(--text),0.70)]">30-day average</div>
          <div className="text-6xl font-[var(--font-serif)] mt-3">{avg.toFixed(1)}</div>
          <div className="mt-3 text-sm text-[rgba(var(--text),0.60)]">
            Range: 1 (very low) to 5 (very good)
          </div>
        </div>

        <div className="rounded-[28px] bg-[rgba(var(--surface),0.85)] shadow-[0_18px_50px_rgba(0,0,0,0.10)] ring-1 ring-[rgba(0,0,0,0.06)] p-7">
          <div className="text-sm text-[rgba(var(--text),0.70)]">Days logged</div>
          <div className="text-6xl font-[var(--font-serif)] mt-3">{daysLogged}</div>
          <div className="mt-3 text-sm text-[rgba(var(--text),0.60)]">
            You’ve shown up {daysLogged} {daysLogged === 1 ? "time" : "times"} this month.
          </div>
        </div>

        <div className="rounded-[28px] bg-[rgba(var(--surface),0.85)] shadow-[0_18px_50px_rgba(0,0,0,0.10)] ring-1 ring-[rgba(0,0,0,0.06)] p-7">
          <div className="text-sm text-[rgba(var(--text),0.70)]">Next step</div>
          <a
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[rgba(255,255,255,0.85)] px-6 py-3 font-medium shadow-[0_14px_28px_rgba(0,0,0,0.10)] hover:bg-white transition"
            href="/checkin"
          >
            Do today’s check-in
          </a>
          <div className="mt-3 text-sm text-[rgba(var(--text),0.60)]">
            Just a quick moment — no streak pressure.
          </div>
          <div className="mt-4 text-sm text-[rgba(var(--text),0.55)] italic">
            “A steady month is still progress.”
          </div>
        </div>
      </div>

      <div className="rounded-[28px] bg-[rgba(var(--surface),0.85)] shadow-[0_18px_55px_rgba(0,0,0,0.10)] ring-1 ring-[rgba(0,0,0,0.06)] p-7">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-5xl font-[var(--font-serif)] tracking-tight">Mood trend</h2>
            <p className="mt-2 text-[rgba(var(--text),0.70)]">A simple view of your last 30 days.</p>
          </div>
          <div className="rounded-full bg-[rgba(255,255,255,0.55)] ring-1 ring-[rgba(0,0,0,0.06)] px-4 py-2 text-sm">
            Tip: hover points to see the day
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="text-sm text-[rgba(var(--text),0.60)]">Loading…</div>
          ) : sorted.length ? (
            <ChartMoodTrend data={chartData} />
          ) : (
            <div className="text-sm text-[rgba(var(--text),0.60)]">No data yet. Start with a check-in.</div>
          )}
        </div>
      </div>
    </div>
  );
}
