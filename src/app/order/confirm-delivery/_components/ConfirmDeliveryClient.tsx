"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type State = "loading" | "success" | "already_used" | "error";

export default function ConfirmDeliveryClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState]   = useState<State>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("No delivery token found in the link.");
      return;
    }

    fetch("/api/orders/confirm-delivery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setState("success");
          setMessage(json.message || "Delivery confirmed!");
        } else if (json.message?.includes("already been used")) {
          setState("already_used");
          setMessage(json.message);
        } else {
          setState("error");
          setMessage(json.message || "Failed to confirm delivery.");
        }
      })
      .catch(() => {
        setState("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7] px-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full overflow-hidden">

        {/* Header */}
        <div className="bg-[#1A1A1A] px-8 py-6 text-center">
          <h1 style={{ fontFamily: "var(--font-cinzel),'Cinzel',serif", color: "#D4AF37", fontSize: "20px", letterSpacing: "1px", margin: 0 }}>
            ROSEWOOD PHARMACY
          </h1>
        </div>

        <div className="px-8 py-10 text-center">
          {state === "loading" && (
            <>
              <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <p style={{ fontFamily: "var(--font-montserrat),'Montserrat',sans-serif", color: "#666", fontSize: "15px" }}>
                Confirming your delivery…
              </p>
            </>
          )}

          {state === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-6 text-3xl">
                ✅
              </div>
              <h2 style={{ fontFamily: "var(--font-cinzel),'Cinzel',serif", color: "#1A1A1A", fontSize: "22px", marginBottom: "12px" }}>
                Delivery Confirmed!
              </h2>
              <p style={{ fontFamily: "var(--font-montserrat),'Montserrat',sans-serif", color: "#555", fontSize: "14px", marginBottom: "28px", lineHeight: "1.6" }}>
                {message} Thank you for shopping with Rosewood Pharmacy.
              </p>
              <Link href="/pharmacy"
                className="inline-block px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
                style={{ backgroundColor: "#D4AF37", color: "#1A1A1A", fontFamily: "var(--font-montserrat),'Montserrat',sans-serif" }}>
                Continue Shopping
              </Link>
            </>
          )}

          {state === "already_used" && (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-6 text-3xl">
                ℹ️
              </div>
              <h2 style={{ fontFamily: "var(--font-cinzel),'Cinzel',serif", color: "#1A1A1A", fontSize: "22px", marginBottom: "12px" }}>
                Already Confirmed
              </h2>
              <p style={{ fontFamily: "var(--font-montserrat),'Montserrat',sans-serif", color: "#555", fontSize: "14px", marginBottom: "28px", lineHeight: "1.6" }}>
                This delivery has already been confirmed. No further action needed.
              </p>
              <Link href="/pharmacy"
                className="inline-block px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
                style={{ backgroundColor: "#D4AF37", color: "#1A1A1A", fontFamily: "var(--font-montserrat),'Montserrat',sans-serif" }}>
                Back to Store
              </Link>
            </>
          )}

          {state === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-6 text-3xl">
                ❌
              </div>
              <h2 style={{ fontFamily: "var(--font-cinzel),'Cinzel',serif", color: "#1A1A1A", fontSize: "22px", marginBottom: "12px" }}>
                Something Went Wrong
              </h2>
              <p style={{ fontFamily: "var(--font-montserrat),'Montserrat',sans-serif", color: "#555", fontSize: "14px", marginBottom: "28px", lineHeight: "1.6" }}>
                {message}
              </p>
              <Link href="/"
                className="inline-block px-6 py-3 rounded-lg text-sm font-semibold border transition-colors"
                style={{ borderColor: "#E5E5E5", color: "#555", fontFamily: "var(--font-montserrat),'Montserrat',sans-serif" }}>
                Go to Homepage
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
