// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { StillButton, StillInput, StillLabel, StillMuted } from "@/components/ui";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setStatus(j?.error ?? "Registration failed. Try a different email.");
      return;
    }

    // push them to login
    window.location.href = "/login";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-[var(--font-serif)] text-[rgba(var(--text),0.92)]">
          Create account
        </h2>
        <div className="mt-2">
          <StillMuted>Start small. Build a calm pattern.</StillMuted>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-2">
          <StillLabel>Email</StillLabel>
          <StillInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div className="grid gap-2">
          <StillLabel>Password</StillLabel>
          <StillInput value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••••••" />
        </div>

        {status && <div className="text-sm text-red-600">{status}</div>}

        <StillButton type="submit" disabled={loading} className="w-full">
          {loading ? "Creating…" : "Create account"}
        </StillButton>

        <div className="text-sm text-[rgba(var(--text),0.7)]">
          Already have an account?{" "}
          <Link className="underline" href="/login">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
