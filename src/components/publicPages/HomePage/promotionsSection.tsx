/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";

const API_BASE = "/api/ui/promotions";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const sharedInputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent font-sans";

interface PromotionSlide {
  id: string;
  eyebrow: string | null;
  brand: string | null;
  title: string | null;
  description: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  bgImage: string | null;
  order: number;
  isActive: boolean;
}

export default function PromotionsSection() {
  const [slides, setSlides] = useState<PromotionSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [eyebrow, setEyebrow] = useState("");
  const [brand, setBrand] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [bgImageUrl, setBgImageUrl] = useState("");
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [bgImagePreview, setBgImagePreview] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Fetch all slides ──────────────────────────────────────────────────────
  const fetchSlides = async () => {
    try {
      const res = await fetch(`${API_BASE}/all`);
      const json = await res.json();
      if (json.success) setSlides(json.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  // ── Reset form ────────────────────────────────────────────────────────────
  const resetForm = () => {
    setEyebrow("");
    setBrand("");
    setTitle("");
    setDescription("");
    setCtaText("");
    setCtaLink("");
    setBgImageUrl("");
    setBgImageFile(null);
    setBgImagePreview(null);
    setIsActive(true);
    setEditingId(null);
    setShowForm(false);
  };

  // ── Open edit form ────────────────────────────────────────────────────────
  const handleEdit = (slide: PromotionSlide) => {
    setEditingId(slide.id);
    setEyebrow(slide.eyebrow || "");
    setBrand(slide.brand || "");
    setTitle(slide.title || "");
    setDescription(slide.description || "");
    setCtaText(slide.ctaText || "");
    setCtaLink(slide.ctaLink || "");
    setBgImageUrl(slide.bgImage || "");
    setBgImagePreview(slide.bgImage || null);
    setIsActive(slide.isActive);
    setShowForm(true);
  };

  // ── Image handlers ────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be ≤ 5 MB");
      return;
    }
    setBgImageFile(file);
    setBgImageUrl("");
    setBgImagePreview(URL.createObjectURL(file));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setBgImageUrl(url);
    if (url) {
      setBgImageFile(null);
      setBgImagePreview(url);
    }
  };

  // ── Save (create or update) ───────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("eyebrow", eyebrow);
      fd.append("brand", brand);
      fd.append("title", title);
      fd.append("description", description);
      fd.append("ctaText", ctaText);
      fd.append("ctaLink", ctaLink);
      fd.append("isActive", String(isActive));

      if (bgImageFile) {
        fd.append("bgImage", bgImageFile);
      } else if (bgImageUrl) {
        fd.append("bgImageUrl", bgImageUrl);
      }

      const isEditing = !!editingId;
      const url = isEditing ? `${API_BASE}/${editingId}` : API_BASE;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      const json = await res.json();

      if (!res.ok || !json.success) throw new Error(json.message || "Save failed");

      toast.success(isEditing ? "Promotion updated" : "Promotion created");
      resetForm();
      fetchSlides();
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promotion?")) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Delete failed");
      toast.success("Promotion deleted");
      fetchSlides();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  // ── Toggle active ─────────────────────────────────────────────────────────
  const handleToggleActive = async (slide: PromotionSlide) => {
    try {
      const fd = new FormData();
      fd.append("isActive", String(!slide.isActive));

      const res = await fetch(`${API_BASE}/${slide.id}`, { method: "PUT", body: fd });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Update failed");
      toast.success(slide.isActive ? "Promotion hidden" : "Promotion activated");
      fetchSlides();
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div
          className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#D4AF37", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-lg text-gray-900">Promotion Slides</h3>
          <p className="text-xs text-gray-500 mt-1">Manage carousel slides for limited-time promotions</p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "#D4AF37" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#b8952e")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#D4AF37")}
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </button>
      </div>

      {/* ── Slide List ────────────────────────────────────────────────────── */}
      {slides.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-400 text-sm">
          No promotion slides yet. Click "Add Slide" to create one.
        </div>
      )}

      {slides.length > 0 && !showForm && (
        <div className="space-y-3">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
            >
              <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
              
              {slide.bgImage && (
                <div className="w-20 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slide.bgImage} alt={slide.title || "Slide"} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {slide.eyebrow && (
                    <span className="text-[9px] tracking-wider uppercase text-gray-400">{slide.eyebrow}</span>
                  )}
                  {slide.brand && (
                    <span className="text-xs font-semibold text-gray-700">{slide.brand}</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{slide.title || "Untitled"}</p>
                {slide.description && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{slide.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggleActive(slide)}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title={slide.isActive ? "Hide" : "Show"}
                >
                  {slide.isActive ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(slide)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="p-2 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Form ──────────────────────────────────────────────────────────── */}
      {showForm && (
        <form onSubmit={handleSave} className="space-y-4 border border-gray-200 rounded-sm p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading text-base">{editingId ? "Edit Slide" : "New Slide"}</h4>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Eyebrow Label</label>
              <input
                type="text"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                placeholder="e.g. LIMITED TIME"
                className={sharedInputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. LA ROCHE-POSAY"
                className={sharedInputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Save 20%"
              className={sharedInputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. on selected lines only until October 12th"
              rows={2}
              className={sharedInputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">CTA Button Text</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="e.g. ANTHELIOS SUNCARE"
                className={sharedInputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CTA Link URL</label>
              <input
                type="text"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                placeholder="/pharmacy?category=suncare"
                className={sharedInputClass}
              />
            </div>
          </div>

          <div className="h-px bg-gray-200 my-4" />

          <div>
            <label className="block text-sm font-medium mb-1">Background Image URL</label>
            <input
              type="text"
              value={bgImageUrl}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.jpg or Google Drive URL"
              className={sharedInputClass}
            />
            <p className="text-xs text-gray-500 mt-1">Or upload a file below:</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload Background Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:bg-[#D4AF37] file:text-white hover:file:bg-[#b8952e]"
            />
            {bgImagePreview && (
              <div className="mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bgImagePreview} alt="Preview" className="w-full max-w-md h-32 object-cover rounded border" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active (show on frontend)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-sm text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-sm text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: "#D4AF37" }}
              onMouseEnter={(e) => {
                if (!saving) (e.currentTarget as HTMLElement).style.backgroundColor = "#b8952e";
              }}
              onMouseLeave={(e) => {
                if (!saving) (e.currentTarget as HTMLElement).style.backgroundColor = "#D4AF37";
              }}
            >
              {saving ? "Saving..." : editingId ? "Update Slide" : "Create Slide"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
