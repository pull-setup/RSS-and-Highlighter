"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4 rounded-lg border border-black/10 dark:border-white/10 bg-black/[.02] dark:bg-white/[.06] p-6"
      >
        <h1 className="text-xl font-semibold">Sign in</h1>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-foreground text-background py-2 text-sm font-medium hover:opacity-90"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
