"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Create an account
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Join us today
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Full name
            </label>
            <input
              id="name" type="text" autoComplete="name" required
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Email address
            </label>
            <input
              id="email" type="email" autoComplete="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Password
              <span className="ml-1 font-normal text-zinc-400">(min. 8 characters)</span>
            </label>
            <div className="relative">
              <input
                id="password" type={showPassword ? "text" : "password"}
                autoComplete="new-password" required minLength={8}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 pr-10 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 transition"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition">
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
