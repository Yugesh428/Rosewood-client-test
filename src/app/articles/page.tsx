"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";
import { useTheme } from "@/context/ThemeContext";

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  coverImage: string;
  date: string;
  authorName: string;
}

export default function ArticlesPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const { homeBg } = useTheme();
  const bg =
    homeBg === "white" ? "#ffffff" :
    homeBg === "soft-blue" ? "#f0f8ff" :
    homeBg === "near-blue" ? "#cce8f7" :
    homeBg === "creamy-blue" ? "#e8f4f8" :
    "#dff0fb";

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch("/api/ui/blog");
        const data = await res.json();
        if (data.success) {
          setBlogs(data.data);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: bg }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-500 font-sans">Loading articles...</p>
        </div>
      </div>
    );
  }

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
            {blogs.map((article, idx) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <Link href={`/articles/${article.slug}`} className="block">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm mb-4">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Category */}
                  <p className="text-[10px] tracking-[0.2em] uppercase font-sans text-black/40 mb-2">
                    {article.category}
                  </p>

                  {/* Title */}
                  <h3 className="font-heading text-xl md:text-2xl text-[#1A1A1A] mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Date */}
                  <p className="text-xs text-black/50 font-sans mb-3">{article.date}</p>

                  {/* Excerpt */}
                  <p className="text-sm text-black/60 font-sans leading-relaxed mb-5 line-clamp-3">
                    {article.excerpt}
                  </p>

                  {/* Read More Button */}
                  <span className="inline-block px-6 py-2.5 text-[10px] tracking-[0.2em] uppercase font-sans font-bold bg-[#1A1A1A] text-white rounded-sm hover:bg-[#D4AF37] transition-colors">
                    READ MORE
                  </span>
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
