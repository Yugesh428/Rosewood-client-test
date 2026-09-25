"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

// ─── Nav links (also used in mobile drawer) ───────────────────────────────────

export const navLinks = [
  { label: "Home",     href: "/"         },
  { label: "Pharmacy", href: "/pharmacy" },
  { label: "About Us", href: "/about"    },
  { label: "Contact",  href: "/contact"  },
];

// ─── Category Icons map ──────────────────────────────────────────────────────

function CategoryIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes("skin") || n.includes("care"))
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    );
  if (n.includes("hair"))
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M12 2a5 5 0 0 1 5 5c0 3-2 5-5 9-3-4-5-6-5-9a5 5 0 0 1 5-5z"/>
      </svg>
    );
  if (n.includes("vitamin") || n.includes("supplement") || n.includes("health"))
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      </svg>
    );
  if (n.includes("body") || n.includes("bath"))
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M7 21h10M12 21V12M5 3h14l-2 9H7L5 3z"/>
      </svg>
    );
  if (n.includes("fragrance") || n.includes("perfume"))
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M9 3h6l1 4H8L9 3z"/><rect x="6" y="7" width="12" height="13" rx="2"/>
      </svg>
    );
  if (n.includes("make") || n.includes("lip") || n.includes("eye"))
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    );
  // Default
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  );
}

// Icon bg colors cycling for variety
const ICON_COLORS = [
  { bg: "#FEF3C7", color: "#D97706" },
  { bg: "#FCE7F3", color: "#DB2777" },
  { bg: "#E0F2FE", color: "#0284C7" },
  { bg: "#D1FAE5", color: "#059669" },
  { bg: "#EDE9FE", color: "#7C3AED" },
  { bg: "#FEE2E2", color: "#DC2626" },
];

// ─── Mega Menu ────────────────────────────────────────────────────────────────

interface MegaMenuProps {
  categories: NavCategory[];
  onClose: () => void;
}

function MegaMenu({ categories, onClose }: MegaMenuProps) {
  const router = useRouter();
  const topLevel = categories.filter(c => !c.parentId);
  const childrenOf = (id: string) => categories.filter(c => c.parentId === id);

  // Featured blog static data
  const featuredBlog = {
    title: "The Daily Moisturizing Ritual Behind Effortlessly Glowing Skin",
    excerpt: "Build a consistent routine with ingredients your skin actually recognizes.",
    image: "/uploads/ui/products/photo1/230a35de-d2b8-43e5-8764-ecdbd822020d.jpg",
    slug: "daily-moisturizing-ritual-glowing-skin",
  };

  const goTo = (id: string) => {
    onClose();
    router.push(`/pharmacy/category/${id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed left-0 right-0 z-[9990] bg-white"
      style={{
        top: "94px",
        borderTop: "3px solid #D4AF37",
        boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-10 py-8">
        <div className="flex gap-8">

          {/* ── Dynamic category columns ─────────────────────────── */}
          <div className="flex-1">
            {topLevel.length === 0 ? (
              <p className="text-sm text-gray-400 font-sans">No categories yet.</p>
            ) : (
              <div
                className="grid gap-x-8 gap-y-0"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(topLevel.length, 6)}, 1fr)`,
                }}
              >
                {topLevel.map((cat) => {
                  const children = childrenOf(cat.id);
                  return (
                    <div key={cat.id} className="flex flex-col">
                      {/* Column heading */}
                      <button
                        onClick={() => goTo(cat.id)}
                        className="text-left mb-3 group"
                      >
                        <span className="text-[13px] font-bold font-sans text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors leading-snug uppercase tracking-wide">
                          {cat.categoryName}
                        </span>
                      </button>

                      {/* Subcategory links */}
                      <ul className="space-y-0">
                        {children.length > 0 ? (
                          children.map((sub) => (
                            <li key={sub.id}>
                              <button
                                onClick={() => goTo(sub.id)}
                                className="text-left w-full py-[7px] text-[13px] font-sans text-[#444] hover:text-[#D4AF37] transition-colors leading-snug border-b border-gray-100 last:border-0"
                              >
                                {sub.categoryName}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li>
                            <button
                              onClick={() => goTo(cat.id)}
                              className="text-left w-full py-[7px] text-[13px] font-sans text-[#444] hover:text-[#D4AF37] transition-colors leading-snug"
                            >
                              View all
                            </button>
                          </li>
                        )}
                      </ul>

                      {/* View all link for categories with children */}
                      {children.length > 0 && (
                        <button
                          onClick={() => goTo(cat.id)}
                          className="text-left mt-2 text-[11px] font-semibold font-sans text-[#D4AF37] hover:text-[#b8952e] transition-colors tracking-wide"
                        >
                          View all →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom shop links */}
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-6">
              {[
                { label: "Shop all products", href: "/pharmacy" },
                { label: "New arrivals",      href: "/pharmacy?sort=newest" },
                { label: "Best sellers",      href: "/pharmacy?sort=bestsellers" },
                { label: "On sale",           href: "/pharmacy?sort=price_asc" },
              ].map(({ label, href }) => (
                <button
                  key={label}
                  onClick={() => { onClose(); router.push(href); }}
                  className="text-[12px] font-sans font-semibold text-[#1A1A1A] hover:text-[#D4AF37] transition-colors tracking-wide uppercase"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Right: Featured image block ───────────────────────── */}
          <div className="w-[200px] flex-shrink-0 border-l border-gray-100 pl-8">
            <p className="text-[9px] tracking-[0.3em] uppercase font-sans font-semibold text-black/35 mb-4">
              Featured
            </p>
            <div
              className="group rounded-sm overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg"
              style={{ border: "1px solid rgba(0,0,0,0.07)" }}
              onClick={() => { onClose(); router.push(`/articles/${featuredBlog.slug}`); }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={featuredBlog.image}
                  alt={featuredBlog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3 bg-white">
                <p className="text-[10px] tracking-[0.2em] uppercase font-sans font-semibold mb-1.5" style={{ color: "#D4AF37" }}>
                  Latest Article
                </p>
                <p className="text-xs font-sans font-semibold text-[#1A1A1A] leading-snug mb-2 line-clamp-2">
                  {featuredBlog.title}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold font-sans transition-colors" style={{ color: "#D4AF37" }}>
                  Read article
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function UserIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function CartIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function WishlistIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  productName: string;
  productImage: string | null;
  sellingPrice: number;
  category?: { categoryName: string };
}

// ─── Search overlay ───────────────────────────────────────────────────────────

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [latestArticles, setLatestArticles] = useState<{ id: string; title: string; slug: string; coverImage: string; category: string; }[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<SearchResult[]>([]);

  useEffect(() => { 
    inputRef.current?.focus(); 
    
    // Fetch articles and filter to get one article per category (4 unique categories)
    fetch("/api/ui/blog?limit=20")
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          const allArticles = json.data ?? [];
          const seenCategories = new Set<string>();
          const uniqueArticles: typeof allArticles = [];
          
          // Pick one article per category until we have 4
          for (const article of allArticles) {
            if (!seenCategories.has(article.category) && uniqueArticles.length < 4) {
              seenCategories.add(article.category);
              uniqueArticles.push(article);
            }
            if (uniqueArticles.length === 4) break;
          }
          
          setLatestArticles(uniqueArticles);
        }
      })
      .catch(() => {});
    
    // Fetch 3 recommended products
    fetch("/api/products?isActive=true&limit=3")
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setRecommendedProducts(json.data ?? []);
        }
      })
      .catch(() => {});
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/products?search=${encodeURIComponent(q)}&isActive=true&limit=6`);
      const json = await res.json();
      setResults(json.success ? (json.data ?? []) : []);
    } catch { setResults([]); }
    finally  { setLoading(false); }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!val.trim()) { setResults([]); return; }
    timerRef.current = setTimeout(() => search(val), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      onClose();
      router.push(`/pharmacy?search=${encodeURIComponent(query.trim())}`);
    }
    if (e.key === "Escape") onClose();
  };

  const go = (id: string) => { onClose(); router.push(`/pharmacy/${id}`); };
  const viewAll = () => { onClose(); router.push(`/pharmacy?search=${encodeURIComponent(query.trim())}`); };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[9997] bg-black/40"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed right-0 bottom-0 z-[9998] w-full md:w-[480px] bg-white shadow-2xl flex flex-col overflow-hidden"
        style={{ top: "30px" }}
      >
        {/* Search Bar Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-200">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close search"
          >
            <CloseIcon />
          </button>

          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Search"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 rounded-full border border-gray-200 focus:outline-none focus:border-gray-300 transition-colors font-sans text-[#1a1a1a] placeholder:text-gray-400"
            />
            
            {/* Search Icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              ) : (
                <SearchIcon />
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Recommended Products - shown first when empty */}
          {!query.trim() && recommendedProducts.length > 0 && (
            <div className="px-6 pt-8 pb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 font-sans">Recommended Products</h3>
              <div className="space-y-3">
                {recommendedProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => { onClose(); router.push(`/pharmacy/${product.id}`); }}
                    className="w-full flex gap-3 text-left hover:bg-gray-50 rounded-lg transition-colors p-2"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {product.productImage ? (
                        <img src={product.productImage} alt={product.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#D4AF37] text-sm font-bold">
                          {product.productName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-sans line-clamp-2 leading-snug mb-1">{product.productName}</p>
                      <p className="text-xs text-gray-500 font-sans">{product.category?.categoryName ?? ""}</p>
                      <span className="text-sm font-semibold font-sans text-[#D4AF37] mt-1 block">
                        £{Number(product.sellingPrice).toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Latest Articles - shown second when empty */}
          {!query.trim() && latestArticles.length > 0 && (
            <div className="px-6 pb-8 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 font-sans">Latest Articles</h3>
              <div className="space-y-4">
                {latestArticles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => { onClose(); router.push(`/articles/${article.slug}`); }}
                    className="w-full flex gap-3 text-left hover:bg-gray-50 rounded-lg transition-colors p-2"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] tracking-[0.2em] uppercase font-sans font-semibold text-[#D4AF37] mb-1 block">
                        {article.category}
                      </span>
                      <p className="text-sm text-gray-900 font-sans line-clamp-2 leading-snug">{article.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links Section - only if no latest articles and products */}
          {!query.trim() && latestArticles.length === 0 && recommendedProducts.length === 0 && (
            <div className="px-6 py-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 font-sans">Quick links</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    onClick={onClose}
                    className="block text-sm text-gray-700 hover:text-[#D4AF37] transition-colors font-sans"
                  >
                    Find our Store
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/orders"
                    onClick={onClose}
                    className="block text-sm text-gray-700 hover:text-[#D4AF37] transition-colors font-sans"
                  >
                    Manage Subscriptions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/orders"
                    onClick={onClose}
                    className="block text-sm text-gray-700 hover:text-[#D4AF37] transition-colors font-sans"
                  >
                    My Orders
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Search Results */}
          {query.trim() && results.length > 0 && (
            <div className="px-6 py-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 font-sans">Products</h3>
              <ul className="space-y-3">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => go(p.id)}
                      className="w-full flex items-center gap-4 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors px-2"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                        {p.productImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.productImage} alt={p.productName} className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#D4AF37] text-sm font-bold">
                            {p.productName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate font-sans">{p.productName}</p>
                        <p className="text-xs text-gray-500 font-sans">{p.category?.categoryName ?? ""}</p>
                      </div>
                      <span className="text-sm font-semibold font-sans text-[#D4AF37]">
                        £{Number(p.sellingPrice).toFixed(2)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={viewAll}
                className="w-full mt-6 py-3 text-sm font-sans text-center text-[#D4AF37] hover:bg-gray-50 rounded-lg transition-colors"
              >
                View all results for &quot;{query}&quot; →
              </button>
            </div>
          )}

          {/* No Results */}
          {!loading && query.trim().length > 1 && results.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-400 font-sans">No products found for &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── Account Dropdown ─────────────────────────────────────────────────────────

function AccountDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && session?.user;
  const user = session?.user as { name?: string; email?: string; role?: string } | undefined;
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Account"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="transition-opacity hover:opacity-60"
        style={{ color: "var(--color-text-heading)" }}
      >
        <UserIcon />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-9 w-56 rounded-xl overflow-hidden z-[9999] bg-white shadow-2xl"
            style={{ border: "1px solid rgba(0,0,0,0.1)" }}
          >
            {isLoggedIn ? (
              <>
                <div className="px-4 pt-3 pb-2 border-b border-black/8">
                  <p className="text-[9px] tracking-[0.25em] uppercase font-sans text-black/40">Signed in as</p>
                  <p className="text-xs font-semibold truncate font-sans mt-0.5 text-[#1a1a1a]">{user?.name}</p>
                  <p className="text-[10px] truncate font-sans text-black/50">{user?.email}</p>
                </div>

                {isAdmin && (
                  <>
                    <Link href="/admin/dashboard" onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-colors font-sans hover:bg-[#faf8f0]"
                      style={{ color: "var(--color-primary)" }}>
                      <ShieldIcon /> My Dashboard
                    </Link>
                    <div className="mx-4 border-t border-black/8" />
                  </>
                )}

                {!isAdmin && (
                  <>
                    <Link href="/account/orders" onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs transition-colors font-sans text-[#1a1a1a] hover:bg-[#f5f5f5]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                      My Orders
                    </Link>
                    <Link href="/account/wishlist" onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs transition-colors font-sans text-[#1a1a1a] hover:bg-[#f5f5f5]">
                      <WishlistIcon /> My Wishlist
                    </Link>
                    <div className="mx-4 my-1 border-t border-black/8" />
                  </>
                )}

                <button onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 mb-1 text-xs transition-colors font-sans text-left text-red-500 hover:bg-red-50">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[9px] tracking-[0.25em] uppercase font-sans text-black/40">Customer</p>
                </div>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs transition-colors font-sans text-[#1a1a1a] hover:bg-[#f5f5f5]">
                  <UserIcon size={12} /> Sign in
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs transition-colors font-sans text-[#1a1a1a] hover:bg-[#f5f5f5]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                  </svg>
                  Create account
                </Link>
                <div className="mx-4 my-1 border-t border-black/8" />
                <Link href="/track-order" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs transition-colors font-sans text-black/50 hover:bg-[#f5f5f5]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  Track Order
                </Link>
                <div className="mx-4 my-1 border-t border-black/8" />
                <div className="px-4 pt-2 pb-1">
                  <p className="text-[9px] tracking-[0.25em] uppercase font-sans" style={{ color: "var(--color-primary)" }}>Admin</p>
                </div>
                <Link href="/admin/login" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 mb-1 text-xs font-semibold transition-colors font-sans hover:bg-[#faf8f0]"
                  style={{ color: "var(--color-primary)" }}>
                  <ShieldIcon /> Admin portal
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavCategory {
  id: string;
  categoryName: string;
  parentId: string | null;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [categories,  setCategories]  = useState<NavCategory[]>([]);
  const [catLoading,  setCatLoading]  = useState(false);
  const [navigationStack, setNavigationStack] = useState<string[]>([]); // Breadcrumb navigation
  const { totalItems, isOpen: cartOpen, openCart, closeCart } = useCart();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch categories once when drawer first opens
  useEffect(() => {
    if (!mobileOpen || categories.length > 0) return;
    setCatLoading(true);
    fetch("/api/product-categories?isActive=true&limit=100")
      .then(r => r.json())
      .then(json => { if (json.success) setCategories(json.data ?? []); })
      .catch(() => {})
      .finally(() => setCatLoading(false));
  }, [mobileOpen, categories.length]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const topLevelCats  = categories.filter(c => !c.parentId);
  const childrenOf    = (id: string) => categories.filter(c => c.parentId === id);

  // Get current level categories based on navigation stack
  const getCurrentLevelCats = (): NavCategory[] => {
    if (navigationStack.length === 0) {
      return topLevelCats;
    } else {
      const currentParentId = navigationStack[navigationStack.length - 1];
      return childrenOf(currentParentId);
    }
  };

  // Navigate into a category (breadcrumb drill-down)
  const navigateIntoCategory = (catId: string) => {
    const children = childrenOf(catId);
    if (children.length > 0) {
      // Has children - drill down
      setNavigationStack(prev => [...prev, catId]);
    } else {
      // Leaf category - navigate to pharmacy page
      goToCategory(catId);
    }
  };

  // Navigate back one level
  const navigateBack = () => {
    if (navigationStack.length > 0) {
      const newStack = [...navigationStack];
      newStack.pop();
      setNavigationStack(newStack);
    }
  };

  // Get current parent category name
  const getCurrentParentCat = (): NavCategory | null => {
    if (navigationStack.length === 0) return null;
    const currentParentId = navigationStack[navigationStack.length - 1];
    return categories.find(c => c.id === currentParentId) || null;
  };

  const goToCategory = (id: string) => {
    setMobileOpen(false);
    setNavigationStack([]); // Reset navigation
    router.push(`/pharmacy/category/${id}`);
  };

  return (
    <>
      {/* ── Top contact bar ── */}
      <div className="w-full bg-[#1A1A1A] text-white text-[11px] font-sans py-1.5 px-6 flex items-center justify-between z-[9999] fixed top-0 left-0 right-0">
        {/* Left - phone */}
        <div className="flex items-center gap-4">
          <a href="tel:+441234567890" className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.64 5a2 2 0 0 1 1.99-2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z"/>
            </svg>
            +44 123 456 7890
          </a>
          <a href="mailto:info@rosewoodpharmacy.com" className="flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            info@rosewoodpharmacy.com
          </a>
        </div>

        {/* Center - message */}
        <p className="hidden md:block tracking-[0.15em] uppercase text-[10px] text-white/60">
          Free delivery on orders over £50
        </p>

        {/* Right - opening hours */}
        <div className="flex items-center gap-1.5 text-white/70">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
          </svg>
          Mon–Fri: 9am–6pm · Sat: 10am–4pm
        </div>
      </div>

      {/* ── Main bar ── */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 right-0 z-50 transition-shadow duration-300"
        style={{
          top: "30px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid rgba(0,0,0,0.10)",
          boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div className="w-full px-5 md:px-10 h-[64px] grid grid-cols-3 items-center">

          {/* ── LEFT: hamburger ── */}
          <div className="flex items-center">
            <button
              aria-label="Menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="transition-opacity hover:opacity-60"
              style={{ color: "var(--color-text-heading)" }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>

          {/* ── CENTER: logo ── */}
          <div className="flex justify-center">
            <Link href="/" className="flex flex-col items-center leading-none select-none">
              <span
                className="text-[22px] md:text-[26px]"
                style={{
                  color: "#1A1A1A",
                  fontFamily: "'Lucida Calligraphy', 'Lucida Handwriting', 'Palatino Linotype', cursive",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                }}
              >
                Rosewood
              </span>
              <span
                className="font-sans text-[9px] tracking-[0.28em] uppercase mt-0.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                Pharmacy
              </span>
            </Link>
          </div>

          {/* ── RIGHT: search · wishlist · account · cart ── */}
          <div className="flex items-center justify-end gap-5" style={{ color: "var(--color-text-heading)" }}>
            {/* Search */}
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="transition-opacity hover:opacity-60"
            >
              <SearchIcon />
            </button>

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className="transition-opacity hover:opacity-60"
            >
              <WishlistIcon />
            </Link>

            {/* Account */}
            <AccountDropdown />

            {/* Cart */}
            <button
              aria-label="Cart"
              onClick={openCart}
              className="relative transition-opacity hover:opacity-60"
            >
              <CartIcon />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-[16px] h-[16px] text-[8px] font-bold rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-text-heading)", color: "#ffffff" }}
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile full-screen drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 z-50 w-[300px] bg-white flex flex-col pb-10"
              style={{ top: "30px", bottom: 0, borderRight: "1px solid rgba(0,0,0,0.12)", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`.mobile-drawer::-webkit-scrollbar { display: none; }`}</style>
              {/* Close */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-5 left-6 transition-opacity hover:opacity-60"
                style={{ color: "var(--color-text-heading)" }}
              >
                <CloseIcon />
              </button>

              {/* ── Page Links — above categories ── */}
              <div className="px-6 pt-16 pb-4 border-b border-black/8">
                <Link
                  href="/pharmacy"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center py-2.5 text-[15px] font-sans transition-all duration-200 border-b"
                  style={{ color: "var(--color-text-heading)", borderColor: "rgba(0,0,0,0.12)", paddingLeft: "24px" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = "#fdfbf4";
                    e.currentTarget.style.color = "#D4AF37";
                    e.currentTarget.style.paddingLeft = "28px";
                    e.currentTarget.style.borderLeft = "3px solid #D4AF37";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.color = "var(--color-text-heading)";
                    e.currentTarget.style.paddingLeft = "24px";
                    e.currentTarget.style.borderLeft = "";
                  }}
                >
                  Pharmacy
                </Link>
              </div>

              {/* ── Product Categories ── */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-6 py-3">
                  {navigationStack.length > 0 && (
                    <button
                      onClick={navigateBack}
                      className="flex items-center gap-1 text-sm font-sans"
                      style={{ color: "var(--color-primary)" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      Back
                    </button>
                  )}
                  <p className="text-[10px] tracking-[0.25em] uppercase font-sans text-black/35">
                    {navigationStack.length === 0 ? "Shop by Category" : getCurrentParentCat()?.categoryName || "Categories"}
                  </p>
                </div>

                {catLoading ? (
                  <div className="flex justify-center py-6">
                    <svg className="animate-spin w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </div>
                ) : (
                  <ul>
                    {getCurrentLevelCats().map((cat) => {
                      const children = childrenOf(cat.id);
                      const hasChildren = children.length > 0;
                      return (
                        <li key={cat.id}>
                          <button
                            type="button"
                            className="mobile-cat-item w-full flex items-center justify-between px-6 py-4 text-[15px] font-sans border-b text-left transition-all duration-200"
                            style={{ color: "var(--color-text-heading)", borderColor: "rgba(0,0,0,0.12)" }}
                            onClick={() => navigateIntoCategory(cat.id)}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor = "#fdfbf4";
                              e.currentTarget.style.color = "#D4AF37";
                              e.currentTarget.style.paddingLeft = "28px";
                              e.currentTarget.style.borderLeft = "3px solid #D4AF37";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = "";
                              e.currentTarget.style.color = "var(--color-text-heading)";
                              e.currentTarget.style.paddingLeft = "24px";
                              e.currentTarget.style.borderLeft = "";
                            }}
                          >
                            {cat.categoryName}
                            {hasChildren && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-gray-400">
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Search overlay ── */}
      <AnimatePresence>
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>

      {/* ── Cart Drawer ── */}
      <CartDrawer open={cartOpen} onClose={closeCart} />
    </>
  );
}
