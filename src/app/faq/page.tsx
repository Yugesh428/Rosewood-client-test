"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";

type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  displayOrder: number;
};

// ─── Accordion item ───────────────────────────────────────────────────────────
function FaqItem({ faq, index, isOpen, onToggle }: {
  faq: Faq;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="border border-[#E5E5E5] bg-white overflow-hidden"
      style={{ boxShadow: isOpen ? "0 4px 20px rgba(212,175,55,0.08)" : "0 1px 4px rgba(0,0,0,0.04)" }}
    >
      {/* Question row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 transition-colors duration-200"
        style={{ backgroundColor: isOpen ? "rgba(212,175,55,0.04)" : "transparent" }}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4 min-w-0">
          {/* Number badge */}
          <span
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
            style={{
              backgroundColor: isOpen ? "#D4AF37" : "rgba(212,175,55,0.10)",
              color: isOpen ? "#000" : "#b8952e",
              fontFamily: "var(--font-montserrat), sans-serif",
              transition: "all 0.2s",
            }}
          >
            {index + 1}
          </span>
          <span
            className="text-sm font-semibold leading-snug"
            style={{
              fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
              color: isOpen ? "#1A1A1A" : "#333",
            }}
          >
            {faq.question}
          </span>
        </div>

        {/* +/- icon */}
        <span
          className="flex-shrink-0 w-7 h-7 rounded flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor: isOpen ? "#D4AF37" : "rgba(212,175,55,0.10)",
            color: isOpen ? "#000" : "#b8952e",
            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </button>

      {/* Answer panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="px-6 pb-5 pt-1 border-t"
              style={{ borderColor: "rgba(212,175,55,0.15)" }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: "var(--font-sans), 'Inter', sans-serif",
                  color: "#4B4B4B",
                  marginLeft: "calc(28px + 16px)",
                }}
              >
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FaqPage() {
  const [faqs, setFaqs]           = useState<Faq[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openId, setOpenId]       = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch("/api/ui/faq")
      .then((r) => r.json())
      .then((json) => {
        const data: Faq[] = json.data ?? [];
        setFaqs(data);

        const cats = Array.from(
          new Set<string>(data.map((f) => f.category).filter((c): c is string => !!c)),
        ).sort();
        setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeCategory === "All"
      ? faqs
      : faqs.filter((f) => f.category === activeCategory);

  return (
    <div style={{ backgroundColor: "#ffffff" }}>
      <Navbar />

      <main className="min-h-screen pt-20">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="py-16 bg-[#F9F8F5]">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-xs tracking-[0.35em] uppercase font-semibold mb-3"
              style={{ color: "#D4AF37", fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
            >
              Support
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-5xl font-heading mb-4"
              style={{ color: "#1A1A1A", fontFamily: "var(--font-cinzel), 'Cinzel', serif" }}
            >
              Frequently Asked Questions
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-sm leading-relaxed"
              style={{ color: "#6B6B6B", fontFamily: "var(--font-sans), 'Inter', sans-serif" }}
            >
              Everything you need to know about our pharmacy services. Can&apos;t find what you&apos;re looking for?{" "}
              <a href="/contact" className="text-[#D4AF37] hover:text-[#1A1A1A] transition-colors">Contact us</a>.
            </motion.p>
          </div>
        </section>

        {/* ── Two-column layout ─────────────────────────────────────────── */}
        <section className="py-14">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start">

              {/* ── Left: Accordion ─────────────────────────────────────── */}
              <div>
                {/* Category filter tabs */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {["All", ...categories].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setOpenId(null); }}
                        className="px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all duration-200"
                        style={{
                          fontFamily: "var(--font-montserrat), sans-serif",
                          backgroundColor: activeCategory === cat ? "#1A1A1A" : "transparent",
                          color: activeCategory === cat ? "#D4AF37" : "#6B6B6B",
                          border: activeCategory === cat ? "1px solid #1A1A1A" : "1px solid #E5E5E5",
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* FAQ list */}
                {loading ? (
                  <div className="flex items-center justify-center py-24">
                    <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-16 text-center">
                    <p style={{ fontFamily: "var(--font-heading), serif", fontSize: "18px", color: "#999" }}>
                      No questions found
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filtered.map((faq, i) => (
                      <FaqItem
                        key={faq.id}
                        faq={faq}
                        index={i}
                        isOpen={openId === faq.id}
                        onToggle={() => setOpenId((prev) => (prev === faq.id ? null : faq.id))}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ── Right: Illustration + CTA ────────────────────────────── */}
              <div className="hidden lg:flex flex-col items-center gap-8 sticky top-28">
                {/* Illustration */}
                <div className="w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&q=80"
                    alt="Pharmacist helping customer"
                    className="w-full object-cover"
                    style={{ height: "320px", filter: "brightness(0.96)" }}
                  />
                  {/* Gold bottom border accent */}
                  <div className="h-[3px] bg-gradient-to-r from-[#D4AF37] via-[#ffe87c] to-[#D4AF37]" />
                </div>

                {/* Still have questions card */}
                <div
                  className="w-full border border-[#E5E5E5] p-7 bg-white"
                  style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
                >
                  <div className="w-8 h-[2px] bg-[#D4AF37] mb-4" />
                  <h3
                    className="text-xl mb-2"
                    style={{ fontFamily: "var(--font-cinzel), 'Cinzel', serif", color: "#1A1A1A" }}
                  >
                    Still have questions?
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-5"
                    style={{ fontFamily: "var(--font-sans), 'Inter', sans-serif", color: "#6B6B6B" }}
                  >
                    Our team is here to help. Reach out and we&apos;ll get back to you within 24 hours.
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase px-5 py-3 transition-all duration-300"
                    style={{
                      backgroundColor: "#1A1A1A",
                      color: "#D4AF37",
                    }}
                    onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#D4AF37"; el.style.color = "#000"; }}
                    onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = "#1A1A1A"; el.style.color = "#D4AF37"; }}
                  >
                    Contact Us
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Gold divider */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
      </main>

      <Footer />
    </div>
  );
}
