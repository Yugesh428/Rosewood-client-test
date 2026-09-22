"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";

type PromotionSlide = {
  id: string;
  eyebrow: string | null;
  brand: string | null;
  title: string | null;
  description: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  bgImage: string | null;
  order: number;
  isActive: boolean;
};

export default function PromotionsDynamic() {
  const [slides, setSlides] = useState<PromotionSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [sectionHovered, setSectionHovered] = useState(false);

  // ── 3D Tilt ──────────────────────────────────────────────────────────────
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [shimmerPos, setShimmerPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
    // Shimmer follows mouse
    setShimmerPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleCardMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovering(false);
  };

  useEffect(() => {
    fetch("/api/ui/promotions")
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data)
          setSlides(json.data.filter((s: PromotionSlide) => s.isActive));
      })
      .finally(() => setLoading(false));
  }, []);

  const next = useCallback(() => setCurrent(p => (p + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent(p => (p - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [slides.length, paused, next]);

  if (loading || slides.length === 0) return null;

  const slide = slides[current];
  const discountMatch = (slide.title ?? "").match(/(\d+%)/);
  const discount = discountMatch ? discountMatch[1] : null;

  return (
    <section
      className="w-full relative"
      onMouseEnter={() => { setPaused(true); setSectionHovered(true); }}
      onMouseLeave={() => { setPaused(false); setSectionHovered(false); }}
    >
      {/* Section label in the gap */}
      <div className="w-full bg-white py-8 text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase font-sans text-black/40 mb-2">Limited Time</p>
        <h2 className="font-heading text-4xl md:text-5xl text-[#1A1A1A]">Promotions</h2>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="relative w-full"
          style={{ minHeight: "520px" }}
        >
          {/* ── Full background image ── */}
          {slide.bgImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.bgImage}
              alt={slide.title ?? "Promotion"}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: "#1a1a2e" }} />
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.35) 100%)" }}
          />

          {/* ── Card (content above image) ── */}
          <div className="relative z-10 w-full h-full flex items-center justify-end px-8 md:px-16 py-16" style={{ minHeight: "520px" }}>
            <AnimatePresence>
            {sectionHovered && (
            <motion.div
              ref={cardRef}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onMouseMove={handleCardMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={handleCardMouseLeave}
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                perspective: 1000,
                background: "rgba(0, 0, 0, 0.55)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "16px",
                padding: "2.5rem",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                position: "relative",
                overflow: "hidden",
              }}
              className="max-w-md w-full cursor-default"
            >
              {/* Shimmer overlay - follows mouse */}
              <motion.div
                animate={{ opacity: isHovering ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(circle 120px at ${shimmerPos.x}% ${shimmerPos.y}%, rgba(212,175,55,0.18) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)`,
                  pointerEvents: "none",
                  borderRadius: "16px",
                  zIndex: 0,
                }}
              />

              {/* Sweep shimmer on hover */}
              <motion.div
                initial={{ x: "-100%", opacity: 0 }}
                animate={isHovering ? { x: "200%", opacity: [0, 0.4, 0] } : { x: "-100%", opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  top: 0, bottom: 0,
                  width: "60%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                  transform: "skewX(-15deg)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />

              {/* All content — lifted above shimmer */}
              <div style={{ position: "relative", zIndex: 2 }}>
              {/* Eyebrow */}
              {slide.eyebrow && (
                <p className="text-[9px] tracking-[0.4em] uppercase font-sans mb-4"
                  style={{ color: "#D4AF37" }}>
                  {slide.eyebrow}
                </p>
              )}

              {/* Brand */}
              {slide.brand && (
                <p className="text-xs font-sans tracking-widest uppercase mb-2"
                  style={{ color: "rgba(255,255,255,0.6)" }}>
                  {slide.brand}
                </p>
              )}

              {/* Title / Discount */}
              {discount ? (
                <div className="mb-4">
                  <p className="font-heading text-white text-xl leading-none mb-1">Save</p>
                  <p className="font-heading leading-none"
                    style={{ fontSize: "clamp(4rem,10vw,6.5rem)", color: "#D4AF37", lineHeight: 1 }}>
                    {discount}
                  </p>
                </div>
              ) : (
                <h2 className="font-heading text-4xl md:text-5xl text-white leading-tight mb-4">
                  {slide.title}
                </h2>
              )}

              {/* Description */}
              {slide.description && (
                <p className="text-sm font-sans leading-relaxed mb-6"
                  style={{ color: "rgba(255,255,255,0.7)" }}>
                  {slide.description}
                </p>
              )}

              {/* CTA */}
              {slide.ctaText && slide.ctaLink && (
                <Link
                  href={slide.ctaLink}
                  className="inline-block px-7 py-3 text-[10px] tracking-[0.25em] uppercase font-sans font-semibold transition-all duration-300 rounded-full"
                  style={{
                    background: "rgba(212,175,55,0.9)",
                    backdropFilter: "blur(8px)",
                    color: "#111",
                    border: "1px solid rgba(212,175,55,0.5)",
                    boxShadow: "0 4px 15px rgba(212,175,55,0.3)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.95)";
                    (e.currentTarget as HTMLElement).style.color = "#111";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(212,175,55,0.9)";
                    (e.currentTarget as HTMLElement).style.color = "#111";
                  }}
                >
                  {slide.ctaText}
                </Link>
              )}

              {/* Slide navigation inside card */}
              {slides.length > 1 && (
                <div className="flex items-center gap-3 mt-6 pt-5"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <button onClick={prev}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(212,175,55,0.3)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>

                  {/* Dots */}
                  <div className="flex gap-1.5">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: i === current ? "20px" : "6px",
                          height: "6px",
                          backgroundColor: i === current ? "#D4AF37" : "rgba(255,255,255,0.35)",
                        }}
                      />
                    ))}
                  </div>

                  <button onClick={next}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(212,175,55,0.3)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>

                  <span className="text-[10px] font-mono ml-auto"
                    style={{ color: "rgba(255,255,255,0.3)" }}>
                    {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                  </span>
                </div>
              )}
              </div>{/* end content z-2 */}
            </motion.div>
            )}
            </AnimatePresence>
          </div>

        </motion.div>
      </AnimatePresence>
    </section>
  );
}
