"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  coverImage: string;
  date: string;
}

const faqs = [
  {
    question: "Are your products 100% natural?",
    answer:
      "Yes, every Rosewood product is meticulously crafted with 100% natural botanical extracts sourced from sustainable organic farms. We ensure that no synthetic fragrances or artificial colors touch your skin.",
    defaultOpen: true,
  },
  {
    question: "Are they suitable for sensitive skin?",
    answer:
      "Absolutely. Our formulas are dermatologist-tested and specifically designed to be gentle on sensitive skin. We avoid harsh chemicals and allergens commonly found in other products.",
    defaultOpen: false,
  },
  {
    question: "Do you use parabens or sulfates?",
    answer:
      "Never. All our products are completely free from parabens, sulfates, phthalates, and other harmful preservatives. We believe in clean beauty that works.",
    defaultOpen: false,
  },
  {
    question: "How should I store the botanical products?",
    answer:
      "Store in a cool, dry place away from direct sunlight. Most products are best kept at room temperature between 15–25°C. Avoid storing in humid environments like bathrooms.",
    defaultOpen: false,
  },
];

function FAQItem({ question, answer, defaultOpen }: { question: string; answer: string; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="border-b border-gray-200 last:border-0"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span
          className="text-base font-semibold font-sans transition-colors duration-200"
          style={{ color: open ? "#1A1A1A" : "#1A1A1A" }}
        >
          {question}
        </span>
        <ChevronDown
          className="w-5 h-5 flex-shrink-0 ml-4 transition-transform duration-300"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            color: "#D4AF37",
          }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-sm text-gray-500 font-sans leading-relaxed pb-5 pr-8">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ArticlesSection() {
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [sidebarBlogs, setSidebarBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        // Fetch featured blogs for main cards
        const featuredRes = await fetch("/api/ui/blog?featured=true");
        const featuredData = await featuredRes.json();
        if (featuredData.success) {
          setFeaturedBlogs(featuredData.data.slice(0, 2));
        }

        // Fetch recent blogs for sidebar
        const allRes = await fetch("/api/ui/blog");
        const allData = await allRes.json();
        if (allData.success) {
          setSidebarBlogs(allData.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    }

    fetchBlogs();
  }, []);

  return (
    <>

      {/* ── Articles + Model Banner ───────────────────────────────────────── */}
      <section
        className="w-full relative overflow-visible bg-white pt-16"
        style={{ minHeight: "420px" }}
      >
        <div className="w-full flex flex-col lg:flex-row items-end">

          {/* LEFT — Model image overflowing upward */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-20 flex-shrink-0"
            style={{ marginBottom: "-1px" }}
          >
            <img
              src="/uploads/modeltry.png"
              alt="Skincare model"
              className="w-auto object-contain object-bottom"
              style={{ height: "700px", marginTop: "-200px" }}
            />
          </motion.div>

          {/* RIGHT — Articles list */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex-1 py-12 px-10 md:px-16"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h3
                className="text-3xl text-[#1A1A1A]"
                style={{
                  fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                }}
              >
                Latest Articles
              </h3>
              <Link href="/articles" className="text-sm font-sans text-[#1A1A1A] hover:text-[#D4AF37] transition-colors flex items-center gap-1">
                View all
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8l4 4-4 4M8 12h8"/></svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Featured blog cards (2) */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {featuredBlogs.length > 0 ? (
                  featuredBlogs.map((article, idx) => (
                    <motion.article
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="group"
                    >
                      <Link href={`/articles/${article.slug}`} className="block">
                        <div className="aspect-[4/3] overflow-hidden rounded-sm mb-4">
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                        <p className="text-[10px] tracking-[0.2em] uppercase font-sans text-black/40 mb-2">{article.category}</p>
                        <h4 className="font-sans font-bold text-lg text-[#1A1A1A] mb-1 group-hover:text-[#D4AF37] transition-colors leading-snug line-clamp-2">{article.title}</h4>
                        <p className="text-xs text-black/50 font-sans mb-3">{article.date}</p>
                        <p className="text-sm text-black/60 font-sans leading-relaxed mb-5 line-clamp-3">{article.excerpt}</p>
                        <span className="inline-block px-5 py-2 text-[10px] tracking-[0.2em] uppercase font-sans font-bold bg-[#1A1A1A] text-white hover:bg-[#D4AF37] transition-colors">
                          READ MORE
                        </span>
                      </Link>
                    </motion.article>
                  ))
                ) : (
                  // Fallback static content
                  [
                    {
                      id: "1",
                      category: "SKINCARE",
                      title: "10 Daily Habits for Healthier Skin",
                      date: "Sep 22, 2026",
                      excerpt: "Simple daily habits that transform your skin health over time, from hydration to sun protection and gentle cleansing routines.",
                      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=280&fit=crop&q=80",
                      slug: "daily-habits-healthier-skin",
                    },
                    {
                      id: "2",
                      category: "WELLNESS",
                      title: "Benefits of Natural Botanical Ingredients",
                      date: "Sep 19, 2026",
                      excerpt: "Discover how natural botanical extracts work to nourish, protect and revitalize your skin without harsh chemicals.",
                      image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=280&fit=crop&q=80",
                      slug: "natural-botanical-ingredients",
                    },
                  ].map((article, idx) => (
                    <motion.article
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="group"
                    >
                      <Link href="/articles" className="block">
                        <div className="aspect-[4/3] overflow-hidden rounded-sm mb-4">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                        <p className="text-[10px] tracking-[0.2em] uppercase font-sans text-black/40 mb-2">{article.category}</p>
                        <h4 className="font-sans font-bold text-lg text-[#1A1A1A] mb-1 group-hover:text-[#D4AF37] transition-colors leading-snug line-clamp-2">{article.title}</h4>
                        <p className="text-xs text-black/50 font-sans mb-3">{article.date}</p>
                        <p className="text-sm text-black/60 font-sans leading-relaxed mb-5 line-clamp-3">{article.excerpt}</p>
                        <span className="inline-block px-5 py-2 text-[10px] tracking-[0.2em] uppercase font-sans font-bold bg-[#1A1A1A] text-white hover:bg-[#D4AF37] transition-colors">
                          READ MORE
                        </span>
                      </Link>
                    </motion.article>
                  ))
                )}
              </div>

              {/* Sidebar — category list */}
              <div className="space-y-6">
                {sidebarBlogs.length > 0 ? (
                  sidebarBlogs.map((item, idx) => (
                    <Link key={item.id} href={`/articles/${item.slug}`} className="block group pb-6 border-b border-gray-200 last:border-0">
                      <p className="text-[10px] tracking-[0.2em] uppercase font-sans text-black/40 mb-1">{item.category}</p>
                      <h4 className="font-sans font-semibold text-base text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors leading-snug mb-1">{item.title}</h4>
                      <p className="text-xs text-black/50 font-sans">{item.date}</p>
                    </Link>
                  ))
                ) : (
                  // Fallback static sidebar
                  [
                    { category: "GIFTING", title: "12 of the Best Gifts for Wellness Lovers", date: "Sep 21, 2026" },
                    { category: "ROYAL JELLY", title: "Royal Jelly Explained for Everyday Wellness", date: "Sep 20, 2026" },
                    { category: "AUTUMN", title: "Autumn Immune Support for the Cooler Months", date: "Sep 19, 2026" },
                    { category: "FATIGUE", title: "Vitamin Routine for Winter Fatigue That Fits", date: "Sep 18, 2026" },
                  ].map((item, idx) => (
                    <Link key={idx} href="/articles" className="block group pb-6 border-b border-gray-200 last:border-0">
                      <p className="text-[10px] tracking-[0.2em] uppercase font-sans text-black/40 mb-1">{item.category}</p>
                      <h4 className="font-sans font-semibold text-base text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors leading-snug mb-1">{item.title}</h4>
                      <p className="text-xs text-black/50 font-sans">{item.date}</p>
                    </Link>
                  ))
                )}
              </div>

            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
