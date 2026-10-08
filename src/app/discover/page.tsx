"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";
import { useTheme } from "@/context/ThemeContext";

type DiscoverData = {
  eyebrow: string | null;
  heading: string | null;
  description: string | null;
  mainImage: string | null;
  videoUrl: string | null;
  expandTitle: string | null;
  expandDescription: string | null;
  expandBtn1Text: string | null;
  expandBtn1Link: string | null;
  expandBtn2Text: string | null;
  expandBtn2Link: string | null;
  expandImage: string | null;
  expandImageLabel: string | null;
  diveInto: string | null;
  diveHeading: string | null;
  diveDescription: string | null;
  videoImage: string | null;
  videoLabel: string | null;
  videoTitle: string | null;
  isActive: boolean;
};

function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  );
}

function isExternal(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let videoId = u.searchParams.get("v");
      if (!videoId && u.hostname.includes("youtu.be")) videoId = u.pathname.slice(1);
      if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&rel=0`;
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const videoId = u.pathname.split("/").pop();
      if (videoId) return `https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1&muted=1`;
    }
  } catch {}
  return null;
}

export default function DiscoverPage() {
  const [data, setData] = useState<DiscoverData | null>(null);
  const [loading, setLoading] = useState(true);
  const { homeBg } = useTheme();
  
  const bg =
    homeBg === "white" ? "#ffffff" :
    homeBg === "soft-blue" ? "#f0f8ff" :
    homeBg === "near-blue" ? "#cce8f7" :
    homeBg === "creamy-blue" ? "#e8f4f8" :
    "#dff0fb";

  useEffect(() => {
    fetch("/api/ui/discover")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) setData(json.data);
      })
      .catch((err) => console.error("Failed to load discover:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Content not available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: bg, margin: 0, padding: 0 }}>
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">

          {/* ══ HERO SPLIT LAYOUT ════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20"
          >
            {/* Left — Text Content */}
            <div className="max-w-lg">
              {data.expandTitle && (
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] mb-8 leading-tight">
                  {data.expandTitle}
                </h1>
              )}
              {data.expandDescription && (
                <p className="text-base md:text-lg leading-relaxed mb-10" style={{ color: "#1A1A1A", fontFamily: "'Times New Roman', Times, serif" }}>
                  {data.expandDescription}
                </p>
              )}

              {/* Action Buttons */}
              {(data.expandBtn1Text || data.expandBtn2Text) && (
                <div className="flex flex-wrap gap-4">
                  {data.expandBtn1Text && data.expandBtn1Link && (
                    <Link
                      href={data.expandBtn1Link}
                      target={isExternal(data.expandBtn1Link) ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="px-8 py-3 text-xs tracking-[0.2em] uppercase font-sans font-bold bg-[#1A1A1A] text-white rounded-sm hover:bg-[#333] transition-colors"
                    >
                      {data.expandBtn1Text}
                    </Link>
                  )}
                  {data.expandBtn2Text && data.expandBtn2Link && (
                    <Link
                      href={data.expandBtn2Link}
                      target={isExternal(data.expandBtn2Link) ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="px-8 py-3 text-xs tracking-[0.2em] uppercase font-sans font-bold border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-sm hover:bg-[#1A1A1A] hover:text-white transition-colors"
                    >
                      {data.expandBtn2Text}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Right — Video embedded (autoplay) */}
            {data.videoUrl && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative rounded-lg overflow-hidden h-[400px] md:h-[500px]"
              >
                {getEmbedUrl(data.videoUrl) ? (
                  <iframe
                    src={getEmbedUrl(data.videoUrl)!}
                    title={data.expandImageLabel || "Video"}
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                    style={{ border: "none" }}
                  />
                ) : (
                  <video
                    src={data.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {/* Label overlay at bottom */}
                {data.expandImageLabel && (
                  <div className="absolute bottom-4 left-4 right-4 pointer-events-none z-10">
                    <p className="font-heading text-white text-xl drop-shadow-lg">{data.expandImageLabel}</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* ══ DIVE INTO SECTION ═══════════════════════════════════════════ */}
          {(data.diveHeading || data.diveDescription) && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center max-w-4xl mx-auto mb-20 py-16"
            >
              {data.diveInto && (
                <p className="text-[10px] tracking-[0.35em] uppercase font-sans text-black/40 mb-5">
                  {data.diveInto}
                </p>
              )}
              {data.diveHeading && (
                <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-[#1A1A1A] mb-8 leading-tight">
                  {data.diveHeading}
                </h2>
              )}
              {data.diveDescription && (
                <div className="space-y-6 text-base md:text-lg leading-relaxed" style={{ color: "#1A1A1A", fontFamily: "'Times New Roman', Times, serif" }}>
                  {data.diveDescription.split('\n\n').map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ══ VIDEO SECTION (FULL WIDTH WITH FRAME) ══════════════════════ */}
          {(data.videoImage || data.videoUrl) && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative rounded-lg overflow-hidden h-[500px] md:h-[700px]"
            >
              {/* Autoplay embed (YouTube/Vimeo) */}
              {data.videoUrl && getEmbedUrl(data.videoUrl) ? (
                <div className="relative w-full h-full">
                  <iframe
                    src={getEmbedUrl(data.videoUrl)!}
                    title={data.videoTitle || "Video"}
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                    style={{ border: "none" }}
                  />
                  {/* White frame border */}
                  <div className="absolute inset-8 md:inset-12 border-4 border-white pointer-events-none z-10" />
                  {/* Bottom left branding */}
                  <div className="absolute bottom-8 md:bottom-12 left-8 md:left-12 z-20 pointer-events-none">
                    <p className="font-heading text-white text-lg md:text-xl drop-shadow-lg">
                      The<br />
                      <span className="text-2xl md:text-3xl">John Bell</span><br />
                      <span className="text-xl md:text-2xl" style={{ color: "#D4AF37" }}>& Croyden</span>
                    </p>
                    <p className="text-[8px] tracking-widest uppercase font-sans text-white/70 mt-1">PODCAST</p>
                  </div>
                </div>
              ) : data.videoUrl ? (
                /* Direct video file - autoplay */
                <div className="relative w-full h-full">
                  <video
                    src={data.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-8 md:inset-12 border-4 border-white pointer-events-none z-10" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-20 pointer-events-none">
                    {data.videoLabel && (
                      <p className="text-xs md:text-sm tracking-[0.3em] uppercase font-sans text-white mb-4">{data.videoLabel}</p>
                    )}
                    {data.videoTitle && (
                      <h3 className="font-heading text-5xl md:text-7xl lg:text-8xl text-white leading-tight">{data.videoTitle}</h3>
                    )}
                  </div>
                </div>
              ) : (
                /* Fallback — image thumbnail */
                <>
                  <Img src={data.videoImage!} alt={data.videoTitle || "Video"} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />
                  <div className="absolute inset-8 md:inset-12 border-4 border-white pointer-events-none" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                    {data.videoLabel && (
                      <p className="text-xs md:text-sm tracking-[0.3em] uppercase font-sans text-white mb-4">{data.videoLabel}</p>
                    )}
                    {data.videoTitle && (
                      <h3 className="font-heading text-5xl md:text-7xl lg:text-8xl text-white leading-tight">{data.videoTitle}</h3>
                    )}
                  </div>
                  <div className="absolute bottom-8 md:bottom-12 left-8 md:left-12">
                    <p className="font-heading text-white text-lg md:text-xl">
                      The<br />
                      <span className="text-2xl md:text-3xl">John Bell</span><br />
                      <span className="text-xl md:text-2xl" style={{ color: "#D4AF37" }}>& Croyden</span>
                    </p>
                    <p className="text-[8px] tracking-widest uppercase font-sans text-white/70 mt-1">PODCAST</p>
                  </div>
                </>
              )}
            </motion.div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
