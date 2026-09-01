import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import BestSellers from "@/components/home/BestSellers";
import ProductCollection from "@/components/home/ProductCollection";
import Testimonials from "@/components/home/Testimonials";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <div className="bg-[#F9F9F9]">
      <Navbar />
      <HeroSection />
      <BestSellers />
      <ProductCollection />
      <Testimonials />
      <Footer />
    </div>
  );
}
