"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";
import AboutHeaderDynamic from "@/components/about/AboutHeaderDynamic";
import OurStoryDynamic from "@/components/about/OurStoryDynamic";
import OurMissionDynamic from "@/components/about/OurMissionDynamic";
import OurValuesDynamic from "@/components/about/OurValuesDynamic";

export default function AboutPage() {
  return (
    <div className="bg-[#F9F9F9]">
      <Navbar />
      <main className="min-h-screen pt-14">
        {/* ── Hero / Page Title ──────────────────────────────────────────────── */}
        <AboutHeaderDynamic />

        {/* ── Our Story ─────────────────────────────────────────────────────── */}
        <OurStoryDynamic />

        {/* ── Our Mission ───────────────────────────────────────────────────── */}
        <OurMissionDynamic />

        {/* ── Our Values ────────────────────────────────────────────────────── */}
        <OurValuesDynamic />

        {/* ── Bottom gold line (mirrors hero) ───────────────────────────────── */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
      </main>
      <Footer />
    </div>
  );
}
