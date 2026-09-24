"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type ContactInfo = {
  latitude: number | null;
  longitude: number | null;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: "easeOut" },
  }),
};

const hours = [
  { day: "Monday",    open: "09:00 am", close: "06:00 pm" },
  { day: "Tuesday",   open: "09:00 am", close: "06:00 pm" },
  { day: "Wednesday", open: "09:00 am", close: "06:00 pm" },
  { day: "Thursday",  open: "09:00 am", close: "06:00 pm" },
  { day: "Friday",    open: "09:00 am", close: "06:00 pm" },
  { day: "Saturday",  open: "09:00 am", close: "05:00 pm" },
  { day: "Sunday",    open: "10:00 am", close: "04:00 pm" },
];

const today = new Date().toLocaleDateString("en-GB", { weekday: "long" });

export default function ContactMapDynamic() {
  const [data, setData] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ui/contact-info")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) setData(json.data);
      })
      .catch((err) => console.error("Failed to load map coordinates:", err))
      .finally(() => setLoading(false));
  }, []);

  const lat = data?.latitude || 40.7165;
  const lon = data?.longitude || -74.0005;
  const offset = 0.005;
  const bbox = `${lon - offset}%2C${lat - offset}%2C${lon + offset}%2C${lat + offset}`;

  return (
    <section className="py-16 bg-white">
      <div className="w-full px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-stretch">

          {/* ── Opening Hours ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="bg-white border border-[#E5E5E5] rounded-2xl p-8 md:p-10 lg:col-span-2"
          >
            {/* Header */}
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#D4AF37] font-semibold mb-1">
                We're open
              </p>
              <h2 className="font-heading text-2xl text-[#1A1A1A]">
                Opening Hours
              </h2>
            </div>

            {/* Hours table */}
            <div className="space-y-0">
              {hours.map((row, i) => {
                const isToday = row.day === today;
                return (
                  <div
                    key={row.day}
                    className={`flex items-center justify-between py-3.5 ${
                      i < hours.length - 1 ? "border-b border-gray-100" : ""
                    } ${isToday ? "bg-[#FFFBF0] -mx-4 px-4 rounded-lg" : ""}`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isToday && (
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm font-sans ${
                          isToday ? "font-bold text-[#1A1A1A]" : "font-medium text-gray-700"
                        }`}
                      >
                        {row.day}
                        {isToday && (
                          <span className="ml-2 text-[10px] font-sans font-bold uppercase tracking-widest text-[#D4AF37]">
                            Today
                          </span>
                        )}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-sans ${
                        isToday ? "font-bold text-[#D4AF37]" : "text-gray-500"
                      }`}
                    >
                      {row.open} – {row.close}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Note */}
            <p className="mt-6 text-xs font-sans text-gray-400 border-t border-gray-100 pt-4">
              Hours may vary on public holidays. Call us at{" "}
              <span className="text-[#1A1A1A] font-semibold">+44 (0)20 7935 5555</span>{" "}
              for the most up-to-date information.
            </p>
          </motion.div>

          {/* ── Map ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0.15}
            className="overflow-hidden rounded-2xl border border-[#E5E5E5] lg:col-span-3 min-h-[600px]"
          >
            {loading ? (
              <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-gray-50">
                <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <iframe
                title="Store location"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "600px", display: "block" }}
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
