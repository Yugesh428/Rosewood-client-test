"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

type VideoItem = {
  id: string;
  url: string;
  brand: string | null;
  title: string | null;
  link: string | null;
  sortOrder: number;
};

type FeaturedDuoData = {
  id: number;
  eyebrow: string | null;
  heading: string | null;
  shopNowUrl: string | null;
  leftImage: string | null;
  leftBrand: string | null;
  leftTitle: string | null;
  leftLink: string | null;
  isActive: boolean;
};

// ── TikTok-style Video Player with Auto-Cycling ──────────────────────────────
function TikTokPlayer({ videos }: { videos: VideoItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const currentVideo = videos[currentIndex] || null;

  // Auto-advance to next video when current one ends
  const handleVideoEnded = () => {
    if (videos.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
      setProgress(0);
    } else {
      const v = videoRef.current;
      if (v) { v.currentTime = 0; v.play(); }
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !currentVideo) return;
    v.muted = true;
    v.currentTime = 0;
    v.play().then(() => setPlaying(true)).catch(() => {});
  }, [currentIndex, currentVideo]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
  };

  if (!currentVideo) return null;

  const src = currentVideo.url;
  const title = currentVideo.title;
  const brand = currentVideo.brand;

  // Check if src is a video or image
  const isVideo = src && (src.includes("youtube") || src.includes("youtu.be") || src.match(/\.(mp4|webm|ogg|mov)(\?|$)/i));
  const isYoutube = src && (src.includes("youtube") || src.includes("youtu.be"));

  const getYoutubeEmbed = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&modestbranding=1` : null;
  };

  return (
    <div className="relative w-full flex flex-col items-center" style={{ maxHeight: "520px" }}>
      {/* Phone frame */}
      <div
        className="relative overflow-hidden rounded-[28px] bg-black w-full"
        style={{
          aspectRatio: "9/16",
          maxHeight: "510px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35), 0 0 0 2px rgba(255,255,255,0.08)",
        }}
        onClick={togglePlay}
      >
        {/* Video / Image content */}
        {isYoutube ? (
          <iframe
            src={getYoutubeEmbed(src) || ""}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ border: "none", pointerEvents: "none" }}
          />
        ) : isVideo ? (
          <video
            ref={videoRef}
            src={src}
            playsInline
            muted={muted}
            onTimeUpdate={onTimeUpdate}
            onEnded={handleVideoEnded}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <img
            src={src}
            alt={title || "Featured"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center">
              <span className="text-[8px] font-bold text-black">R</span>
            </div>
            <span className="text-white text-[11px] font-semibold font-sans">rosewoodpharmacy</span>
          </div>
        </div>

        {/* Right side TikTok actions */}
        <div className="absolute right-3 bottom-20 flex flex-col items-center gap-5 z-10">
          {/* Shop */}
          <button className="flex flex-col items-center gap-1" style={{ pointerEvents: "auto" }}>
            <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <span className="text-[#D4AF37] text-[10px] font-sans font-bold">Shop</span>
          </button>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-10 left-4 right-16 z-10 pointer-events-none">
          {brand && <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-sans font-bold mb-1">{brand}</p>}
          {title && <p className="text-white text-sm font-sans font-semibold leading-snug line-clamp-2">{title}</p>}
        </div>

        {/* Progress bar */}
        {isVideo && !isYoutube && (
          <div
            className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 cursor-pointer z-10"
            onClick={seek}
            style={{ pointerEvents: "auto" }}
          >
            <div className="h-full bg-[#D4AF37] transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Play/Pause indicator */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
          </div>
        )}

        {/* Mute button */}
        {!isYoutube && (
          <button
            onClick={toggleMute}
            className="absolute top-14 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center z-10"
            style={{ pointerEvents: "auto" }}
          >
            {muted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function FeaturedDuoDynamic() {
  const [data, setData] = useState<FeaturedDuoData | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const shopNowRef = useRef<HTMLAnchorElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/ui/featured-duo").then(r => r.json()),
      fetch("/api/ui/featured-duo/videos").then(r => r.json()),
    ])
      .then(([duoJson, videosJson]) => {
        if (duoJson.success && duoJson.data && duoJson.data.isActive) setData(duoJson.data);
        if (videosJson.success && Array.isArray(videosJson.data)) setVideos(videosJson.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // GSAP underline
  useEffect(() => {
    if (!shopNowRef.current || !underlineRef.current) return;
    const link = shopNowRef.current;
    const underline = underlineRef.current;
    const enter = () => gsap.to(underline, { scaleX: 1, duration: 0.6, ease: "power2.out" });
    const leave = () => gsap.to(underline, { scaleX: 0, duration: 0.4, ease: "power2.in" });
    link.addEventListener("mouseenter", enter);
    link.addEventListener("mouseleave", leave);
    return () => { link.removeEventListener("mouseenter", enter); link.removeEventListener("mouseleave", leave); };
  }, [data]);

  // GSAP heading letters
  useEffect(() => {
    if (!headingRef.current || !data?.heading) return;
    const heading = headingRef.current;
    heading.innerHTML = data.heading.split("").map(c =>
      c === " " ? '<span style="display:inline-block;width:0.3em;"></span>'
               : `<span style="display:inline-block;opacity:0;">${c}</span>`
    ).join("");
    gsap.fromTo(heading.querySelectorAll("span"),
      { opacity: 0, rotationX: -90, y: 20 },
      { opacity: 1, rotationX: 0, y: 0, duration: 0.8, stagger: 0.03, ease: "back.out(1.2)", delay: 0.3 }
    );
  }, [data]);

  if (loading || !data || !data.isActive) return null;
  if (!data.leftImage && videos.length === 0) return null;

  return (
    <section className="py-6 bg-white">
      <div className="w-full px-6 md:px-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            {data.eyebrow && (
              <p className="text-[11px] tracking-[0.25em] uppercase font-sans text-black/50 mb-2">{data.eyebrow}</p>
            )}
            {data.heading && (
              <h2
                ref={headingRef}
                className="text-3xl md:text-4xl text-[#1A1A1A]"
                style={{ fontFamily: "var(--font-cinzel), 'Cinzel', serif", fontWeight: 700, letterSpacing: "-0.01em", perspective: "1000px" }}
              >
                {data.heading}
              </h2>
            )}
          </div>
          {data.shopNowUrl && (
            <Link ref={shopNowRef} href={data.shopNowUrl}
              className="flex-shrink-0 relative text-[11px] tracking-[0.18em] uppercase font-sans text-[#1A1A1A] ml-8 pb-1">
              Shop Now
              <span ref={underlineRef} className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37] origin-left" style={{ transform: "scaleX(0)" }} />
            </Link>
          )}
        </motion.div>

        {/* ── Grid: large left photo + narrow right video ── */}
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "1.8fr 0.7fr", height: "520px", alignItems: "stretch" }}
        >
          {/* Left — tall portrait photo */}
          {data.leftImage && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="h-full"
            >
              <Link href={data.leftLink || "/pharmacy"} className="group relative block overflow-hidden rounded-sm h-full">
                <Image
                  src={data.leftImage}
                  alt={data.leftTitle || "Featured"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized={data.leftImage.startsWith("/uploads/")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 pb-10 px-10">
                  {data.leftBrand && (
                    <p className="text-[11px] tracking-[0.28em] uppercase font-sans mb-2 text-white">{data.leftBrand}</p>
                  )}
                  {data.leftTitle && (
                    <h3 className="text-3xl md:text-4xl text-white leading-tight"
                      style={{ fontFamily: "var(--font-cinzel), 'Cinzel', serif", fontWeight: 700 }}>
                      {data.leftTitle}
                    </h3>
                  )}
                </div>
              </Link>
            </motion.div>
          )}

          {/* Right — TikTok video */}
          {videos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="h-full flex items-center justify-center"
            >
              <TikTokPlayer
                videos={videos}
              />
            </motion.div>
          )}
        </div>

      </div>
    </section>
  );
}
