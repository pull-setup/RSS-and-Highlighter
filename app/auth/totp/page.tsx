"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/app/components/ArticleIcons";
import { useEffect, useState } from "react";

export default function TotpSetupPage() {
  const [totpEnabled, setTotpEnabled] = useState<boolean | null>(null);
  const [step, setStep] = useState<"idle" | "setup" | "verify">("idle");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/totp/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setTotpEnabled(data.totpEnabled))
      .catch(() => setTotpEnabled(false));
  }, []);

  async function handleSetup() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/totp/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to start setup");
        return;
      }
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep("verify");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/totp/verify-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid code");
        return;
      }
      setTotpEnabled(true);
      setStep("idle");
      setQrCode(null);
      setSecret(null);
      setCode("");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopySecret() {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  if (totpEnabled === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col gap-6 rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Two-factor authentication</h1>
          {totpEnabled && (
            <Link
              href="/"
              className="flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded border border-border px-2 py-2 text-muted transition-colors hover:bg-surface hover:text-foreground sm:min-h-0 sm:min-w-0 sm:py-1"
              aria-label="Back to Home"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          )}
        </div>

        {error && (
          <p className="text-sm text-error">{error}</p>
        )}

        {step === "idle" && (
          <div className="flex flex-col gap-4">
            {totpEnabled ? (
              <p className="text-sm text-muted">
                Two-factor authentication is enabled.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted">
                  Set up two-factor authentication to continue. You will need an authenticator app (e.g. Google Authenticator, Authy).
                </p>
                <button
                  type="button"
                  onClick={handleSetup}
                  disabled={loading}
                  className="rounded bg-foreground text-background py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Starting…" : "Set up 2FA"}
                </button>
              </>
            )}
          </div>
        )}

        {step === "verify" && qrCode && (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <p className="text-sm text-muted">
              Scan this QR code with your authenticator app, then enter the 6-digit code below.
            </p>
            <div className="flex justify-center">
              <img src={qrCode} alt="TOTP QR code" className="rounded-lg border border-border" />
            </div>
            {secret && (
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted">Or enter manually in your app:</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-foreground break-all rounded border border-border bg-surface px-3 py-2">
                    {secret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="shrink-0 rounded border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-surface"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Verification code</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground font-mono tracking-widest"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="flex-1 rounded bg-foreground text-background py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Verify and enable"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("idle");
                  setQrCode(null);
                  setSecret(null);
                  setCode("");
                  setError("");
                }}
                className="rounded border border-border px-4 py-2 text-sm text-foreground hover:bg-surface"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
