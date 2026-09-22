"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const articles = [
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
];

const sidebarArticles = [
  {
    id: "royal-jelly-explained",
    category: "ROYAL JELLY",
    title: "Royal Jelly Explained for Everyday Wellness",
    date: "Sep 20, 2026",
  },
  {
    id: "autumn-immune-support",
    category: "AUTUMN",
    title: "Autumn Immune Support for the Cooler Months",
    date: "Sep 19, 2026",
  },
  {
    id: "vitamin-routine-winter",
    category: "FATIGUE",
    title: "Vitamin Routine for Winter Fatigue That Fits",
    date: "Sep 18, 2026",
  },
];

export default function ArticlesSection() {
  return (
    <section className="w-full bg-white py-6">
      <div className="w-full px-8 md:px-16">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-heading text-3xl md:text-4xl text-[#1A1A1A]"
          >
            Latest from John Bell & Croyden
          </motion.h2>
          
          <Link
            href="/articles"
            className="flex items-center gap-2 text-sm font-sans text-[#1A1A1A] hover:text-[#D4AF37] transition-colors group"
          >
            <span>View all</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="group-hover:translate-x-1 transition-transform"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8l4 4-4 4M8 12h8" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Articles (2 columns on left) */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((article, idx) => (
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

          {/* Sidebar (1 column on right) */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {sidebarArticles.map((article, idx) => (
              <Link
                key={article.id}
                href={`/articles/${article.id}`}
                className="block group pb-8 border-b border-gray-200 last:border-0"
              >
                {/* Category */}
                <p className="text-[10px] tracking-[0.2em] uppercase font-sans text-black/40 mb-3">
                  {article.category}
                </p>

                {/* Title */}
                <h4 className="font-heading text-lg text-[#1A1A1A] mb-2 group-hover:text-[#D4AF37] transition-colors leading-snug">
                  {article.title}
                </h4>

                {/* Date */}
                <p className="text-xs text-black/50 font-sans">{article.date}</p>
              </Link>
            ))}
          </motion.aside>

        </div>
      </div>
    </section>
  );
}
