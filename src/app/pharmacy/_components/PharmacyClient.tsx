"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown, ChevronLeft, ChevronRight,
  ShoppingCart, Star,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import ProductImage from "@/components/ui/ProductImage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DBCategory {
  id: string;
  categoryName: string;
  isActive: boolean;
  parentId: string | null;
}

interface DBProduct {
  id: string;
  categoryId: string;
  productName: string;
  productImage: string | null;
  sellingPrice: number;
  originalPrice: number;
  discount: number;
  isActive: boolean;
  category?: { id: string; categoryName: string };
}

interface PharmacyClientProps {
  categories: DBCategory[];
  products: DBProduct[];
}

const SORT_OPTIONS = [
  { label: "Recommended",       value: "recommended" },
  { label: "Price: Low → High", value: "price_asc"   },
  { label: "Price: High → Low", value: "price_desc"  },
];

const PER_PAGE = 8;

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star key={star} className="w-3 h-3"
            fill={star <= Math.round(rating) ? "var(--color-primary)" : "none"}
            stroke={star <= Math.round(rating) ? "var(--color-primary)" : "#d1d5db"}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span className="text-[10px] text-gray-400 font-sans">({count})</span>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, highlight = false }: { product: DBProduct; highlight?: boolean }) {
  const { addToCart, items, updateQty } = useCart();
  const cartItem = items.find(i => i.id === product.id);
  const inCart   = !!cartItem;
  const price    = Number(product.sellingPrice);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ 
      id: product.id, 
      name: product.productName, 
      price, 
      image: product.productImage ?? "", 
      category: product.category?.categoryName ?? "" 
    });
    toast.success("Added to cart");
  };

  return (
    <Link 
      href={`/pharmacy/${product.id}`}
      className="block bg-white rounded-lg group hover:shadow-lg transition-shadow duration-300 relative overflow-hidden"
    >
      <style>{`
        .btn-flip-cart {
          opacity: 1;
          outline: 0;
          color: #fff;
          line-height: 40px;
          position: relative;
          text-align: center;
          letter-spacing: 0.15em;
          display: inline-block;
          text-decoration: none;
          font-family: var(--font-sans), 'Open Sans', sans-serif;
          font-size: 10px;
          text-transform: uppercase;
          cursor: pointer;
          border: none;
          background: transparent;
        }
        .btn-flip-cart:after {
          top: 0;
          left: 0;
          opacity: 0;
          width: 100%;
          color: #1A1A1A;
          display: block;
          transition: 0.45s cubic-bezier(0.23, 1, 0.32, 1);
          position: absolute;
          background: rgba(212, 175, 55, 0.95);
          content: attr(data-back);
          transform: translateY(-50%) rotateX(90deg);
          padding: 0 28px;
          border-radius: 999px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px rgba(212, 175, 55, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        .btn-flip-cart:before {
          top: 0;
          left: 0;
          opacity: 1;
          color: #D4AF37;
          display: block;
          padding: 0 28px;
          line-height: 40px;
          transition: 0.45s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(212, 175, 55, 0.4);
          content: attr(data-front);
          transform: translateY(0) rotateX(0);
          border-radius: 999px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }
        .btn-flip-cart:hover:after {
          opacity: 1;
          transform: translateY(0) rotateX(0);
        }
        .btn-flip-cart:hover:before {
          opacity: 0;
          transform: translateY(50%) rotateX(90deg);
        }
        .btn-flip-cart:active {
          transform: scale(0.97);
        }
      `}</style>

      {/* Image container — contain so full product is always visible */}
      <div className="relative aspect-square bg-white overflow-hidden">
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 z-10 text-white text-[9px] font-semibold px-2 py-0.5 uppercase tracking-wide bg-[#c0392b]">
            -{product.discount}%
          </span>
        )}
        <ProductImage 
          src={product.productImage} 
          alt={product.productName} 
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" 
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized={product.productImage?.startsWith('http')}
        />

        {/* Add to cart button — floats over image on hover */}
        <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={handleAddToCart}
            className="btn-flip-cart"
            data-front="Add to Cart"
            data-back="Add to Cart"
          />
        </div>
      </div>

      {/* Product info */}
      <div className="p-3 text-center">
        {/* Category */}
        {product.category?.categoryName && (
          <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1 font-sans">
            {product.category.categoryName}
          </p>
        )}
        
        {/* Product name */}
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 font-sans leading-snug">
          {product.productName}
        </h3>

        {/* Price row */}
        <div className="flex items-center justify-center gap-2">
          <p className="text-sm font-semibold text-gray-900 font-sans">£{price.toFixed(2)}</p>
          {Number(product.originalPrice) > price && (
            <p className="text-xs text-red-400 line-through font-sans">£{Number(product.originalPrice).toFixed(2)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Mega Menu Category Bar (horizontal, top, hideable) ──────────────────────

const PHARMACY_BAR_KEY = "rosewood_pharmacy_bar_hidden";

function MegaMenuBar({ categories, selectedCategory, onSelect }: {
  categories: DBCategory[];
  selectedCategory: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const topLevel = categories.filter(c => !c.parentId);
  const childrenOf = (id: string) => categories.filter(c => c.parentId === id);

  useEffect(() => {
    const saved = localStorage.getItem(PHARMACY_BAR_KEY);
    // Default is visible (false = not hidden), only hide if explicitly saved as "true"
    setHidden(saved === "true");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(PHARMACY_BAR_KEY, String(hidden));
  }, [hidden, mounted]);

  return (
    <div className="bg-white border-b border-gray-200 relative z-30">
      {/* Animated wrapper — overflow hidden only during animation, visible when open so dropdowns work */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: hidden ? "0fr" : "1fr",
          opacity: hidden ? 0 : 1,
          transition: "grid-template-rows 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
        }}
      >
        <div style={{ overflow: hidden ? "hidden" : "visible" }}>
        <div ref={contentRef} className="w-full px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* All Products */}
            <button
              onClick={() => { onSelect(null); setActiveMenu(null); }}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs font-sans font-medium transition-all rounded-full whitespace-nowrap"
              style={{
                color: selectedCategory === null ? "#D4AF37" : "#374151",
                backgroundColor: selectedCategory === null ? "#fdfbf4" : "transparent",
                border: selectedCategory === null ? "1px solid #D4AF37" : "1px solid #E5E7EB",
              }}
            >
              All Products
            </button>

            {/* Top-level categories */}
            {topLevel.map(cat => {
              const children = childrenOf(cat.id);
              const isActive = selectedCategory === cat.id || children.some(c => c.id === selectedCategory);
              const isOpen = activeMenu === cat.id;

              return (
                <div
                  key={cat.id}
                  className="relative flex-shrink-0"
                  onMouseEnter={() => children.length > 0 && setActiveMenu(cat.id)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <button
                    onClick={() => { onSelect(cat.id); setActiveMenu(null); }}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-sans font-medium transition-all rounded-full whitespace-nowrap"
                    style={{
                      color: isActive ? "#D4AF37" : "#374151",
                      backgroundColor: isActive ? "#fdfbf4" : "transparent",
                      border: isActive ? "1px solid #D4AF37" : "1px solid #E5E7EB",
                    }}
                  >
                    {cat.categoryName}
                    {children.length > 0 && (
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    )}
                  </button>

                  {/* Subcategory dropdown on hover */}
                  {children.length > 0 && isOpen && (
                    <div
                      className="absolute top-full left-0 mt-1 bg-white shadow-xl border border-gray-100 z-50 min-w-[200px] py-2 rounded-md"
                      style={{ borderTop: "2px solid #D4AF37" }}
                      onMouseEnter={() => setActiveMenu(cat.id)}
                      onMouseLeave={() => setActiveMenu(null)}
                    >
                      <button
                        onClick={() => { onSelect(cat.id); setActiveMenu(null); }}
                        className="w-full text-left px-4 py-2 text-xs font-sans font-semibold border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        style={{ color: "#D4AF37" }}
                      >
                        All {cat.categoryName}
                      </button>
                      {children.map(child => (
                        <button
                          key={child.id}
                          onClick={() => { onSelect(child.id); setActiveMenu(null); }}
                          className="w-full text-left px-4 py-2 text-xs font-sans transition-colors hover:bg-gray-50"
                          style={{
                            color: selectedCategory === child.id ? "#D4AF37" : "#374151",
                            fontWeight: selectedCategory === child.id ? 600 : 400,
                            backgroundColor: selectedCategory === child.id ? "#fdfbf4" : "",
                          }}
                        >
                          {child.categoryName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </div>

      {/* Toggle tab — always visible at the bottom edge of the bar */}
      <button
        onClick={() => setHidden(v => !v)}
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-3 py-1 rounded-b-full bg-white border border-t-0 border-gray-200 text-[10px] font-sans text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all shadow-sm"
      >
        {hidden ? (
          <>
            <ChevronDown className="w-3 h-3" />
            <span>Show Categories</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3 rotate-180" />
            <span>Hide</span>
          </>
        )}
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PharmacyClient({ categories, products }: PharmacyClientProps) {
  const { totalItems } = useCart();
  const searchParams   = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort,    setSort]    = useState("recommended");
  const [visibleCount, setVisibleCount] = useState(PER_PAGE);
  const [cartOpen,    setCartOpen]    = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const urlSearch  = searchParams.get("search")  ?? "";
  const urlProduct = searchParams.get("product") ?? "";
  const urlCategory = searchParams.get("category") ?? "";

  useEffect(() => {
    if (!urlProduct) return;
    const el = document.getElementById(`product-${urlProduct}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [urlProduct]);

  // Set category from URL on mount
  useEffect(() => {
    if (urlCategory && categories.some(c => c.id === urlCategory)) {
      setSelectedCategory(urlCategory);
    }
  }, [urlCategory, categories]);

  const categoryList = [
    { id: null, label: "All" },
    ...categories.map(cat => ({ id: cat.id, label: cat.categoryName })),
  ];

  const filtered = products
    .filter(p => !selectedCategory || p.categoryId === selectedCategory)
    .filter(p => {
      const search = catalogSearch || urlSearch;
      if (!search) return true;
      return p.productName.toLowerCase().includes(search.toLowerCase()) ||
        (p.category?.categoryName ?? "").toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (sort === "price_asc")  return Number(a.sellingPrice) - Number(b.sellingPrice);
      if (sort === "price_desc") return Number(b.sellingPrice) - Number(a.sellingPrice);
      return 0;
    });

  const paginated  = filtered.slice(0, visibleCount);
  const hasMore    = visibleCount < filtered.length;
  const resetPage  = () => setVisibleCount(PER_PAGE);

  return (
    <div className="min-h-screen bg-[#F9F9F9]" style={{ paddingTop: '94px' }}>

      {/* ── Page Header: PAGES > Pharmacy ── */}
      <div className="bg-white border-b border-gray-100 px-6 md:px-12 py-3">
        <div className="flex items-center gap-2 text-xs font-sans text-gray-400 uppercase tracking-widest">
          <span>Pages</span>
          <span className="text-gray-300">›</span>
          <span className="text-gray-700 font-semibold">Pharmacy</span>
        </div>
      </div>

      {/* ── Mega Menu Category Bar - Sticky at top, hideable ── */}
      <div className="hidden md:block sticky top-[94px] z-20">
        <MegaMenuBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={(id) => { setSelectedCategory(id); resetPage(); }}
        />
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Products Area - Full Width */}
      <div className="w-full px-6 md:px-12 py-4 md:py-6">
        <div className="w-full">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <p className="text-sm text-gray-500 font-sans">
              Showing <span className="font-semibold font-heading" style={{ color: "var(--color-text-heading)" }}>1-{paginated.length} of {filtered.length}</span> products
              {urlSearch && <span className="ml-1.5"> for <span className="font-medium" style={{ color: "var(--color-text-heading)" }}>&quot;{urlSearch}&quot;</span></span>}
              {selectedCategory && (
                <button onClick={() => { setSelectedCategory(null); resetPage(); }}
                  className="ml-2 text-[11px] hover:underline" style={{ color: "var(--color-primary)" }}>
                  × Clear
                </button>
              )}
            </p>
            <div className="flex items-center gap-2">
            </div>
          </div>

          {/* Grid — 4 products per row */}
          {paginated.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-gray-400 font-sans text-sm">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginated.map(product => (
                <div key={product.id} id={`product-${product.id}`}>
                  <ProductCard product={product} highlight={urlProduct === product.id} />
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setVisibleCount(v => v + PER_PAGE)}
                className="px-10 py-3 text-xs uppercase tracking-widest font-sans font-medium border transition-all duration-300 rounded-full hover:scale-105"
                style={{
                  borderColor: "#D4AF37",
                  color: "#D4AF37",
                  background: "transparent",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#D4AF37";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#D4AF37";
                }}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
