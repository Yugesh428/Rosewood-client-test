"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type ContactInfo = {
  address: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
};

const todayIndex = new Date().getDay();

const ALL_HOURS = [
  { day: "Sunday",    dayIndex: 0, time: "10:00 AM — 06:00 PM" },
  { day: "Monday",    dayIndex: 1, time: "10:00 AM — 06:00 PM" },
  { day: "Tuesday",   dayIndex: 2, time: "10:00 AM — 06:00 PM" },
  { day: "Wednesday", dayIndex: 3, time: "10:00 AM — 06:00 PM" },
  { day: "Thursday",  dayIndex: 4, time: "10:00 AM — 06:00 PM" },
  { day: "Friday",    dayIndex: 5, time: "10:00 AM — 06:00 PM" },
  { day: "Saturday",  dayIndex: 6, time: "10:00 AM — 06:00 PM" },
];

const sortedHours = [
  ...ALL_HOURS.filter(h => h.dayIndex === todayIndex),
  ...ALL_HOURS.filter(h => h.dayIndex > todayIndex),
  ...ALL_HOURS.filter(h => h.dayIndex < todayIndex),
];

// Google Maps styled embed — muted POIs, clean aesthetic
function buildMapSrc(lat: number, lon: number) {
  // Use Google Maps embed with zoom 16 for neighborhood-level view
  return `https://maps.google.com/maps?q=${lat},${lon}&z=16&output=embed&hl=en&iwloc=near`;
}

export default function ContactMapDynamic() {
  const [info, setInfo] = useState<ContactInfo | null>(null);

  useEffect(() => {
    fetch("/api/ui/contact-info")
      .then(r => r.json())
      .then(j => { if (j.success && j.data) setInfo(j.data); })
      .catch(() => {});
  }, []);

  const lat     = info?.latitude  ?? 51.5156;
  const lon     = info?.longitude ?? -0.1419;
  const phone   = info?.phone   ?? "+44 (0)20 7935 5555";
  const address = info?.address ?? "London, UK";
  const addressLines = address.split("\n").filter(l => l.trim());
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
  const mapSrc  = buildMapSrc(lat, lon);

  return (
    <section style={{ backgroundColor: "#ffffff", padding: "60px 0 100px" }}>
      <div style={{ width: "100%", padding: "0 32px" }}>

        {/* ── Main two-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "48px" }}
          className="contact-map-grid"
        >
          <style>{`
            @media (min-width: 1024px) {
              .contact-map-grid {
                grid-template-columns: minmax(260px, 0.30fr) minmax(0, 0.70fr) !important;
                gap: 24px !important;
                align-items: start !important;
              }
            }
            @media (min-width: 768px) and (max-width: 1023px) {
              .contact-map-grid {
                grid-template-columns: 0.35fr 0.65fr !important;
                gap: 24px !important;
                align-items: start !important;
              }
            }
            .hours-row:last-child {
              border-bottom: none !important;
            }
          `}</style>

          {/* ── LEFT: Editorial content panel ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Eyebrow + Heading — inside left column */}
            <p style={{
              fontSize: "10px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              fontFamily: "var(--font-sans), sans-serif",
              fontWeight: 600,
              color: "#D4AF37",
              marginBottom: "10px",
            }}>
              Visit Us
            </p>
            <h2 style={{
              fontFamily: "var(--font-heading), Georgia, serif",
              fontSize: "clamp(24px, 3vw, 34px)",
              fontWeight: 400,
              color: "#1A1A1A",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              marginBottom: "36px",
            }}>
              Find Us &amp; Our Hours
            </h2>
            <p style={{
              fontSize: "10px",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              fontFamily: "var(--font-sans), sans-serif",
              fontWeight: 600,
              color: "#9CA3AF",
              marginBottom: "20px",
            }}>
              Opening Hours
            </p>

            {/* Hours rows — no box, just clean rows */}
            <div style={{ maxWidth: "280px" }}>
              {sortedHours.map((row) => {
                const isToday = row.dayIndex === todayIndex;
                return (
                  <div
                    key={row.day}
                    className="hours-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "11px 0",
                      borderBottom: "1px solid #F3F0EB",
                    }}
                  >
                    {/* Day label */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {isToday && (
                        <span style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "#D4AF37",
                          flexShrink: 0,
                          display: "inline-block",
                        }} />
                      )}
                      <span style={{
                        fontFamily: "var(--font-sans), sans-serif",
                        fontSize: "14px",
                        fontWeight: isToday ? 600 : 400,
                        color: isToday ? "#1A1A1A" : "#6B7280",
                        letterSpacing: isToday ? "0" : "0.01em",
                      }}>
                        {isToday ? "Today" : row.day}
                      </span>
                      {isToday && (
                        <span style={{
                          fontSize: "9px",
                          fontFamily: "var(--font-sans), sans-serif",
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "#D4AF37",
                          backgroundColor: "rgba(212,175,55,0.08)",
                          padding: "2px 6px",
                          borderRadius: "3px",
                        }}>
                          Open
                        </span>
                      )}
                    </div>

                    {/* Time */}
                    <span style={{
                      fontFamily: "var(--font-sans), sans-serif",
                      fontSize: "14px",
                      fontWeight: isToday ? 500 : 400,
                      color: isToday ? "#1A1A1A" : "#9CA3AF",
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {row.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Contact area — no card, just content */}
            <div style={{ marginTop: "40px" }}>
              <p style={{
                fontSize: "10px",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                fontFamily: "var(--font-sans), sans-serif",
                fontWeight: 600,
                color: "#9CA3AF",
                marginBottom: "16px",
              }}>
                Get in Touch
              </p>

              {/* Phone */}
              <a
                href={`tel:${phone.replace(/[\s()]/g, "")}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textDecoration: "none",
                  marginBottom: "16px",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "17px",
                  fontWeight: 600,
                  color: "#1A1A1A",
                  letterSpacing: "-0.01em",
                }}>
                  {phone}
                </span>
              </a>

              {/* Address */}
              <div style={{ marginBottom: "20px" }}>
                {addressLines.map((line, i) => (
                  <p key={i} style={{
                    fontFamily: "var(--font-sans), sans-serif",
                    fontSize: "14px",
                    color: "#6B7280",
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {line}
                  </p>
                ))}
              </div>

              {/* Get Directions — refined text link */}
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="get-directions-link"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#1A1A1A",
                  textDecoration: "none",
                  borderBottom: "1px solid #1A1A1A",
                  paddingBottom: "2px",
                  transition: "color 0.2s, border-color 0.2s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = "#D4AF37";
                  el.style.borderColor = "#D4AF37";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = "#1A1A1A";
                  el.style.borderColor = "#1A1A1A";
                }}
              >
                Get Directions
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>

              {/* Holiday note */}
              <p style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "11px",
                color: "#C0B8B0",
                marginTop: "12px",
                letterSpacing: "0.01em",
              }}>
                Hours may vary on public holidays
              </p>
            </div>
          </motion.div>

          {/* ── RIGHT: Map ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ position: "relative" }}
          >
            {/* Map wrapper */}
            <div style={{
              width: "100%",
              height: "520px",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 2px 20px rgba(0,0,0,0.07)",
              border: "1px solid #EDE9E3",
              position: "relative",
            }}>
              <iframe
                title="Rosewood Pharmacy Location"
                src={mapSrc}
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  display: "block",
                  width: "100%",
                  height: "100%",
                  // Mute the map colours slightly
                  filter: "saturate(0.75) brightness(1.02)",
                }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Minimal location label — bottom left of map */}
            <div style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              backgroundColor: "rgba(255,255,255,0.96)",
              borderRadius: "12px",
              padding: "10px 14px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              maxWidth: "240px",
              backdropFilter: "blur(8px)",
            }}>
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: "#D4AF37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#1A1A1A",
                  lineHeight: 1.3,
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  Rosewood Pharmacy
                </p>
                <p style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "10px",
                  color: "#9CA3AF",
                  lineHeight: 1.3,
                  margin: "2px 0 0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {addressLines[0] ?? "London, UK"}
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
