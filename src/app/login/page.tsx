"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/site-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const target = params.get("from") || "/";
      router.push(target);
      router.refresh();
    } else {
      setLoading(false);
      setError(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[24px] border border-border bg-surface p-8 flex flex-col gap-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.55)] ring-1 ring-white/5"
      >
        <h1 className="text-xl font-semibold text-foreground text-center">
          Insert password
        </h1>
        <input
          type="password"
          autoFocus
          autoComplete="off"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          className="rounded-[16px] border border-border bg-surface-2 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        />
        {error && (
          <p className="text-sm text-red-400 text-center">Wrong password</p>
        )}
        <button
          type="submit"
          disabled={loading || password.length === 0}
          className="rounded-[16px] bg-accent text-accent-foreground font-semibold px-4 py-3 text-sm transition-all duration-200 hover:bg-accent-strong disabled:opacity-40 disabled:pointer-events-none"
        >
          {loading ? "…" : "Enter"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
