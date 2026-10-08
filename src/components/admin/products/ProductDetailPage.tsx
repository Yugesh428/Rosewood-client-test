/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Edit, Eye, EyeOff, Package, Tag, Layers, FlaskConical, ShieldAlert, BookOpen, Star, ChevronDown, ChevronUp, X, Plus, Trash2 } from "lucide-react";

const FONT_HEADING    = "var(--font-cinzel), 'Cinzel', serif";
const FONT_MONTSERRAT = "var(--font-montserrat), 'Montserrat', sans-serif";
const inputCls = "w-full rounded border border-[#E5E5E5] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]";

const SUITABLE_FOR_OPTIONS = [
  "vegetarian","vegan","gluten_free","lactose_free",
  "diabetic_friendly","children","adults","elderly","pregnant_women",
];

type Category = { id: string; categoryName: string; parentId: string | null };
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

const BLANK_FORM = {
  categoryId: "", productName: "", dosageForm: "", strength: "", packSize: "",
  unitType: "", sellingPrice: "", originalPrice: "", tax: "0", discount: "0",
  isActive: true, suitableFor: [] as string[],
  productDescriptions: [{ title: "", content: "" }] as { title: string; content: string }[],
  specifications: [] as { key: string; value: string }[],
  ingredients: [] as Ingredient[],
  howToUse: [] as string[],
  safetyInformation: [] as string[],
  imageFile: null as File | null,
  imageUrl: "",
  galleryFiles: [] as File[],
  existingGallery: [] as string[],
};

// ── Collapsible Section ───────────────────────────────────────────────────────
function Section({ icon: Icon, title, count, children, defaultOpen = true }: {
  icon: React.ElementType; title: string; count?: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-lg overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAFAF8] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(212,175,55,0.10)" }}>
            <Icon className="w-4 h-4" style={{ color: "#D4AF37" }} />
          </div>
          <span style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 600, fontSize: "14px", color: "#111" }}>{title}</span>
          {count !== undefined && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: "rgba(212,175,55,0.10)", color: "#9a7a1a", fontFamily: FONT_MONTSERRAT }}>{count}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: "#AAA" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "#AAA" }} />}
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

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
  const [product, setProduct]       = useState<Product | null>(null);
  const [loading, setLoading]       = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [toggling, setToggling]     = useState(false);

  // Edit modal state
  const [editOpen, setEditOpen]         = useState(false);
  const [form, setForm]                 = useState({ ...BLANK_FORM });
  const [submitting, setSubmitting]     = useState(false);
  const [activeTab, setActiveTab]       = useState<"basic"|"descriptions"|"specifications"|"ingredients"|"howToUse"|"safetyInformation">("basic");
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryUrlInput, setGalleryUrlInput] = useState("");

  const setField = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  // ── Fetch product ──────────────────────────────────────────────────────────
  const loadProduct = useCallback(() => {
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

  useEffect(() => { loadProduct(); }, [loadProduct]);

  // ── Fetch categories for edit form ────────────────────────────────────────
  useEffect(() => {
    fetch("/api/product-categories?isActive=true&limit=500")
      .then(r => r.json())
      .then(json => { if (json.success) setAllCategories(json.data || []); })
      .catch(() => {});
  }, []);

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

  // ── Open edit modal ────────────────────────────────────────────────────────
  const openEdit = () => {
    if (!product) return;
    setForm({
      ...BLANK_FORM,
      categoryId:          product.categoryId,
      productName:         product.productName,
      dosageForm:          product.dosageForm,
      strength:            product.strength,
      packSize:            product.packSize,
      unitType:            product.unitType,
      sellingPrice:        String(product.sellingPrice),
      originalPrice:       String(product.originalPrice),
      tax:                 String(product.tax),
      discount:            String(product.discount),
      isActive:            product.isActive,
      suitableFor:         product.suitableFor || [],
      productDescriptions: product.productDescriptions?.length ? product.productDescriptions : [{ title: "", content: "" }],
      specifications:      product.specifications || [],
      ingredients:         (product.ingredients || []).map(i => ({ ...i, quantity: i.quantity || "", unit: i.unit || "" })),
      howToUse:            product.howToUse || [],
      safetyInformation:   product.safetyInformation || [],
      existingGallery:     product.productImages || [],
      imageUrl:            product.productImage || "",
    });
    setImagePreview(product.productImage || null);
    setActiveTab("basic");
    setEditOpen(true);
  };

  // ── Submit edit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);
    try {
      const descriptions = form.productDescriptions.filter(d => d.title.trim() || d.content.trim());
      const specifications = form.specifications.filter(s => s.key.trim() && s.value.trim());
      const ingredients = form.ingredients.filter(i => i.ingredientName.trim()).map((i, idx) => ({ ...i, sortOrder: idx }));

      const payload: Record<string, unknown> = {
        categoryId: form.categoryId,
        productName: form.productName,
        dosageForm: form.dosageForm,
        strength: form.strength,
        packSize: form.packSize,
        unitType: form.unitType,
        sellingPrice: Number(form.sellingPrice),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : Number(form.sellingPrice),
        tax: Number(form.tax),
        discount: Number(form.discount),
        isActive: form.isActive,
        imageUrl: form.imageUrl || null,
        productImages: form.existingGallery,
        productDescriptions: descriptions,
        specifications,
        suitableFor: form.suitableFor,
        ingredients,
        howToUse: form.howToUse.filter(s => s.trim()),
        safetyInformation: form.safetyInformation.filter(s => s.trim()),
      };

      if (form.imageFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) =>
          fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v ?? ""))
        );
        fd.append("image", form.imageFile);
        form.galleryFiles.forEach(f => fd.append("galleryImages", f));
        const res = await fetch(`/api/products/${product.id}`, { method: "PUT", body: fd });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || "Update failed");
      } else {
        const res = await fetch(`/api/products/${product.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || "Update failed");
      }

      toast.success("Product updated");
      setEditOpen(false);
      loadProduct();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSuitable = (tag: string) =>
    setField("suitableFor", form.suitableFor.includes(tag)
      ? form.suitableFor.filter(t => t !== tag)
      : [...form.suitableFor, tag]);

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

  const TABS = ["basic","descriptions","specifications","ingredients","howToUse","safetyInformation"] as const;
  const TAB_LABELS: Record<string, string> = { basic:"Basic", descriptions:"Descriptions", specifications:"Specifications", ingredients:"Ingredients", howToUse:"How to Use", safetyInformation:"Safety Info" };

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
            <button onClick={handleToggle} disabled={toggling}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded border text-sm font-semibold transition-colors disabled:opacity-50"
              style={{
                fontFamily: FONT_MONTSERRAT,
                backgroundColor: product.isActive ? "rgba(239,68,68,0.06)" : "rgba(34,197,94,0.06)",
                color: product.isActive ? "#dc2626" : "#16a34a",
                borderColor: product.isActive ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)",
              }}>
              {product.isActive ? <><EyeOff className="w-4 h-4" /> Hide from Store</> : <><Eye className="w-4 h-4" /> Show in Store</>}
            </button>

            <button onClick={openEdit}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded text-sm font-semibold text-white transition-colors hover:bg-[#b8952e]"
              style={{ backgroundColor: "#D4AF37", fontFamily: FONT_MONTSERRAT }}>
              <Edit className="w-4 h-4" /> Edit Product
            </button>
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
            <span className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0"
              style={{ backgroundColor: product.isActive ? "rgba(34,197,94,0.10)" : "rgba(0,0,0,0.06)", color: product.isActive ? "#166534" : "#6B7280" }}>
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── LEFT ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg p-4" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="aspect-square rounded-md overflow-hidden flex items-center justify-center" style={{ backgroundColor: "#F9F9F7" }}>
                {selectedImage
                  ? <img src={selectedImage} alt={product.productName} className="w-full h-full object-contain p-4" />
                  : <div className="flex flex-col items-center gap-2" style={{ color: "#CCC" }}><Package className="w-12 h-12" /><span style={{ fontSize: "11px" }}>No image</span></div>}
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {allImages.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(img)}
                      className="w-14 h-14 rounded-md overflow-hidden border-2 transition-all"
                      style={{ borderColor: selectedImage === img ? "#D4AF37" : "rgba(0,0,0,0.08)" }}>
                      <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-5" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "#AAA", fontWeight: 600 }}>Pricing</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: "13px", color: "#666" }}>Selling Price</span>
                  <span style={{ fontSize: "18px", fontWeight: 700, color: "#111" }}>£{selling.toFixed(2)}</span>
                </div>
                {original > selling && (
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: "13px", color: "#666" }}>Original Price</span>
                    <span style={{ fontSize: "14px", color: "#AAA", textDecoration: "line-through" }}>£{original.toFixed(2)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: "13px", color: "#666" }}>Discount</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(34,197,94,0.10)", color: "#16a34a" }}>{discount}% off</span>
                  </div>
                )}
                {Number(product.tax) > 0 && (
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: "13px", color: "#666" }}>Tax</span>
                    <span style={{ fontSize: "13px", color: "#444" }}>{product.tax}%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-5" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "#AAA", fontWeight: 600 }}>Details</p>
              <div className="space-y-3">
                <Field label="Product ID" value={<span className="font-mono text-[11px] text-[#888]">{product.id}</span>} />
                <Field label="Created" value={new Date(product.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} />
                <Field label="Updated" value={new Date(product.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} />
              </div>
            </div>
          </div>

          {/* ── RIGHT ────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <Section icon={Package} title="Product Information" defaultOpen>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <Field label="Category"    value={product.category?.categoryName} />
                <Field label="Dosage Form" value={product.dosageForm} />
                <Field label="Strength"    value={product.strength} />
                <Field label="Pack Size"   value={product.packSize} />
                <Field label="Unit Type"   value={product.unitType} />
                <Field label="Status" value={
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ backgroundColor: product.isActive ? "rgba(34,197,94,0.10)" : "rgba(0,0,0,0.06)", color: product.isActive ? "#166534" : "#6B7280" }}>
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                } />
              </div>
            </Section>

            {product.suitableFor?.length > 0 && (
              <Section icon={Tag} title="Suitable For" count={product.suitableFor.length}>
                <div className="flex flex-wrap gap-2 pt-2">
                  {product.suitableFor.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: "rgba(212,175,55,0.10)", color: "#9a7a1a", border: "1px solid rgba(212,175,55,0.2)" }}>
                      {tag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {product.productDescriptions?.length > 0 && (
              <Section icon={BookOpen} title="Descriptions" count={product.productDescriptions.length}>
                <div className="space-y-4 pt-2">
                  {product.productDescriptions.map((d, i) => (
                    <div key={i} className="pl-3" style={{ borderLeft: "2px solid #D4AF37" }}>
                      {d.title && <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "#888" }}>{d.title}</p>}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#444" }}>{d.content}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {product.ingredients && product.ingredients.length > 0 && (
              <Section icon={FlaskConical} title="Ingredients" count={product.ingredients.length}>
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-sm">
                    <thead><tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      {["#","Name","Quantity","Unit"].map(h => (
                        <th key={h} className="text-left py-2 px-3"
                          style={{ fontSize: "10px", fontWeight: 700, color: "#AAA", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {product.ingredients.map((ing, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                          <td className="py-2.5 px-3" style={{ color: "#AAA", fontSize: "12px" }}>{i + 1}</td>
                          <td className="py-2.5 px-3" style={{ fontWeight: 500, color: "#222" }}>{ing.ingredientName}</td>
                          <td className="py-2.5 px-3" style={{ color: "#666" }}>{ing.quantity || "—"}</td>
                          <td className="py-2.5 px-3" style={{ color: "#666" }}>{ing.unit || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {product.specifications?.length > 0 && (
              <Section icon={Layers} title="Specifications" count={product.specifications.length}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {product.specifications.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-2.5 rounded-md" style={{ backgroundColor: "#FAFAF8", border: "1px solid rgba(0,0,0,0.05)" }}>
                      <span className="text-xs font-semibold shrink-0" style={{ color: "#888", minWidth: "100px" }}>{s.key}</span>
                      <span style={{ fontSize: "13px", color: "#222", fontWeight: 500 }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {product.howToUse?.length > 0 && (
              <Section icon={Star} title="How to Use" count={product.howToUse.length} defaultOpen={false}>
                <ol className="space-y-3 pt-2">
                  {product.howToUse.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: "rgba(212,175,55,0.12)", color: "#D4AF37" }}>{i + 1}</span>
                      <p className="text-sm leading-relaxed pt-0.5" style={{ color: "#444" }}>{step}</p>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {product.safetyInformation?.length > 0 && (
              <Section icon={ShieldAlert} title="Safety Information" count={product.safetyInformation.length} defaultOpen={false}>
                <ul className="space-y-2.5 pt-2">
                  {product.safetyInformation.map((info, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#dc2626" }}>!</span>
                      <p className="text-sm leading-relaxed" style={{ color: "#444" }}>{info}</p>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        </div>
      </div>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto"
            style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <div>
                <p style={{ fontFamily: FONT_MONTSERRAT, fontSize: "10px", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Editing</p>
                <h2 style={{ fontFamily: FONT_HEADING, fontSize: "18px", fontWeight: 700, color: "#111" }}>Edit Product</h2>
              </div>
              <button onClick={() => setEditOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors">
                <X className="w-5 h-5" style={{ color: "#888" }} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b px-6 gap-1 overflow-x-auto" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className="px-3 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors"
                  style={{
                    fontFamily: FONT_MONTSERRAT,
                    borderBottomColor: activeTab === t ? "#D4AF37" : "transparent",
                    color: activeTab === t ? "#D4AF37" : "#888",
                  }}>
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

              {/* ── BASIC TAB ── */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  {/* Image */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ fontFamily: FONT_MONTSERRAT }}>Product Image</label>
                    {imagePreview && <img src={imagePreview} alt="preview" className="w-24 h-24 object-contain rounded border mb-2" style={{ borderColor: "#E5E5E5" }} />}
                    <input type="file" accept="image/*" onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setField("imageFile", file);
                      if (file) setImagePreview(URL.createObjectURL(file));
                    }} className="block text-sm" />
                    <div className="flex gap-2 mt-2">
                      <input type="text" placeholder="Or paste image URL…" value={form.imageUrl}
                        onChange={e => { setField("imageUrl", e.target.value); setImagePreview(e.target.value || null); }}
                        className={inputCls} style={{ fontFamily: FONT_MONTSERRAT }} />
                    </div>
                  </div>

                  {/* Gallery */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ fontFamily: FONT_MONTSERRAT }}>Gallery Images</label>
                    {form.existingGallery.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {form.existingGallery.map((url, i) => (
                          <div key={i} className="relative w-16 h-16">
                            <img src={url} alt="" className="w-full h-full object-cover rounded border" style={{ borderColor: "#E5E5E5" }} />
                            <button type="button" onClick={() => setField("existingGallery", form.existingGallery.filter((_, j) => j !== i))}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px]">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input type="text" placeholder="Paste gallery URL…" value={galleryUrlInput}
                        onChange={e => setGalleryUrlInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (galleryUrlInput.trim()) { setField("existingGallery", [...form.existingGallery, galleryUrlInput.trim()]); setGalleryUrlInput(""); } } }}
                        className={inputCls} style={{ fontFamily: FONT_MONTSERRAT }} />
                      <button type="button" onClick={() => { if (galleryUrlInput.trim()) { setField("existingGallery", [...form.existingGallery, galleryUrlInput.trim()]); setGalleryUrlInput(""); } }}
                        className="px-3 py-2 rounded bg-[#D4AF37] text-white text-xs font-semibold">+ Add</button>
                    </div>
                  </div>

                  {/* Category + Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
                      <select value={form.categoryId} onChange={e => setField("categoryId", e.target.value)} required className={inputCls} style={{ fontFamily: FONT_MONTSERRAT }}>
                        <option value="">Select category</option>
                        {allCategories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Product Name <span className="text-red-500">*</span></label>
                      <input type="text" value={form.productName} onChange={e => setField("productName", e.target.value)} required className={inputCls} style={{ fontFamily: FONT_MONTSERRAT }} />
                    </div>
                  </div>

                  {/* Dosage/Strength/Pack/Unit */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[["dosageForm","Dosage Form"],["strength","Strength"],["packSize","Pack Size"],["unitType","Unit Type"]].map(([k, l]) => (
                      <div key={k}>
                        <label className="block text-sm font-medium mb-1">{l} <span className="text-red-500">*</span></label>
                        <input type="text" value={form[k as keyof typeof form] as string} onChange={e => setField(k, e.target.value)} required className={inputCls} style={{ fontFamily: FONT_MONTSERRAT }} />
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { k: "sellingPrice",  l: "Selling Price",          req: true },
                      { k: "originalPrice", l: "Original Price (optional)", req: false },
                      { k: "tax",           l: "Tax (%)",                req: false },
                      { k: "discount",      l: "Discount (%)",           req: false },
                    ].map(({ k, l, req }) => (
                      <div key={k}>
                        <label className="block text-sm font-medium mb-1">{l}{req && <span className="text-red-500"> *</span>}</label>
                        <input type="number" min="0" step="0.01" required={req}
                          placeholder={k === "originalPrice" ? "Leave blank if no MRP" : "0"}
                          value={form[k as keyof typeof form] as string}
                          onChange={e => setField(k, e.target.value)}
                          className={inputCls} style={{ fontFamily: FONT_MONTSERRAT }} />
                      </div>
                    ))}
                  </div>

                  {/* Suitable For */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Suitable For</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {SUITABLE_FOR_OPTIONS.map(tag => (
                        <button key={tag} type="button" onClick={() => toggleSuitable(tag)}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${form.suitableFor.includes(tag) ? "bg-[#D4AF37] border-[#D4AF37] text-white" : "border-[#E5E5E5] text-[#6B6B6B] hover:border-[#D4AF37]"}`}>
                          {tag.replace(/_/g, " ")}
                        </button>
                      ))}
                    </div>
                    {form.suitableFor.filter(t => !SUITABLE_FOR_OPTIONS.includes(t)).map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 mr-1 mb-1 px-3 py-1 rounded-full text-xs bg-[#D4AF37] text-white">
                        {tag}
                        <button type="button" onClick={() => toggleSuitable(tag)} className="font-bold hover:opacity-70">×</button>
                      </span>
                    ))}
                    <div className="flex gap-2 mt-1">
                      <input type="text" id="editCustomTag" placeholder="Add custom tag…"
                        className="flex-1 rounded border border-[#E5E5E5] px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value.trim().toLowerCase().replace(/\s+/g, "_");
                            if (val && !form.suitableFor.includes(val)) toggleSuitable(val);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }} />
                      <button type="button"
                        className="px-3 py-1.5 rounded border border-[#D4AF37] text-[#D4AF37] text-xs font-semibold hover:bg-[#D4AF37] hover:text-white transition-colors"
                        onClick={() => {
                          const input = document.getElementById("editCustomTag") as HTMLInputElement;
                          const val = input.value.trim().toLowerCase().replace(/\s+/g, "_");
                          if (val && !form.suitableFor.includes(val)) toggleSuitable(val);
                          input.value = "";
                        }}>+ Add</button>
                    </div>
                  </div>

                  {/* Active */}
                  <div className="flex items-center gap-2">
                    <input id="editIsActive" type="checkbox" checked={form.isActive} onChange={e => setField("isActive", e.target.checked)} className="w-4 h-4 accent-[#D4AF37]" />
                    <label htmlFor="editIsActive" className="text-sm cursor-pointer" style={{ fontFamily: FONT_MONTSERRAT }}>Active (visible in store)</label>
                  </div>
                </div>
              )}

              {/* ── DESCRIPTIONS TAB ── */}
              {activeTab === "descriptions" && (
                <div className="space-y-3">
                  {form.productDescriptions.map((d, i) => (
                    <div key={i} className="p-4 rounded-lg border" style={{ borderColor: "#E5E5E5" }}>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-semibold text-[#888]">Section {i + 1}</span>
                        {form.productDescriptions.length > 1 && (
                          <button type="button" onClick={() => setField("productDescriptions", form.productDescriptions.filter((_, j) => j !== i))}
                            className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                      <input type="text" placeholder="Section title…" value={d.title}
                        onChange={e => setField("productDescriptions", form.productDescriptions.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                        className={`${inputCls} mb-2`} style={{ fontFamily: FONT_MONTSERRAT }} />
                      <textarea rows={4} placeholder="Content…" value={d.content}
                        onChange={e => setField("productDescriptions", form.productDescriptions.map((x, j) => j === i ? { ...x, content: e.target.value } : x))}
                        className={inputCls} style={{ fontFamily: FONT_MONTSERRAT }} />
                    </div>
                  ))}
                  <button type="button" onClick={() => setField("productDescriptions", [...form.productDescriptions, { title: "", content: "" }])}
                    className="flex items-center gap-1.5 text-sm text-[#D4AF37] hover:text-[#b8952e]">
                    <Plus className="w-4 h-4" /> Add Section
                  </button>
                </div>
              )}

              {/* ── SPECIFICATIONS TAB ── */}
              {activeTab === "specifications" && (
                <div className="space-y-3">
                  {form.specifications.map((s, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="text" placeholder="Key" value={s.key}
                        onChange={e => setField("specifications", form.specifications.map((x, j) => j === i ? { ...x, key: e.target.value } : x))}
                        className={inputCls} style={{ fontFamily: FONT_MONTSERRAT }} />
                      <input type="text" placeholder="Value" value={s.value}
                        onChange={e => setField("specifications", form.specifications.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                        className={inputCls} style={{ fontFamily: FONT_MONTSERRAT }} />
                      <button type="button" onClick={() => setField("specifications", form.specifications.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setField("specifications", [...form.specifications, { key: "", value: "" }])}
                    className="flex items-center gap-1.5 text-sm text-[#D4AF37] hover:text-[#b8952e]">
                    <Plus className="w-4 h-4" /> Add Specification
                  </button>
                </div>
              )}

              {/* ── INGREDIENTS TAB ── */}
              {activeTab === "ingredients" && (
                <div className="space-y-3">
                  {form.ingredients.map((ing, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 items-center">
                      <input type="text" placeholder="Ingredient name" value={ing.ingredientName}
                        onChange={e => setField("ingredients", form.ingredients.map((x, j) => j === i ? { ...x, ingredientName: e.target.value } : x))}
                        className={inputCls} style={{ fontFamily: FONT_MONTSERRAT }} />
                      <input type="text" placeholder="Quantity" value={ing.quantity}
                        onChange={e => setField("ingredients", form.ingredients.map((x, j) => j === i ? { ...x, quantity: e.target.value } : x))}
                        className={inputCls} style={{ fontFamily: FONT_MONTSERRAT }} />
                      <div className="flex gap-2">
                        <input type="text" placeholder="Unit (mg, ml…)" value={ing.unit}
                          onChange={e => setField("ingredients", form.ingredients.map((x, j) => j === i ? { ...x, unit: e.target.value } : x))}
                          className={inputCls} style={{ fontFamily: FONT_MONTSERRAT }} />
                        <button type="button" onClick={() => setField("ingredients", form.ingredients.filter((_, j) => j !== i))}
                          className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => setField("ingredients", [...form.ingredients, { ingredientName: "", quantity: "", unit: "", sortOrder: form.ingredients.length }])}
                    className="flex items-center gap-1.5 text-sm text-[#D4AF37] hover:text-[#b8952e]">
                    <Plus className="w-4 h-4" /> Add Ingredient
                  </button>
                </div>
              )}

              {/* ── HOW TO USE TAB ── */}
              {activeTab === "howToUse" && (
                <div className="space-y-3">
                  {form.howToUse.map((step, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-xs font-bold text-[#D4AF37] w-5 flex-shrink-0">{i + 1}.</span>
                      <input type="text" placeholder={`Step ${i + 1}…`} value={step}
                        onChange={e => setField("howToUse", form.howToUse.map((x, j) => j === i ? e.target.value : x))}
                        className={`${inputCls} flex-1`} style={{ fontFamily: FONT_MONTSERRAT }} />
                      <button type="button" onClick={() => setField("howToUse", form.howToUse.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setField("howToUse", [...form.howToUse, ""])}
                    className="flex items-center gap-1.5 text-sm text-[#D4AF37] hover:text-[#b8952e]">
                    <Plus className="w-4 h-4" /> Add Step
                  </button>
                </div>
              )}

              {/* ── SAFETY INFO TAB ── */}
              {activeTab === "safetyInformation" && (
                <div className="space-y-3">
                  {form.safetyInformation.map((info, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="text" placeholder="Safety information…" value={info}
                        onChange={e => setField("safetyInformation", form.safetyInformation.map((x, j) => j === i ? e.target.value : x))}
                        className={`${inputCls} flex-1`} style={{ fontFamily: FONT_MONTSERRAT }} />
                      <button type="button" onClick={() => setField("safetyInformation", form.safetyInformation.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setField("safetyInformation", [...form.safetyInformation, ""])}
                    className="flex items-center gap-1.5 text-sm text-[#D4AF37] hover:text-[#b8952e]">
                    <Plus className="w-4 h-4" /> Add Safety Info
                  </button>
                </div>
              )}

              {/* ── Footer buttons ── */}
              <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                <button type="button" onClick={() => setEditOpen(false)}
                  className="px-4 py-2 rounded text-sm font-semibold active:scale-95"
                  style={{ background: "linear-gradient(135deg,rgba(107,114,128,0.10) 0%,rgba(107,114,128,0.05) 100%)", color: "#6B7280", border: "1px solid rgba(107,114,128,0.25)", boxShadow: "0 2px 6px rgba(0,0,0,0.05),inset 0 1px 0 rgba(255,255,255,0.6)", fontFamily: FONT_MONTSERRAT, transition: "all 0.15s" }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 rounded text-sm font-bold active:scale-95"
                  style={{ background: "linear-gradient(135deg,#D4AF37 0%,#C9A52E 100%)", color: "#1A1A1A", border: "1px solid rgba(212,175,55,0.6)", boxShadow: "0 2px 8px rgba(212,175,55,0.42),inset 0 1px 0 rgba(255,255,255,0.2)", fontFamily: FONT_MONTSERRAT, opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer", transition: "all 0.15s" }}>
                  {submitting ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


