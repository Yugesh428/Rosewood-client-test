/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Edit, Eye, EyeOff, Package, Tag, Layers, FlaskConical, ShieldAlert, BookOpen, Star, ChevronDown, ChevronUp } from "lucide-react";

const FONT_HEADING    = "var(--font-cinzel), 'Cinzel', serif";
const FONT_MONTSERRAT = "var(--font-montserrat), 'Montserrat', sans-serif";

type Ingredient = { id?: string; ingredientName: string; quantity: string; unit: string; sortOrder: number };
type Product = {
  id: string;
  categoryId: string;
  productName: string;
  productImage: string | null;
  productImages: string[];
  dosageForm: string;
  strength: string;
  packSize: string;
  unitType: string;
  sellingPrice: number;
  originalPrice: number;
  tax: number;
  discount: number;
  productDescriptions: { title: string; content: string }[];
  specifications: { key: string; value: string }[];
  suitableFor: string[];
  howToUse: string[];
  safetyInformation: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: { categoryName: string };
  ingredients?: Ingredient[];
};

// ── Collapsible Section ───────────────────────────────────────────────────────
function Section({ icon: Icon, title, count, children, defaultOpen = true }: {
  icon: React.ElementType;
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-lg overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAFAF8] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(212,175,55,0.10)" }}>
            <Icon className="w-4 h-4" style={{ color: "#D4AF37" }} />
          </div>
          <span style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 600, fontSize: "14px", color: "#111" }}>{title}</span>
          {count !== undefined && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: "rgba(212,175,55,0.10)", color: "#9a7a1a", fontFamily: FONT_MONTSERRAT }}>
              {count}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: "#AAA" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "#AAA" }} />}
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: FONT_MONTSERRAT, color: "#AAA", fontWeight: 600 }}>{label}</p>
      <p style={{ fontFamily: FONT_MONTSERRAT, fontSize: "13px", color: "#222", fontWeight: 500 }}>{value || <span style={{ color: "#CCC" }}>—</span>}</p>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ProductDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setProduct(json.data);
          setSelectedImage(json.data.productImage || null);
        } else {
          toast.error("Product not found");
          router.push("/admin/products");
        }
      })
      .catch(() => { toast.error("Failed to load product"); router.push("/admin/products"); })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleToggle = async () => {
    if (!product) return;
    setToggling(true);
    try {
      const res  = await fetch(`/api/products/${product.id}/toggle-active`, { method: "PATCH" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Toggle failed");
      setProduct(p => p ? { ...p, isActive: !p.isActive } : p);
      toast.success(product.isActive ? "Product hidden from store" : "Product visible in store");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Toggle failed");
    } finally {
      setToggling(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3" style={{ backgroundColor: "#ffffff" }}>
      <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      <span style={{ fontFamily: FONT_MONTSERRAT, fontSize: "12px", color: "#AAA" }}>Loading product…</span>
    </div>
  );

  if (!product) return null;

  const allImages = [product.productImage, ...(product.productImages || [])].filter(Boolean) as string[];
  const discount  = Number(product.discount);
  const selling   = Number(product.sellingPrice);
  const original  = Number(product.originalPrice);

  return (
    <div className="min-h-screen px-6 pt-8 pb-12" style={{ backgroundColor: "#ffffff", fontFamily: FONT_MONTSERRAT }}>
      <div className="max-w-6xl mx-auto">

        {/* ── Breadcrumb + actions ─────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Link href="/admin/products"
              className="flex items-center gap-1.5 text-sm transition-colors hover:text-[#D4AF37]"
              style={{ color: "#888", fontFamily: FONT_MONTSERRAT }}>
              <ArrowLeft className="w-4 h-4" /> Back to Products
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Hide / Show */}
            <button
              onClick={handleToggle}
              disabled={toggling}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded border text-sm font-semibold transition-colors disabled:opacity-50"
              style={{
                fontFamily: FONT_MONTSERRAT,
                backgroundColor: product.isActive ? "rgba(239,68,68,0.06)" : "rgba(34,197,94,0.06)",
                color: product.isActive ? "#dc2626" : "#16a34a",
                borderColor: product.isActive ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)",
              }}>
              {product.isActive
                ? <><EyeOff className="w-4 h-4" /> Hide from Store</>
                : <><Eye className="w-4 h-4" /> Show in Store</>}
            </button>

            {/* Edit */}
            <Link
              href={`/admin/products?edit=${product.id}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded text-sm font-semibold text-white transition-colors hover:bg-[#b8952e]"
              style={{ backgroundColor: "#D4AF37", fontFamily: FONT_MONTSERRAT }}>
              <Edit className="w-4 h-4" /> Edit Product
            </Link>
          </div>
        </div>

        {/* ── Page title ───────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: "#D4AF37", fontWeight: 600 }}>
            {product.category?.categoryName || "Product"}
          </p>
          <div className="flex items-start gap-3">
            <h1 style={{ fontFamily: FONT_HEADING, fontSize: "26px", fontWeight: 700, color: "#111", lineHeight: 1.2 }}>
              {product.productName}
            </h1>
            <span
              className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0"
              style={{
                backgroundColor: product.isActive ? "rgba(34,197,94,0.10)" : "rgba(0,0,0,0.06)",
                color: product.isActive ? "#166534" : "#6B7280",
              }}>
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── LEFT: Images + pricing ───────────────────────────────── */}
          <div className="lg:col-span-1 space-y-4">

            {/* Main image */}
            <div className="bg-white rounded-lg p-4" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="aspect-square rounded-md overflow-hidden flex items-center justify-center" style={{ backgroundColor: "#F9F9F7" }}>
                {selectedImage
                  ? <img src={selectedImage} alt={product.productName} className="w-full h-full object-contain p-4" />
                  : <div className="flex flex-col items-center gap-2" style={{ color: "#CCC" }}>
                      <Package className="w-12 h-12" />
                      <span style={{ fontSize: "11px", fontFamily: FONT_MONTSERRAT }}>No image</span>
                    </div>
                }
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className="w-14 h-14 rounded-md overflow-hidden border-2 transition-all"
                      style={{ borderColor: selectedImage === img ? "#D4AF37" : "rgba(0,0,0,0.08)" }}
                    >
                      <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing card */}
            <div className="bg-white rounded-lg p-5" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "#AAA", fontWeight: 600 }}>Pricing</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: "13px", color: "#666", fontFamily: FONT_MONTSERRAT }}>Selling Price</span>
                  <span style={{ fontSize: "18px", fontWeight: 700, color: "#111", fontFamily: FONT_MONTSERRAT }}>£{selling.toFixed(2)}</span>
                </div>
                {original > selling && (
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: "13px", color: "#666", fontFamily: FONT_MONTSERRAT }}>Original Price</span>
                    <span style={{ fontSize: "14px", color: "#AAA", textDecoration: "line-through", fontFamily: FONT_MONTSERRAT }}>£{original.toFixed(2)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: "13px", color: "#666", fontFamily: FONT_MONTSERRAT }}>Discount</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(34,197,94,0.10)", color: "#16a34a", fontFamily: FONT_MONTSERRAT }}>
                      {discount}% off
                    </span>
                  </div>
                )}
                {Number(product.tax) > 0 && (
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: "13px", color: "#666", fontFamily: FONT_MONTSERRAT }}>Tax</span>
                    <span style={{ fontSize: "13px", color: "#444", fontFamily: FONT_MONTSERRAT }}>{product.tax}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Meta card */}
            <div className="bg-white rounded-lg p-5" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "#AAA", fontWeight: 600 }}>Details</p>
              <div className="space-y-3">
                <Field label="Product ID" value={<span className="font-mono text-[11px] text-[#888]">{product.id}</span>} />
                <Field label="Created" value={new Date(product.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} />
                <Field label="Updated" value={new Date(product.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} />
              </div>
            </div>
          </div>

          {/* ── RIGHT: All sections ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Core fields */}
            <Section icon={Package} title="Product Information" defaultOpen>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <Field label="Category"    value={product.category?.categoryName} />
                <Field label="Dosage Form" value={product.dosageForm} />
                <Field label="Strength"    value={product.strength} />
                <Field label="Pack Size"   value={product.packSize} />
                <Field label="Unit Type"   value={product.unitType} />
                <Field label="Status"      value={
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ backgroundColor: product.isActive ? "rgba(34,197,94,0.10)" : "rgba(0,0,0,0.06)", color: product.isActive ? "#166534" : "#6B7280" }}>
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                } />
              </div>
            </Section>

            {/* Suitable For */}
            {product.suitableFor?.length > 0 && (
              <Section icon={Tag} title="Suitable For" count={product.suitableFor.length}>
                <div className="flex flex-wrap gap-2 pt-2">
                  {product.suitableFor.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: "rgba(212,175,55,0.10)", color: "#9a7a1a", fontFamily: FONT_MONTSERRAT, border: "1px solid rgba(212,175,55,0.2)" }}>
                      {tag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Descriptions */}
            {product.productDescriptions?.length > 0 && (
              <Section icon={BookOpen} title="Descriptions" count={product.productDescriptions.length}>
                <div className="space-y-4 pt-2">
                  {product.productDescriptions.map((d, i) => (
                    <div key={i} className="pl-3" style={{ borderLeft: "2px solid #D4AF37" }}>
                      {d.title && <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "#888", fontFamily: FONT_MONTSERRAT }}>{d.title}</p>}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#444", fontFamily: FONT_MONTSERRAT }}>{d.content}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <Section icon={FlaskConical} title="Ingredients" count={product.ingredients.length}>
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {["#", "Name", "Quantity", "Unit"].map(h => (
                          <th key={h} className="text-left py-2 px-3"
                            style={{ fontFamily: FONT_MONTSERRAT, fontSize: "10px", fontWeight: 700, color: "#AAA", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {product.ingredients.map((ing, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                          <td className="py-2.5 px-3" style={{ color: "#AAA", fontSize: "12px", fontFamily: FONT_MONTSERRAT }}>{i + 1}</td>
                          <td className="py-2.5 px-3" style={{ fontWeight: 500, color: "#222", fontFamily: FONT_MONTSERRAT }}>{ing.ingredientName}</td>
                          <td className="py-2.5 px-3" style={{ color: "#666", fontFamily: FONT_MONTSERRAT }}>{ing.quantity || "—"}</td>
                          <td className="py-2.5 px-3" style={{ color: "#666", fontFamily: FONT_MONTSERRAT }}>{ing.unit || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {/* Specifications */}
            {product.specifications?.length > 0 && (
              <Section icon={Layers} title="Specifications" count={product.specifications.length}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {product.specifications.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-2.5 rounded-md" style={{ backgroundColor: "#FAFAF8", border: "1px solid rgba(0,0,0,0.05)" }}>
                      <span className="text-xs font-semibold shrink-0" style={{ color: "#888", fontFamily: FONT_MONTSERRAT, minWidth: "100px" }}>{s.key}</span>
                      <span style={{ fontSize: "13px", color: "#222", fontFamily: FONT_MONTSERRAT, fontWeight: 500 }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* How to Use */}
            {product.howToUse?.length > 0 && (
              <Section icon={Star} title="How to Use" count={product.howToUse.length} defaultOpen={false}>
                <ol className="space-y-3 pt-2">
                  {product.howToUse.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: "rgba(212,175,55,0.12)", color: "#D4AF37", fontFamily: FONT_MONTSERRAT }}>
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed pt-0.5" style={{ color: "#444", fontFamily: FONT_MONTSERRAT }}>{step}</p>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {/* Safety Information */}
            {product.safetyInformation?.length > 0 && (
              <Section icon={ShieldAlert} title="Safety Information" count={product.safetyInformation.length} defaultOpen={false}>
                <ul className="space-y-2.5 pt-2">
                  {product.safetyInformation.map((info, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#dc2626" }}>
                        !
                      </span>
                      <p className="text-sm leading-relaxed" style={{ color: "#444", fontFamily: FONT_MONTSERRAT }}>{info}</p>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}





