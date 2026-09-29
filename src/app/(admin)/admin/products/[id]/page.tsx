import ProductDetailPage from "@/components/admin/products/ProductDetailPage";

// Server component — unwraps the async params, then renders the client component
export default async function SingleProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailPage id={id} />;
}
