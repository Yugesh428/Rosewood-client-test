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
        <div className="py-16 md:py-20 lg:py-24">
          <div className="max-w-[780px] mx-auto px-6 md:px-8">
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

        {/* ─── SHARE BAR ────────────────────────────────────────────────── */}
        <div className="border-t border-gray-100 bg-gray-50 py-8">
          <div className="max-w-[780px] mx-auto px-6 md:px-8 flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm font-sans text-gray-500">Share this article</p>
            <div className="flex gap-3">
              {/* Facebook */}
              <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              {/* Twitter / X */}
              <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              {/* LinkedIn */}
              <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ─── RELATED ARTICLES ─────────────────────────────────────────── */}
        {relatedBlogs.length > 0 && (
          <div className="py-16 md:py-20 bg-white border-t border-gray-100">
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
