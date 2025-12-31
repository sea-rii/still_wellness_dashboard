// components/AuthShell.tsx
import type { ReactNode } from "react";
import { StillCard, StillCardInner, StillH1, StillMuted } from "./ui";

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center px-6 pt-14 pb-16">
        <div className="text-center">
          <StillH1>Still.</StillH1>
          <div className="mt-4">
            <StillMuted>A calm space for patterns + reflection.</StillMuted>
          </div>
        </div>

        <div className="mt-10 w-full max-w-xl">
          <StillCard>
            <StillCardInner>{children}</StillCardInner>
          </StillCard>
        </div>
      </div>
    </div>
  );
}

