"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import gsap from "gsap";

type PromotionSlide = {
  id: string;
  eyebrow: string | null;
  brand: string | null;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  bgImage: string | null;
  order: number;
  isActive: boolean;
};

// Slide transition variants — text from right, image from right
const textVariants = {
  enter:  { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit:   { opacity: 0, x: -60, transition: { duration: 0.4, ease: "easeIn" } },
};

const imageVariants = {
  enter:  { opacity: 0, scale: 0.85, x: 80 },
  center: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
  exit:   { opacity: 0, scale: 0.85, x: -80, transition: { duration: 0.4, ease: "easeIn" } },
};

// Static fallback slide shown when no data
const FALLBACK: PromotionSlide = {
  id: "fallback",
  eyebrow: null,
  brand: null,
  title: "TRUE BEAUTY BEGINS WHERE NATURE TOUCHES THE SKIN",
  subtitle: "Discover skincare crafted with gentle ingredients that cleanse, nourish, and care for your skin every day, helping you embrace your natural glow.",
  description: null,
  ctaText: "Order Now",
  ctaLink: "/pharmacy",
  bgImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&h=900&fit=crop&q=80",
  order: 0,
  isActive: true,
};

export default function PromotionsDynamic() {
  const headingRef   = useRef<HTMLHeadingElement>(null);
  const [slides, setSlides]   = useState<PromotionSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // ── Fetch slides ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/ui/promotions")
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.length > 0)
          setSlides(json.data);
        else
          setSlides([FALLBACK]);
      })
      .catch(() => setSlides([FALLBACK]))
      .finally(() => setLoading(false));
  }, []);

  // ── GSAP heading animation ────────────────────────────────────────────────
  useEffect(() => {
    if (!headingRef.current) return;
    const heading = headingRef.current;
    const text = "Promotions";
    heading.innerHTML = text
      .split("")
      .map(char =>
        char === " "
          ? '<span style="display:inline-block;width:0.3em;"></span>'
          : `<span style="display:inline-block;opacity:0;">${char}</span>`
      )
      .join("");

    gsap.fromTo(
      heading.querySelectorAll("span"),
      { opacity: 0, rotationX: -90, y: 20 },
      { opacity: 1, rotationX: 0, y: 0, duration: 0.8, stagger: 0.03, ease: "back.out(1.2)", delay: 0.3 }
    );
  }, [loading]);

  // ── Auto-advance ──────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent(p => (p + 1) % slides.length);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent(p => (p - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(goNext, 6000);
    return () => clearInterval(t);
  }, [slides.length, goNext]);

  if (loading) return null;

  const slide = slides[current];

  return (
    <section className="w-full relative min-h-screen flex items-center" style={{ backgroundColor: "#FFFFFF" }}>

      {/* Promotions Heading - Top Center */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 text-center">
        <h2
          ref={headingRef}
          className="text-4xl md:text-5xl text-[#1A1A1A]"
          style={{
            fontFamily: "'Lucida Calligraphy', 'Lucida Handwriting', 'Palatino Linotype', cursive",
            fontWeight: 400,
            letterSpacing: "0.02em",
            perspective: "1000px",
          }}
        >Promotions</h2>
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-8 md:px-16 lg:px-32 py-16 pt-32">

        {/* Two columns */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">

          {/* LEFT — Text */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={slide.id + "-text"}
              custom={direction}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full lg:flex-[1.2] text-right max-w-lg ml-auto z-10"
            >
              {/* Eyebrow / brand */}
              {(slide.eyebrow || slide.brand) && (
                <p className="text-xs tracking-[0.3em] uppercase font-sans text-[#D4AF37] mb-4">
                  {slide.eyebrow}{slide.eyebrow && slide.brand ? " · " : ""}{slide.brand}
                </p>
              )}

              {/* Main heading */}
              {slide.title && (
                <h3
                  className="text-3xl md:text-4xl lg:text-[2.6rem] font-bold uppercase leading-tight mb-6"
                  style={{ color: "#1A1A1A", letterSpacing: "0.02em" }}
                >
                  {slide.title}
                </h3>
              )}

              {/* Subtitle */}
              {slide.subtitle && (
                <p className="text-sm md:text-base leading-relaxed mb-4 ml-auto" style={{ color: "#555555", maxWidth: "450px" }}>
                  {slide.subtitle}
                </p>
              )}

              {/* Description */}
              {slide.description && (
                <p className="text-xs md:text-sm leading-relaxed mb-6 ml-auto italic" style={{ color: "#888", maxWidth: "450px" }}>
                  {slide.description}
                </p>
              )}

              {/* CTA Button - Gold theme with flip animation */}
              <div className="flex justify-end mt-4">
                <div
                  className="relative group"
                  style={{
                    perspective: "600px",
                    width: "fit-content",
                  }}
                >
                  <style>{`
                    .promo-btn {
                      display: inline-block;
                      position: relative;
                      width: 180px;
                      height: 52px;
                      transform-style: preserve-3d;
                      transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
                      cursor: pointer;
                    }
                    .promo-btn:hover {
                      transform: rotateX(180deg);
                    }
                    .promo-btn-front,
                    .promo-btn-back {
                      position: absolute;
                      inset: 0;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      backface-visibility: hidden;
                      -webkit-backface-visibility: hidden;
                      font-size: 0.75rem;
                      font-weight: 700;
                      letter-spacing: 0.15em;
                      text-transform: uppercase;
                      font-family: system-ui, sans-serif;
                      border-radius: 999px;
                    }
                    .promo-btn-front {
                      background: #D4AF37;
                      color: #1A1A1A;
                      box-shadow: 0 4px 20px rgba(212,175,55,0.4);
                    }
                    .promo-btn-back {
                      background: #1A1A1A;
                      color: #D4AF37;
                      transform: rotateX(180deg);
                      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    }
                  `}</style>

                  {slide.ctaLink ? (
                    <Link href={slide.ctaLink} className="promo-btn" style={{ textDecoration: "none" }}>
                      <span className="promo-btn-front">{slide.ctaText || "Order Now"}</span>
                      <span className="promo-btn-back">{slide.ctaText || "Order Now"}</span>
                    </Link>
                  ) : (
                    <button className="promo-btn">
                      <span className="promo-btn-front">{slide.ctaText || "Order Now"}</span>
                      <span className="promo-btn-back">{slide.ctaText || "Order Now"}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* RIGHT — Circular Image */}
          <div className="w-full lg:w-auto lg:flex-shrink-0 relative flex items-center justify-center">
            {/* Halo circle */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] lg:w-[650px] lg:h-[650px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(194,225,218,0.8) 0%, rgba(194,225,218,0.4) 50%, transparent 75%)" }}
            />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={slide.id + "-img"}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="relative z-10"
              >
                <div className="w-[480px] h-[480px] lg:w-[560px] lg:h-[560px] rounded-full overflow-hidden bg-white"
                  style={{
                    boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 8px 25px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
                  }}
                >
                  {slide.bgImage ? (
                    <img
                      src={slide.bgImage}
                      alt={slide.title || "Promotion"}
                      className="w-full h-full object-cover transition-transform duration-700 ease-in-out hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <p className="text-gray-400 text-sm">No image</p>
                    </div>
                  )}
                </div>

                {/* Decorative blur */}
                <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full" style={{ background: "#52796F", filter: "blur(45px)", zIndex: -1, opacity: 0.15 }} />
                <div className="absolute -bottom-4 -right-8 w-32 h-32 rounded-full" style={{ background: "#52796F", filter: "blur(50px)", zIndex: -1, opacity: 0.12 }} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation dots */}
        {slides.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-16">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: idx === current ? "32px" : "8px",
                  height: "8px",
                  backgroundColor: idx === current ? "#0A3A2A" : "rgba(0,0,0,0.2)",
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
