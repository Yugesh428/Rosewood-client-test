"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";

// ─── Contact info items ───────────────────────────────────────────────────────
const contactInfo = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: "Address",
    lines: ["123 Apothecary Lane", "Suite 100", "New York, NY 10001"],
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    label: "Phone",
    lines: ["+1 (212) 555-0199"],
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    label: "Email",
    lines: ["concierge@luxeapothecary.com"],
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    label: "Opening Hours",
    lines: [
      "Monday – Friday: 9:00 AM – 7:00 PM",
      "Saturday: 10:00 AM – 5:00 PM",
      "Sunday: Closed",
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: "easeOut" },
  }),
};

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    // TODO: wire to real API endpoint
    await new Promise((r) => setTimeout(r, 1000));
    setStatus("sent");
    setForm({ fullName: "", email: "", phone: "", message: "" });
  }

  return (
    <div className="bg-[#F9F9F9]">
      <Navbar />

      <main className="min-h-screen pt-14">

        {/* ── Two-column content ─────────────────────────────────────────── */}
        <section className="py-16 bg-[#F9F9F9]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

              {/* ── Left: Contact Form ──────────────────────────────────── */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} custom={0}
                className="bg-white border border-[#E5E5E5] rounded-sm p-8 md:p-10"
              >
                <h2 className="font-heading text-2xl text-[#1A1A1A] mb-7">
                  Send a Message
                </h2>

                {status === "sent" ? (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-4">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="font-heading text-lg text-[#1A1A1A] mb-2">Message Sent</p>
                    <p className="text-xs text-[#6B6B6B] font-sans">
                      Thank you for reaching out. We will respond within 24 hours.
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="mt-6 text-xs font-sans tracking-widest uppercase text-[#D4AF37] hover:text-[#1A1A1A] transition-colors duration-200"
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Row: Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-sans text-[#1A1A1A] tracking-wide">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={form.fullName}
                          onChange={handleChange}
                          placeholder="Jane Doe"
                          required
                          className="border border-[#E5E5E5] bg-[#F9F9F9] text-sm text-[#1A1A1A] font-sans px-4 py-2.5 rounded-sm placeholder:text-[#ABABAB] focus:outline-none focus:border-[#D4AF37] transition-colors duration-200"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-sans text-[#1A1A1A] tracking-wide">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="jane@example.com"
                          required
                          className="border border-[#E5E5E5] bg-[#F9F9F9] text-sm text-[#1A1A1A] font-sans px-4 py-2.5 rounded-sm placeholder:text-[#ABABAB] focus:outline-none focus:border-[#D4AF37] transition-colors duration-200"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-sans text-[#1A1A1A] tracking-wide">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="border border-[#E5E5E5] bg-[#F9F9F9] text-sm text-[#1A1A1A] font-sans px-4 py-2.5 rounded-sm placeholder:text-[#ABABAB] focus:outline-none focus:border-[#D4AF37] transition-colors duration-200"
                      />
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-sans text-[#1A1A1A] tracking-wide">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="How can we help you today?"
                        required
                        rows={5}
                        className="border border-[#E5E5E5] bg-[#F9F9F9] text-sm text-[#1A1A1A] font-sans px-4 py-2.5 rounded-sm placeholder:text-[#ABABAB] focus:outline-none focus:border-[#D4AF37] transition-colors duration-200 resize-y"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="mt-2 w-full bg-[#1A1A1A] text-white text-xs font-sans tracking-widest uppercase py-3.5 hover:bg-[#D4AF37] hover:text-black transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === "sending" ? "Sending…" : "Send Message"}
                    </button>
                  </form>
                )}
              </motion.div>

              {/* ── Right: Contact Info ────────────────────────────────── */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} custom={0.15}
                className="flex flex-col gap-8"
              >
                <div>
                  <h2 className="font-heading text-2xl text-[#1A1A1A] mb-6">
                    Contact Information
                  </h2>

                  <div className="flex flex-col gap-6">
                    {contactInfo.map((item) => (
                      <div key={item.label} className="flex gap-4 items-start">
                        {/* Icon */}
                        <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {item.icon}
                        </div>
                        {/* Text */}
                        <div>
                          <p className="text-xs font-sans font-semibold text-[#1A1A1A] tracking-wide mb-1">
                            {item.label}
                          </p>
                          {item.lines.map((line) => (
                            <p key={line} className="text-sm text-[#6B6B6B] font-sans leading-relaxed">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── Full-width Map ─────────────────────────────────────────────── */}
        <section className="bg-[#F9F9F9] pb-16">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="visible"
              viewport={{ once: true }} custom={0}
              className="overflow-hidden rounded-sm border border-[#E5E5E5]"
            >
              <iframe
                title="Store location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-74.0060%2C40.7128%2C-73.9950%2C40.7200&layer=mapnik&marker=40.7165%2C-74.0005"
                width="100%"
                height="380"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </section>

        {/* Gold line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
      </main>

      <Footer />
    </div>
  );
}
