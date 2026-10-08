/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

const API = "/api/ui/discover";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const input =
  "w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent font-sans";
const textarea =
  "w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent font-sans resize-none";

// ── Image row (URL + file picker + preview) ───────────────────────────────────
function ImageField({
  label,
  urlValue,
  onUrlChange,
  onFileChange,
  preview,
}: {
  label: string;
  urlValue: string;
  onUrlChange: (v: string) => void;
  onFileChange: (f: File) => void;
  preview: string | null;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label} — Image URL</label>
      <input
        type="text"
        value={urlValue}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://… or paste Google Drive URL"
        className={input}
      />
      <p className="text-xs text-gray-400">Or upload a file:</p>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          if (f.size > MAX_FILE_SIZE) { toast.error("Max 5 MB"); return; }
          onFileChange(f);
        }}
        className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:bg-[#D4AF37] file:text-white hover:file:bg-[#b8952e]"
      />
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="preview" className="mt-2 w-48 h-28 object-cover rounded border" />
      )}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-[10px] tracking-widest uppercase text-gray-400 font-sans">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DiscoverSectionAdmin() {
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);

  // main card
  const [eyebrow,     setEyebrow]     = useState("");
  const [heading,     setHeading]     = useState("");
  const [description, setDescription] = useState("");
  const [ctaText,     setCtaText]     = useState("DISCOVER MORE");
  const [mainImgUrl,  setMainImgUrl]  = useState("");
  const [mainImgFile, setMainImgFile] = useState<File | null>(null);
  const [mainImgPrev, setMainImgPrev] = useState<string | null>(null);

  // expanded top
  const [expTitle,  setExpTitle]  = useState("");
  const [expDesc,   setExpDesc]   = useState("");
  const [expBtn1T,  setExpBtn1T]  = useState("");
  const [expBtn1L,  setExpBtn1L]  = useState("");
  const [expBtn2T,  setExpBtn2T]  = useState("");
  const [expBtn2L,  setExpBtn2L]  = useState("");
  const [expImgLabel, setExpImgLabel] = useState("");
  const [expImgUrl,  setExpImgUrl]  = useState("");
  const [expImgFile, setExpImgFile] = useState<File | null>(null);
  const [expImgPrev, setExpImgPrev] = useState<string | null>(null);

  // dive block
  const [diveInto, setDiveInto] = useState("");
  const [diveHead, setDiveHead] = useState("");
  const [diveDesc, setDiveDesc] = useState("");

  // video block
  const [videoLabel, setVideoLabel] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl,   setVideoUrl]   = useState("");
  const [videoImgUrl,  setVideoImgUrl]  = useState("");
  const [videoImgFile, setVideoImgFile] = useState<File | null>(null);
  const [videoImgPrev, setVideoImgPrev] = useState<string | null>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then(({ success, data: d }) => {
        if (!success || !d) return;
        setEyebrow(d.eyebrow || "");
        setHeading(d.heading || "");
        setDescription(d.description || "");
        setCtaText(d.ctaText || "DISCOVER MORE");
        setMainImgUrl(d.mainImage || "");
        setMainImgPrev(d.mainImage || null);

        setExpTitle(d.expandTitle || "");
        setExpDesc(d.expandDescription || "");
        setExpBtn1T(d.expandBtn1Text || "");
        setExpBtn1L(d.expandBtn1Link || "");
        setExpBtn2T(d.expandBtn2Text || "");
        setExpBtn2L(d.expandBtn2Link || "");
        setExpImgLabel(d.expandImageLabel || "");
        setExpImgUrl(d.expandImage || "");
        setExpImgPrev(d.expandImage || null);

        setDiveInto(d.diveInto || "");
        setDiveHead(d.diveHeading || "");
        setDiveDesc(d.diveDescription || "");

        setVideoLabel(d.videoLabel || "");
        setVideoTitle(d.videoTitle || "");
        setVideoUrl(d.videoUrl || "");
        setVideoImgUrl(d.videoImage || "");
        setVideoImgPrev(d.videoImage || null);
      })
      .catch(() => toast.error("Failed to load section"))
      .finally(() => setLoading(false));
  }, []);

  // ── URL change helpers (clears file) ────────────────────────────────────────
  const handleMainUrl = (v: string) => {
    setMainImgUrl(v); setMainImgFile(null);
    if (v) setMainImgPrev(v);
  };
  const handleMainFile = (f: File) => {
    setMainImgFile(f); setMainImgUrl("");
    setMainImgPrev(URL.createObjectURL(f));
  };
  const handleExpUrl = (v: string) => {
    setExpImgUrl(v); setExpImgFile(null);
    if (v) setExpImgPrev(v);
  };
  const handleExpFile = (f: File) => {
    setExpImgFile(f); setExpImgUrl("");
    setExpImgPrev(URL.createObjectURL(f));
  };
  const handleVideoUrl = (v: string) => {
    setVideoImgUrl(v); setVideoImgFile(null);
    if (v) setVideoImgPrev(v);
  };
  const handleVideoFile = (f: File) => {
    setVideoImgFile(f); setVideoImgUrl("");
    setVideoImgPrev(URL.createObjectURL(f));
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("eyebrow", eyebrow);
      fd.append("heading", heading);
      fd.append("description", description);
      fd.append("ctaText", ctaText);
      fd.append("expandTitle", expTitle);
      fd.append("expandDescription", expDesc);
      fd.append("expandBtn1Text", expBtn1T);
      fd.append("expandBtn1Link", expBtn1L);
      fd.append("expandBtn2Text", expBtn2T);
      fd.append("expandBtn2Link", expBtn2L);
      fd.append("expandImageLabel", expImgLabel);
      fd.append("diveInto", diveInto);
      fd.append("diveHeading", diveHead);
      fd.append("diveDescription", diveDesc);
      fd.append("videoLabel", videoLabel);
      fd.append("videoTitle", videoTitle);
      fd.append("videoUrl", videoUrl);

      if (mainImgFile)       fd.append("mainImage",    mainImgFile);
      else if (mainImgUrl)   fd.append("mainImageUrl", mainImgUrl);

      if (expImgFile)        fd.append("expandImage",    expImgFile);
      else if (expImgUrl)    fd.append("expandImageUrl", expImgUrl);

      if (videoImgFile)      fd.append("videoImage",    videoImgFile);
      else if (videoImgUrl)  fd.append("videoImageUrl", videoImgUrl);

      const res  = await fetch(API, { method: "PUT", body: fd });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Save failed");
      toast.success("Discover section saved");
      setMainImgFile(null);
      setExpImgFile(null);
      setVideoImgFile(null);
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: "#D4AF37", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="p-6 bg-white">
      <form onSubmit={handleSave} className="space-y-6">

        {/* ── MAIN CARD ────────────────────────────────────────────────── */}
        <Divider label="Main Card (always visible)" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Eyebrow Label</label>
            <input value={eyebrow} onChange={(e) => setEyebrow(e.target.value)}
              placeholder="e.g. THE ROSEWOOD PODCAST" className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CTA Button Text</label>
            <input value={ctaText} onChange={(e) => setCtaText(e.target.value)}
              placeholder="DISCOVER MORE" className={input} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Heading</label>
          <input value={heading} onChange={(e) => setHeading(e.target.value)}
            placeholder="e.g. We are back with Season 3!" className={input} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            rows={3} placeholder="Short paragraph shown in the main card…" className={textarea} />
        </div>

        <ImageField label="Main Card" urlValue={mainImgUrl}
          onUrlChange={handleMainUrl} onFileChange={handleMainFile} preview={mainImgPrev} />

        {/* ── EXPANDED TOP BLOCK ───────────────────────────────────────── */}
        <Divider label="Expanded — Top Block" />

        <div>
          <label className="block text-sm font-medium mb-1">Expanded Heading</label>
          <input value={expTitle} onChange={(e) => setExpTitle(e.target.value)}
            placeholder="e.g. We are Back with Season 3!" className={input} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Expanded Description</label>
          <textarea value={expDesc} onChange={(e) => setExpDesc(e.target.value)}
            rows={3} placeholder="Longer text shown after expanding…" className={textarea} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Button 1 Text</label>
            <input value={expBtn1T} onChange={(e) => setExpBtn1T(e.target.value)}
              placeholder="LISTEN ON SPOTIFY" className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Button 1 Link</label>
            <input value={expBtn1L} onChange={(e) => setExpBtn1L(e.target.value)}
              placeholder="https://open.spotify.com/…" className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Button 2 Text</label>
            <input value={expBtn2T} onChange={(e) => setExpBtn2T(e.target.value)}
              placeholder="WATCH" className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Button 2 Link</label>
            <input value={expBtn2L} onChange={(e) => setExpBtn2L(e.target.value)}
              placeholder="https://youtube.com/…" className={input} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Right Image Overlay Label</label>
          <input value={expImgLabel} onChange={(e) => setExpImgLabel(e.target.value)}
            placeholder="e.g. THE CONVERSATION CONTINUES" className={input} />
        </div>

        <ImageField label="Expanded Right" urlValue={expImgUrl}
          onUrlChange={handleExpUrl} onFileChange={handleExpFile} preview={expImgPrev} />

        {/* ── EXPANDED DIVE BLOCK ──────────────────────────────────────── */}
        <Divider label="Expanded — Dive Into Block" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Eyebrow (Dive Into)</label>
            <input value={diveInto} onChange={(e) => setDiveInto(e.target.value)}
              placeholder="DIVE INTO" className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dive Heading</label>
            <input value={diveHead} onChange={(e) => setDiveHead(e.target.value)}
              placeholder="e.g. All things Beauty & Wellbeing" className={input} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dive Description</label>
          <textarea value={diveDesc} onChange={(e) => setDiveDesc(e.target.value)}
            rows={3} placeholder="Paragraph about the podcast topic…" className={textarea} />
        </div>

        {/* ── VIDEO BLOCK ──────────────────────────────────────────────── */}
        <Divider label="Expanded — Video Block" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Video Label</label>
            <input value={videoLabel} onChange={(e) => setVideoLabel(e.target.value)}
              placeholder="e.g. DR IVONA IGRC" className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Video Title</label>
            <input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="e.g. Dr Ivy" className={input} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Video / Link URL</label>
          <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=…" className={input} />
        </div>

        <ImageField label="Video Thumbnail" urlValue={videoImgUrl}
          onUrlChange={handleVideoUrl} onFileChange={handleVideoFile} preview={videoImgPrev} />

        {/* ── Save ─────────────────────────────────────────────────────── */}
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving}
            className="px-6 py-2 rounded-sm text-sm font-medium text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: "#D4AF37" }}
            onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.backgroundColor = "#b8952e"; }}
            onMouseLeave={(e) => { if (!saving) (e.currentTarget as HTMLElement).style.backgroundColor = "#D4AF37"; }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
}
