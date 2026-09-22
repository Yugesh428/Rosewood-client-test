"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface Product {
  id: string;
  productName: string;
  productImage: string | null;
  sellingPrice: number;
  originalPrice: number;
  discount: number;
  category?: { categoryName: string };
}

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const price = Number(product.sellingPrice);
  const original = Number(product.originalPrice);
  const hasDiscount = product.discount > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.productName,
      price,
      image: product.productImage ?? "",
      category: product.category?.categoryName ?? "",
    });
    toast.success("Added to cart");
  };

  return (
    <Link
      href={`/pharmacy/${product.id}`}
      className="block bg-white group hover:shadow-lg transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {hasDiscount && (
          <span className="absolute top-2 left-2 z-10 text-white text-[9px] font-semibold px-2 py-0.5 uppercase tracking-wide bg-[#c0392b]">
            -{product.discount}%
          </span>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.productImage ?? "/placeholder.png"}
          alt={product.productName}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
        {/* Add to cart on hover */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-5 py-2 bg-black text-white text-xs font-medium rounded-full whitespace-nowrap hover:bg-gray-800"
        >
          Add to Cart
        </button>
      </div>

      {/* Info */}
      <div className="p-3 text-center">
        {product.category?.categoryName && (
          <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1 font-sans">
            {product.category.categoryName}
          </p>
        )}
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 font-sans leading-snug">
          {product.productName}
        </h3>
        <div className="flex items-center justify-center gap-2">
          <p className="text-sm font-semibold text-gray-900 font-sans">£{price.toFixed(2)}</p>
          {original > price && (
            <p className="text-xs text-red-400 line-through font-sans">£{original.toFixed(2)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function TopSellingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?isActive=true&limit=4&sort=discount")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setProducts(json.data.slice(0, 4));
        }
      })
      .catch((err) => console.error("Failed to load top products:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!products.length) return null;

  return (
    <section className="w-full py-12 bg-white">
      <div className="w-full px-8 md:px-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-sans text-gray-400 mb-1">
              Most Popular
            </p>
            <h2 className="font-heading text-3xl md:text-4xl text-[#1A1A1A]">
              Top Selling Products
            </h2>
          </div>
          <Link
            href="/pharmacy"
            className="text-xs uppercase tracking-widest font-sans font-medium text-gray-500 hover:text-black transition-colors border-b border-gray-300 hover:border-black pb-0.5"
          >
            View All
          </Link>
        </motion.div>

        {/* Grid — 4 per row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
