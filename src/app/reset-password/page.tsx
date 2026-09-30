"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ─── Icons ────────────────────────────────────────────────────────────────────
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

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

const inputClass =
  "w-full border border-[#E5E5E5] bg-white text-sm text-[#1A1A1A] font-sans px-4 py-3 placeholder:text-[#ABABAB] focus:outline-none focus:border-[#D4AF37] transition-colors duration-200";

const inputWithIconClass =
  "w-full border border-[#E5E5E5] bg-white text-sm text-[#1A1A1A] font-sans pl-10 pr-4 py-3 placeholder:text-[#ABABAB] focus:outline-none focus:border-[#D4AF37] transition-colors duration-200";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const emailFromUrl = params.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to reset password");
        return;
      }

      // Redirect to login with success message
      router.push("/login?reset=1");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF] px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white border border-[#E5E5E5] shadow-sm px-8 py-10"
      >
        {/* Brand */}
        <div className="text-center mb-7">
          <p className="text-xs tracking-[0.35em] uppercase text-[#D4AF37] font-sans mb-3">
            Rosewood Pharmacy
          </p>
          <h1 className="font-heading text-3xl text-[#1A1A1A] mb-1">
            Reset Password
          </h1>
          <p className="text-xs text-[#6B6B6B] font-sans">
            Enter the code sent to your email and create a new password.
          </p>
        </div>

        {/* Alert */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              role="alert"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700 font-sans overflow-hidden"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Email (if not pre-filled) */}
          {!emailFromUrl && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans font-semibold text-[#1A1A1A]">
                Email Address
              </label>
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
          )}

          {/* Reset Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans font-semibold text-[#1A1A1A]">
              Reset Code
            </label>
            <input
              type="text"
              value={code}
              required
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              autoComplete="off"
              disabled={loading}
              maxLength={6}
              className={inputClass}
            />
            <p className="text-[10px] text-[#ABABAB] font-sans">
              Check your email for the 6-digit reset code
            </p>
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans font-semibold text-[#1A1A1A]">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <LockIcon />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                required
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={loading}
                minLength={8}
                className={`${inputWithIconClass} pr-11`}
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

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans font-semibold text-[#1A1A1A]">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <LockIcon />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={loading}
                className={`${inputWithIconClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center px-3.5 text-[#ABABAB] hover:text-[#6B6B6B] transition-colors"
              >
                <EyeIcon open={showConfirmPassword} />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 bg-[#1A1A1A] text-[#D4AF37] text-xs font-sans tracking-[0.2em] uppercase py-3.5 flex items-center justify-center gap-2 hover:bg-[#D4AF37] hover:text-black transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Resetting..."
            ) : (
              <>
                Reset Password
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Back to login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-[#6B6B6B] font-sans hover:text-[#D4AF37] transition-colors"
          >
            <BackIcon />
            Back to Login
          </Link>
        </div>

        {/* Resend code */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-xs text-[#D4AF37] font-sans hover:text-[#1A1A1A] transition-colors"
          >
            Didn&apos;t receive a code? Resend
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
