// app/(app)/checkin/page.tsx
"use client";

import { useEffect, useState } from "react";
import MoodPicker from "../../../components/MoodPicker";
import TagChips from "../../../components/TagChips";
import { StillButton, StillTextarea } from "@/components/ui";

export default function CheckinPage() {
  const [moodScore, setMoodScore] = useState(3); // 1..5
  const [intensity, setIntensity] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/mood?range=7");
      if (!res.ok) return;
      const j = await res.json();
      const last = j.data?.[j.data.length - 1];
      if (last) {
        // backend may store -2..2, normalize -> 1..5
        const normalized = last.moodScore <= 2 && last.moodScore >= -2 ? last.moodScore + 3 : last.moodScore;
        setMoodScore(normalized);
        setIntensity(last.intensity);
        setTags((last.tags ?? []).map((x: any) => x.tag));
        setNote(last.note ?? "");
      }
    })();
  }, []);

  function toggleTag(t: string) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function save() {
    setSaving(true);
    setStatus(null);

    // If your API expects -2..2, convert back:
    const moodForApi = moodScore - 3;

    const res = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moodScore: moodForApi, intensity, tags, note }),
    });

    setSaving(false);
    if (!res.ok) {
      setStatus("Could not save. Try again.");
      return;
    }
    setStatus("Saved for today.");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-[var(--font-serif)] text-[rgba(var(--text),0.92)]">Today’s check-in</h1>
        <p className="mt-2 text-[rgba(var(--text),0.70)]">Quick and gentle. No streak pressure.</p>
      </div>

      <div className="rounded-[28px] bg-[rgb(var(--surface))] ring-1 ring-[rgba(0,0,0,0.06)] p-8 shadow-[0_20px_55px_rgba(0,0,0,0.10)] space-y-8">
        <div>
          <div className="text-2xl font-[var(--font-serif)] text-[rgba(var(--text),0.9)] mb-3">Mood</div>
          <MoodPicker value={moodScore} onChange={setMoodScore} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-[var(--font-serif)] text-[rgba(var(--text),0.9)]">Intensity</div>
            <div className="text-sm text-[rgba(var(--text),0.65)]">{intensity} / 5</div>
          </div>

          <div className="mt-4 rounded-[26px] bg-[rgba(255,255,255,0.35)] ring-1 ring-[rgba(0,0,0,0.06)] p-6">
            <input
              type="range"
              min={1}
              max={5}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-3 flex justify-between text-sm text-[rgba(var(--text),0.65)]">
              <span>low</span>
              <span>high</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-2xl font-[var(--font-serif)] text-[rgba(var(--text),0.9)] mb-3">Tags</div>
          <TagChips selected={tags} onToggle={toggleTag} />
        </div>

        <div>
          <div className="text-2xl font-[var(--font-serif)] text-[rgba(var(--text),0.9)] mb-3">Note</div>
          <StillTextarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A few words about what today felt like…"
            className="bg-[rgba(255,255,255,0.45)]"
          />
        </div>

        <div className="flex items-center gap-4">
          <StillButton onClick={save} disabled={saving} className="w-auto px-10">
            {saving ? "Saving…" : "Save check-in"}
          </StillButton>
          {status && <span className="text-sm text-[rgba(var(--text),0.75)]">{status}</span>}
        </div>
      </div>
    </div>
  );
}
