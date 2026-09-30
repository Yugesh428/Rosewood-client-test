"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// ─── Icons ────────────────────────────────────────────────────────────────────
function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

const inputClass =
  "w-full border border-[#E5E5E5] bg-white text-sm text-[#1A1A1A] font-sans pl-10 pr-4 py-3 placeholder:text-[#ABABAB] focus:outline-none focus:border-[#D4AF37] transition-colors duration-200";

// ─── Form ─────────────────────────────────────────────────────────────────────
function LoginForm() {
  const router         = useRouter();
  const params         = useSearchParams();
  const justRegistered = params.get("registered") === "1";
  const passwordReset  = params.get("reset") === "1";

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [loading, setLoading]           = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      // Step 1 — detect role from DB
      const checkRes = await fetch("/api/auth/check-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (checkRes.ok) {
        const accountData = await checkRes.json();

        if (!accountData.exists) {
          setError("No account found with this email.");
          setLoading(false);
          return;
        }

        if (accountData.needsVerification) {
          router.push(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
          return;
        }

        // Step 2 — sign in with detected role
        const detectedRole: string = accountData.role ?? "CUSTOMER";

        const result = await signIn("credentials", {
          email:        normalizedEmail,
          password,
          expectedRole: detectedRole,
          redirect:     false,
        });

        if (result?.error) {
          setError("Incorrect password. Please try again.");
        } else {
          window.location.href = detectedRole === "ADMIN" ? "/admin" : "/";
        }
        return;
      }

      setError("Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F9]">
      <div className="flex flex-1">

        {/* ── Left: Image panel ─────────────────────────────────────────── */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&q=80"
            alt="Rosewood Pharmacy interior"
            fill
            sizes="50vw"
            className="object-cover object-center"
            priority
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {/* Text overlay */}
          <div className="absolute bottom-0 left-0 p-12">
            <div className="w-8 h-[1px] bg-[#D4AF37] mb-5" />
            <h2 className="font-heading text-3xl text-white leading-snug mb-3">
              Your Health,<br />Our Priority.
            </h2>
            <p className="text-sm text-white/70 font-sans leading-relaxed max-w-xs">
              Trusted pharmacy care with curated wellness products, delivered with precision and warmth.
            </p>
          </div>
        </div>

        {/* ── Right: Form panel ─────────────────────────────────────────── */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            {/* Heading */}
            <div className="mb-8">
              <p className="text-xs tracking-[0.35em] uppercase text-[#D4AF37] font-sans mb-3">
                Rosewood Pharmacy
              </p>
              <h1 className="font-heading text-4xl text-[#1A1A1A] leading-tight mb-2">
                Welcome Back
              </h1>
              <p className="text-sm text-[#6B6B6B] font-sans">
                Sign in to continue to your account.
              </p>
            </div>

            {/* Alerts */}
            <AnimatePresence mode="wait">
              {justRegistered && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-3 text-xs text-[#1A1A1A] font-sans overflow-hidden"
                >
                  ✓ Account created. Sign in below.
                </motion.div>
              )}
              {passwordReset && (
                <motion.div
                  key="reset"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-3 text-xs text-[#1A1A1A] font-sans overflow-hidden"
                >
                  ✓ Password reset successful. Sign in below.
                </motion.div>
              )}
              {error && (
                <motion.div
                  key="error"
                  role="alert"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 font-sans overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-[#1A1A1A]">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <MailIcon />
                  </span>
                  <input
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                    autoComplete="email"
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-sans font-semibold tracking-[0.15em] uppercase text-[#1A1A1A]">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <LockIcon />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center px-3.5 text-[#ABABAB] hover:text-[#6B6B6B] transition-colors"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="flex justify-end -mt-2">
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#D4AF37] font-sans hover:text-[#1A1A1A] transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A1A1A] text-white text-xs font-sans tracking-[0.2em] uppercase py-4 flex items-center justify-center gap-2 hover:bg-[#D4AF37] hover:text-black transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in…" : (
                  <>
                    Login
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Sign up */}
            <p className="mt-6 text-center text-xs text-[#6B6B6B] font-sans">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-[#1A1A1A] font-semibold underline underline-offset-2 hover:text-[#D4AF37] transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
