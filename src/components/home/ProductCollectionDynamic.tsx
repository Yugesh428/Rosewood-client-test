"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

type CollectionCategory = {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
};

type CollectionProduct = {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string | null;
  backgroundImage: string | null;
  videoUrl: string | null;
  videoFile: string | null;
  photo1Url: string | null;
  photo2Url: string | null;
  isActive: boolean;
};

export default function ProductCollectionDynamic() {
  const [categories, setCategories] = useState<CollectionCategory[]>([]);
  const [products, setProducts] = useState<CollectionProduct[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories and products in parallel
    Promise.all([
      fetch("/api/ui/collection/categories").then((r) => r.json()),
      fetch("/api/ui/collection/products").then((r) => r.json()),
    ])
      .then(([catJson, prodJson]) => {
        if (catJson.success && catJson.data) {
          setCategories(catJson.data);
        }
        if (prodJson.success && prodJson.data) {
          setProducts(prodJson.data);
        }
      })
      .catch((err) => console.error("Failed to load collection data:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts =
    activeTab === "all"
      ? products
      : products.filter((p) => p.categoryId === activeTab);

  const displayProducts = filteredProducts.slice(0, 3); // Show max 3 cards

  if (loading) {
    return (
      <section className="py-10 bg-[#F9F9F9] flex justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }} />
      </section>
    );
  }

  return (
    <section className="pt-10 pb-12 bg-[#F9F9F9]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="font-heading text-3xl text-[#1A1A1A]">
            Our Product Collection
          </h2>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {[{ id: "all", name: "All" }, ...categories.map(c => ({ id: c.id, name: c.name }))].map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="text-xs font-sans px-5 py-2 rounded-sm border transition-all duration-200"
                style={active
                  ? { backgroundColor: "var(--color-text-heading)", color: "#fff", borderColor: "var(--color-text-heading)" }
                  : { backgroundColor: "#fff", color: "#6B6B6B", borderColor: "#E5E5E5" }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = "var(--color-text-heading)"; e.currentTarget.style.color = "var(--color-text-heading)"; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = "#E5E5E5"; e.currentTarget.style.color = "#6B6B6B"; }}}>
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Mosaic grid */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large card - First product (video or background image) */}
            {displayProducts[0] && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="md:col-span-2 relative group overflow-hidden rounded-sm h-80 md:h-96 cursor-pointer"
              >
                {/* Video support: video URL or uploaded video file */}
                {(displayProducts[0].videoFile || displayProducts[0].videoUrl) ? (
                  <video
                    src={displayProducts[0].videoFile || displayProducts[0].videoUrl!}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : displayProducts[0].backgroundImage ? (
                  <Image
                    src={displayProducts[0].backgroundImage}
                    alt={displayProducts[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized={displayProducts[0].backgroundImage.startsWith('/uploads/')}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  {displayProducts[0].subtitle && (
                    <p className="text-[10px] tracking-[0.25em] uppercase font-sans mb-1"
                      style={{ color: "var(--color-primary)" }}>
                      {displayProducts[0].subtitle}
                    </p>
                  )}
                  <h3 className="font-heading text-xl text-white mb-3">
                    {displayProducts[0].title}
                  </h3>
                  <Link
                    href="/pharmacy"
                    className="inline-flex items-center gap-1.5 text-xs font-sans text-white border border-white/50 px-4 py-2 hover:bg-white hover:text-black transition-all duration-200"
                  >
                    Shop Category
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Small cards - Photo 1 and Photo 2 from the FIRST product */}
            <div className="flex flex-col gap-4">
              {/* Photo 1 */}
              {displayProducts[0]?.photo1Url && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0, duration: 0.5 }}
                  className="relative group overflow-hidden rounded-sm flex-1 min-h-44 cursor-pointer"
                >
                  <Image
                    src={displayProducts[0].photo1Url}
                    alt={displayProducts[0].photo1Title || displayProducts[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized={displayProducts[0].photo1Url.startsWith('/uploads/')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    {displayProducts[0].photo1Subtitle && (
                      <p className="text-[10px] tracking-[0.2em] uppercase font-sans mb-0.5"
                        style={{ color: "var(--color-primary)" }}>
                        {displayProducts[0].photo1Subtitle}
                      </p>
                    )}
                    <h3 className="font-heading text-sm text-white">
                      {displayProducts[0].photo1Title || displayProducts[0].title}
                    </h3>
                  </div>
                </motion.div>
              )}

              {/* Photo 2 */}
              {displayProducts[0]?.photo2Url && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="relative group overflow-hidden rounded-sm flex-1 min-h-44 cursor-pointer"
                >
                  <Image
                    src={displayProducts[0].photo2Url}
                    alt={displayProducts[0].photo2Title || displayProducts[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized={displayProducts[0].photo2Url.startsWith('/uploads/')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    {displayProducts[0].photo2Subtitle && (
                      <p className="text-[10px] tracking-[0.2em] uppercase font-sans mb-0.5"
                        style={{ color: "var(--color-primary)" }}>
                        {displayProducts[0].photo2Subtitle}
                      </p>
                    )}
                    <h3 className="font-heading text-sm text-white">
                      {displayProducts[0].photo2Title || displayProducts[0].title}
                    </h3>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-[#6B6B6B] text-sm">
            No products available in this category.
          </div>
        )}

        {/* View all */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link href="/pharmacy"
            className="collection-view-all inline-flex items-center gap-2 text-xs font-sans tracking-widest uppercase px-8 py-3 transition-all duration-300"
            style={{ color: "var(--color-text-heading)", borderColor: "var(--color-text-heading)", border: "1px solid var(--color-text-heading)", backgroundColor: "transparent" }}>
            View All Products
          </Link>
          <style>{`
            .collection-view-all:hover {
              background-color: var(--color-text-heading) !important;
              color: #fff !important;
            }
          `}</style>
        </motion.div>
      </div>
    </section>
  );
}
