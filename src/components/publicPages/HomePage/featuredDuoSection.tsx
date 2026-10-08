/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const API_BASE       = "/api/ui/featured-duo";
const VIDEOS_API     = "/api/ui/featured-duo/videos";
const MAX_FILE_SIZE  = 5  * 1024 * 1024;   // 5 MB  — images
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;   // 50 MB — videos

const sharedInputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent font-sans";

type VideoRow = {
  id: string;
  url: string;
  brand: string | null;
  title: string | null;
  link: string | null;
  sortOrder: number;
};

export default function FeaturedDuoSection() {
  // ── Section meta ──────────────────────────────────────────────────────────
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  const [eyebrow,    setEyebrow]    = useState("");
  const [heading,    setHeading]    = useState("");
  const [shopNowUrl, setShopNowUrl] = useState("/pharmacy");

  // ── Left panel ────────────────────────────────────────────────────────────
  const [leftBrand,        setLeftBrand]        = useState("");
  const [leftTitle,        setLeftTitle]        = useState("");
  const [leftLink,         setLeftLink]         = useState("/pharmacy");
  const [leftImageFile,    setLeftImageFile]    = useState<File | null>(null);
  const [leftImageUrl,     setLeftImageUrl]     = useState("");
  const [leftImagePreview, setLeftImagePreview] = useState<string | null>(null);

  // ── Video carousel (real DB rows) ─────────────────────────────────────────
  const [videos,         setVideos]         = useState<VideoRow[]>([]);
  const [loadingVideos,  setLoadingVideos]  = useState(true);

  // ── Add-video form ────────────────────────────────────────────────────────
  const [newBrand,    setNewBrand]    = useState("");
  const [newTitle,    setNewTitle]    = useState("");
  const [newLink,     setNewLink]     = useState("/pharmacy");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoFile,setNewVideoFile]= useState<File | null>(null);
  const [newPreview,  setNewPreview]  = useState<string | null>(null);
  const [adding,      setAdding]      = useState(false);

  // ── Deleting set ──────────────────────────────────────────────────────────
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // ── Fetch section meta ────────────────────────────────────────────────────
  useEffect(() => {
    fetch(API_BASE)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          const d = json.data;
          setEyebrow(d.eyebrow || "");
          setHeading(d.heading || "");
          setShopNowUrl(d.shopNowUrl || "/pharmacy");
          setLeftBrand(d.leftBrand || "");
          setLeftTitle(d.leftTitle || "");
          setLeftLink(d.leftLink || "/pharmacy");
          setLeftImageUrl(d.leftImage || "");
          setLeftImagePreview(d.leftImage || null);
        }
      })
      .catch(() => toast.error("Failed to load section"))
      .finally(() => setLoading(false));
  }, []);

  // ── Fetch videos from real API ────────────────────────────────────────────
  const fetchVideos = useCallback(() => {
    setLoadingVideos(true);
    fetch(VIDEOS_API)
      .then(r => r.json())
      .then(json => {
        if (json.success) setVideos(json.data || []);
      })
      .catch(() => toast.error("Failed to load videos"))
      .finally(() => setLoadingVideos(false));
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  // ── Left image handlers ───────────────────────────────────────────────────
  const handleLeftImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) { toast.error("Image must be ≤ 5 MB"); return; }
    setLeftImageFile(file);
    setLeftImageUrl("");
    setLeftImagePreview(URL.createObjectURL(file));
  };

  const handleLeftUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeftImageUrl(e.target.value);
    setLeftImageFile(null);
    setLeftImagePreview(e.target.value || null);
  };

  // ── Save section meta ─────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("eyebrow",    eyebrow);
      fd.append("heading",    heading);
      fd.append("shopNowUrl", shopNowUrl);
      fd.append("leftBrand",  leftBrand);
      fd.append("leftTitle",  leftTitle);
      fd.append("leftLink",   leftLink);

      if (leftImageFile)       fd.append("leftImage",    leftImageFile);
      else if (leftImageUrl)   fd.append("leftImageUrl", leftImageUrl);

      const res  = await fetch(API_BASE, { method: "PUT", body: fd });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Save failed");
      toast.success("Section saved");
      setLeftImageFile(null);
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Add video (real API POST, multipart) ──────────────────────────────────
  const handleAddVideo = async () => {
    if (!newVideoUrl && !newVideoFile) {
      toast.error("Provide a video URL or upload a file");
      return;
    }
    setAdding(true);
    try {
      const fd = new FormData();
      fd.append("brand",     newBrand);
      fd.append("title",     newTitle);
      fd.append("link",      newLink);
      fd.append("sortOrder", String(videos.length));   // add to end

      if (newVideoFile) {
        if (newVideoFile.size > MAX_VIDEO_SIZE) throw new Error("Video must be ≤ 50 MB");
        fd.append("file", newVideoFile);
      } else {
        fd.append("url", newVideoUrl);
      }

      const res  = await fetch(VIDEOS_API, { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Upload failed");

      toast.success("Video added");
      // Refresh list from server — guaranteed real URLs
      fetchVideos();

      // Clear form
      setNewBrand(""); setNewTitle(""); setNewLink("/pharmacy");
      setNewVideoUrl(""); setNewVideoFile(null); setNewPreview(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to add video");
    } finally {
      setAdding(false);
    }
  };

  // ── Delete video (real API DELETE + file deletion on server) ─────────────
  const handleDeleteVideo = async (id: string) => {
    setDeletingIds(prev => new Set(prev).add(id));
    try {
      const res  = await fetch(`${VIDEOS_API}/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Delete failed");
      toast.success("Video deleted");
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeletingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: "#D4AF37", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="p-6 bg-white space-y-8">

      {/* ── Section Meta Form ─────────────────────────────────────────────── */}
      <form onSubmit={handleSave} className="space-y-6">
        <h3 className="font-heading text-base font-semibold">Section Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Eyebrow Label</label>
            <input type="text" value={eyebrow} onChange={e => setEyebrow(e.target.value)}
              placeholder="e.g. JUST LANDED" className={sharedInputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Heading</label>
            <input type="text" value={heading} onChange={e => setHeading(e.target.value)}
              placeholder="e.g. Skincare & Hair Care" className={sharedInputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">"Shop Now" Link</label>
          <input type="text" value={shopNowUrl} onChange={e => setShopNowUrl(e.target.value)}
            placeholder="/pharmacy" className={sharedInputClass} />
        </div>

        <div className="h-px bg-gray-200" />

        {/* Left Panel */}
        <div>
          <h4 className="font-medium text-sm mb-3">Left Panel (Photo)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Brand Label</label>
              <input type="text" value={leftBrand} onChange={e => setLeftBrand(e.target.value)}
                placeholder="e.g. ROMILLY WILDE" className={sharedInputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Panel Title</label>
              <input type="text" value={leftTitle} onChange={e => setLeftTitle(e.target.value)}
                placeholder="e.g. Proteomic Skincare" className={sharedInputClass} />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Link URL</label>
            <input type="text" value={leftLink} onChange={e => setLeftLink(e.target.value)}
              placeholder="/pharmacy" className={sharedInputClass} />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input type="text" value={leftImageUrl} onChange={handleLeftUrlChange}
              placeholder="https://..." className={sharedInputClass} />
            <p className="text-xs text-gray-500 mt-1">Or upload below:</p>
          </div>
          <div className="mt-2">
            <input type="file" accept="image/*" onChange={handleLeftImageChange}
              className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:bg-[#D4AF37] file:text-white hover:file:bg-[#b8952e]" />
            {leftImagePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={leftImagePreview} alt="preview" className="mt-2 w-40 h-40 object-cover rounded border" />
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving}
            className="px-6 py-2 rounded-sm text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: "#D4AF37" }}
            onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.backgroundColor = "#b8952e"; }}
            onMouseLeave={e => { if (!saving) (e.currentTarget as HTMLElement).style.backgroundColor = "#D4AF37"; }}>
            {saving ? "Saving..." : "Save Section"}
          </button>
        </div>
      </form>

      <div className="h-px bg-gray-200" />

      {/* ── Video Carousel CRUD ───────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="font-heading text-base font-semibold">
          Video Carousel&nbsp;
          <span className="text-sm font-normal text-gray-500">
            ({videos.length} video{videos.length !== 1 ? "s" : ""})
          </span>
        </h3>

        {/* Existing videos list */}
        {loadingVideos ? (
          <p className="text-sm text-gray-500">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No videos yet. Add one below.</p>
        ) : (
          <div className="space-y-2">
            {videos.map((v, idx) => (
              <div key={v.id}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded border">
                <span className="text-xs text-gray-400 w-5 shrink-0">{idx + 1}</span>

                {/* Tiny preview */}
                {v.url.match(/youtube\.com|youtu\.be/i) ? (
                  // YouTube — show thumbnail from YouTube's image CDN
                  (() => {
                    const ytId = v.url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/)?.[1];
                    return ytId ? (
                      <div className="relative w-10 h-14 shrink-0 rounded overflow-hidden border bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                          alt=""
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <polygon points="5,3 19,12 5,21" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-14 shrink-0 rounded border bg-gray-100 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                    );
                  })()
                ) : v.url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) ? (
                  <video src={v.url} className="w-10 h-14 object-cover rounded shrink-0 border" muted />
                ) : (
                  // Uploaded file path (no extension in URL) — show a play icon placeholder
                  <div className="w-10 h-14 shrink-0 rounded border bg-gray-900 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{v.title || "Untitled"}</p>
                  {v.brand && <p className="text-xs text-gray-500 truncate">{v.brand}</p>}
                  <p className="text-[10px] text-gray-400 truncate">{v.url}</p>
                </div>

                <button
                  type="button"
                  disabled={deletingIds.has(v.id)}
                  onClick={() => handleDeleteVideo(v.id)}
                  className="shrink-0 text-xs px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 transition-colors"
                >
                  {deletingIds.has(v.id) ? "Deleting…" : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Add New Video Form ─────────────────────────────────────────── */}
        <div className="border border-dashed border-gray-300 rounded p-4 space-y-3">
          <p className="text-sm font-medium">Add New Video</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Brand Label</label>
              <input type="text" value={newBrand} onChange={e => setNewBrand(e.target.value)}
                placeholder="e.g. ROMILLY WILDE" className={sharedInputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Video Title</label>
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Overnight Repair" className={sharedInputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Shop Link</label>
            <input type="text" value={newLink} onChange={e => setNewLink(e.target.value)}
              placeholder="/pharmacy" className={sharedInputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Video URL (YouTube / MP4 link)</label>
            <input
              type="text"
              value={newVideoUrl}
              onChange={e => {
                setNewVideoUrl(e.target.value);
                if (e.target.value) { setNewVideoFile(null); setNewPreview(e.target.value); }
              }}
              placeholder="https://youtube.com/... or https://example.com/video.mp4"
              className={sharedInputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Or Upload Video File
              <span className="text-gray-400 font-normal"> (MP4, WebM, MOV — max 50 MB)</span>
            </label>
            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > MAX_VIDEO_SIZE) { toast.error("Video must be ≤ 50 MB"); return; }
                setNewVideoFile(file);
                setNewVideoUrl("");
                setNewPreview(URL.createObjectURL(file));
              }}
              className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:bg-[#D4AF37] file:text-white hover:file:bg-[#b8952e]"
            />
          </div>

          {/* Preview */}
          {newPreview && (
            <div>
              {newPreview.includes("youtube") || newPreview.includes("youtu.be") ? (
                <p className="text-xs text-gray-500 px-3 py-2 bg-gray-50 rounded">
                  YouTube: {newPreview}
                </p>
              ) : newPreview.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) || newVideoFile ? (
                <video src={newPreview} controls className="w-40 h-56 object-cover rounded border" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={newPreview} alt="preview" className="w-40 h-56 object-cover rounded border" />
              )}
            </div>
          )}

          <button
            type="button"
            disabled={adding}
            onClick={handleAddVideo}
            className="px-5 py-2 rounded-sm text-sm font-medium text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: "#D4AF37" }}
            onMouseEnter={e => { if (!adding) (e.currentTarget as HTMLElement).style.backgroundColor = "#b8952e"; }}
            onMouseLeave={e => { if (!adding) (e.currentTarget as HTMLElement).style.backgroundColor = "#D4AF37"; }}
          >
            {adding ? "Uploading & Saving…" : "Add Video to Carousel"}
          </button>
        </div>
      </div>

    </div>
  );
}
