export default function HomePage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="font-[var(--font-serif)] text-6xl text-[rgba(var(--text),0.92)]">Still.</div>
          <div className="mt-4 text-[rgba(var(--text),0.70)]">
            A calm space for patterns + reflection.
          </div>

          <div className="mt-10 flex justify-center gap-3">
            <a
              href="/register"
              className="rounded-full bg-[rgb(var(--surface-2))] px-6 py-3 text-sm font-medium text-[rgba(var(--text),0.9)] ring-1 ring-[rgba(0,0,0,0.12)] hover:shadow-[0_18px_45px_rgba(0,0,0,0.12)] transition"
            >
              Create account
            </a>
            <a
              href="/login"
              className="rounded-full bg-[rgba(255,255,255,0.55)] px-6 py-3 text-sm font-medium text-[rgba(var(--text),0.8)] ring-1 ring-[rgba(0,0,0,0.06)] hover:bg-[rgba(255,255,255,0.75)] transition"
            >
              Sign in
            </a>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            { title: "Mood check-in", desc: "A simple scale + a few tags." },
            { title: "Journal", desc: "Write freely, with soft prompts when needed." },
            { title: "Insights", desc: "Small patterns you can actually use." },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-[28px] bg-[rgba(255,255,255,0.55)] p-7 ring-1 ring-[rgba(0,0,0,0.06)] shadow-[0_20px_55px_rgba(0,0,0,0.08)]"
            >
              <div className="font-[var(--font-serif)] text-2xl text-[rgba(var(--text),0.92)]">
                {c.title}
              </div>
              <div className="mt-2 text-sm text-[rgba(var(--text),0.65)]">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
