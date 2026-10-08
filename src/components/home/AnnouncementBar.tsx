"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Message = {
  id: string;
  text: string;
  cta: string | null;
  link: string | null;
};

type Props = {
  onVisibilityChange?: (visible: boolean) => void;
};

export default function AnnouncementBar({ onVisibilityChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [index,    setIndex]    = useState(0);
  const [visible,  setVisible]  = useState(false); // start false — show only when data loads

  // Fetch active messages from API
  useEffect(() => {
    fetch("/api/ui/announcement")
      .then(r => r.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setMessages(json.data);
          setVisible(true);
          onVisibilityChange?.(true);
        } else {
          onVisibilityChange?.(false);
        }
      })
      .catch(() => { onVisibilityChange?.(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-cycle
  useEffect(() => {
    if (!visible || messages.length === 0) return;
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [visible, messages.length]);

  const handleClose = () => {
    setVisible(false);
    onVisibilityChange?.(false);
  };

  if (!visible || messages.length === 0) return null;

  const msg = messages[index];

  return (
    <div
      className="fixed left-0 right-0 z-40 flex items-center justify-center overflow-hidden"
      style={{
        top: "64px",
        backgroundColor: "#ffffff",
        height: "38px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {/* Animated text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={msg.id + index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex items-center gap-2 text-[11px] font-sans tracking-[0.12em]"
          style={{ color: "rgba(0,0,0,0.75)" }}
        >
          <span>{msg.text}</span>
          {msg.cta && msg.link && (
            <Link
              href={msg.link}
              className="font-bold underline underline-offset-2 transition-colors duration-200"
              style={{ color: "#D4AF37" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#b8952e")}
              onMouseLeave={e => (e.currentTarget.style.color = "#D4AF37")}
            >
              {msg.cta}
            </Link>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      {messages.length > 1 && (
        <div className="absolute right-10 flex items-center gap-1.5">
          {messages.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i === index ? "#D4AF37" : "rgba(0,0,0,0.2)",
                transform: i === index ? "scale(1.3)" : "scale(1)",
              }}
              aria-label={`Message ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Close */}
      <button
        onClick={handleClose}
        className="absolute right-4 text-black/40 hover:text-black transition-colors"
        aria-label="Close announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
