"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const emailFromUrl = params.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/customer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otpCode: code.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to verify email");
        return;
      }

      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login?verified=1");
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setResending(true);

    try {
      const res = await fetch("/api/customer/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to resend code");
        return;
      }

      setError(null);
      // Show temporary success message
      const tempSuccess = document.createElement("div");
      tempSuccess.className = "text-xs text-[#D4AF37] font-sans mt-2";
      tempSuccess.textContent = "✓ New code sent!";
      const btn = document.querySelector("[data-resend-btn]");
      btn?.parentElement?.appendChild(tempSuccess);
      setTimeout(() => tempSuccess.remove(), 3000);
    } catch {
      setError("Failed to resend code");
    } finally {
      setResending(false);
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
            Verify Your Email
          </h1>
          <p className="text-xs text-[#6B6B6B] font-sans">
            Enter the verification code sent to your email address.
          </p>
        </div>

        {/* Alerts */}
        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2.5 text-xs text-[#1A1A1A] font-sans overflow-hidden"
            >
              ✓ Email verified! Redirecting to login...
            </motion.div>
          )}
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
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans font-semibold text-[#1A1A1A]">
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
                disabled={loading || success || !!emailFromUrl}
                className={inputWithIconClass}
              />
            </div>
          </div>

          {/* Verification Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans font-semibold text-[#1A1A1A]">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              required
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              autoComplete="off"
              disabled={loading || success}
              maxLength={6}
              className={inputClass}
            />
            <p className="text-[10px] text-[#ABABAB] font-sans">
              Check your email for the 6-digit verification code
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full mt-1 bg-[#1A1A1A] text-[#D4AF37] text-xs font-sans tracking-[0.2em] uppercase py-3.5 flex items-center justify-center gap-2 hover:bg-[#D4AF37] hover:text-black transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Verifying..."
            ) : success ? (
              "Verified ✓"
            ) : (
              <>
                Verify Email
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Resend code */}
        <div className="mt-6 text-center">
          <button
            type="button"
            data-resend-btn
            onClick={handleResend}
            disabled={resending || success}
            className="text-xs text-[#D4AF37] font-sans hover:text-[#1A1A1A] transition-colors disabled:opacity-60"
          >
            {resending ? "Sending..." : "Didn't receive a code? Resend"}
          </button>
        </div>

        {/* Back to login */}
        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-[#6B6B6B] font-sans hover:text-[#D4AF37] transition-colors"
          >
            <BackIcon />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
