"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Heart, ChevronDown, ChevronLeft, ChevronRight,
  LayoutGrid, ShoppingCart, Zap as BuyNow, Star, Check,
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
      className="block bg-white rounded-lg overflow-hidden group hover:shadow-lg transition-shadow duration-300"
    >
      {/* Image container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <ProductImage 
          src={product.productImage} 
          alt={product.productName} 
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" 
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized={product.productImage?.startsWith('http')}
        />
        
        {/* Add to cart button - appears on hover */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-6 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800"
        >
          Add to Cart
        </button>
      </div>

      {/* Product info */}
      <div className="p-4 text-center">
        {/* Brand/Category */}
        {product.category?.categoryName && (
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-sans">
            {product.category.categoryName}
          </p>
        )}
        
        {/* Product name */}
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem] font-sans">
          {product.productName}
        </h3>
        
        {/* Item count */}
        <p className="text-xs text-gray-500 mb-2 font-sans">1 item</p>
        
        {/* Price */}
        <p className="text-base font-semibold text-gray-900 font-sans">
          £{price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PharmacyClient({ categories, products }: PharmacyClientProps) {
  const { totalItems } = useCart();
  const searchParams   = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort,    setSort]    = useState("recommended");
  const [page,    setPage]    = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cartOpen,    setCartOpen]    = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

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

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const resetPage  = () => setPage(1);

  return (
    <div className="min-h-screen bg-[#F9F9F9]" style={{ paddingTop: '94px' }}>

      {/* Hero Header Section - Full Width */}
      <div className="relative bg-gradient-to-r from-[#2d6a4f] to-[#52b788] py-12 mb-8 overflow-hidden w-screen -mx-[100vw] left-1/2 right-1/2 ml-[calc(-50vw)] mr-[calc(-50vw)]">
        {/* Background pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)'
          }}></div>
        </div>
        
        <div className="w-full px-12 relative z-10">
          <div className="text-center">
            <p className="text-[#D4AF37] text-xs md:text-sm uppercase tracking-[0.2em] mb-3 font-sans font-medium">
              OUR PHARMACY
            </p>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
              Medicines & Health Essentials
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto font-sans">
              Explore trusted medicines, wellness products, and health essentials alongside specialty pharmaceutical care.
            </p>
          </div>
        </div>
      </div>

      {/* Floating cart */}
      {totalItems > 0 && (
        <button onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold shadow-xl transition-all hover:scale-105"
          style={{ background: "var(--color-primary)", color: "var(--color-primary-text)" }}>
          <ShoppingCart className="w-4 h-4" /> Cart · {totalItems}
        </button>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* ── MOBILE: horizontal category strip ─────────────────────────────── */}
      <div className="md:hidden px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {categoryList.map(cat => {
            const active = selectedCategory === cat.id;
            return (
              <button key={String(cat.id)}
                onClick={() => { setSelectedCategory(cat.id); resetPage(); }}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                style={active
                  ? { backgroundColor: "var(--color-primary)", color: "var(--color-primary-text)", borderColor: "var(--color-primary)" }
                  : { backgroundColor: "#ffffff", color: "#374151", borderColor: "#D0CBBF" }}>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full px-12 py-4 md:py-6">

        <div className="w-full">

        {/* Product area - full width */}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1 flex-wrap">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-sm text-gray-500 disabled:opacity-40 transition-colors"
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.color = "var(--color-primary)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.color = ""; }}>
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
                    className="w-8 h-8 flex items-center justify-center border rounded-sm text-sm font-medium transition-all"
                    style={active
                      ? { background: "var(--color-primary)", color: "var(--color-primary-text)", borderColor: "var(--color-primary)" }
                      : { borderColor: "#e5e7eb", color: "#6B7280" }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.color = "var(--color-primary)"; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6B7280"; }}}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-sm text-gray-500 disabled:opacity-40 transition-colors"
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.color = "var(--color-primary)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.color = ""; }}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
