"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";

type HeroSlide = {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  order: number;
  isActive: boolean;
};

type Bubble = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
};

// Returns "left" for even slides, "right" for odd
function textSide(index: number): "left" | "right" {
  return index % 2 === 0 ? "left" : "right";
}

const BUBBLE_COLORS = [
  "rgba(212,175,55,0.5)",
  "rgba(255,255,255,0.4)",
  "rgba(212,175,55,0.35)",
  "rgba(255,255,255,0.3)",
  "rgba(180,150,40,0.45)",
];

export default function HeroSectionDynamic() {
  const [slides, setSlides]             = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [bubbles, setBubbles]           = useState<Bubble[]>([]);
  const bubbleId                        = useRef(0);
  const sectionRef                      = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch("/api/ui/hero")
      .then((res) => res.json())
      .then((json) => { if (json.success && json.data) setSlides(json.data); })
      .catch((err) => console.error("Failed to load hero slides:", err))
      .finally(() => setLoading(false));
  }, []);

  // Auto-rotate every 5s
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCurrentIndex((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  // Spawn bubble on mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Throttle: only spawn every ~80ms
    if (Math.random() > 0.4) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.random() * 80 + 40; // 40–120px
    const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    const id = bubbleId.current++;

    setBubbles(prev => [...prev.slice(-25), { id, x, y, size, color }]);

    // Remove bubble after animation
    setTimeout(() => {
      setBubbles(prev => prev.filter(b => b.id !== id));
    }, 1500);
  }, []);

  /* ── Loading ── */
  if (loading) {
    return (
      <section className="relative w-full h-[90vh] min-h-[580px] pt-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }} />
      </section>
    );
  }

  /* ── Fallback (no slides) ── */
  if (slides.length === 0) {
    return (
      <section className="relative w-full h-[90vh] min-h-[580px] overflow-hidden pt-20">
        <Image
          src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1600&q=80"
          alt="Luxury apothecary products" fill className="object-cover object-center" priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="relative z-10 h-full flex items-center">
          <div className="w-full px-12">
            <div className="max-w-lg">
              <p className="text-xs tracking-[0.3em] uppercase text-white/70 font-sans mb-4">Your Personal Pharmacy</p>
              <h1 className="font-heading text-4xl md:text-5xl text-white leading-tight mb-5">
                Quality Healthcare,<br />Right at Your Door
              </h1>
              <Link href="/pharmacy"
                className="inline-flex items-center gap-2 text-xs font-sans tracking-widest uppercase px-7 py-3 transition-all duration-300"
                style={{ backgroundColor: "#D4AF37", color: "#1A1A1A", borderRadius: "9999px" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#b8952e"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#D4AF37"; }}>
                Explore Pharmacy
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-primary) 40%, transparent), transparent)" }} />
      </section>
    );
  }

  const currentSlide = slides[currentIndex];
  const side         = textSide(currentIndex);
  const isRight      = side === "right";

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[90vh] min-h-[580px] overflow-hidden pt-[94px]"
    >
      {/* ── Bubbles layer ── */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {bubbles.map(bubble => (
            <motion.div
              key={bubble.id}
              initial={{ opacity: 0.9, scale: 0, x: bubble.x - bubble.size / 2, y: bubble.y - bubble.size / 2 }}
              animate={{ opacity: 0, scale: 1.2, y: bubble.y - bubble.size / 2 - 120 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              className="absolute rounded-full"
              style={{
                width: bubble.size,
                height: bubble.size,
                backgroundColor: bubble.color,
                backdropFilter: "blur(6px)",
                border: "2px solid rgba(255,255,255,0.35)",
                boxShadow: `0 0 ${bubble.size * 0.5}px ${bubble.color}`,
              }}
            />
          ))}
        </AnimatePresence>
      </div>
      {/* ── Background image ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
          className="absolute inset-0"
        >
          <Image
            src={currentSlide.imageUrl}
            alt={currentSlide.title || "Hero slide"}
            fill
            className="object-cover object-center"
            priority={currentIndex === 0}
            unoptimized={currentSlide.imageUrl.startsWith("http")}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Overlay — darkens the side where text lives ── */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: isRight
            ? "linear-gradient(to left, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)"
            : "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)",
        }}
      />

      {/* ── Prev / Next arrows ── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((p) => (p - 1 + slides.length) % slides.length)}
            aria-label="Previous slide"
            className="absolute left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentIndex((p) => (p + 1) % slides.length)}
            aria-label="Next slide"
            className="absolute right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {/* ── Text content ── */}
      <div className="relative z-10 h-full flex items-center">
        <div className={`w-full px-10 md:px-20 flex ${isRight ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[520px] flex flex-col ${isRight ? "items-end text-right" : "items-start text-left"}`}>

          {/* Eyebrow */}
          {currentSlide.subtitle && (
            <motion.p
              key={`eyebrow-${currentSlide.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="font-sans text-[11px] md:text-[12px] tracking-[0.22em] uppercase text-white/80 mb-3"
            >
              {currentSlide.subtitle}
            </motion.p>
          )}

          {/* Title — large serif */}
          {currentSlide.title && (
            <motion.h1
              key={`title-${currentSlide.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hero-heading font-heading text-white leading-[1.1] mb-5 cursor-default"
              style={{
                fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
                fontWeight: 400,
                transition: "color 0.3s ease",
              }}
              dangerouslySetInnerHTML={{ __html: currentSlide.title.replace(/\n/g, "<br />") }}
            />
          )}

          {/* CTA ghost button */}
          <motion.div
            key={`cta-${currentSlide.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link
              href="/pharmacy"
              className="inline-flex items-center justify-center text-[11px] font-sans tracking-[0.18em] uppercase px-8 py-3.5 transition-all duration-300"
              style={{
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.55)",
                borderRadius: "6px",
                backgroundColor: "transparent",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = "rgba(255,255,255,0.15)";
                el.style.borderColor = "rgba(255,255,255,0.9)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = "transparent";
                el.style.borderColor = "rgba(255,255,255,0.55)";
              }}
            >
              Explore Pharmacy
            </Link>
          </motion.div>
        </div>
        </div>
      </div>

      {/* ── Dot indicators ── */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className="h-[3px] rounded-full transition-all duration-400"
              style={{
                width: idx === currentIndex ? 28 : 8,
                backgroundColor: idx === currentIndex ? "var(--color-primary)" : "rgba(255,255,255,0.45)",
              }}
            />
          ))}
        </div>
      )}

      {/* ── Bottom accent line ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-primary) 40%, transparent), transparent)" }} />

      <style>{`.hero-heading:hover { color: #D4AF37 !important; }`}</style>
    </section>
  );
}
