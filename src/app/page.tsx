import Navbar from "@/components/Navbar";
import HeroSectionDynamic from "@/components/home/HeroSectionDynamic";
import BestSellers from "@/components/home/BestSellers";
import ProductCollectionDynamic from "@/components/home/ProductCollectionDynamic";
import TestimonialsDynamic from "@/components/home/TestimonialsDynamic";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "var(--color-bg-page)" }} className="min-h-screen">
      <Navbar />
      <HeroSectionDynamic />
      <BestSellers />
      <ProductCollectionDynamic />
      <TestimonialsDynamic />
      <Footer />
    </div>
  );
}
