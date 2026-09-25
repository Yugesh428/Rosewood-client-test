"use client";

import { motion } from "framer-motion";
import { Phone } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: "easeOut" },
  }),
};

export default function OpeningHoursCard() {
  const today = new Date().getDay(); // 0=Sunday, 1=Monday, ..., 5=Friday, 6=Saturday
  
  const schedule = [
    { day: "Monday", hours: "10:00 am – 06:00 pm", dayIndex: 1 },
    { day: "Tuesday", hours: "10:00 am – 06:00 pm", dayIndex: 2 },
    { day: "Wednesday", hours: "10:00 am – 06:00 pm", dayIndex: 3 },
    { day: "Thursday", hours: "10:00 am – 06:00 pm", dayIndex: 4 },
    { day: "Friday", hours: "10:00 am – 06:00 pm", dayIndex: 5 },
    { day: "Saturday", hours: "10:00 am – 06:00 pm", dayIndex: 6 },
    { day: "Sunday", hours: "10:00 am – 06:00 pm", dayIndex: 0 },
  ];

  // Sort so today comes first
  const sortedSchedule = [
    ...schedule.filter(s => s.dayIndex === today),
    ...schedule.filter(s => s.dayIndex !== today),
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
      <div className="mb-4 pb-3 border-b border-gray-200">
        <p className="text-[10px] tracking-[0.25em] uppercase font-sans font-semibold text-gray-500 mb-1">
          We're open
        </p>
        <h3 className="text-lg font-heading text-[#1A1A1A] font-semibold">
          Opening Hours
        </h3>
      </div>

      {/* Schedule */}
      <div className="space-y-0">
        {sortedSchedule.map((item, idx) => {
          const isToday = item.dayIndex === today;
          return (
            <div
              key={item.day}
              className={`flex items-center justify-between py-3 transition-all duration-200 ${
                idx < sortedSchedule.length - 1 ? "border-b border-gray-100" : ""
              } ${
                isToday
                  ? "bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent rounded-md px-3 -mx-3 border-l-2 border-[#D4AF37]"
                  : "hover:bg-gray-50 rounded-md px-2 -mx-2"
              }`}
            >
              <div className="flex items-center gap-2">
                {isToday && (
                  <span className="text-[9px] font-sans font-bold tracking-widest uppercase bg-[#D4AF37] text-white px-2 py-0.5 rounded-sm">
                    Today
                  </span>
                )}
                <span
                  className={`text-sm font-sans ${
                    isToday ? "font-bold text-[#1A1A1A]" : "font-medium text-gray-700"
                  }`}
                >
                  {item.day}
                </span>
              </div>
              <span
                className={`text-sm font-sans ${
                  isToday ? "font-bold text-[#D4AF37]" : "text-gray-600"
                }`}
              >
                {item.hours}
              </span>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-gray-200" />

      {/* Get in Touch */}
      <div className="flex items-start gap-3 py-2">
        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
          <Phone className="w-5 h-5 text-[#D4AF37]" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] tracking-[0.2em] uppercase font-sans font-semibold text-gray-500 mb-1">
            Get in Touch
          </p>
          <a
            href="tel:+442079355555"
            className="text-base font-heading font-semibold text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
          >
            +44 (0)20 7935 5555
          </a>
          <p className="text-xs text-gray-500 font-sans mt-1">
            Public holidays may vary
          </p>
        </div>
      </div>
    </motion.div>
  );
}
