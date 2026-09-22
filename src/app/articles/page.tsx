"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";
import { useTheme } from "@/context/ThemeContext";

const allArticles = [
  {
    id: "best-beauty-gift-ideas",
    category: "GIFTING",
    title: "12 Best Beauty Gift Ideas",
    date: "Sep 22, 2026",
    excerpt: "Find the best pharmacy beauty gift ideas, from results-led skincare to refined bath and body treats, chosen for every recipient and occasion with care.",
    image: "/uploads/ui/products/photo1/230a35de-d2b8-43e5-8764-ecdbd822020d.jpg",
  },
  {
    id: "best-gifts-wellness-lovers",
    category: "GIFTING",
    title: "12 of the Best Gifts for Wellness Lovers",
    date: "Sep 21, 2026",
    excerpt: "Find the best gifts for wellness lovers, from advanced skincare and sleep rituals to considered supplements and restorative everyday essentials at home.",
    image: "/uploads/ui/products/photo2/0351f449-8675-46cf-bafd-7d563c3e6306.jpg",
  },
  {
    id: "royal-jelly-explained",
    category: "ROYAL JELLY",
    title: "Royal Jelly Explained for Everyday Wellness",
    date: "Sep 20, 2026",
    excerpt: "Discover the benefits of royal jelly for everyday wellness and how this natural ingredient can support your health routine.",
    image: "/uploads/ui/products/photo1/230a35de-d2b8-43e5-8764-ecdbd822020d.jpg",
  },
  {
    id: "autumn-immune-support",
    category: "AUTUMN",
    title: "Autumn Immune Support for the Cooler Months",
    date: "Sep 19, 2026",
    excerpt: "Strengthen your immune system this autumn with our guide to essential supplements and wellness practices for the changing season.",
    image: "/uploads/ui/products/photo2/0351f449-8675-46cf-bafd-7d563c3e6306.jpg",
  },
  {
    id: "vitamin-routine-winter",
    category: "FATIGUE",
    title: "Vitamin Routine for Winter Fatigue That Fits",
    date: "Sep 18, 2026",
    excerpt: "Combat winter fatigue with a tailored vitamin routine designed to boost energy and support wellbeing during the colder months.",
    image: "/uploads/ui/products/photo1/230a35de-d2b8-43e5-8764-ecdbd822020d.jpg",
  },
];

export default function ArticlesPage() {
  const { homeBg } = useTheme();
  const bg =
    homeBg === "white" ? "#ffffff" :
    homeBg === "soft-blue" ? "#f0f8ff" :
    homeBg === "near-blue" ? "#cce8f7" :
    homeBg === "creamy-blue" ? "#e8f4f8" :
    "#dff0fb";

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: bg }}>
      <Navbar />

      <div className="pt-32 pb-20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] mb-4">
              Articles & Insights
            </h1>
            <p className="text-base md:text-lg text-black/60 font-sans max-w-2xl mx-auto">
              Expert advice, wellness guides, and curated recommendations from John Bell & Croyden
            </p>
          </motion.div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allArticles.map((article, idx) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <Link href={`/articles/${article.id}`} className="block">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm mb-5">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Category */}
                  <p className="text-[10px] tracking-[0.2em] uppercase font-sans text-black/40 mb-3">
                    {article.category}
                  </p>

                  {/* Title */}
                  <h3 className="font-heading text-xl md:text-2xl text-[#1A1A1A] mb-3 group-hover:text-[#D4AF37] transition-colors">
                    {article.title}
                  </h3>

                  {/* Date */}
                  <p className="text-xs text-black/50 font-sans mb-4">{article.date}</p>

                  {/* Excerpt */}
                  <p className="text-sm text-black/60 font-sans leading-relaxed mb-5">
                    {article.excerpt}
                  </p>

                  {/* Read More Button */}
                  <button className="px-6 py-2.5 text-[10px] tracking-[0.2em] uppercase font-sans font-bold bg-[#1A1A1A] text-white rounded-sm hover:bg-[#D4AF37] transition-colors">
                    READ MORE
                  </button>
                </Link>
              </motion.article>
            ))}
          </div>

          {/* Back Link */}
          <div className="mt-16 pt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-sans text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
