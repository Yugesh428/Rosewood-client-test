"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type CollectionCategory = {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
};

type CollectionProduct = {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string | null;
  backgroundImage: string | null;
  videoUrl: string | null;
  videoFile: string | null;
  photo1Url: string | null;
  photo2Url: string | null;
  isActive: boolean;
};

// Product category from database
interface DBCategory {
  id: string;
  categoryName: string;
  isActive: boolean;
  parentId: string | null;
}

// ─── Helper: extract YouTube embed URL ───────────────────────────────────────
function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname.includes("youtube.com")) {
      videoId = u.searchParams.get("v");
    } else if (u.hostname.includes("youtu.be")) {
      videoId = u.pathname.slice(1);
    }
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0`;
  } catch {}
  return null;
}

// ─── Helper: extract Instagram embed URL ──────────────────────────────────────
function getInstagramEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("instagram.com")) {
      // Strip trailing slash and append /embed
      const path = u.pathname.replace(/\/$/, "");
      return `https://www.instagram.com${path}/embed`;
    }
  } catch {}
  return null;
}

// ─── Video renderer — handles YouTube, Instagram, or direct file ──────────────
function VideoMedia({ videoUrl, videoFile, title }: { videoUrl: string | null; videoFile: string | null; title: string }) {
  // Prefer local video file if available
  if (videoFile) {
    return (
      <video
        src={videoFile}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
    );
  }

  if (videoUrl) {
    const ytEmbed = getYouTubeEmbedUrl(videoUrl);
    if (ytEmbed) {
      return (
        <iframe
          src={ytEmbed}
          title={title}
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{
            border: "none",
            pointerEvents: "none",
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "calc(100% + 120px)",
            height: "calc(100% + 120px)",
            transform: "translate(-50%, -50%)",
          }}
        />
      );
    }

    const igEmbed = getInstagramEmbedUrl(videoUrl);
    if (igEmbed) {
      return (
        <iframe
          src={igEmbed}
          title={title}
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          style={{ border: "none", pointerEvents: "none" }}
          scrolling="no"
        />
      );
    }

    // Generic video URL (mp4, etc.)
    return (
      <video
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
    );
  }

  return null;
}

export default function ProductCollectionDynamic() {
  const [categories, setCategories] = useState<CollectionCategory[]>([]);
  const [products, setProducts] = useState<CollectionProduct[]>([]);
  const [productCategories, setProductCategories] = useState<DBCategory[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  // Sidebar navigation state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories, products, and product categories in parallel
    Promise.all([
      fetch("/api/ui/collection/categories").then((r) => r.json()),
      fetch("/api/ui/collection/products").then((r) => r.json()),
      fetch("/api/product-categories").then((r) => r.json()),
    ])
      .then(([catJson, prodJson, prodCatJson]) => {
        if (catJson.success && catJson.data) {
          setCategories(catJson.data);
          if (catJson.data.length > 0) setActiveTab(catJson.data[0].id);
        }
        if (prodJson.success && prodJson.data) {
          setProducts(prodJson.data);
        }
        if (prodCatJson.success && prodCatJson.data) {
          setProductCategories(prodCatJson.data);
        }
      })
      .catch((err) => console.error("Failed to load collection data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Build category hierarchy
  const childCategoriesMap = productCategories.reduce((acc, cat) => {
    if (cat.parentId) {
      if (!acc[cat.parentId]) acc[cat.parentId] = [];
      acc[cat.parentId].push(cat);
    }
    return acc;
  }, {} as Record<string, DBCategory[]>);

  // Get current level categories based on navigation stack
  const getCurrentLevelCategories = (): DBCategory[] => {
    if (navigationStack.length === 0) {
      return productCategories.filter(cat => !cat.parentId);
    } else {
      const currentParentId = navigationStack[navigationStack.length - 1];
      return childCategoriesMap[currentParentId] || [];
    }
  };

  // Sort categories: those with children first
  const getSortedCategories = (cats: DBCategory[]): DBCategory[] => {
    return [...cats].sort((a, b) => {
      const aHasChildren = childCategoriesMap[a.id]?.length > 0;
      const bHasChildren = childCategoriesMap[b.id]?.length > 0;
      if (aHasChildren && !bHasChildren) return -1;
      if (!aHasChildren && bHasChildren) return 1;
      return a.categoryName.localeCompare(b.categoryName);
    });
  };

  // Navigate into a category
  const navigateIntoCategory = (categoryId: string) => {
    const hasChildren = childCategoriesMap[categoryId]?.length > 0;
    
    if (hasChildren) {
      setNavigationStack(prev => [...prev, categoryId]);
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
      // Optionally close sidebar on mobile after selection
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    }
  };

  // Navigate back
  const navigateBack = () => {
    if (navigationStack.length > 0) {
      const newStack = [...navigationStack];
      newStack.pop();
      setNavigationStack(newStack);
      setSelectedCategory(null);
    }
  };

  // Get current parent category
  const getCurrentParentCategory = (): DBCategory | null => {
    if (navigationStack.length === 0) return null;
    const currentParentId = navigationStack[navigationStack.length - 1];
    return productCategories.find(c => c.id === currentParentId) || null;
  };

  const filteredProducts =
    activeTab === ""
      ? products
      : products.filter((p) => p.categoryId === activeTab);

  const displayProducts = filteredProducts.slice(0, 3); // Show max 3 cards

  if (loading) {
    return (
      <section className="py-10 flex justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }} />
      </section>
    );
  }

  return (
    <section className="pt-4 pb-4 relative">
      <div className="w-full px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left mb-8 flex items-center justify-between"
        >
          <h2
            className="text-3xl text-[#1A1A1A]"
            style={{
              fontFamily: "var(--font-sans), 'Inter', sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Our Product Collection
          </h2>
          
          {/* Shop by Category button - fizzy gold hover effect */}
          <Link
            href="/pharmacy"
            className="shop-by-cat-btn"
          >
            <style>{`
              .shop-by-cat-btn {
                position: relative;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                font-size: 13px;
                font-family: var(--font-sans), 'Inter', sans-serif;
                font-weight: 600;
                letter-spacing: 0.04em;
                color: #1A1A1A;
                background: transparent;
                border: 1.5px solid #d1d5db;
                border-radius: 8px;
                text-decoration: none;
                overflow: hidden;
                transition: color 0.3s ease, border-color 0.3s ease, background 0.3s ease;
                z-index: 0;
              }
              .shop-by-cat-btn::before {
                content: '';
                position: absolute;
                inset: 0;
                background: #D4AF37;
                transform: scaleX(0);
                transform-origin: left;
                transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: -1;
                border-radius: 6px;
              }
              .shop-by-cat-btn:hover::before {
                transform: scaleX(1);
              }
              .shop-by-cat-btn:hover {
                color: #ffffff;
                border-color: #D4AF37;
              }
              .shop-by-cat-btn .btn-spot {
                position: absolute;
                display: block;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: rgba(255,255,255,0.6);
                opacity: 0;
                pointer-events: none;
              }
              .shop-by-cat-btn:hover .btn-spot { animation: fizz 0.8s ease-out forwards; }
              .shop-by-cat-btn:hover .btn-spot:nth-child(1)  { left:10%;  top:80%; animation-delay:0.00s; }
              .shop-by-cat-btn:hover .btn-spot:nth-child(2)  { left:20%;  top:70%; animation-delay:0.05s; }
              .shop-by-cat-btn:hover .btn-spot:nth-child(3)  { left:30%;  top:90%; animation-delay:0.10s; }
              .shop-by-cat-btn:hover .btn-spot:nth-child(4)  { left:40%;  top:75%; animation-delay:0.08s; }
              .shop-by-cat-btn:hover .btn-spot:nth-child(5)  { left:50%;  top:85%; animation-delay:0.03s; }
              .shop-by-cat-btn:hover .btn-spot:nth-child(6)  { left:60%;  top:70%; animation-delay:0.12s; }
              .shop-by-cat-btn:hover .btn-spot:nth-child(7)  { left:70%;  top:90%; animation-delay:0.06s; }
              .shop-by-cat-btn:hover .btn-spot:nth-child(8)  { left:80%;  top:75%; animation-delay:0.09s; }
              .shop-by-cat-btn:hover .btn-spot:nth-child(9)  { left:90%;  top:80%; animation-delay:0.02s; }
              .shop-by-cat-btn:hover .btn-spot:nth-child(10) { left:15%;  top:60%; animation-delay:0.15s; }
              .shop-by-cat-btn:hover .btn-spot:nth-child(11) { left:45%;  top:65%; animation-delay:0.07s; }
              .shop-by-cat-btn:hover .btn-spot:nth-child(12) { left:75%;  top:60%; animation-delay:0.11s; }
              @keyframes fizz {
                0%   { opacity: 0;   transform: translateY(0)   scale(0.5); }
                30%  { opacity: 0.8; transform: translateY(-8px) scale(1);   }
                100% { opacity: 0;   transform: translateY(-20px) scale(0.3); }
              }
            `}</style>
            <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="relative z-10">Shop by Category</span>
            {/* Fizzy spots */}
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="btn-spot" />
            ))}
          </Link>
        </motion.div>

        {/* Sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {navigationStack.length > 0 && (
                <button
                  onClick={navigateBack}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
              )}
              <span className="text-sm font-semibold text-[#1A1A1A] font-sans uppercase truncate">
                {navigationStack.length === 0 ? "Shop by Category" : getCurrentParentCategory()?.categoryName || "Categories"}
              </span>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => {
                setSidebarOpen(false);
                setNavigationStack([]);
                setSelectedCategory(null);
              }}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Category list */}
          <ul className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 80px)" }}>
            {getSortedCategories(getCurrentLevelCategories()).map((cat) => {
              const active = selectedCategory === cat.id;
              const hasChildren = childCategoriesMap[cat.id]?.length > 0;

              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => navigateIntoCategory(cat.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
                    style={{
                      backgroundColor: active ? "#f0f0f0" : "transparent",
                    }}
                  >
                    <span
                      className="text-sm font-sans"
                      style={{ color: active ? "#1A1A1A" : "#3a3a3a", fontWeight: active ? 600 : 400 }}
                    >
                      {cat.categoryName}
                    </span>
                    {hasChildren && (
                      <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-400" />
                    )}
                  </button>
                  <div className="mx-5 h-px bg-gray-100" />
                </li>
              );
            })}
          </ul>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-8 mb-4 flex-wrap">
          {categories.map(c => ({ id: c.id, name: c.name })).map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="relative text-xs tracking-[0.18em] uppercase pb-2 transition-colors duration-200 border-none bg-transparent font-bold"
                style={{ color: active ? "#1A1A1A" : "#6B6B6B", fontFamily: "var(--font-sans), 'Inter', sans-serif" }}>
                {tab.name}
                <span
                  className="absolute left-0 bottom-0 h-[2px] rounded-full"
                  style={{
                    backgroundColor: "#D4AF37",
                    width: active ? "100%" : "0%",
                    transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Mosaic grid */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large card - First product (video or background image) */}
            {displayProducts[0] && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="md:col-span-2 relative group overflow-hidden rounded-sm h-[420px] md:h-[520px] cursor-pointer"
              >
                {/* Video support: handles YouTube, Instagram, or uploaded file */}
                {(displayProducts[0].videoFile || displayProducts[0].videoUrl) ? (
                  <VideoMedia
                    videoUrl={displayProducts[0].videoUrl}
                    videoFile={displayProducts[0].videoFile}
                    title={displayProducts[0].title}
                  />
                ) : displayProducts[0].backgroundImage ? (
                  <Image
                    src={displayProducts[0].backgroundImage}
                    alt={displayProducts[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized={displayProducts[0].backgroundImage.startsWith('/uploads/')}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  {displayProducts[0].subtitle && (
                    <p className="text-[10px] tracking-[0.25em] uppercase font-sans mb-1 text-white/80">
                      {displayProducts[0].subtitle}
                    </p>
                  )}
                  <h3 className="font-heading text-xl text-white mb-3">
                    {displayProducts[0].title}
                  </h3>
                  <Link
                    href="/pharmacy"
                    className="inline-flex items-center gap-1.5 text-xs font-sans text-white border border-white/50 px-4 py-2 rounded-md hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-white transition-all duration-200"
                  >
                    Shop Category
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Small cards - Photo 1 and Photo 2 from the FIRST product */}
            <div className="flex flex-col gap-4">
              {/* Photo 1 */}
              {displayProducts[0]?.photo1Url && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0, duration: 0.5 }}
                  className="relative group overflow-hidden rounded-sm flex-1 min-h-56 cursor-pointer"
                >
                  <Image
                    src={displayProducts[0].photo1Url}
                    alt={displayProducts[0].photo1Title || displayProducts[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized={displayProducts[0].photo1Url.startsWith('/uploads/')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    {displayProducts[0].photo1Subtitle && (
                      <p className="text-[10px] tracking-[0.2em] uppercase font-sans mb-0.5 text-white/80">
                        {displayProducts[0].photo1Subtitle}
                      </p>
                    )}
                    <h3 className="font-heading text-sm text-white">
                      {displayProducts[0].photo1Title || displayProducts[0].title}
                    </h3>
                  </div>
                </motion.div>
              )}

              {/* Photo 2 */}
              {displayProducts[0]?.photo2Url && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="relative group overflow-hidden rounded-sm flex-1 min-h-56 cursor-pointer"
                >
                  <Image
                    src={displayProducts[0].photo2Url}
                    alt={displayProducts[0].photo2Title || displayProducts[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized={displayProducts[0].photo2Url.startsWith('/uploads/')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    {displayProducts[0].photo2Subtitle && (
                      <p className="text-[10px] tracking-[0.2em] uppercase font-sans mb-0.5 text-white/80">
                        {displayProducts[0].photo2Subtitle}
                      </p>
                    )}
                    <h3 className="font-heading text-sm text-white">
                      {displayProducts[0].photo2Title || displayProducts[0].title}
                    </h3>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-[#6B6B6B] text-sm">
            No products available in this category.
          </div>
        )}

      </div>
    </section>
  );
}
