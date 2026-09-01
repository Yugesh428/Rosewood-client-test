"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";

// ─── Values data ──────────────────────────────────────────────────────────────
const values = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Trust",
    description:
      "Building lasting relationships through transparency, rigorous standards, and uncompromised integrity in every interaction.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Quality",
    description:
      "Curating only the finest, scientifically-backed products that meet our exacting standards for efficacy and safety.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Care",
    description:
      "Providing compassionate, personalised guidance tailored to your unique wellness journey and lifestyle.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <path d="M9 9h6M9 12h6M9 15h4" />
      </svg>
    ),
    title: "Reliability",
    description:
      "Ensuring consistent excellence in service, product availability, and professional advice when you need it most.",
  },
];

// ─── Fade-up animation variant ────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: "easeOut" },
  }),
};

export default function AboutPage() {
  return (
    <div className="bg-[#F9F9F9]">
      <Navbar />
      <main className="min-h-screen pt-14">

      {/* ── Hero / Page Title ──────────────────────────────────────────────── */}
      <section className="py-20 text-center">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="text-xs tracking-[0.35em] uppercase text-[#D4AF37] font-sans mb-3"
        >
          Who We Are
        </motion.p>
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.2}
          className="font-heading text-4xl md:text-5xl text-[#1A1A1A] mb-5"
        >
          About Us
        </motion.h1>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.3}
          className="text-sm text-[#6B6B6B] font-sans leading-relaxed max-w-md mx-auto"
        >
          Elevating the pharmacy experience through meticulous curation, expert care,
          and an unwavering commitment to your holistic well-being.
        </motion.p>
        {/* Gold divider */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.4}
          className="mt-8 mx-auto w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
        />
      </section>

      {/* ── Our Story ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

            {/* Image */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              className="relative h-[420px] overflow-hidden rounded-sm"
            >
              <Image
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80"
                alt="Inside our apothecary store"
                fill
                className="object-cover object-center"
              />
              {/* Gold corner accent */}
              <div className="absolute top-4 left-4 w-10 h-10 border-t border-l border-[#D4AF37]/60" />
              <div className="absolute bottom-4 right-4 w-10 h-10 border-b border-r border-[#D4AF37]/60" />
            </motion.div>

            {/* Text */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0.15}
              className="flex flex-col gap-5"
            >
              <p className="text-xs tracking-[0.3em] uppercase text-[#D4AF37] font-sans">
                Our Story
              </p>
              <h2 className="font-heading text-3xl text-[#1A1A1A] leading-snug">
                Born from a Desire to<br />Redefine the Pharmacy
              </h2>
              <div className="w-8 h-[1px] bg-[#D4AF37]" />
              <p className="text-sm text-[#6B6B6B] font-sans leading-relaxed">
                Luxe Apothecary was born from a desire to redefine the traditional
                pharmacy. We recognised a need for a space that seamlessly blends the
                rigorous standards of clinical care with the personalised, sensory
                experience of a high-end boutique.
              </p>
              <p className="text-sm text-[#6B6B6B] font-sans leading-relaxed">
                For over a decade, we have dedicated ourselves to sourcing the
                highest-quality pharmaceutical products, holistic remedies, and premium
                skincare. Our environment is designed to be an oasis of calm, where
                every consultation is handled with the utmost discretion and expertise.
              </p>
              <p className="text-sm text-[#6B6B6B] font-sans leading-relaxed">
                We believe that health and wellness are luxuries that everyone deserves.
                Our team of expert pharmacists and wellness consultants are here to
                guide you on your journey to optimal health, providing tailored advice
                and a curated selection of products you can trust.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Our Mission ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#F9F9F9]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-xs tracking-[0.35em] uppercase text-[#D4AF37] font-sans mb-4"
          >
            Our Mission
          </motion.p>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0.1}
            className="font-heading text-3xl text-[#1A1A1A] mb-8"
          >
            A Higher Standard of Care
          </motion.h2>
          <motion.blockquote
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0.2}
            className="relative"
          >
            {/* Large quote mark */}
            <span className="absolute -top-4 -left-2 font-heading text-7xl text-[#D4AF37]/20 leading-none select-none">
              &ldquo;
            </span>
            <p className="font-heading text-xl md:text-2xl text-[#1A1A1A] leading-relaxed italic px-6">
              To provide an unparalleled standard of healthcare and wellness guidance
              in an environment that inspires confidence, safety, and elegance.
            </p>
            <span className="absolute -bottom-6 -right-2 font-heading text-7xl text-[#D4AF37]/20 leading-none select-none">
              &rdquo;
            </span>
          </motion.blockquote>
        </div>
      </section>

      {/* ── Our Values ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-center mb-14"
          >
            <p className="text-xs tracking-[0.35em] uppercase text-[#D4AF37] font-sans mb-3">
              What Drives Us
            </p>
            <h2 className="font-heading text-3xl text-[#1A1A1A]">Our Values</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.1}
                className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-sm p-7 flex flex-col gap-4 hover:border-[#D4AF37]/50 hover:shadow-sm transition-all duration-300 group"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors duration-300">
                  {v.icon}
                </div>
                <h3 className="font-heading text-lg text-[#1A1A1A]">{v.title}</h3>
                <p className="text-xs text-[#6B6B6B] font-sans leading-relaxed">
                  {v.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom gold line (mirrors hero) ───────────────────────────────── */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

    </main>
    <Footer />
    </div>
  );
}
