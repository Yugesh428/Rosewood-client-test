"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

const products = [
  {
    id: 1,
    name: "Advanced Vitamin C",
    category: "Vitamins",
    price: "$42.00",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
  },
  {
    id: 2,
    name: "Daily Moisturiser Complex",
    category: "Skincare",
    price: "$35.00",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80",
  },
  {
    id: 3,
    name: "Probiotic Enhancer",
    category: "Wellness",
    price: "$28.00",
    image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=80",
  },
  {
    id: 4,
    name: "Soothing Skin Relief",
    category: "Skincare",
    price: "$29.00",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80",
  },
];

function CartPlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      <line x1="12" y1="10" x2="12" y2="16" /><line x1="9" y1="13" x2="15" y2="13" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill={filled ? "#D4AF37" : "none"} stroke="#D4AF37" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ProductCard({ product, index }: { product: typeof products[0]; index: number }) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group bg-white border border-[#E5E5E5] rounded-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#F9F9F9]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Add to cart overlay */}
        <motion.button
          onClick={handleAdd}
          whileTap={{ scale: 0.95 }}
          className="absolute bottom-3 right-3 w-8 h-8 bg-white border border-[#E5E5E5] rounded-full flex items-center justify-center text-[#1A1A1A] hover:bg-[#000000] hover:text-white hover:border-[#000000] transition-all duration-200 shadow-sm"
          aria-label="Add to cart"
        >
          {added ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <CartPlusIcon />
          )}
        </motion.button>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] font-sans mb-1">{product.category}</p>
        <h3 className="font-heading text-sm text-[#1A1A1A] mb-2 leading-tight">{product.name}</h3>
        <div className="flex items-center gap-0.5 mb-3">
          {[1,2,3,4,5].map((s) => <StarIcon key={s} filled={s <= 4} />)}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-sans text-sm font-semibold text-[#1A1A1A]">{product.price}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function BestSellers() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl text-[#1A1A1A]">Our Most Selling Products</h2>
            <p className="text-sm text-[#6B6B6B] font-sans mt-1">Curated essentials for your daily wellness.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/pharmacy" className="text-xs text-[#1A1A1A] font-sans tracking-wide hover:underline underline-offset-4">
              View All →
            </Link>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {["Trending", "Popular"].map((tab, i) => (
            <button
              key={tab}
              className={`text-xs font-sans px-4 py-1.5 rounded-sm border transition-all ${
                i === 0
                  ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                  : "bg-white text-[#6B6B6B] border-[#E5E5E5] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
