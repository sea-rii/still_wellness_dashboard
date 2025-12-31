"use client";

import { useEffect, useMemo, useState } from "react";
import InsightCard from "../../../components/InsightCards";
import { fillToNDays } from "@/app/lib/moodSeed";

type Insight = { id: string; title: string; message: string };
type Mood = { date: string; moodScore: number; tags?: { tag: string }[] };
type JournalEntry = { id: string; date: string; text: string; prompt?: string | null };

type LocalInsight = { id: string; title: string; message: string };

function buildLocalInsights(moods: Mood[], journal: JournalEntry[]): LocalInsight[] {
  if (!moods.length) return [];

  const sorted = [...moods].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const avg = sorted.reduce((s, m) => s + m.moodScore, 0) / sorted.length;

  // last 7 vs previous 7
  const last7 = sorted.slice(-7);
  const prev7 = sorted.slice(-14, -7);
  const last7Avg = last7.reduce((s, m) => s + m.moodScore, 0) / Math.max(1, last7.length);
  const prev7Avg = prev7.length ? prev7.reduce((s, m) => s + m.moodScore, 0) / prev7.length : last7Avg;
  const delta = last7Avg - prev7Avg;

  // volatility proxy
  const variance = sorted.reduce((s, m) => s + Math.pow(m.moodScore - avg, 2), 0) / sorted.length;

  // tag lift (tag day avg vs overall)
  const tagCounts = new Map<string, number>();
  const tagSums = new Map<string, number>();
  for (const m of sorted) {
    for (const t of m.tags ?? []) {
      const tag = t.tag.toLowerCase();
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      tagSums.set(tag, (tagSums.get(tag) ?? 0) + m.moodScore);
    }
  }

  const tagLift = [...tagCounts.keys()]
    .map((tag) => {
      const c = tagCounts.get(tag)!;
      const tagAvg = (tagSums.get(tag)! / c) || 0;
      return { tag, c, tagAvg, lift: tagAvg - avg };
    })
    .filter((x) => x.c >= 4) // "earned" threshold
    .sort((a, b) => Math.abs(b.lift) - Math.abs(a.lift));

  // next-day effect for a tag
  const nextDayEffect = (tag: string) => {
    const tagged: number[] = [];
    const next: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const cur = sorted[i];
      const hasTag = (cur.tags ?? []).some((t) => t.tag.toLowerCase() === tag);
      if (!hasTag) continue;
      tagged.push(cur.moodScore);
      next.push(sorted[i + 1].moodScore);
    }
    if (next.length < 5) return null;
    const a = tagged.reduce((s, v) => s + v, 0) / tagged.length;
    const b = next.reduce((s, v) => s + v, 0) / next.length;
    return { tag, taggedAvg: a, nextAvg: b, diff: b - a, n: next.length };
  };

  const sleep = nextDayEffect("sleep");
  const stress = nextDayEffect("stress");

  // journaling connection (long entry days)
  const longDays = new Set(
    journal
      .filter((e) => (e.text ?? "").length > 220)
      .map((e) => new Date(e.date).toDateString())
  );

  const journalDaysMood = sorted
    .filter((m) => longDays.has(new Date(m.date).toDateString()))
    .map((m) => m.moodScore);

  const journalAvg =
    journalDaysMood.length >= 4
      ? journalDaysMood.reduce((s, v) => s + v, 0) / journalDaysMood.length
      : null;

  const cards: LocalInsight[] = [];

  // 1) week shift
  if (sorted.length >= 14) {
    const direction =
      Math.abs(delta) < 0.2 ? "steady" : delta > 0 ? "a little lighter" : "a little heavier";

    cards.push({
      id: "local-week-shift",
      title: "This week vs last week",
      message:
        direction === "steady"
          ? "Your last 7 days look pretty steady compared to the week before — no big swings."
          : `Your last 7 days feel ${direction} than the previous week. Not a conclusion — just a gentle nudge.`,
    });
  }

  // 2) volatility
  cards.push({
    id: "local-volatility",
    title: variance < 0.35 ? "Your month looks steady" : "Your month has some ups and downs",
    message:
      variance < 0.35
        ? "Your mood stays within a narrow range most days. Sometimes “boring” is actually calm."
        : "Your mood changes day-to-day without one obvious driver — and that’s completely normal.",
  });

  // 3) tag lift
  if (tagLift.length) {
    const top = tagLift[0];
    const sign = top.lift > 0 ? "higher" : "lower";
    cards.push({
      id: "local-tag-lift",
      title: `When you tag “${top.tag}”`,
      message: `On days tagged “${top.tag}”, your mood runs ${sign} than your month average (seen ${top.c} times).`,
    });
  }

  // 4) next day effects
  if (sleep) {
    const sign = sleep.diff > 0 ? "steadier" : "a bit lower";
    cards.push({
      id: "local-sleep-next",
      title: "Sleep shows up the next day",
      message: `After “sleep” days, the next day tends to feel ${sign} (based on ${sleep.n} transitions).`,
    });
  }

  if (stress) {
    const sign = stress.diff < 0 ? "heavier" : "not consistently worse";
    cards.push({
      id: "local-stress-next",
      title: "Stress doesn’t always stick",
      message: `After “stress” days, the next day is ${sign} (based on ${stress.n} transitions).`,
    });
  }

  // 5) journaling link
  if (journalAvg !== null) {
    const diff = journalAvg - avg;
    cards.push({
      id: "local-journal-link",
      title: "Journaling + mood (soft link)",
      message:
        Math.abs(diff) < 0.2
          ? "On days you write longer entries, your mood looks similar — journaling might be support, not a switch."
          : diff > 0
          ? "Longer journaling days tend to be calmer — but inconsistently."
          : "On longer journaling days, mood sometimes dips — it may just be processing.",
    });
  }

  return cards.slice(0, 4);
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const [moods, setMoods] = useState<Mood[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function load() {
    setLoading(true);

    const [insRes, moodRes, journalRes] = await Promise.allSettled([
      fetch("/api/insights", { cache: "no-store" }),
      fetch("/api/mood?range=30", { cache: "no-store" }),
      fetch("/api/journal", { cache: "no-store" }),
    ]);

    // insights (API)
    if (insRes.status === "fulfilled" && insRes.value.ok) {
      const j = await insRes.value.json().catch(() => ({}));
      setInsights(j.insights ?? []);
    } else {
      setInsights([]);
    }

    // moods (always fill to 30)
    if (moodRes.status === "fulfilled" && moodRes.value.ok) {
      const j = await moodRes.value.json().catch(() => ({}));
      const apiMoods = (j.data ?? []) as Mood[];
      const { filled } = fillToNDays(apiMoods, 30);
      setMoods(filled);
    } else {
      const { filled } = fillToNDays([], 30);
      setMoods(filled);
    }

    // journal
    if (journalRes.status === "fulfilled" && journalRes.value.ok) {
      const j = await journalRes.value.json().catch(() => ({}));
      setJournal(j.entries ?? []);
    } else {
      setJournal([]);
    }

    setLastUpdated(new Date());
    setLoading(false);
  }

  async function generate() {
    setStatus("Looking for different patterns…");
    const res = await fetch("/api/insights/generate", { method: "POST" });
    if (!res.ok) {
      setStatus("Could not generate insights.");
      return;
    }
    setStatus("Updated.");
    await load();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // count is always 30 once filled
  const checkinsCount = moods.length;

  const confidenceLevel = useMemo<"high" | "medium" | "low">(() => {
    if (checkinsCount >= 20) return "high";
    if (checkinsCount >= 10) return "medium";
    return "low";
  }, [checkinsCount]);

  const uncertaintyCopy = useMemo(() => {
    if (checkinsCount >= 12) return null;
    return "We’re noticing hints of a pattern, but there isn’t enough data yet to be confident.";
  }, [checkinsCount]);

  const negativeSpaceCopy = useMemo(() => {
    if (moods.length < 10) return "No strong patterns detected yet — and that’s okay.";
    const avg = moods.reduce((a, b) => a + b.moodScore, 0) / moods.length;
    const variance = moods.reduce((a, b) => a + Math.pow(b.moodScore - avg, 2), 0) / moods.length;
    if (variance < 0.35) return "Your mood has been fairly steady — not every month needs a lesson.";
    return "Your moods vary day-to-day, without a clear driver — and that’s completely normal.";
  }, [moods]);

  const journalSignal = useMemo(() => {
    if (!journal.length || moods.length < 10) return null;

    const longDays = new Set(
      journal
        .filter((e) => (e.text ?? "").length > 220)
        .map((e) => new Date(e.date).toDateString())
    );

    if (!longDays.size) return "Journaling is here if you want it — no pressure to write a lot.";

    const moodMap = new Map<string, number>();
    moods.forEach((m) => moodMap.set(new Date(m.date).toDateString(), m.moodScore));

    const longMoodVals: number[] = [];
    longDays.forEach((d) => {
      const v = moodMap.get(d);
      if (typeof v === "number") longMoodVals.push(v);
    });

    if (longMoodVals.length < 3) return "Journaling days might matter, but it’s too early to be sure.";

    const longAvg = longMoodVals.reduce((a, b) => a + b, 0) / longMoodVals.length;
    const overallAvg = moods.reduce((a, b) => a + b.moodScore, 0) / moods.length;
    const diff = longAvg - overallAvg;

    if (Math.abs(diff) < 0.25) return "On days you journal more, your mood looks similar — but consistency varies.";
    if (diff > 0) return "Journaling days tend to be calmer, but inconsistently.";
    return "On longer journaling days, mood sometimes dips — it may just be processing.";
  }, [journal, moods]);

  const distribution = useMemo(() => {
    const counts = new Map<number, number>();
    for (const m of moods) counts.set(m.moodScore, (counts.get(m.moodScore) ?? 0) + 1);
    return [1, 2, 3, 4, 5].map((k) => ({ score: k, count: counts.get(k) ?? 0 }));
  }, [moods]);

  const avg = useMemo(() => {
    if (!moods.length) return 0;
    return moods.reduce((a, b) => a + b.moodScore, 0) / moods.length;
  }, [moods]);

  const bestGoodStreak = useMemo(() => {
    let best = 0;
    let cur = 0;
    for (const m of moods) {
      if (m.moodScore >= 4) {
        cur++;
        best = Math.max(best, cur);
      } else cur = 0;
    }
    return best;
  }, [moods]);

  // fallback insight generation
  const localInsights = useMemo(() => buildLocalInsights(moods, journal), [moods, journal]);
  const sourceInsights = useMemo(
    () => (insights?.length ? insights : localInsights).slice(0, 4),
    [insights, localInsights]
  );

  const enriched = useMemo(() => {
    const baseEvidence = `Based on ${checkinsCount} check-ins over the last 30 days`;
    const conf = confidenceLevel;

    const inviteSamples = [
      "You might experiment with one small change for a week — just to notice what shifts.",
      "It could help to pay attention to what you do on calmer days (no fixing required).",
      "Just observing this pattern for a few days may be enough.",
    ];

    const pickInvite = (i: number) => inviteSamples[i % inviteSamples.length];

    const list = sourceInsights.map((i: any, idx: number) => ({
      id: i.id,
      title: i.title,
      message: i.message,
      evidence: baseEvidence,
      confidence: conf,
      invite: pickInvite(idx),
      note: journalSignal ? `Journal note: ${journalSignal}` : undefined,
    }));

    // still keep one negative space card (feels real)
    list.push({
      id: "ns-2",
      title: "A normal note",
      message: negativeSpaceCopy,
      evidence: baseEvidence,
      confidence: "medium" as const,
      invite: "Patterns don’t judge — they just show up.",
      note: journalSignal ? `Journal note: ${journalSignal}` : undefined,
    });

    return list;
  }, [sourceInsights, checkinsCount, confidenceLevel, negativeSpaceCopy, journalSignal]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-5xl tracking-tight text-[rgba(var(--text),0.95)]">Insights</h1>
          <p className="mt-2 text-[rgba(var(--text),0.70)]">Gentle observations from your last 30 days.</p>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-[rgba(var(--text),0.70)]">
            {lastUpdated && (
              <span className="rounded-full bg-white/60 px-4 py-2 ring-1 ring-[rgba(0,0,0,0.06)]">
                Last updated{" "}
                {lastUpdated.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
              </span>
            )}
            <span className="rounded-full bg-white/60 px-4 py-2 ring-1 ring-[rgba(0,0,0,0.06)]">
              You’ve shown up {checkinsCount} times this month
            </span>
          </div>

          {uncertaintyCopy && (
            <div className="mt-4 rounded-[20px] bg-white/55 ring-1 ring-[rgba(0,0,0,0.06)] px-5 py-4 text-[rgba(var(--text),0.78)]">
              <div className="text-[rgba(var(--text),0.92)]">This pattern isn’t strong yet</div>
              <div className="mt-1">{uncertaintyCopy}</div>
            </div>
          )}

          <p className="mt-4 text-[rgba(var(--text),0.75)]">Patterns don’t judge — they just show up.</p>
          {status && <div className="mt-3 text-[rgba(var(--text),0.75)]">{status}</div>}
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={generate}
            className="rounded-full bg-white/85 px-6 py-3 font-medium text-[rgba(var(--text),0.92)] shadow-[0_10px_25px_rgba(0,0,0,0.10)] hover:bg-white transition"
          >
            Regenerate
          </button>
          <div className="max-w-[280px] text-right text-sm text-[rgba(var(--text),0.70)]">
            Regenerate looks for different patterns — it won’t overwrite anything.
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="grid gap-5">
          {loading ? (
            <div className="text-[rgba(var(--text),0.70)]">Loading…</div>
          ) : (
            enriched.map((i) => (
              <InsightCard
                key={i.id}
                title={i.title}
                message={i.message}
                evidence={i.evidence}
                confidence={i.confidence}
                invite={i.invite}
                note={i.note}
              />
            ))
          )}
        </div>

        {/* RIGHT */}
        <div className="grid gap-5">
          {/* Mood distribution */}
          <div className="rounded-[28px] bg-[rgb(var(--surface))] ring-1 ring-[rgba(0,0,0,0.06)] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
            <h2 className="text-2xl tracking-tight text-[rgba(var(--text),0.95)]">Mood distribution</h2>
            <p className="mt-2 text-[rgba(var(--text),0.70)]">How often each score showed up.</p>

            <div className="mt-6 space-y-3">
              {distribution.map((d) => (
                <div key={d.score} className="flex items-center gap-4">
                  <div className="w-10 text-[rgba(var(--text),0.85)]">{d.score}</div>
                  <div className="flex-1 rounded-full bg-white/45 ring-1 ring-[rgba(0,0,0,0.06)] overflow-hidden h-3">
                    <div
                      className="h-3 bg-[rgba(0,0,0,0.55)]"
                      style={{
                        width: `${moods.length ? (d.count / moods.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="w-10 text-right text-[rgba(var(--text),0.70)]">{d.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekday rhythm */}
          <div className="rounded-[28px] bg-[rgb(var(--surface))] ring-1 ring-[rgba(0,0,0,0.06)] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
            <h2 className="text-2xl tracking-tight text-[rgba(var(--text),0.95)]">Weekday rhythm</h2>
            <p className="mt-2 text-[rgba(var(--text),0.70)]">Average mood by day of week.</p>

            {(() => {
              const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              const sums = Array(7).fill(0);
              const counts = Array(7).fill(0);

              moods.forEach((m) => {
                const d = new Date(m.date).getDay();
                sums[d] += m.moodScore;
                counts[d] += 1;
              });

              const avgs = sums.map((s, i) => (counts[i] ? s / counts[i] : 0));
              const max = Math.max(...avgs, 1);

              return (
                <div className="mt-6 space-y-3">
                  {days.map((label, i) => (
                    <div key={label} className="flex items-center gap-4">
                      <div className="w-12 text-[rgba(var(--text),0.80)]">{label}</div>
                      <div className="flex-1 rounded-full bg-white/45 ring-1 ring-[rgba(0,0,0,0.06)] overflow-hidden h-3">
                        <div
                          className="h-3 bg-[rgba(0,0,0,0.50)]"
                          style={{ width: `${(avgs[i] / max) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-right text-[rgba(var(--text),0.70)]">
                        {avgs[i] ? avgs[i].toFixed(1) : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Tags you use */}
          <div className="rounded-[28px] bg-[rgb(var(--surface))] ring-1 ring-[rgba(0,0,0,0.06)] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
            <h2 className="text-2xl tracking-tight text-[rgba(var(--text),0.95)]">Tags you use</h2>
            <p className="mt-2 text-[rgba(var(--text),0.70)]">What shows up most across 30 days.</p>

            {(() => {
              const counts = new Map<string, number>();
              moods.forEach((m) =>
                (m.tags ?? []).forEach((t) => {
                  const key = t.tag.toLowerCase();
                  counts.set(key, (counts.get(key) ?? 0) + 1);
                })
              );

              const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

              if (!top.length) {
                return (
                  <div className="mt-5 text-[rgba(var(--text),0.70)]">
                    No tags yet — try adding 1–2 on check-in days.
                  </div>
                );
              }

              return (
                <div className="mt-6 flex flex-wrap gap-2">
                  {top.map(([tag, c]) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/60 px-3 py-2 ring-1 ring-[rgba(0,0,0,0.06)] text-sm text-[rgba(var(--text),0.85)]"
                    >
                      {tag} <span className="text-[rgba(var(--text),0.55)]">· {c}</span>
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Quick stats */}
          <div className="rounded-[28px] bg-[rgb(var(--surface))] ring-1 ring-[rgba(0,0,0,0.06)] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
            <h2 className="text-2xl tracking-tight text-[rgba(var(--text),0.95)]">Quick stats</h2>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-[22px] bg-white/55 ring-1 ring-[rgba(0,0,0,0.06)] p-5">
                <div className="text-sm text-[rgba(var(--text),0.70)]">Monthly average</div>
                <div className="mt-2 text-4xl text-[rgba(var(--text),0.95)]">{avg.toFixed(1)}</div>
              </div>

              <div className="rounded-[22px] bg-white/55 ring-1 ring-[rgba(0,0,0,0.06)] p-5">
                <div className="text-sm text-[rgba(var(--text),0.70)]">Best “good” streak</div>
                <div className="mt-2 text-4xl text-[rgba(var(--text),0.95)]">{bestGoodStreak}d</div>
              </div>
            </div>

            <p className="mt-4 text-[rgba(var(--text),0.70)]">
              These reflections are meant to support awareness, not conclusions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
