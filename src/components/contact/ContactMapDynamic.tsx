"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type ContactInfo = { latitude: number | null; longitude: number | null };

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: "easeOut" } }),
};

const today = new Date().toLocaleDateString("en-GB", { weekday: "long" });

const hours = [
  { day: "Friday",    open: "10:00 am", close: "06:00 pm" },
  { day: "Saturday",  open: "10:00 am", close: "06:00 pm" },
  { day: "Sunday",    open: "10:00 am", close: "06:00 pm" },
  { day: "Monday",    open: "10:00 am", close: "06:00 pm" },
  { day: "Tuesday",   open: "10:00 am", close: "06:00 pm" },
  { day: "Wednesday", open: "10:00 am", close: "06:00 pm" },
  { day: "Thursday",  open: "10:00 am", close: "06:00 pm" },
];

export default function ContactMapDynamic() {
  const [data, setData]     = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ui/contact-info")
      .then(r => r.json())
      .then(j => { if (j.success && j.data) setData(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const lat  = data?.latitude  || 40.7165;
  const lon  = data?.longitude || -74.0005;
  const off  = 0.005;
  const bbox = `${lon-off}%2C${lat-off}%2C${lon+off}%2C${lat+off}`;

  return (
    <section className="pb-10 bg-white">
      <div className="w-full px-6 md:px-10">
        <div className="flex flex-col lg:flex-row gap-5 items-stretch">

          {/* ── Opening Hours Card ── */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
            className="bg-white border border-gray-200 rounded-2xl flex flex-col flex-shrink-0"
            style={{ padding: "14px 16px", width: "300px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-2 mb-2 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FFFBF0" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] font-sans leading-none mb-0.5" style={{ color: "#D4AF37" }}>We're open</p>
                <h2 className="text-[13px] font-bold font-heading text-[#1A1A1A] leading-none">Opening Hours</h2>
              </div>
            </div>

            {/* Rows — each ~32px tall */}
            <div>
              {hours.map((row, i) => {
                const isToday = row.day === today;
                return (
                  <div
                    key={row.day}
                    className={`flex items-center gap-3 ${i < hours.length - 1 ? "border-b border-gray-50" : ""} ${isToday ? "rounded-md -mx-1 px-1" : ""}`}
                    style={{ height: "30px", backgroundColor: isToday ? "#FFFBF0" : "transparent" }}
                  >
                    {isToday && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#D4AF37" }} />}
                    <span className={`text-[11px] font-sans w-20 flex-shrink-0 ${isToday ? "font-bold text-[#1A1A1A]" : "font-medium text-gray-600"}`}>
                      {isToday ? "Today" : row.day}
                    </span>
                    <span className={`text-[11px] font-sans ${isToday ? "font-bold" : "text-gray-500"}`} style={isToday ? { color: "#D4AF37" } : {}}>
                      {row.open} – {row.close}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Get in touch */}
            <div className="mt-2.5 pt-2.5 border-t border-gray-100">
              <div className="flex items-center gap-2.5 rounded-xl" style={{ backgroundColor: "#FFFBF0", padding: "10px 12px" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#D4AF37" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.64 5a2 2 0 0 1 1.99-2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.15em] font-sans leading-none mb-0.5" style={{ color: "#D4AF37" }}>Get in touch</p>
                  <p className="text-[13px] font-bold font-sans text-[#1A1A1A] leading-none">+44 (0)20 7935 5555</p>
                  <p className="text-[9px] font-sans text-gray-400 mt-0.5 leading-none">Hours may vary on public holidays.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Map ── */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.15}
            className="overflow-hidden rounded-2xl border border-gray-200 flex-1"
            style={{ minHeight: "380px" }}
          >
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-50" style={{ minHeight: "380px" }}>
                <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <iframe
                title="Store location"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "380px", height: "100%", display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
