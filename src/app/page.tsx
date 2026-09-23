"use client";

import Navbar from "@/components/Navbar";
import HeroSectionDynamic from "@/components/home/HeroSectionDynamic";
import TopSellingProducts from "@/components/home/TopSellingProducts";
import PromotionsDynamic from "@/components/home/PromotionsDynamic";
import FeaturedDuoDynamic from "@/components/home/FeaturedDuoDynamic";
import ProductCollectionDynamic from "@/components/home/ProductCollectionDynamic";
import ArticlesSection from "@/components/home/ArticlesSection";
import Footer from "@/components/home/Footer";
import { useTheme } from "@/context/ThemeContext";

export default function HomePage() {
  const { homeBg } = useTheme();
  const bg =
    homeBg === "white" ? "#ffffff" :
    homeBg === "soft-blue" ? "#f0f8ff" :
    homeBg === "near-blue" ? "#cce8f7" :
    homeBg === "creamy-blue" ? "#e8f4f8" :
    "#dff0fb";

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: bg, margin: 0, padding: 0 }}>
      <Navbar />
      <HeroSectionDynamic />
      <TopSellingProducts />
      <FeaturedDuoDynamic />
      <PromotionsDynamic />
      <ProductCollectionDynamic />
      <ArticlesSection />
      <Footer />
    </div>
  );
}
