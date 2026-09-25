"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, ChevronUp, Home } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import ProductImage from "@/components/ui/ProductImage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DBCategory {
  id: string;
  categoryName: string;
  categoryDescription: string;
  isActive: boolean;
  parentId: string | null;
  subCategories?: { id: string; categoryName: string; isActive: boolean }[];
  parentCategory?: { id: string; categoryName: string } | null;
}

interface FlatCategory {
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
  dosageForm?: string;
  packSize?: string;
  suitableFor?: string[];
}

interface CategoryLandingClientProps {
  category: DBCategory;
  products: DBProduct[];
  allCategories: FlatCategory[];
  activeCategoryId: string;
}

// ─── Category Nav Bar (same style as pharmacy page) ──────────────────────────

function CategoryNavBar({ categories, activeCategoryId }: {
  categories: FlatCategory[];
  activeCategoryId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleLines, setVisibleLines] = useState(1);
  const [itemsPerLine, setItemsPerLine] = useState<number[]>([]);

  const topLevel   = categories.filter(c => !c.parentId);
  const childrenOf = (id: string) => categories.filter(c => c.parentId === id);
  const allItems   = [{ id: "__all__", categoryName: "All Products", isActive: true, parentId: null }, ...topLevel];

  useEffect(() => {
    if (!containerRef.current || allItems.length === 0) return;
    const measure = () => {
      const container = containerRef.current;
      if (!container) return;
      const MORE_BTN_WIDTH = 100;
      const availableWidth = container.offsetWidth - MORE_BTN_WIDTH;
      const temp = document.createElement("div");
      temp.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;font-size:11px;font-family:sans-serif;letter-spacing:0.08em;text-transform:uppercase;";
      document.body.appendChild(temp);
      const widths: number[] = [];
      allItems.forEach(item => {
        temp.textContent = item.categoryName;
        widths.push(temp.offsetWidth + 32);
      });
      document.body.removeChild(temp);
      const lines: number[] = [];
      let lineWidth = 0, lineStart = 0;
      for (let i = 0; i < widths.length; i++) {
        if (lineWidth + widths[i] > availableWidth && i > lineStart) {
          lines.push(i); lineStart = i; lineWidth = widths[i];
        } else { lineWidth += widths[i]; }
      }
      setItemsPerLine(lines);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [allItems.length]);

  const firstBreak = itemsPerLine.length > 0 ? itemsPerLine[0] : allItems.length;
  const line1Items = allItems.slice(0, firstBreak);
  const line2Items = allItems.slice(firstBreak);
  const hasMore    = line2Items.length > 0;
  const showLine2  = visibleLines > 1;

  const isActiveItem = (cat: FlatCategory) => {
    const children = childrenOf(cat.id);
    return cat.id === activeCategoryId || children.some(c => c.id === activeCategoryId);
  };

  return (
    <div className="relative z-30 bg-white overflow-visible"
      style={{ borderBottom: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      {/* No container padding — each row handles its own left indent */}
      <div className="w-full">
        <div ref={containerRef} className="flex items-center overflow-visible pr-5 md:pr-10">
          <style>{`
            .cnav-btn {
              position: relative;
              background: transparent;
              border: none;
              cursor: pointer;
              font-family: var(--font-brandon), 'Josefin Sans', sans-serif;
              letter-spacing: 0.04em;
              font-weight: 700;
              font-size: 13px;
            }
            .cnav-btn::after {
              content: '';
              position: absolute;
              bottom: 0; left: 0;
              width: 0%;
              height: 2px;
              background-color: #D4AF37;
              transition: width 0.25s ease;
            }
            .cnav-btn:hover::after, .cnav-btn.active::after { width: 100%; }
            .cnav-item .cnav-dropdown { display: none; }
            .cnav-item:hover .cnav-dropdown { display: block; }
          `}</style>

          {/* Category items — first item gets left indent matching Navbar hamburger */}
          {line1Items.map((cat, idx) => {
            const isAll    = cat.id === "__all__";
            const children = isAll ? [] : childrenOf(cat.id);
            const isActive = !isAll && isActiveItem(cat);
            const firstItemPadding = idx === 0 ? "pl-5 md:pl-10 pr-4" : "px-4";
            return (
              <div key={cat.id} className="cnav-item relative flex-shrink-0">
                <a
                  href={isAll ? "/pharmacy" : `/pharmacy/category/${cat.id}`}
                  className={`cnav-btn ${firstItemPadding} py-3 whitespace-nowrap block${isActive ? " active" : ""}`}
                  style={{ color: "#1A1A1A", fontWeight: isActive ? 700 : 400 }}
                >
                  {cat.categoryName}
                </a>
                {!isAll && children.length > 0 && (
                  <div className="cnav-dropdown absolute top-full left-0 bg-white z-50 py-2 min-w-[200px]"
                    style={{ borderTop: "2px solid #D4AF37", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                    <a href={`/pharmacy/category/${cat.id}`}
                      className="block px-4 py-2 text-[11px] font-bold uppercase tracking-widest border-b border-gray-100 hover:text-[#D4AF37] transition-colors"
                      style={{ color: isActive ? "#D4AF37" : "#1A1A1A", fontFamily: "var(--font-brandon), 'Josefin Sans', sans-serif" }}>
                      All {cat.categoryName}
                    </a>
                    {children.map(sub => (
                      <a key={sub.id} href={`/pharmacy/category/${sub.id}`}
                        className="block px-4 py-2 text-[12px] transition-colors hover:text-[#D4AF37] hover:bg-[#FEFBF0]"
                        style={{ color: sub.id === activeCategoryId ? "#D4AF37" : "#444", fontWeight: sub.id === activeCategoryId ? 600 : 400, fontFamily: "var(--font-brandon), 'Josefin Sans', sans-serif" }}>
                        {sub.categoryName}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* More button */}
          {line2Items.length > 0 && (
            <button onClick={() => setVisibleLines(v => v > 1 ? 1 : 2)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-3 text-[12px] font-semibold font-sans transition-colors whitespace-nowrap ml-auto"
              style={{ color: "#D4AF37" }}>
              <span className="w-[18px] h-[18px] rounded-full border-2 border-[#D4AF37] flex items-center justify-center text-[12px] leading-none font-bold">
                {showLine2 ? "−" : "+"}
              </span>
              {showLine2 ? "less" : `${line2Items.length} more`}
            </button>
          )}
        </div>

        {showLine2 && (
          <div className="flex flex-wrap items-center border-t border-gray-100 pl-5 md:pl-10">
            {line2Items.map((cat) => {
              const isAll    = cat.id === "__all__";
              const children = isAll ? [] : childrenOf(cat.id);
              const isActive = !isAll && isActiveItem(cat);
              return (
                <div key={cat.id} className="cnav-item relative flex-shrink-0">
                  <a href={isAll ? "/pharmacy" : `/pharmacy/category/${cat.id}`}
                    className={`cnav-btn px-4 py-3 whitespace-nowrap block${isActive ? " active" : ""}`}
                    style={{ color: "#1A1A1A", fontWeight: isActive ? 700 : 400 }}>
                    {cat.categoryName}
                  </a>
                  {!isAll && children.length > 0 && (
                    <div className="cnav-dropdown absolute top-full left-0 bg-white z-50 py-2 min-w-[200px]"
                      style={{ borderTop: "2px solid #D4AF37", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                      <a href={`/pharmacy/category/${cat.id}`}
                        className="block px-4 py-2 text-[11px] font-bold uppercase tracking-widest border-b border-gray-100 hover:text-[#D4AF37] transition-colors"
                        style={{ color: "#1A1A1A", fontFamily: "var(--font-brandon), 'Josefin Sans', sans-serif" }}>
                        All {cat.categoryName}
                      </a>
                      {children.map(sub => (
                        <a key={sub.id} href={`/pharmacy/category/${sub.id}`}
                          className="block px-4 py-2 text-[12px] transition-colors hover:text-[#D4AF37] hover:bg-[#FEFBF0]"
                          style={{ color: sub.id === activeCategoryId ? "#D4AF37" : "#444", fontWeight: sub.id === activeCategoryId ? 600 : 400, fontFamily: "var(--font-brandon), 'Josefin Sans', sans-serif" }}>
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

const SORT_OPTIONS = [
  { label: "Recommended",       value: "recommended" },
  { label: "Price: Low → High", value: "price_asc"   },
  { label: "Price: High → Low", value: "price_desc"  },
  { label: "Name: A → Z",       value: "name_asc"    },
];

const PER_PAGE = 12;

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: DBProduct }) {
  const { addToCart } = useCart();
  const price = Number(product.sellingPrice);

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

      {/* Image container */}
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

        {/* Add to cart button */}
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

// ─── Filter Section Component ─────────────────────────────────────────────────

function FilterSection({ 
  title, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left font-sans font-medium text-gray-900 text-sm"
      >
        {title}
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CategoryLandingClient({ category, products, allCategories, activeCategoryId }: CategoryLandingClientProps) {
  const [sort, setSort] = useState("recommended");
  const [visibleCount, setVisibleCount] = useState(PER_PAGE);
  const [cartOpen, setCartOpen] = useState(false);

  // ── Active filter state ──
  const [selectedForms, setSelectedForms]         = useState<Set<string>>(new Set());
  const [selectedSizes, setSelectedSizes]         = useState<Set<string>>(new Set());
  const [selectedSuitable, setSelectedSuitable]   = useState<Set<string>>(new Set());

  // ── Extract unique filter values from products ──
  const uniqueDosageForms  = Array.from(new Set(products.map(p => p.dosageForm).filter(Boolean))) as string[];
  const uniquePackSizes    = Array.from(new Set(products.map(p => p.packSize).filter(Boolean))) as string[];
  const uniqueSuitableFor  = Array.from(new Set(products.flatMap(p => p.suitableFor || [])));

  // ── Toggle helpers ──
  const toggle = (set: Set<string>, val: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setter(next);
    setVisibleCount(PER_PAGE); // reset pagination on filter change
  };

  const clearAll = () => {
    setSelectedForms(new Set());
    setSelectedSizes(new Set());
    setSelectedSuitable(new Set());
    setVisibleCount(PER_PAGE);
  };

  const activeFilterCount = selectedForms.size + selectedSizes.size + selectedSuitable.size;

  // ── Filter + Sort ──
  const filtered = products
    .filter(p => selectedForms.size    === 0 || (p.dosageForm && selectedForms.has(p.dosageForm)))
    .filter(p => selectedSizes.size    === 0 || (p.packSize   && selectedSizes.has(p.packSize)))
    .filter(p => selectedSuitable.size === 0 || (p.suitableFor?.some(s => selectedSuitable.has(s))));

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price_asc")  return Number(a.sellingPrice) - Number(b.sellingPrice);
    if (sort === "price_desc") return Number(b.sellingPrice) - Number(a.sellingPrice);
    if (sort === "name_asc")   return a.productName.localeCompare(b.productName);
    return 0;
  });

  const paginated = sorted.slice(0, visibleCount);
  const hasMore   = visibleCount < sorted.length;

  return (
    <div className="min-h-screen" style={{ paddingTop: '94px', backgroundColor: '#ffffff' }}>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Category Nav Bar */}
      <div className="hidden md:block sticky top-[94px] z-20">
        <CategoryNavBar categories={allCategories} activeCategoryId={activeCategoryId} />
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full pl-5 md:pl-10 pr-5 md:pr-10 py-3">
          <div className="flex items-center gap-2 text-xs font-sans">
            <Link href="/" className="text-gray-500 hover:text-[#D4AF37] transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <Link href="/pharmacy" className="text-gray-500 hover:text-[#D4AF37] transition-colors">
              Pharmacy
            </Link>
            {category.parentCategory && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <Link
                  href={`/pharmacy/category/${category.parentCategory.id}`}
                  className="text-gray-500 hover:text-[#D4AF37] transition-colors"
                >
                  {category.parentCategory.categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-900 font-medium">{category.categoryName}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full pl-5 md:pl-10 pr-5 md:pr-10 py-6">
        <div className="flex gap-8">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg p-5 sticky top-[110px]">

              {/* Category name + description */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h1 className="text-2xl font-heading font-bold text-gray-900 mb-1"
                  style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}>
                  {category.categoryName}
                </h1>
                {category.categoryDescription && (
                  <p className="text-xs font-sans font-bold leading-relaxed text-gray-800">
                    {category.categoryDescription}
                  </p>
                )}
              </div>

              {/* Clear all filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="mb-4 text-xs font-sans text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  × Clear all filters ({activeFilterCount})
                </button>
              )}

              {/* Subcategories */}
              {category.subCategories && category.subCategories.length > 0 && (
                <FilterSection title={category.categoryName} defaultOpen={true}>
                  {category.subCategories.filter(sub => sub.isActive).map((sub) => {
                    const count = products.filter(p => p.categoryId === sub.id).length;
                    const isActive = sub.id === activeCategoryId;
                    return (
                      <Link
                        key={sub.id}
                        href={`/pharmacy/category/${sub.id}`}
                        className="flex items-center gap-2.5 py-1.5 group transition-colors"
                      >
                        {/* Radio icon */}
                        <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          isActive
                            ? "border-[#D4AF37]"
                            : "border-gray-400 group-hover:border-[#D4AF37]"
                        }`}>
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                          )}
                        </span>
                        <span className={`text-sm font-sans transition-colors flex-1 ${
                          isActive ? "text-[#D4AF37] font-medium" : "text-gray-700 group-hover:text-[#D4AF37]"
                        }`}>
                          {sub.categoryName}
                        </span>
                        {count > 0 && (
                          <span className="text-xs text-gray-400 font-sans group-hover:text-[#D4AF37] transition-colors">
                            {count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </FilterSection>
              )}

              {/* Form (dosageForm) */}
              {uniqueDosageForms.length > 0 && (
                <FilterSection title="Form" defaultOpen={true}>
                  {uniqueDosageForms.map((form) => (
                    <label key={form} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedForms.has(form)}
                        onChange={() => toggle(selectedForms, form, setSelectedForms)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#D4AF37]"
                      />
                      <span className="text-sm text-gray-700 font-sans group-hover:text-[#D4AF37] transition-colors">
                        {form}
                      </span>
                    </label>
                  ))}
                </FilterSection>
              )}

              {/* Size (packSize) */}
              {uniquePackSizes.length > 0 && (
                <FilterSection title="Size" defaultOpen={true}>
                  {uniquePackSizes.map((size) => (
                    <label key={size} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedSizes.has(size)}
                        onChange={() => toggle(selectedSizes, size, setSelectedSizes)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#D4AF37]"
                      />
                      <span className="text-sm text-gray-700 font-sans group-hover:text-[#D4AF37] transition-colors">
                        {size}
                      </span>
                    </label>
                  ))}
                </FilterSection>
              )}

              {/* Suitable For */}
              {uniqueSuitableFor.length > 0 && (
                <FilterSection title="Suitable For" defaultOpen={false}>
                  {uniqueSuitableFor.map((suitable) => (
                    <label key={suitable} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedSuitable.has(suitable)}
                        onChange={() => toggle(selectedSuitable, suitable, setSelectedSuitable)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#D4AF37]"
                      />
                      <span className="text-sm text-gray-700 font-sans capitalize group-hover:text-[#D4AF37] transition-colors">
                        {suitable.replace(/_/g, ' ')}
                      </span>
                    </label>
                  ))}
                </FilterSection>
              )}

            </div>
          </aside>

          {/* ── RIGHT CONTENT ── */}
          <div className="flex-1">

            {/* Subcategory pills — mobile only */}
            {category.subCategories && category.subCategories.length > 0 && (
              <div className="lg:hidden bg-white rounded-lg p-5 mb-6">
                <h2 className="text-xs uppercase tracking-widest font-sans font-semibold text-gray-700 mb-3">
                  Shop by Category
                </h2>
                <div className="flex flex-wrap gap-2">
                  {category.subCategories.filter(sub => sub.isActive).map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/pharmacy/category/${sub.id}`}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-full text-xs font-sans font-medium text-gray-700 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-200"
                    >
                      {sub.categoryName}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {[...selectedForms].map(f => (
                  <span key={f} className="inline-flex items-center gap-1 px-3 py-1 bg-[#FEFBF0] border border-[#D4AF37] rounded-full text-xs font-sans text-[#D4AF37]">
                    {f}
                    <button onClick={() => toggle(selectedForms, f, setSelectedForms)} className="ml-1 hover:text-red-500">×</button>
                  </span>
                ))}
                {[...selectedSizes].map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-[#FEFBF0] border border-[#D4AF37] rounded-full text-xs font-sans text-[#D4AF37]">
                    {s}
                    <button onClick={() => toggle(selectedSizes, s, setSelectedSizes)} className="ml-1 hover:text-red-500">×</button>
                  </span>
                ))}
                {[...selectedSuitable].map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-[#FEFBF0] border border-[#D4AF37] rounded-full text-xs font-sans text-[#D4AF37]">
                    {s.replace(/_/g, ' ')}
                    <button onClick={() => toggle(selectedSuitable, s, setSelectedSuitable)} className="ml-1 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-4">
              <p className="text-sm text-gray-600 font-sans">
                Showing <span className="font-semibold text-gray-900">1–{Math.min(visibleCount, sorted.length)}</span> of{" "}
                <span className="font-semibold text-gray-900">{sorted.length}</span> products
              </p>
              <div className="flex items-center gap-3">
                <label htmlFor="sort" className="text-sm text-gray-600 font-sans hidden sm:block">Sort by:</label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 font-sans focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {paginated.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-lg">
                <p className="text-gray-400 font-sans text-sm mb-3">No products match your filters.</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearAll} className="text-sm text-[#D4AF37] hover:underline font-sans">
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginated.map(product => (
                  <div key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setVisibleCount(v => v + PER_PAGE)}
                  className="px-10 py-3 text-xs uppercase tracking-widest font-sans font-medium border transition-all duration-300 rounded-full hover:scale-105"
                  style={{ borderColor: "#D4AF37", color: "#D4AF37", background: "transparent" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#D4AF37"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#D4AF37"; }}
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
