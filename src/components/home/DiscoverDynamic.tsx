"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

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

  useEffect(() => {
    fetch("/api/ui/discover")
      .then(r => r.json())
      .then(json => { if (json.success && json.data?.isActive) setData(json.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return null;
  if (!data.heading && !data.mainImage && !data.videoUrl) return null;

  const embedUrl = getEmbedUrl(data.videoUrl);
  const thumbImage = data.videoImage || data.mainImage;

  return (
    <section className="w-full bg-white py-12 md:py-16">
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
            <h2 className="font-heading text-3xl md:text-5xl text-[#1A1A1A] leading-tight mb-4 max-w-3xl mx-auto">
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

        {/* ── Big rounded video/image below ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative overflow-hidden"
          style={{
            borderRadius: "20px",
            height: "480px",
            backgroundColor: "#111",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}
        >
          {/* Video embed */}
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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbImage}
              alt={data.heading ?? "Discover"}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : null}

          {/* Bottom-left overlay: play label */}
          {!embedUrl && (
            <div className="absolute bottom-5 left-6 flex items-center gap-3">
              {/* Play button */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white" className="ml-0.5">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
              {/* Label */}
              <div>
                {data.videoLabel && (
                  <p className="text-[10px] uppercase tracking-widest font-sans text-white/70">
                    {data.videoLabel}
                  </p>
                )}
                {data.videoTitle && (
                  <p className="text-sm font-sans text-white font-medium">
                    {data.videoTitle}
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
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

      </div>
    </section>
  );
}
