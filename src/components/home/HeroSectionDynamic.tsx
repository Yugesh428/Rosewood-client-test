"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

// ── Flip Button ───────────────────────────────────────────────────────────────
function FlipButton({ href, front, back }: { href: string; front: string; back: string }) {
  return (
    <>
      <Link href={href} className="btn-flip-hero" data-front={front} data-back={back} />
      <style>{`
        .btn-flip-hero {
          opacity: 1;
          outline: 0;
          color: #fff;
          line-height: 44px;
          position: relative;
          text-align: center;
          letter-spacing: 0.18em;
          display: inline-block;
          text-decoration: none;
          font-family: var(--font-sans), 'Open Sans', sans-serif;
          font-size: 11px;
          text-transform: uppercase;
        }
        .btn-flip-hero:after {
          top: 0;
          left: 0;
          opacity: 0;
          width: 100%;
          color: #1A1A1A;
          display: block;
          transition: 0.45s cubic-bezier(0.23, 1, 0.32, 1);
          position: absolute;
          background: #D4AF37;
          content: attr(data-back);
          transform: translateY(-50%) rotateX(90deg);
          padding: 0 32px;
          border-radius: 999px;
        }
        .btn-flip-hero:before {
          top: 0;
          left: 0;
          opacity: 1;
          color: #D4AF37;
          display: block;
          padding: 0 32px;
          line-height: 44px;
          transition: 0.45s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(212,175,55,0.5);
          content: attr(data-front);
          transform: translateY(0) rotateX(0);
          border-radius: 999px;
        }
        .btn-flip-hero:hover:after {
          opacity: 1;
          transform: translateY(0) rotateX(0);
        }
        .btn-flip-hero:hover:before {
          opacity: 0;
          transform: translateY(50%) rotateX(90deg);
        }
        .btn-flip-hero:active {
          transform: scale(0.97);
        }
      `}</style>
    </>
  );
}

// ── Timings (ms) — single source of truth ─────────────────────────────────────
const TEXT_OUT_MS   = 400;  // text fades out
const BG_WIPE_MS    = 1200; // image wipe duration
const TEXT_IN_DELAY = TEXT_OUT_MS + BG_WIPE_MS; // 1600ms — text fades in after bg settled

type HeroSlide = {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  order: number;
  isActive: boolean;
};

function colorMiddleWord(text: string): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) return text;
  const mid = Math.floor(words.length / 2);
  return words
    .map((w, i) => i === mid ? `<span style="color:#D4AF37">${w}</span>` : w)
    .join(" ");
}

export default function HeroSectionDynamic() {
  const [slides, setSlides]           = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating]     = useState(false);
  const [textVisible, setTextVisible] = useState(true); // controls text show/hide
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    fetch("/api/ui/hero")
      .then((res) => res.json())
      .then((json) => { if (json.success && json.data) setSlides(json.data); })
      .catch((err) => console.error("Failed to load hero slides:", err))
      .finally(() => setLoading(false));
  }, []);

  const getNextIndex = useCallback((from = currentIndex) =>
    (from + 1) % slides.length, [currentIndex, slides.length]);

  const getPrevIndex = useCallback((from = currentIndex) =>
    (from - 1 + slides.length) % slides.length, [currentIndex, slides.length]);

  /**
   * Sequence:
   * 0ms       — text fades OUT
   * 400ms     — image starts wipe transition
   * 1600ms    — image fully in, text fades IN with new content
   */
  const goTo = useCallback((nextIdx: number) => {
    if (animating || nextIdx === currentIndex || slides.length < 2) return;
    setAnimating(true);

    // Step 1: hide text
    setTextVisible(false);

    // Step 2: after text is gone, swap image
    setTimeout(() => {
      setCurrentIndex(nextIdx);
    }, TEXT_OUT_MS);

    // Step 3: after image finishes, show new text
    setTimeout(() => {
      setTextVisible(true);
      setAnimating(false);
    }, TEXT_IN_DELAY + 200); // small extra buffer
  }, [animating, currentIndex, slides.length]);

  // Auto-rotate every 6s — full sequenced transition
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      if (animating) return;
      const next = (currentIndex + 1) % slides.length;
      setAnimating(true);
      setTextVisible(false);
      setTimeout(() => setCurrentIndex(next), TEXT_OUT_MS);
      setTimeout(() => { setTextVisible(true); setAnimating(false); }, TEXT_IN_DELAY + 200);
    }, 6000);
    return () => clearInterval(t);
  }, [slides.length, currentIndex, animating]);

  /* ── Loading ── */
  if (loading) {
    return (
      <section className="relative w-full h-screen min-h-[600px] pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }} />
      </section>
    );
  }

  /* ── Fallback ── */
  if (slides.length === 0) {
    return (
      <section className="relative w-full h-screen min-h-[600px] overflow-hidden pt-20">
        <Image src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1600&q=80"
          alt="Luxury apothecary products" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent" />
        <div className="relative z-10 h-full flex items-center px-12">
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl text-white leading-tight mb-5"
              style={{ fontFamily: "var(--font-display), 'Cormorant', Georgia, serif", fontWeight: 600 }}>
              Quality Healthcare, Right at Your Door
            </h1>
            <Link href="/pharmacy"
              className="inline-flex items-center gap-2 text-xs font-sans tracking-widest uppercase px-7 py-3"
              style={{ backgroundColor: "#D4AF37", color: "#1A1A1A", borderRadius: "9999px" }}>
              Explore Pharmacy
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const current = slides[currentIndex];
  const isRight = currentIndex % 2 !== 0;
  const titleHtml = colorMiddleWord(
    (current.title || "Quality Healthcare, Right at Your Door").replace(/<br\s*\/?>/gi, " ").replace(/\n/g, " ")
  );

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden pt-[94px] bg-black">

      {/* ── Background image — simple crossfade ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: BG_WIPE_MS / 1000, ease: "easeInOut" }}
        >
          <Image
            src={current.imageUrl}
            alt={current.title || "Hero slide"}
            fill
            className="object-cover object-center"
            priority={currentIndex === 0}
            unoptimized={current.imageUrl.startsWith("http")}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Overlay ── */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: isRight
            ? "linear-gradient(to left, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)"
            : "linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)",
        }}
      />

      {/* ── Text — driven by textVisible state ── */}
      <div className="relative z-20 h-full flex items-center">
        <div className={`w-full px-10 md:px-20 flex ${isRight ? "justify-end" : "justify-start"}`}>
          <motion.div
            className={`max-w-[600px] flex flex-col ${isRight ? "items-end text-right" : "items-start text-left"}`}
            animate={{ opacity: textVisible ? 1 : 0, y: textVisible ? 0 : 16 }}
            transition={{ duration: textVisible ? 0.7 : 0.35, ease: "easeInOut" }}
          >
            {/* Title */}
            <h1
              className="text-white leading-[1.15] mb-4"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 3.2rem)",
                fontFamily: "var(--font-display), 'Cormorant', 'Playfair Display', Georgia, serif",
                fontWeight: 600,
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
              }}
              dangerouslySetInnerHTML={{ __html: titleHtml }}
            />

            {/* Subtitle */}
            <p className="font-sans text-[11px] tracking-[0.22em] uppercase text-white/80 mb-6">
              {current.subtitle || "Your Personal Pharmacy"}
            </p>

            {/* CTA — Flip Button */}
            <FlipButton href="/pharmacy" front="Explore Pharmacy" back="Shop Now" />
          </motion.div>
        </div>
      </div>

      {/* ── Prev arrow ── */}
      {slides.length > 1 && (
        <button
          onClick={() => goTo(getPrevIndex())}
          aria-label="Previous slide"
          className="absolute left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{ backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.25)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.35)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.18)"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* ── Next arrow ── */}
      {slides.length > 1 && (
        <button
          onClick={() => goTo(getNextIndex())}
          aria-label="Next slide"
          className="absolute right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{ backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.25)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.35)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.18)"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      )}

      {/* ── Dot indicators ── */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className="h-[3px] rounded-full transition-all duration-500"
              style={{
                width: idx === currentIndex ? 28 : 8,
                backgroundColor: idx === currentIndex ? "var(--color-primary)" : "rgba(255,255,255,0.45)",
              }}
            />
          ))}
        </div>
      )}

      {/* ── Bottom accent line ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] z-20"
        style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-primary) 40%, transparent), transparent)" }} />
    </section>
  );
}
