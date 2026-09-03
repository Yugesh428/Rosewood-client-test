"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import ProductImage from "@/components/ui/ProductImage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  productName: string;
  productImage: string | null;
  sellingPrice: number;
  originalPrice: number;
  discount: number;
  unitType: string;
  packSize: string;
  isActive: boolean;
  category?: { id: string; categoryName: string };
}

interface ReviewStats {
  avg: number;
  count: number;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CartIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ avg, count }: { avg: number; count: number }) {
  if (count === 0) return null;
  const full = Math.floor(avg);
  const half = avg - full >= 0.4;
  return (
    <div className="flex items-center gap-1 mb-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
          <svg key={s} width="11" height="11" viewBox="0 0 24 24"
            fill={s <= full ? "#D4AF37" : (s === full + 1 && half ? "#D4AF37" : "none")}
            stroke="#D4AF37" strokeWidth="1.5" opacity={s <= full ? 1 : (s === full + 1 && half ? 0.6 : 0.3)}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <span className="text-[10px] text-[#9CA3AF] font-sans">({count})</span>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  stats,
  index,
}: {
  product: Product;
  stats: ReviewStats;
  index: number;
}) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const price    = Number(product.sellingPrice);
  const original = Number(product.originalPrice);

  function handleAddToCart() {
    addToCart({
      id:       product.id,
      name:     product.productName,
      price,
      image:    product.productImage ?? "",
      category: product.category?.categoryName ?? "",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="group bg-white rounded-lg overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.15)] transition-shadow duration-300 cursor-default"
    >
      {/* ── Image ── */}
      <Link href={`/pharmacy/${product.id}`} className="block relative w-full aspect-square overflow-hidden bg-[#F5F3EF]">
        <motion.div
          className="w-full h-full"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <ProductImage
            src={product.productImage}
            alt={product.productName}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
          />
        </motion.div>

        {/* Discount badge — top right only if discounted */}
        {Number(product.discount) > 0 && (
          <span className="absolute top-3 right-3 z-10 text-[10px] font-bold px-2.5 py-1 rounded-full text-white bg-[#C0392B]">
            -{product.discount}%
          </span>
        )}
      </Link>

      {/* ── Info ── */}
      <div className="px-4 pt-3 pb-4">

        {/* Name */}
        <Link href={`/pharmacy/${product.id}`}
          className="font-sans text-[14px] font-semibold text-[#1A1A1A] leading-snug mb-1.5 line-clamp-2 hover:underline block">
          {product.productName}
        </Link>

        {/* Stars */}
        <StarRating avg={stats.avg} count={stats.count} />

        {/* In Stock */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-[11px] text-green-700 font-sans">In Stock</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-3.5">
          <span className="font-sans text-[15px] font-bold text-[#1A1A1A]">
            £{price.toFixed(2)}
          </span>
          {original > price && (
            <span className="text-xs text-[#9CA3AF] line-through font-sans">
              £{original.toFixed(2)}
            </span>
          )}
          <span className="text-[11px] text-[#9CA3AF] font-sans">
            / {product.packSize} {product.unitType}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {/* Cart circle */}
          <motion.button
            onClick={handleAddToCart}
            whileTap={{ scale: 0.88 }}
            aria-label="Add to cart"
            className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 transition-opacity duration-200 hover:opacity-80 border"
            style={{ backgroundColor: "#ffffff", color: "#000000", borderColor: "#e5e7eb" }}
          >
            {added ? <CheckIcon /> : <CartIcon />}
          </motion.button>

          {/* Buy pill */}
          <Link
            href={`/pharmacy/${product.id}`}
            className="flex-1 flex items-center justify-center py-2 rounded-full text-[13px] font-bold transition-opacity duration-200 hover:opacity-80"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-text)" }}
          >
            Buy
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-white rounded-lg overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.08)] animate-pulse"
    >
      <div className="w-full aspect-square bg-[#F0EDE7]" />
      <div className="px-4 pt-3 pb-4 space-y-2.5">
        <div className="h-4 w-3/4 bg-[#E8E4DC] rounded" />
        <div className="h-3 w-20 bg-[#E8E4DC] rounded" />
        <div className="h-4 w-1/2 bg-[#E8E4DC] rounded" />
        <div className="flex gap-2 pt-1">
          <div className="w-9 h-9 rounded-full bg-[#E8E4DC]" />
          <div className="flex-1 h-9 rounded-full bg-[#E8E4DC]" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BestSellers() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<string, ReviewStats>>({});
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const prodRes  = await fetch("/api/products?isActive=true&limit=8");
        const prodJson = await prodRes.json();
        const prods: Product[] = prodJson.success ? (prodJson.data ?? []) : [];
        setProducts(prods);

        const top4 = prods.slice(0, 4);
        if (top4.length === 0) return;

        const statResults = await Promise.allSettled(
          top4.map(p =>
            fetch(`/api/reviews?productId=${p.id}&isApproved=true&limit=1`).then(r => r.json())
          )
        );

        const statsMap: Record<string, ReviewStats> = {};
        statResults.forEach((result, i) => {
          if (result.status === "fulfilled" && result.value.success) {
            statsMap[top4[i].id] = {
              avg:   result.value.stats?.averageRating ?? 0,
              count: result.value.stats?.totalReviews  ?? 0,
            };
          }
        });
        setReviewsMap(statsMap);
      } catch (err) {
        console.error("BestSellers load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="py-12" style={{ backgroundColor: "var(--color-bg-page)" }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#6B6B6B] font-sans font-semibold mb-1">
              Top Selling
            </p>
            <h2 className="font-heading text-3xl text-[#1A1A1A]">Our Most Selling Products</h2>
            <p className="text-sm text-[#6B6B6B] font-sans mt-1">Curated essentials for your daily wellness.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Link
              href="/pharmacy"
              className="text-xs text-[#1A1A1A] font-sans tracking-wide hover:text-[#D4AF37] transition-colors hover:underline underline-offset-4"
            >
              View All →
            </Link>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} index={i} />)
            : products.slice(0, 4).map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  stats={reviewsMap[p.id] ?? { avg: 0, count: 0 }}
                  index={i}
                />
              ))
          }
        </div>

        {!loading && products.length === 0 && (
          <p className="text-center text-sm text-[#9CA3AF] font-sans py-10">
            No products available yet.
          </p>
        )}
      </div>
    </section>
  );
}
