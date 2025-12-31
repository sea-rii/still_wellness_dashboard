// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { StillButton, StillInput, StillLabel, StillMuted } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: true,
      callbackUrl: "/dashboard",
      email,
      password,
    });

    // If redirect happens, you won’t see this.
    setLoading(false);
    if ((res as any)?.error) setStatus("Sign in failed. Double-check your details.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-[var(--font-serif)] text-[rgba(var(--text),0.92)]">
          Sign in
        </h2>
        <div className="mt-2">
          <StillMuted>Welcome back. Keep it gentle.</StillMuted>
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
          {loading ? "Signing in…" : "Sign in"}
        </StillButton>

        <div className="text-sm text-[rgba(var(--text),0.7)]">
          Don’t have an account?{" "}
          <Link className="underline" href="/register">
            Create one
          </Link>
        </div>
      </form>
    </div>
  );
}
