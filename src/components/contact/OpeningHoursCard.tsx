"use client";

import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { useEffect, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: "easeOut" },
  }),
};

// Fixed order: index matches JS getDay() — 0=Sun, 1=Mon ... 6=Sat
const ALL_DAYS = [
  { day: "Sunday",    dayIndex: 0 },
  { day: "Monday",    dayIndex: 1 },
  { day: "Tuesday",   dayIndex: 2 },
  { day: "Wednesday", dayIndex: 3 },
  { day: "Thursday",  dayIndex: 4 },
  { day: "Friday",    dayIndex: 5 },
  { day: "Saturday",  dayIndex: 6 },
];

const DEFAULT_HOURS = "10:00 am – 06:00 pm";

export default function OpeningHoursCard() {
  const today = new Date().getDay(); // 0=Sun … 6=Sat

  const [phone, setPhone] = useState("+44 (0)20 7935 5555");
  const [loading, setLoading] = useState(true);

  // Build schedule with uniform hours per day
  const schedule = ALL_DAYS.map(d => ({ ...d, hours: DEFAULT_HOURS }));

  useEffect(() => {
    fetch("/api/ui/contact-info")
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.phone) {
          setPhone(json.data.phone);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Today always first, then wrap around
  // e.g. today=0(Sun): [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
  // e.g. today=5(Fri): [Fri, Sat, Sun, Mon, Tue, Wed, Thu]
  const sorted = [
    ...schedule.filter(s => s.dayIndex === today),
    ...schedule.filter(s => s.dayIndex > today),
    ...schedule.filter(s => s.dayIndex < today),
  ];

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={0.1}
      className="bg-white border border-[#E5E5E5] rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase font-sans font-semibold text-[#D4AF37]">
            We&apos;re open
          </p>
          <h3 className="text-lg font-heading text-[#1A1A1A] font-semibold">
            Opening Hours
          </h3>
        </div>
      </div>

      {/* Schedule */}
      <div className="space-y-0">
        {sorted.map((item, idx) => {
          const isToday = item.dayIndex === today;
          return (
            <div
              key={item.day}
              className={`flex items-center justify-between py-3 ${
                idx < sorted.length - 1 ? "border-b border-gray-100" : ""
              } ${isToday ? "rounded-md px-3 -mx-3" : "rounded-md px-2 -mx-2 hover:bg-gray-50"}`}
              style={isToday ? { background: "rgba(212,175,55,0.08)" } : {}}
            >
              <div className="flex items-center gap-2">
                {isToday && <span className="w-2 h-2 rounded-full bg-[#D4AF37] flex-shrink-0" />}
                <span className={`text-sm font-sans ${isToday ? "font-bold text-[#1A1A1A]" : "font-medium text-gray-700"}`}>
                  {isToday ? <span className="text-[#D4AF37] font-bold">Today</span> : item.day}
                </span>
              </div>
              <span className={`text-sm font-sans ${isToday ? "font-bold text-[#D4AF37]" : "text-gray-600"}`}>
                {item.hours}
              </span>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-gray-200" />

      {/* Get in Touch */}
      <div className="flex items-start gap-3 py-2 bg-[#D4AF37]/5 rounded-xl px-3">
        <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center flex-shrink-0">
          <Phone className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] tracking-[0.2em] uppercase font-sans font-semibold text-[#D4AF37] mb-1">
            Get in Touch
          </p>
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="text-base font-heading font-semibold text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
          >
            {loading ? "Loading..." : phone}
          </a>
          <p className="text-xs text-gray-500 font-sans mt-1">
            Hours may vary on public holidays.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
