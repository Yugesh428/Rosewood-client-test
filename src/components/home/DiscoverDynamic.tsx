"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import gsap from "gsap";

type DiscoverData = {
  eyebrow: string | null;
  heading: string | null;
  description: string | null;
  mainImage: string | null;
  ctaText: string | null;
  expandDescription: string | null;
  videoImage: string | null;
  videoLabel: string | null;
  videoTitle: string | null;
  videoUrl: string | null;
  isActive: boolean;
};

function getEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let id = u.searchParams.get("v");
      if (!id && u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=1&rel=0`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").pop();
      if (id) return `https://player.vimeo.com/video/${id}?autoplay=1&loop=1&muted=1`;
    }
  } catch {}
  return null;
}

export default function DiscoverDynamic() {
  const [data, setData] = useState<DiscoverData | null>(null);
  const [loading, setLoading] = useState(true);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    fetch("/api/ui/discover")
      .then(r => r.json())
      .then(json => { if (json.success && json.data?.isActive) setData(json.data); })
      .finally(() => setLoading(false));
  }, []);

  // GSAP letter animation for heading
  useEffect(() => {
    if (!headingRef.current || !data?.heading) return;

    const heading = headingRef.current;
    const text = data.heading;
    
    // Split text into individual letters with spans
    heading.innerHTML = text
      .split("")
      .map((char) => {
        if (char === " ") return '<span style="display: inline-block; width: 0.3em;"></span>';
        return `<span style="display: inline-block; opacity: 0;">${char}</span>`;
      })
      .join("");

    const letters = heading.querySelectorAll("span");

    // Animate each letter
    gsap.fromTo(
      letters,
      {
        opacity: 0,
        rotationX: -90,
        y: 20,
      },
      {
        opacity: 1,
        rotationX: 0,
        y: 0,
        duration: 0.8,
        stagger: 0.03,
        ease: "back.out(1.2)",
        delay: 0.3,
      }
    );
  }, [data]);

  if (loading || !data) return null;
  if (!data.heading && !data.mainImage && !data.videoUrl) return null;

  const embedUrl = getEmbedUrl(data.videoUrl);
  const thumbImage = data.videoImage || data.mainImage;

  return (
    <section className="w-full bg-white py-12 md:py-16">
      {/* Text centered with max-width */}
      <div className="max-w-5xl mx-auto px-6 md:px-12">

        {/* ── Top text: centered ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          {/* Eyebrow badge */}
          {data.eyebrow && (
            <span
              className="inline-block text-[10px] tracking-[0.2em] uppercase font-sans px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: "#f0f4f0", color: "#5a7a5a" }}
            >
              {data.eyebrow}
            </span>
          )}

          {/* Main heading */}
          {data.heading && (
            <h2
              ref={headingRef}
              className="text-3xl md:text-5xl text-[#1A1A1A] leading-tight mb-4 max-w-3xl mx-auto"
              style={{
                fontFamily: "'Lucida Calligraphy', 'Lucida Handwriting', 'Palatino Linotype', cursive",
                fontWeight: 400,
                letterSpacing: "0.02em",
                perspective: "1000px",
              }}
            >
              {data.heading}
            </h2>
          )}

          {/* Description */}
          {(data.description || data.expandDescription) && (
            <p className="text-sm md:text-base font-sans text-gray-500 leading-relaxed max-w-xl mx-auto">
              {data.description || data.expandDescription}
            </p>
          )}
        </motion.div>

      </div>{/* end text container */}

      {/* ── Video + images — edge to edge ──────────────────────────────── */}
      <div className="w-full px-0">
        {/* ── Video left + 2 stacked images right ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex gap-4 items-stretch"
          style={{ height: "480px" }}
        >
          {/* LEFT — Main video */}
          <div
            className="relative flex-1 overflow-hidden"
            style={{
              borderRadius: "20px",
              backgroundColor: "#111",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={data.heading ?? "Discover"}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: "none" }}
              />
            ) : data.videoUrl ? (
              <video
                src={data.videoUrl}
                autoPlay muted loop playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : thumbImage ? (
              <img
                src={thumbImage}
                alt={data.heading ?? "Discover"}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : null}

            {!embedUrl && (
              <div className="absolute bottom-5 left-6 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white" className="ml-0.5">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
                <div>
                  {data.videoLabel && <p className="text-[10px] uppercase tracking-widest font-sans text-white/70">{data.videoLabel}</p>}
                  {data.videoTitle && <p className="text-sm font-sans text-white font-medium">{data.videoTitle}</p>}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Two stacked images */}
          <div className="hidden md:flex flex-col gap-4 w-[220px] flex-shrink-0">
            {/* Top image */}
            <div className="flex-1 overflow-hidden" style={{ borderRadius: "20px" }}>
              <img
                src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop&q=80"
                alt="Skincare"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Bottom image */}
            <div className="flex-1 overflow-hidden" style={{ borderRadius: "20px" }}>
              <img
                src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=300&fit=crop&q=80"
                alt="Beauty"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </motion.div>
      </div>{/* end edge-to-edge */}

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <Link
            href="/discover"
            className="inline-block px-8 py-3 text-xs tracking-[0.2em] uppercase font-sans font-semibold rounded-full transition-all duration-300"
            style={{ backgroundColor: "#1A1A1A", color: "#fff" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#D4AF37"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#1A1A1A"}
          >
            {data.ctaText || "Discover More"}
          </Link>
        </motion.div>
      </div>{/* end CTA container */}

    </section>
  );
}
