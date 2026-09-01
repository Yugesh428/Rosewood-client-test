"use client";

import { useState } from "react";
import {
  Heart, ChevronDown, ChevronLeft, ChevronRight,
  LayoutGrid, Pill, Sparkles, ShieldPlus, Zap, User,
  ShoppingCart, Zap as BuyNow, Star, Check,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  { id: 1, name: "Advanced Daily Multivitamin Complex",  category: "Vitamins & Supplements", categorySlug: "vitamins",      price: 45.0, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop", badge: "Premium",   badgeColor: "#D4AF37", rating: 4.5, reviews: 128 },
  { id: 2, name: "Clinical Grade Hydrating Serum",       category: "Skincare & Derma",       categorySlug: "skincare",      price: 85.0, image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop", badge: null,        badgeColor: null,      rating: 4.8, reviews: 64  },
  { id: 3, name: "Organic Ashwagandha Root Extract",     category: "Vitamins & Supplements", categorySlug: "vitamins",      price: 32.0, image: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400&h=400&fit=crop", badge: "Organic",   badgeColor: "#4a7c59", rating: 4.3, reviews: 92  },
  { id: 4, name: "Restorative Sleep Herbal Infusion",    category: "Vitamins & Supplements", categorySlug: "vitamins",      price: 24.0, image: "https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=400&h=400&fit=crop", badge: "Wellness",  badgeColor: "#7c6a4a", rating: 4.6, reviews: 47  },
  { id: 5, name: "Luxe Weekly Pill Organizer",           category: "Personal Care",          categorySlug: "personal-care", price: 28.0, image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop", badge: "Sale",      badgeColor: "#c0392b", rating: 4.1, reviews: 33  },
  { id: 6, name: "Broad Spectrum SPF 50+ Sunscreen",     category: "Skincare & Derma",       categorySlug: "skincare",      price: 38.0, image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop", badge: null,        badgeColor: null,      rating: 4.7, reviews: 210 },
  { id: 7, name: "Fast Relief Ibuprofen 400mg",          category: "Pain Relief",            categorySlug: "pain-relief",   price: 12.5, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop", badge: null,        badgeColor: null,      rating: 4.4, reviews: 318 },
  { id: 8, name: "Antiseptic First Aid Kit",             category: "First Aid",              categorySlug: "first-aid",     price: 55.0, image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&h=400&fit=crop", badge: "Essential", badgeColor: "#2980b9", rating: 4.9, reviews: 76  },
];

const CATEGORIES = [
  { label: "All",                    slug: null,            icon: LayoutGrid, count: 8 },
  { label: "Vitamins & Supplements", slug: "vitamins",      icon: Pill,       count: 3 },
  { label: "Skincare & Derma",       slug: "skincare",      icon: Sparkles,   count: 2 },
  { label: "First Aid",              slug: "first-aid",     icon: ShieldPlus, count: 1 },
  { label: "Pain Relief",            slug: "pain-relief",   icon: Zap,        count: 1 },
  { label: "Personal Care",          slug: "personal-care", icon: User,       count: 1 },
];

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
          <Star
            key={star}
            className="w-3 h-3"
            fill={star <= Math.round(rating) ? "#D4AF37" : "none"}
            stroke={star <= Math.round(rating) ? "#D4AF37" : "#d1d5db"}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span className="text-[10px] text-gray-400 font-sans">({count})</span>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: typeof PRODUCTS[number] }) {
  const { addToCart, items, updateQty } = useCart();
  const [wished, setWished] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const cartItem = items.find(i => i.id === product.id);
  const inCart = !!cartItem;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
    // Scroll to top to open cart or navigate to checkout
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-sm overflow-hidden group hover:shadow-lg hover:border-[#D4AF37]/30 transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.badge && (
          <span
            className="absolute top-2 left-2 z-10 text-white text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wide"
            style={{ background: product.badgeColor ?? "#D4AF37" }}
          >
            {product.badge}
          </span>
        )}
        <button
          onClick={() => setWished(w => !w)}
          className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm hover:shadow-md transition-all"
        >
          <Heart className="w-3.5 h-3.5" fill={wished ? "#D4AF37" : "none"} stroke={wished ? "#D4AF37" : "#bbb"} strokeWidth={2} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col">
        <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-sans mb-1">{product.category}</p>

        {/* Fixed 2-line height so all cards align */}
        <h3 className="text-sm text-gray-900 font-medium leading-snug mb-2 font-sans" style={{ minHeight: "2.5rem" }}>
          <span className="line-clamp-2">{product.name}</span>
        </h3>

        {/* Stars */}
        <div className="mb-2">
          <StarRating rating={product.rating} count={product.reviews} />
        </div>

        {/* Price row */}
        <div className="mb-2">
          <p className="text-base font-heading text-gray-900">${product.price.toFixed(2)}</p>
        </div>

        {/* Qty controls — only appears when item is in cart, naturally pushes buttons down */}
        {inCart && (
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => updateQty(product.id, (cartItem?.quantity ?? 1) - 1)}
              className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors text-sm font-bold leading-none flex-shrink-0"
            >−</button>
            <span className="text-xs font-semibold text-gray-700 flex-1 text-center">
              {cartItem?.quantity} in cart
            </span>
            <button
              onClick={() => updateQty(product.id, (cartItem?.quantity ?? 0) + 1)}
              className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors text-sm font-bold leading-none flex-shrink-0"
            >+</button>
          </div>
        )}

        {/* Action buttons — always the same, never change */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-sm text-xs font-semibold border transition-all duration-200"
            style={
              addedFeedback
                ? { background: "#f0fdf4", borderColor: "#86efac", color: "#16a34a" }
                : { background: "#ffffff", borderColor: "#e5e7eb", color: "#374151" }
            }
          >
            {addedFeedback ? (
              <><Check className="w-3.5 h-3.5" /> Added!</>
            ) : (
              <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
            )}
          </button>

          <button
            onClick={handleBuyNow}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-sm text-xs font-semibold text-black transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #ffe87c 50%, #b8952e 100%)",
              boxShadow: "0 2px 8px rgba(212,175,55,0.35)",
            }}
          >
            <BuyNow className="w-3.5 h-3.5" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PharmacyClient() {
  const { totalItems } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("recommended");
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  const filtered = PRODUCTS
    .filter(p => !selectedCategory || p.categorySlug === selectedCategory)
    .sort((a, b) => {
      if (sort === "price_asc")  return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const resetPage = () => setPage(1);

  return (
    <div className="pt-14 min-h-screen bg-[#F9F9F9]">

      {/* ── Floating cart button ── */}
      {totalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 rounded-full text-black text-sm font-semibold shadow-xl transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #D4AF37 0%, #ffe87c 50%, #b8952e 100%)",
            boxShadow: "0 4px 20px rgba(212,175,55,0.5)",
          }}
        >
          <ShoppingCart className="w-4 h-4" />
          Cart · {totalItems}
        </button>
      )}

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">

        {/* ── Sidebar ── */}
        <div className="flex-shrink-0 relative">
          <button
            type="button"
            onClick={() => setSidebarOpen(o => !o)}
            title={sidebarOpen ? "Hide filters" : "Show filters"}
            className="absolute -right-3.5 top-4 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 hover:border-[#D4AF37] group transition-all"
          >
            <ChevronLeft className={`w-3.5 h-3.5 text-gray-400 group-hover:text-[#D4AF37] transition-transform duration-300 ${sidebarOpen ? "" : "rotate-180"}`} />
          </button>

          <aside className={`overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? "w-52 opacity-100" : "w-0 opacity-0 pointer-events-none"}`}>
            <div className="w-52 pr-4">
              <div className="mb-5 pt-1">
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-gray-400 mb-0.5">Browse by</p>
                <h2 className="font-heading text-lg text-gray-900 leading-tight">Category</h2>
                <div className="mt-1.5 h-px w-8" style={{ background: "linear-gradient(90deg, #D4AF37, #ffe87c, transparent)" }} />
              </div>

              <ul className="space-y-2">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const active = selectedCategory === cat.slug;
                  return (
                    <li key={String(cat.slug)}>
                      <button
                        type="button"
                        onClick={() => { setSelectedCategory(cat.slug); resetPage(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-left transition-all duration-200 relative overflow-hidden"
                        style={active ? {
                          background: "linear-gradient(90deg, rgba(212,175,55,0.13) 0%, rgba(212,175,55,0.05) 100%)",
                          border: "1px solid rgba(212,175,55,0.35)",
                          boxShadow: "0 1px 8px rgba(212,175,55,0.12)",
                        } : { background: "#ffffff", border: "1px solid #F0F0F0" }}
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                            style={{ background: "linear-gradient(180deg, #ffe87c, #D4AF37, #b8952e)", boxShadow: "0 0 6px rgba(212,175,55,0.5)" }} />
                        )}
                        <div className="flex-shrink-0 w-7 h-7 rounded-sm flex items-center justify-center transition-all duration-200"
                          style={active ? {
                            background: "linear-gradient(135deg, #D4AF37, #ffe87c)",
                            boxShadow: "0 2px 6px rgba(212,175,55,0.35)",
                          } : { background: "#F5F5F5" }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: active ? "#000" : "#888" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-tight truncate" style={{ color: active ? "#9a7a1a" : "#374151" }}>
                            {cat.label}
                          </p>
                        </div>
                        <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={active ? {
                            background: "linear-gradient(135deg, #D4AF37, #ffe87c)", color: "#000",
                          } : { background: "#F0F0F0", color: "#888" }}>
                          {cat.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>

        {/* ── Product area ── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500 font-sans">
              <span className="text-gray-900 font-semibold font-heading">{filtered.length}</span> products
              {selectedCategory && (
                <button onClick={() => { setSelectedCategory(null); resetPage(); }}
                  className="ml-2 text-[11px] text-[#D4AF37] hover:underline">
                  × Clear filter
                </button>
              )}
            </p>
            <div className="flex items-center gap-3">
              {/* Cart button in toolbar */}
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-sm text-sm text-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors relative"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[9px] font-bold text-black rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #D4AF37, #ffe87c)" }}>
                    {totalItems}
                  </span>
                )}
              </button>
              <div className="relative">
                <select value={sort} onChange={e => { setSort(e.target.value); resetPage(); }}
                  className="appearance-none border border-gray-200 text-sm text-gray-700 bg-white pl-3 pr-8 py-1.5 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-sans cursor-pointer">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Grid */}
          {paginated.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-gray-400 font-sans text-sm">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginated.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-sm text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                const active = p === page;
                if (totalPages > 7 && p !== 1 && p !== totalPages && (p < page - 1 || p > page + 1)) {
                  if (p === 2 || p === totalPages - 1) return <span key={p} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>;
                  return null;
                }
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center border rounded-sm text-sm font-medium transition-all ${active ? "text-black border-[#D4AF37]" : "border-gray-200 text-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37]"}`}
                    style={active ? { background: "linear-gradient(135deg, #D4AF37, #ffe87c, #b8952e)" } : undefined}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-sm text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
