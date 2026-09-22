"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

type FeaturedDuoData = {
  id: number;
  eyebrow: string | null;
  heading: string | null;
  shopNowUrl: string | null;
  leftImage: string | null;
  leftBrand: string | null;
  leftTitle: string | null;
  leftLink: string | null;
  rightImage: string | null;
  rightBrand: string | null;
  rightTitle: string | null;
  rightLink: string | null;
  isActive: boolean;
};

export default function FeaturedDuoDynamic() {
  const [data, setData] = useState<FeaturedDuoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ui/featured-duo")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data && json.data.isActive) {
          setData(json.data);
        }
      })
      .catch((err) => console.error("Failed to load featured duo:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!data || !data.isActive) return null;
  if (!data.leftImage && !data.rightImage) return null;

  return (
    <section className="py-6 bg-white">
      <div className="w-full px-6 md:px-12">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-8"
        >
          <div className="text-center flex-1">
            {data.eyebrow && (
              <p className="text-[11px] tracking-[0.25em] uppercase font-sans text-black/50 mb-2">
                {data.eyebrow}
              </p>
            )}
            {data.heading && (
              <h2 className="font-heading text-3xl md:text-4xl text-[#1A1A1A]">
                {data.heading}
              </h2>
            )}
          </div>
          {data.shopNowUrl && (
            <Link
              href={data.shopNowUrl}
              className="flex-shrink-0 text-[11px] tracking-[0.18em] uppercase font-sans text-[#1A1A1A] hover:text-[#D4AF37] transition-colors border-b border-[#1A1A1A] hover:border-[#D4AF37] pb-0.5 ml-8"
            >
              Shop Now
            </Link>
          )}
        </motion.div>

        {/* ── Two Panels ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px]">

          {/* Left Panel */}
          {data.leftImage && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="h-full"
            >
              <Link
                href={data.leftLink || "/pharmacy"}
                className="group relative block h-[600px] overflow-hidden rounded-sm"
              >
                <Image
                  src={data.leftImage}
                  alt={data.leftTitle || "Featured product"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized={data.leftImage.startsWith("/uploads/")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <motion.div 
                  className="absolute bottom-0 left-0 pb-8 px-8"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {data.leftBrand && (
                    <motion.p 
                      className="text-[10px] tracking-[0.28em] uppercase font-sans mb-2 text-white"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      {data.leftBrand}
                    </motion.p>
                  )}
                  {data.leftTitle && (
                    <motion.h3 
                      className="font-heading text-2xl md:text-3xl text-white leading-tight"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      {data.leftTitle}
                    </motion.h3>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          )}

          {/* Right Panel */}
          {data.rightImage && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="h-full"
            >
              <Link
                href={data.rightLink || "/pharmacy"}
                className="group relative block h-[600px] overflow-hidden rounded-sm"
              >
                <Image
                  src={data.rightImage}
                  alt={data.rightTitle || "Featured product"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized={data.rightImage.startsWith("/uploads/")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <motion.div 
                  className="absolute bottom-0 left-0 pb-8 px-8"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  {data.rightBrand && (
                    <motion.p 
                      className="text-[10px] tracking-[0.28em] uppercase font-sans mb-2 text-white"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      {data.rightBrand}
                    </motion.p>
                  )}
                  {data.rightTitle && (
                    <motion.h3 
                      className="font-heading text-2xl md:text-3xl text-white leading-tight"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      {data.rightTitle}
                    </motion.h3>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          )}

        </div>
      </div>
    </section>
  );
}
