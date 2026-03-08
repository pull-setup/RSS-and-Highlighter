"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [needTotp, setNeedTotp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, totp: needTotp ? totp : undefined }),
      });
      const data = await res.json();

      if (data.needTotp) {
        setNeedTotp(true);
        setTotp("");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Invalid email or password");
        setLoading(false);
        return;
      }

      if (!data.token) {
        setError("Something went wrong");
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        email,
        token: data.token,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Sign in failed");
        setLoading(false);
        return;
      }

      window.location.href = callbackUrl;
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4 rounded-lg border border-border bg-surface p-6"
      >
        <h1 className="text-xl font-semibold">Sign in</h1>
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
        {needTotp && (
          <p className="text-sm text-muted">
            Enter the 6-digit code from your authenticator app.
          </p>
        )}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            readOnly={needTotp}
            className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground read-only:opacity-70"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            readOnly={needTotp}
            className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground read-only:opacity-70"
          />
        </label>
        {needTotp && (
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Verification code</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={totp}
              onChange={(e) => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground font-mono tracking-widest"
            />
          </label>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-foreground text-background py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in…" : needTotp ? "Verify" : "Sign in"}
        </button>
        {needTotp && (
          <button
            type="button"
            onClick={() => {
              setNeedTotp(false);
              setTotp("");
              setError("");
            }}
            className="text-sm text-muted hover:text-foreground"
          >
            ← Back
          </button>
        )}
      </form>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4"><div className="text-foreground/60">Loading…</div></div>}>
      <SignInForm />
    </Suspense>
  );
}
