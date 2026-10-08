"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import HeroSectionDynamic from "@/components/home/HeroSectionDynamic";
import TopSellingProducts from "@/components/home/TopSellingProducts";
import PromotionsDynamic from "@/components/home/PromotionsDynamic";
import FeaturedDuoDynamic from "@/components/home/FeaturedDuoDynamic";
import ProductCollectionDynamic from "@/components/home/ProductCollectionDynamic";
import ArticlesSection from "@/components/home/ArticlesSection";
import Footer from "@/components/home/Footer";
import { useTheme } from "@/context/ThemeContext";

// Navbar height = 64px. Announcement bar height = 38px.
const NAVBAR_H       = 64;
const ANNOUNCEMENT_H = 38;

export default function HomePage() {
  const { homeBg } = useTheme();
  const [announcementVisible, setAnnouncementVisible] = useState(false);

  const bg =
    homeBg === "white"       ? "#ffffff" :
    homeBg === "soft-blue"   ? "#f0f8ff" :
    homeBg === "near-blue"   ? "#cce8f7" :
    homeBg === "creamy-blue" ? "#e8f4f8" :
    "#dff0fb";

  const paddingTop = announcementVisible
    ? NAVBAR_H + ANNOUNCEMENT_H   // 102px
    : NAVBAR_H;                   // 64px

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: bg, margin: 0, padding: 0 }}>
      <Navbar />
      <AnnouncementBar onVisibilityChange={setAnnouncementVisible} />
      <div style={{ paddingTop, transition: "padding-top 0.3s ease" }}>
        <HeroSectionDynamic />
        <TopSellingProducts />
        <FeaturedDuoDynamic />
        <PromotionsDynamic />
        <ProductCollectionDynamic />
        <ArticlesSection />
      </div>
      <Footer />
    </div>
  );
}
