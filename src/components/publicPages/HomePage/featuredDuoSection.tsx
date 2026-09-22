/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

const API_BASE = "/api/ui/featured-duo";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const sharedInputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent font-sans";

export default function FeaturedDuoSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [eyebrow, setEyebrow] = useState("");
  const [heading, setHeading] = useState("");
  const [shopNowUrl, setShopNowUrl] = useState("/pharmacy");

  const [leftBrand, setLeftBrand] = useState("");
  const [leftTitle, setLeftTitle] = useState("");
  const [leftLink, setLeftLink] = useState("/pharmacy");
  const [leftImageFile, setLeftImageFile] = useState<File | null>(null);
  const [leftImageUrl, setLeftImageUrl] = useState("");
  const [leftImagePreview, setLeftImagePreview] = useState<string | null>(null);

  const [rightBrand, setRightBrand] = useState("");
  const [rightTitle, setRightTitle] = useState("");
  const [rightLink, setRightLink] = useState("/pharmacy");
  const [rightImageFile, setRightImageFile] = useState<File | null>(null);
  const [rightImageUrl, setRightImageUrl] = useState("");
  const [rightImagePreview, setRightImagePreview] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(API_BASE)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const d = json.data;
          setData(d);
          setEyebrow(d.eyebrow || "");
          setHeading(d.heading || "");
          setShopNowUrl(d.shopNowUrl || "/pharmacy");
          setLeftBrand(d.leftBrand || "");
          setLeftTitle(d.leftTitle || "");
          setLeftLink(d.leftLink || "/pharmacy");
          setLeftImageUrl(d.leftImage || "");
          setLeftImagePreview(d.leftImage || null);
          setRightBrand(d.rightBrand || "");
          setRightTitle(d.rightTitle || "");
          setRightLink(d.rightLink || "/pharmacy");
          setRightImageUrl(d.rightImage || "");
          setRightImagePreview(d.rightImage || null);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load section");
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Image handlers ────────────────────────────────────────────────────────
  const handleLeftImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be ≤ 5 MB");
      return;
    }
    setLeftImageFile(file);
    setLeftImageUrl(""); // Clear URL when file is selected
    setLeftImagePreview(URL.createObjectURL(file));
  };

  const handleLeftUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLeftImageUrl(url);
    if (url) {
      setLeftImageFile(null); // Clear file when URL is entered
      setLeftImagePreview(url);
    }
  };

  const handleRightImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be ≤ 5 MB");
      return;
    }
    setRightImageFile(file);
    setRightImageUrl(""); // Clear URL when file is selected
    setRightImagePreview(URL.createObjectURL(file));
  };

  const handleRightUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setRightImageUrl(url);
    if (url) {
      setRightImageFile(null); // Clear file when URL is entered
      setRightImagePreview(url);
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("eyebrow", eyebrow);
      fd.append("heading", heading);
      fd.append("shopNowUrl", shopNowUrl);
      fd.append("leftBrand", leftBrand);
      fd.append("leftTitle", leftTitle);
      fd.append("leftLink", leftLink);
      fd.append("rightBrand", rightBrand);
      fd.append("rightTitle", rightTitle);
      fd.append("rightLink", rightLink);
      
      // Handle left image: file upload or URL
      if (leftImageFile) {
        fd.append("leftImage", leftImageFile);
      } else if (leftImageUrl) {
        fd.append("leftImageUrl", leftImageUrl);
      }
      
      // Handle right image: file upload or URL
      if (rightImageFile) {
        fd.append("rightImage", rightImageFile);
      } else if (rightImageUrl) {
        fd.append("rightImageUrl", rightImageUrl);
      }

      const res = await fetch(API_BASE, { method: "PUT", body: fd });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Save failed");
      toast.success("Featured Duo section updated");
      setData(json.data);
      setLeftImageFile(null);
      setRightImageFile(null);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#D4AF37", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white">
      <form onSubmit={handleSave} className="space-y-6">

        {/* ── Header text ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Eyebrow Label</label>
            <input type="text" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)}
              placeholder="e.g. JUST LANDED" className={sharedInputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Heading</label>
            <input type="text" value={heading} onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. Skincare & Hair Care" className={sharedInputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">"Shop Now" Link</label>
          <input type="text" value={shopNowUrl} onChange={(e) => setShopNowUrl(e.target.value)}
            placeholder="/pharmacy" className={sharedInputClass} />
        </div>

        <div className="h-px bg-gray-200" />

        {/* ── Left Panel ────────────────────────────────────────────────── */}
        <div>
          <h3 className="font-heading text-base mb-3">Left Panel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Brand Label</label>
              <input type="text" value={leftBrand} onChange={(e) => setLeftBrand(e.target.value)}
                placeholder="e.g. ROMILLY WILDE" className={sharedInputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Panel Title</label>
              <input type="text" value={leftTitle} onChange={(e) => setLeftTitle(e.target.value)}
                placeholder="e.g. Proteomic Skincare" className={sharedInputClass} />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Link URL</label>
            <input type="text" value={leftLink} onChange={(e) => setLeftLink(e.target.value)}
              placeholder="/pharmacy?category=..." className={sharedInputClass} />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Image URL (Google Drive, etc.)</label>
            <input 
              type="text" 
              value={leftImageUrl} 
              onChange={handleLeftUrlChange}
              placeholder="https://example.com/image.jpg or paste Google Drive image URL" 
              className={sharedInputClass} 
            />
            <p className="text-xs text-gray-500 mt-1">Or upload a file below:</p>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Upload Image</label>
            <input type="file" accept="image/*" onChange={handleLeftImageChange}
              className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:bg-[#D4AF37] file:text-white hover:file:bg-[#b8952e]" />
            {leftImagePreview && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={leftImagePreview} alt="Left preview" className="w-40 h-40 object-cover rounded border" />
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* ── Right Panel ───────────────────────────────────────────────── */}
        <div>
          <h3 className="font-heading text-base mb-3">Right Panel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Brand Label</label>
              <input type="text" value={rightBrand} onChange={(e) => setRightBrand(e.target.value)}
                placeholder="e.g. INNERSENSE" className={sharedInputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Panel Title</label>
              <input type="text" value={rightTitle} onChange={(e) => setRightTitle(e.target.value)}
                placeholder="e.g. Overnight Hair Repair" className={sharedInputClass} />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Link URL</label>
            <input type="text" value={rightLink} onChange={(e) => setRightLink(e.target.value)}
              placeholder="/pharmacy?category=..." className={sharedInputClass} />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Image URL (Google Drive, etc.)</label>
            <input 
              type="text" 
              value={rightImageUrl} 
              onChange={handleRightUrlChange}
              placeholder="https://example.com/image.jpg or paste Google Drive image URL" 
              className={sharedInputClass} 
            />
            <p className="text-xs text-gray-500 mt-1">Or upload a file below:</p>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Upload Image</label>
            <input type="file" accept="image/*" onChange={handleRightImageChange}
              className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:bg-[#D4AF37] file:text-white hover:file:bg-[#b8952e]" />
            {rightImagePreview && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rightImagePreview} alt="Right preview" className="w-40 h-40 object-cover rounded border" />
              </div>
            )}
          </div>
        </div>

        {/* ── Save button ──────────────────────────────────────────────── */}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving}
            className="px-6 py-2 rounded-sm text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#D4AF37" }}
            onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.backgroundColor = "#b8952e"; }}
            onMouseLeave={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.backgroundColor = "#D4AF37"; }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
}
