"use client";

import { useEffect, useState } from "react";

export default function JournalEntryPage({ params }: { params: { id: string } }) {
  const [entry, setEntry] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/journal/${params.id}`);
      const j = await res.json();
      setEntry(j.entry ?? null);
    })();
  }, [params.id]);

  if (!entry) {
    return <div className="text-sm text-neutral-400">Loading…</div>;
  }

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6">
      <a className="text-sm text-neutral-400 underline" href="/journal">← Back</a>
      <div className="mt-3 text-sm text-neutral-400">{new Date(entry.date).toLocaleDateString()}</div>
      <h1 className="text-2xl font-semibold mt-2">{entry.prompt ?? "Journal entry"}</h1>
      <pre className="mt-4 whitespace-pre-wrap text-neutral-200 leading-relaxed">
        {entry.text}
      </pre>
    </div>
  );
}
