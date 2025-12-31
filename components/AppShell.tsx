// components/AppShell.tsx
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { StillH1, StillMuted, StillPill } from "@/components/ui";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/checkin", label: "Check-in" },
  { href: "/journal", label: "Journal" },
  { href: "/insights", label: "Insights" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-20">
        <div className="text-center">
          <StillH1>Still.</StillH1>
          <div className="mt-3">
            <StillMuted>A calm space for patterns + reflection.</StillMuted>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {nav.map((n) => {
              const active = pathname?.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href}>
                  <StillPill active={active}>{n.label}</StillPill>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-10 h-px w-full bg-[rgba(0,0,0,0.06)]" />

        <main className="mt-10">{children}</main>
      </div>
    </div>
  );
}
