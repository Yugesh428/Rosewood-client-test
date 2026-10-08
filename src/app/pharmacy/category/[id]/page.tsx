import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";
import CategoryLandingClient from "./_components/CategoryLandingClient";
import { getCategoryById, getAllCategories } from "@/features/productCategory/routes";
import { getAllProducts } from "@/features/products/routes";
import { NextRequest } from "next/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getCategoryData(id: string) {
  try {
    // Fetch all categories for the nav bar
    const allCatReq = new NextRequest(
      "http://localhost/api/product-categories?isActive=true&limit=200",
      { method: "GET" }
    );
    const allCatRes  = await getAllCategories(allCatReq);
    const allCatJson = await allCatRes.json();
    const allCategories = allCatJson.success ? (allCatJson.data ?? []) : [];

    // Fetch category details with subcategories
    const catReq = new NextRequest(`http://localhost/api/product-categories/${id}`, { method: "GET" });
    const catRes = await getCategoryById(catReq, id);
    const catJson = await catRes.json();
    
    if (!catJson.success || !catJson.data) return null;
    
    const category = catJson.data;
    
    // Fetch products for this specific category
    const prodReq = new NextRequest(
      `http://localhost/api/products?isActive=true&categoryId=${id}&limit=500`,
      { method: "GET" }
    );
    const prodRes = await getAllProducts(prodReq);
    const prodJson = await prodRes.json();
    let products = prodJson.success ? (prodJson.data ?? []) : [];
    
    // If this is a parent category with subcategories, also fetch products from each subcategory
    if (category.subCategories && category.subCategories.length > 0) {
      for (const subCat of category.subCategories) {
        const subProdReq = new NextRequest(
          `http://localhost/api/products?isActive=true&categoryId=${subCat.id}&limit=500`,
          { method: "GET" }
        );
        const subProdRes = await getAllProducts(subProdReq);
        const subProdJson = await subProdRes.json();
        const subProducts = subProdJson.success ? (subProdJson.data ?? []) : [];
        products = [...products, ...subProducts];
      }
    }
    
    return { category, products, allCategories };
  } catch (err) {
    console.error("CategoryLandingPage — data fetch failed:", err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCategoryData(id);
  
  if (!data) return { title: "Category Not Found" };
  
  return {
    title: `${data.category.categoryName} | Rosewood Pharmacy`,
    description: data.category.categoryDescription || `Shop ${data.category.categoryName} products at Rosewood Pharmacy`,
  };
}

export default async function CategoryLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCategoryData(id);
  
  if (!data) notFound();

  return (
    <div style={{ backgroundColor: "#ffffff" }} className="min-h-screen">
      <Navbar />
      <CategoryLandingClient 
        category={data.category} 
        products={data.products}
        allCategories={data.allCategories}
        activeCategoryId={id}
      />
      <Footer />
    </div>
  );
}
