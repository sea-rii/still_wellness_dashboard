import type { ReactNode } from "react";
import AppShell from "@/components/AppShell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* optional: your pastel blobs background if you have it */}
      <div className="still-blobs" />

      <AppShell>
        <div className="mx-auto max-w-6xl px-6 pt-14 pb-16">{children}</div>
      </AppShell>
    </div>
  );
}
