"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const messages = [
  {
    text: "Seasonal reductions: shop up to 60% off.",
    cta: "Shop now",
    link: "/pharmacy",
  },
  {
    text: "Free next-day UK delivery on orders over £50.",
    cta: "Shop now",
    link: "/pharmacy",
  },
  {
    text: "New arrivals: premium skincare collections just landed.",
    cta: "Explore",
    link: "/pharmacy",
  },
  {
    text: "Earn loyalty points on every purchase.",
    cta: "Learn more",
    link: "/pharmacy",
  },
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [visible]);

  if (!visible) return null;

  const msg = messages[index];

  return (
    <div
      className="fixed left-0 right-0 z-40 flex items-center justify-center overflow-hidden"
      style={{
        top: "94px",
        backgroundColor: "#1A1A1A",
        height: "38px",
      }}
    >
      {/* Animated text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex items-center gap-2 text-[11px] font-sans tracking-[0.12em]"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          <span>{msg.text}</span>
          <Link
            href={msg.link}
            className="font-bold underline underline-offset-2 transition-colors duration-200"
            style={{ color: "#D4AF37" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={e => (e.currentTarget.style.color = "#D4AF37")}
          >
            {msg.cta}
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="absolute right-10 flex items-center gap-1.5">
        {messages.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === index ? "#D4AF37" : "rgba(255,255,255,0.3)",
              transform: i === index ? "scale(1.3)" : "scale(1)",
            }}
            aria-label={`Message ${i + 1}`}
          />
        ))}
      </div>

      {/* Close */}
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 text-white/50 hover:text-white transition-colors"
        aria-label="Close announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
