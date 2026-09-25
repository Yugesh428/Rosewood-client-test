"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight,
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
  { label: "Name: A → Z",       value: "name_asc"    },
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

// ─── Category Icon component ─────────────────────────────────────────────────

function CategoryIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes("skin") || n.includes("care"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
  if (n.includes("hair"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 2a5 5 0 0 1 5 5c0 3-2 5-5 9-3-4-5-6-5-9a5 5 0 0 1 5-5z"/></svg>;
  if (n.includes("vitamin") || n.includes("supplement") || n.includes("nutrition"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
  if (n.includes("body") || n.includes("bath"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M7 21h10M12 21V12M5 3h14l-2 9H7L5 3z"/></svg>;
  if (n.includes("cold") || n.includes("flu") || n.includes("fever"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="4"/></svg>;
  if (n.includes("allerg"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
  if (n.includes("eye"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  if (n.includes("ear"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 8.5a6 6 0 1 1 11.93 1c-.17 1.39-.91 2.61-1.93 3.5-1.5 1.3-2 2.5-2 4v.5a1.5 1.5 0 0 1-3 0v-.5"/><circle cx="12" cy="21" r="1"/></svg>;
  if (n.includes("baby") || n.includes("mother"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="8" r="4"/><path d="M8 16H6a2 2 0 0 0-2 2v2h16v-2a2 2 0 0 0-2-2h-2"/></svg>;
  if (n.includes("diabet"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
  if (n.includes("pain"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
  if (n.includes("digest") || n.includes("stomach"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><ellipse cx="12" cy="12" rx="10" ry="7"/><path d="M12 5v14M5 12h14"/></svg>;
  if (n.includes("heart"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
  if (n.includes("medicine") || n.includes("medical"))
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
  // Default
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
}

const ICON_COLORS = [
  { bg: "#FEF3C7", color: "#D97706" },
  { bg: "#FCE7F3", color: "#DB2777" },
  { bg: "#E0F2FE", color: "#0284C7" },
  { bg: "#D1FAE5", color: "#059669" },
  { bg: "#EDE9FE", color: "#7C3AED" },
  { bg: "#FEE2E2", color: "#DC2626" },
  { bg: "#FEF9C3", color: "#CA8A04" },
  { bg: "#DCFCE7", color: "#16A34A" },
];

// ─── Mega Menu Category Bar (single-line nav with hover dropdowns + expand) ──

function MegaMenuBar({ categories, selectedCategory, onSelect }: {
  categories: DBCategory[];
  selectedCategory: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [visibleLines, setVisibleLines] = useState(1);  const containerRef = useRef<HTMLDivElement>(null);
  const [itemsPerLine, setItemsPerLine] = useState<number[]>([]);

  const topLevel   = categories.filter(c => !c.parentId);
  const childrenOf = (id: string) => categories.filter(c => c.parentId === id);

  // All items including "All Products"
  const allItems = [{ id: "__all__", categoryName: "All Products" }, ...topLevel];

  // Measure how many items fit per line
  useEffect(() => {
    if (!containerRef.current || allItems.length === 0) return;

    const measure = () => {
      const container = containerRef.current;
      if (!container) return;
      const MORE_BTN_WIDTH = 140; // increased reserved space for "+ N more" button
      const availableWidth = container.offsetWidth - MORE_BTN_WIDTH;

      const temp = document.createElement("div");
      temp.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;font-size:13px;font-family:sans-serif;";
      document.body.appendChild(temp);

      const widths: number[] = [];
      allItems.forEach(item => {
        temp.textContent = item.categoryName;
        widths.push(temp.offsetWidth + 32); // 32px = px-4 * 2
      });
      document.body.removeChild(temp);

      // Find how many items fit in one line
      const lines: number[] = []; // stores the start index of each overflow line
      let lineWidth = 0;
      let lineStart = 0;

      for (let i = 0; i < widths.length; i++) {
        if (lineWidth + widths[i] > availableWidth && i > lineStart) {
          lines.push(i); // line break at i
          lineStart = i;
          lineWidth = widths[i];
        } else {
          lineWidth += widths[i];
        }
      }

      setItemsPerLine(lines);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [allItems.length]);

  // line 1 always shows exactly items 0..firstBreak, never changes
  const firstBreak = itemsPerLine.length > 0 ? itemsPerLine[0] : allItems.length;
  const line1Items = allItems.slice(0, firstBreak);
  const line2Items = allItems.slice(firstBreak);
  const hasMore    = line2Items.length > 0;
  const showLine2  = visibleLines > 1;

  return (
    <div
      className="relative z-30 bg-white overflow-visible"
      style={{
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div className="w-full">

        {/* ── Line 1: always single row, no wrap ── */}
        <div ref={containerRef} className="flex items-center overflow-visible pr-2">
          <style>{`
            .cat-btn {
              position: relative;
              background: transparent;
              border: none;
              cursor: pointer;
              font-family: var(--font-brandon), 'Josefin Sans', sans-serif;
              letter-spacing: 0.04em;
              font-weight: 700;
              font-size: 13px;
            }
            .cat-btn::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              width: 0%;
              height: 2px;
              background-color: #D4AF37;
              transition: width 0.25s ease;
            }
            .cat-btn:hover::after {
              width: 100%;
            }
            .cat-btn.active::after {
              width: 100%;
            }
            .cat-item .cat-dropdown {
              display: none;
            }
            .cat-item:hover .cat-dropdown {
              display: block;
            }
          `}</style>

          {line1Items.map((cat, idx) => {
            const isAll    = cat.id === "__all__";
            const children = isAll ? [] : childrenOf(cat.id);
            const isActive = isAll
              ? selectedCategory === null
              : selectedCategory === cat.id || children.some(c => c.id === selectedCategory);

            return (
              <div key={cat.id} className="cat-item relative flex-shrink-0">
                {isAll ? (
                  <button
                    onClick={() => onSelect(null)}
                    className={`cat-btn ${idx === 0 ? "pl-5 md:pl-10 pr-4" : "px-4"} py-3 whitespace-nowrap${isActive ? " active" : ""}`}
                    style={{ color: "#1A1A1A", fontWeight: isActive ? 700 : 400 }}
                  >
                    {cat.categoryName}
                  </button>
                ) : (
                  <a
                    href={`/pharmacy/category/${cat.id}`}
                    className={`cat-btn ${idx === 0 ? "pl-5 md:pl-10 pr-4" : "px-4"} py-3 whitespace-nowrap block${isActive ? " active" : ""}`}
                    style={{ color: "#1A1A1A", fontWeight: isActive ? 700 : 400 }}
                  >
                    {cat.categoryName}
                  </a>
                )}

                {!isAll && children.length > 0 && (
                  <div className="cat-dropdown absolute top-full left-0 bg-white z-50 py-2 min-w-[200px]"
                    style={{ borderTop: "2px solid #D4AF37", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                    <a
                      href={`/pharmacy/category/${cat.id}`}
                      className="block w-full text-left px-4 py-2 text-[11px] font-bold uppercase tracking-widest border-b border-gray-100 hover:text-[#D4AF37] transition-colors"
                      style={{ color: isActive ? "#D4AF37" : "#1A1A1A", fontFamily: "var(--font-brandon), 'Josefin Sans', sans-serif" }}>
                      All {cat.categoryName}
                    </a>
                    {children.map((sub) => (
                      <a
                        key={sub.id}
                        href={`/pharmacy/category/${sub.id}`}
                        className="block w-full text-left px-4 py-2 text-[12px] transition-colors hover:text-[#D4AF37] hover:bg-[#FEFBF0]"
                        style={{ color: selectedCategory === sub.id ? "#D4AF37" : "#444", fontWeight: selectedCategory === sub.id ? 600 : 400, fontFamily: "var(--font-brandon), 'Josefin Sans', sans-serif" }}>
                        {sub.categoryName}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* + more / − less — always end of line 1 */}
          {line2Items.length > 0 && (
            <button
              onClick={() => setVisibleLines(v => v > 1 ? 1 : 2)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-3 text-[12px] font-semibold font-sans transition-colors whitespace-nowrap"
              style={{ color: "#D4AF37" }}
            >
              <span className="w-[18px] h-[18px] rounded-full border-2 border-[#D4AF37] flex items-center justify-center text-[12px] leading-none font-bold">
                {showLine2 ? "−" : "+"}
              </span>
              {showLine2 ? "less" : `${line2Items.length} more`}
            </button>
          )}
        </div>

        {/* ── Line 2: extra categories, shown on demand ── */}
        {showLine2 && (
          <div className="flex flex-wrap items-center border-t border-gray-100 pl-5 md:pl-10">
            {line2Items.map((cat) => {
              const isAll    = cat.id === "__all__";
              const children = isAll ? [] : childrenOf(cat.id);
              const isActive = isAll
                ? selectedCategory === null
                : selectedCategory === cat.id || children.some(c => c.id === selectedCategory);

              return (
                <div key={cat.id} className="cat-item relative flex-shrink-0">
                  {isAll ? (
                    <button
                      onClick={() => onSelect(null)}
                      className={`cat-btn px-4 py-3 whitespace-nowrap${isActive ? " active" : ""}`}
                      style={{ color: "#1A1A1A", fontWeight: isActive ? 700 : 400 }}
                    >
                      {cat.categoryName}
                    </button>
                  ) : (
                    <a
                      href={`/pharmacy/category/${cat.id}`}
                      className={`cat-btn px-4 py-3 whitespace-nowrap block${isActive ? " active" : ""}`}
                      style={{ color: "#1A1A1A", fontWeight: isActive ? 700 : 400 }}
                    >
                      {cat.categoryName}
                    </a>
                  )}

                  {!isAll && children.length > 0 && (
                    <div className="cat-dropdown absolute top-full left-0 bg-white z-50 py-2 min-w-[200px]"
                      style={{ borderTop: "2px solid #D4AF37", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                      <a
                        href={`/pharmacy/category/${cat.id}`}
                        className="block w-full text-left px-4 py-2 text-[11px] font-bold uppercase tracking-widest border-b border-gray-100 hover:text-[#D4AF37] transition-colors"
                        style={{ color: isActive ? "#D4AF37" : "#1A1A1A", fontFamily: "var(--font-brandon), 'Josefin Sans', sans-serif" }}>
                        All {cat.categoryName}
                      </a>
                      {children.map((sub) => (
                        <a
                          key={sub.id}
                          href={`/pharmacy/category/${sub.id}`}
                          className="block w-full text-left px-4 py-2 text-[12px] transition-colors hover:text-[#D4AF37] hover:bg-[#FEFBF0]"
                          style={{ color: selectedCategory === sub.id ? "#D4AF37" : "#444", fontWeight: selectedCategory === sub.id ? 600 : 400, fontFamily: "var(--font-brandon), 'Josefin Sans', sans-serif" }}>
                          {sub.categoryName}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
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
      if (sort === "name_asc")   return a.productName.localeCompare(b.productName);
      return 0;
    });

  const paginated  = filtered.slice(0, visibleCount);
  const hasMore    = visibleCount < filtered.length;
  const resetPage  = () => setVisibleCount(PER_PAGE);

  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: '94px' }}>

      {/* ── Mega Menu Category Bar - Sticky at top, hideable ── */}
      <div className="hidden md:block sticky top-[94px] z-20 overflow-visible">
        <MegaMenuBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={(id) => { setSelectedCategory(id); resetPage(); }}
        />
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Products Area - Full Width */}
      <div className="w-full px-5 md:px-10 py-4 md:py-6">
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
              <label htmlFor="sort-pharmacy" className="text-sm text-gray-600 font-sans hidden sm:block">Sort:</label>
              <select
                id="sort-pharmacy"
                value={sort}
                onChange={(e) => { setSort(e.target.value); resetPage(); }}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 font-sans text-gray-700 focus:outline-none focus:border-[#D4AF37] transition-colors"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
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
