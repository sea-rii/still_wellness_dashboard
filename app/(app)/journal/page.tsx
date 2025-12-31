// app/(app)/journal/page.tsx
"use client";

import { useEffect, useState } from "react";
import { StillCard, StillCardInner, StillMuted, StillInput, StillTextarea, StillButton } from "@/components/ui";

export default function JournalPage() {
  const [q, setQ] = useState("");
  const [text, setText] = useState("");
  const [prompt, setPrompt] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/journal?q=${encodeURIComponent(q)}`);
    const j = await res.json();
    setEntries(j.entries ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setStatus(null);
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt || null, text }),
    });
    if (!res.ok) {
      setStatus("Could not save.");
      return;
    }
    setText("");
    setPrompt("");
    setStatus("Saved.");
    await load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl tracking-tight text-[rgba(var(--text),0.95)]">Journal</h1>
        <div className="mt-2">
          <StillMuted>Write freely, or use a gentle prompt.</StillMuted>
        </div>
      </div>

      <StillCard>
        <StillCardInner className="p-10 space-y-4">
          <StillInput
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Prompt (optional) e.g. "What stayed with you today?"'
          />
          <StillTextarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a few lines…" />
          <div className="flex items-center gap-4 flex-wrap">
            <StillButton onClick={save} className="w-auto px-10">
              Save entry
            </StillButton>
            {status && <span className="text-sm text-[rgba(var(--text),0.70)]">{status}</span>}
          </div>
        </StillCardInner>
      </StillCard>

      <StillCard>
        <StillCardInner className="p-10">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-3xl font-semibold text-[rgba(var(--text),0.92)]">History</div>
            <div className="flex gap-2">
              <StillInput value={q} onChange={(e) => setQ(e.target.value)} className="w-[220px]" placeholder="Search…" />
              <StillButton onClick={load} className="w-auto px-8">
                Search
              </StillButton>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {entries.map((e) => (
              <a
                key={e.id}
                href={`/journal/${e.id}`}
                className="rounded-[22px] bg-[rgba(255,255,255,0.35)] p-5 ring-1 ring-[rgba(0,0,0,0.06)] hover:bg-white transition"
              >
                <div className="text-sm text-[rgba(var(--text),0.60)]">{new Date(e.date).toLocaleDateString()}</div>
                <div className="text-sm font-medium mt-2 text-[rgba(var(--text),0.90)]">{e.prompt ? e.prompt : "Free write"}</div>
                <div className="text-sm text-[rgba(var(--text),0.72)] mt-2 line-clamp-2">{e.text}</div>
              </a>
            ))}
            {!entries.length && <div className="text-sm text-[rgba(var(--text),0.65)]">No entries yet.</div>}
          </div>
        </StillCardInner>
      </StillCard>
    </div>
  );
}
