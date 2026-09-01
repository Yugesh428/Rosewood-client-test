import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";
import PharmacyClient from "./_components/PharmacyClient";

export const metadata = {
  title: "Pharmacy | Rosewood Apothecary",
  description:
    "Browse our complete collection of healthcare and wellness products, carefully curated for your modern lifestyle.",
};

export default function PharmacyPage() {
  return (
    <div className="bg-[#F9F9F9] min-h-screen">
      <Navbar />
      <PharmacyClient />
      <Footer />
    </div>
  );
}
