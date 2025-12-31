export default function InsightCard({
  title,
  message,
  evidence,
  confidence,
  invite,
  note,
}: {
  title: string;
  message: string;
  evidence?: string;
  confidence?: "high" | "medium" | "low";
  invite?: string;
  note?: string;
}) {
  const confText =
    confidence === "high"
      ? "higher confidence"
      : confidence === "medium"
      ? "moderate confidence"
      : confidence === "low"
      ? "low confidence"
      : null;

  return (
    <div className="rounded-[28px] bg-[rgb(var(--surface))] ring-1 ring-[rgba(0,0,0,0.06)] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-2xl tracking-tight text-[rgba(var(--text),0.95)]">{title}</div>

        {confText && (
          <div className="shrink-0 rounded-full bg-white/60 px-3 py-1 text-xs text-[rgba(var(--text),0.75)] ring-1 ring-[rgba(0,0,0,0.06)]">
            {confText}
          </div>
        )}
      </div>

      <div className="mt-3 text-[rgba(var(--text),0.78)] leading-relaxed">{message}</div>

      {invite && <div className="mt-4 text-[rgba(var(--text),0.75)]">{invite}</div>}

      <div className="mt-6 h-px bg-[rgba(0,0,0,0.08)]" />

      <div className="mt-3 grid gap-1 text-sm text-[rgba(var(--text),0.65)]">
        {evidence && <div>{evidence}</div>}
        {note && <div>{note}</div>}
        <div>Still looks for patterns, not diagnoses.</div>
      </div>
    </div>
  );
}
