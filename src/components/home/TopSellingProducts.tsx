"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import gsap from "gsap";

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
      className="block bg-white group hover:shadow-lg transition-shadow duration-300 relative"
    >
      {/* Add to Cart flip button CSS - with glassmorphism */}
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
          background: rgba(255, 255, 255, 0.12);
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

      {/* Image — no overflow-hidden on outer so button isn't clipped */}
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
      </div>

      {/* Add to cart — appears only on hover with flip effect */}
      <div className="absolute bottom-[4.5rem] left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
        <button
          onClick={handleAddToCart}
          className="btn-flip-cart"
          data-front="Add to Cart"
          data-back="Add to Cart"
        />
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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const viewAllRef = useRef<HTMLAnchorElement>(null);
  const viewAllUnderlineRef = useRef<HTMLSpanElement>(null);

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

  // GSAP letter animation
  useEffect(() => {
    if (!headingRef.current) return;

    const heading = headingRef.current;
    const text = heading.textContent || "";
    
    // Split text into individual letters with spans
    heading.innerHTML = text
      .split("")
      .map((char) => {
        if (char === " ") return '<span style="display: inline-block; width: 0.3em;"></span>';
        return `<span style="display: inline-block; opacity: 0;">${char}</span>`;
      })
      .join("");

    const letters = heading.querySelectorAll("span");

    // Animate each letter
    gsap.fromTo(
      letters,
      {
        opacity: 0,
        rotationX: -90,
        y: 20,
      },
      {
        opacity: 1,
        rotationX: 0,
        y: 0,
        duration: 0.8,
        stagger: 0.03,
        ease: "back.out(1.2)",
        delay: 0.3,
      }
    );
  }, [products]);

  // GSAP underline animation for View All
  useEffect(() => {
    if (!viewAllRef.current || !viewAllUnderlineRef.current) return;

    const link = viewAllRef.current;
    const underline = viewAllUnderlineRef.current;

    const handleMouseEnter = () => {
      gsap.to(underline, {
        scaleX: 1,
        duration: 0.6,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(underline, {
        scaleX: 0,
        duration: 0.4,
        ease: "power2.in",
      });
    };

    link.addEventListener("mouseenter", handleMouseEnter);
    link.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      link.removeEventListener("mouseenter", handleMouseEnter);
      link.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [products]);

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
          <div className="flex-1 text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] font-sans text-gray-400 mb-1">
              Most Popular
            </p>
            <h2
              ref={headingRef}
              className="text-3xl md:text-4xl text-[#1A1A1A]"
              style={{
                fontFamily: "'Lucida Calligraphy', 'Lucida Handwriting', 'Palatino Linotype', cursive",
                fontWeight: 400,
                letterSpacing: "0.02em",
                perspective: "1000px",
              }}
            >
              Top Selling Products
            </h2>
          </div>
          <Link
            ref={viewAllRef}
            href="/pharmacy"
            className="text-xs uppercase tracking-widest font-sans font-medium text-gray-500 flex-shrink-0 relative pb-1"
          >
            View All
            <span
              ref={viewAllUnderlineRef}
              className="absolute bottom-0 left-0 w-full h-[2px] bg-[#1A1A1A] origin-left"
              style={{ transform: "scaleX(0)" }}
            />
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
