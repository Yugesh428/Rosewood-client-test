"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorName: string;
  authorRole: string;
  date: string;
  isPublished: boolean;
  isFeatured: boolean;
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlog() {
      try {
        setLoading(true);

        const blogRes = await fetch(`/api/ui/blog/slug/${slug}`);
        if (!blogRes.ok) throw new Error("Blog not found");
        const blogData = await blogRes.json();
        setBlog(blogData.data);

        if (blogData.data) {
          const relatedRes = await fetch(`/api/ui/blog?category=${blogData.data.category}`);
          const relatedData = await relatedRes.json();
          const filtered = relatedData.data
            .filter((b: Blog) => b.id !== blogData.data.id)
            .slice(0, 3);
          setRelatedBlogs(filtered);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-500 font-sans">Loading...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen w-full bg-white">
        <Navbar />
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-3xl font-heading text-gray-900 mb-4">Blog not found</h1>
          <Link href="/articles" className="text-[#D4AF37] hover:underline font-sans">
            ← Back to Articles
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <Navbar />

      <article>
        {/* ─── FULL-BLEED HERO ─────────────────────────────────────────── */}
        <div className="relative w-full h-[70vh] min-h-[480px] max-h-[700px]" style={{ marginTop: '94px' }}>
          {/* Hero image — edge to edge */}
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

          {/* Title block pinned to bottom-left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute bottom-0 left-0 right-0 px-8 md:px-16 lg:px-24 pb-12"
          >
            {/* Category badge */}
            <span className="inline-block px-3 py-1 mb-4 text-[10px] tracking-[0.2em] uppercase font-sans font-semibold bg-[#D4AF37] text-white rounded-sm">
              {blog.category}
            </span>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] text-white leading-tight mb-4 max-w-4xl">
              {blog.title}
            </h1>

            {/* Author + Date row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 font-sans">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8952e] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-heading text-sm font-bold">
                    {blog.authorName?.charAt(0) ?? "A"}
                  </span>
                </div>
                <span className="font-medium text-white">{blog.authorName}</span>
              </div>
              <span className="text-white/50">·</span>
              <time>{blog.date}</time>
              {blog.authorRole && (
                <>
                  <span className="text-white/50">·</span>
                  <span className="text-white/70">{blog.authorRole}</span>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* ─── ARTICLE BODY ─────────────────────────────────────────────── */}
        <div className="pt-16 md:pt-20 lg:pt-24 pb-0">
          <div className="w-full px-6 md:px-8 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="
                prose prose-lg max-w-none
                prose-headings:font-heading prose-headings:text-[#1A1A1A]
                prose-p:font-sans prose-p:text-[#3A3A3A] prose-p:leading-[1.85]
                prose-a:text-[#D4AF37] prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-sm prose-img:w-full
                prose-strong:text-[#1A1A1A]
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-5
                prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
                prose-li:font-sans prose-li:text-[#3A3A3A]
              "
              dangerouslySetInnerHTML={{ __html: blog.content }}
              style={{ fontFamily: "'Inter', sans-serif", lineHeight: "1.8" }}
            />
          </div>
        </div>

        {/* ─── RELATED ARTICLES ─────────────────────────────────────────── */}
        {relatedBlogs.length > 0 && (
          <div className="pt-8 pb-12 bg-white border-t border-gray-100">
            <div className="max-w-[1400px] mx-auto px-8 md:px-16">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase font-sans text-black/40 mb-2">Continue reading</p>
                  <h2 className="font-heading text-3xl md:text-4xl text-[#1A1A1A]">Related Stories</h2>
                </div>
                <Link
                  href="/articles"
                  className="hidden md:flex items-center gap-2 text-sm font-sans text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                >
                  View all articles
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedBlogs.map((relatedBlog, idx) => (
                  <motion.article
                    key={relatedBlog.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <Link href={`/articles/${relatedBlog.slug}`} className="block">
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden rounded-sm mb-4">
                        <img
                          src={relatedBlog.coverImage}
                          alt={relatedBlog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-sm">
                          <span className="text-[9px] tracking-[0.2em] uppercase font-sans text-white">
                            {relatedBlog.category}
                          </span>
                        </div>
                      </div>

                      {/* Author */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8952e] flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-heading text-[10px] font-bold">
                            {relatedBlog.authorName?.charAt(0) ?? "A"}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-sans font-semibold text-[#1A1A1A]">{relatedBlog.authorName}</p>
                          <p className="text-[10px] text-black/40 font-sans">{relatedBlog.date}</p>
                        </div>
                      </div>

                      <h3 className="font-heading text-xl text-[#1A1A1A] mb-4 group-hover:text-[#D4AF37] transition-colors leading-snug line-clamp-2">
                        {relatedBlog.title}
                      </h3>

                      <span className="inline-block px-5 py-2 text-[9px] tracking-[0.2em] uppercase font-sans font-bold bg-[#1A1A1A] text-white rounded-sm group-hover:bg-[#D4AF37] transition-colors">
                        Read More
                      </span>
                    </Link>
                  </motion.article>
                ))}
              </div>

              {/* Mobile: view all */}
              <div className="mt-10 text-center md:hidden">
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-2 text-sm font-sans text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                >
                  View all articles
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ─── BACK LINK ────────────────────────────────────────────────── */}
        <div className="py-10 bg-gray-50 border-t border-gray-100 text-center">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm font-sans text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to Articles</span>
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
}
