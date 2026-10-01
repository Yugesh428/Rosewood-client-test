/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { ChevronRight, ChevronDown, Download, Plus, Upload, Search, X } from "lucide-react";
import CategoryDashboard from "@/components/admin/categories/CategoryDashboard";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = {
  id: string;
  categoryName: string;
  categoryDescription: string | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parentCategory?: Category | null;
};

type TreeNode = Category & { children: TreeNode[] };

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  summary?: { total: number; created: number; skipped: number; invalidRows: number };
  skippedNames?: string[];
};

const API_BASE = "/api/product-categories";
const PAGE_SIZE = 15; // root nodes per page

// ─── Font helpers ─────────────────────────────────────────────────────────────
const FONT_HEADING    = "var(--font-cinzel), 'Cinzel', serif";
const FONT_MONTSERRAT = "var(--font-montserrat), 'Montserrat', sans-serif";

// ─── Build tree ───────────────────────────────────────────────────────────────

function buildTree(flat: Category[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  flat.forEach(c => map.set(c.id, { ...c, children: [] }));
  const roots: TreeNode[] = [];
  map.forEach(node => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  const sort = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    nodes.forEach(n => sort(n.children));
  };
  sort(roots);
  return roots;
}

// ─── Export ───────────────────────────────────────────────────────────────────

function exportToCSV(categories: Category[]) {
  const headers = ["id","categoryName","categoryDescription","parentId","parentName","isActive","createdAt","updatedAt"];
  const rows = categories.map(c => [
    c.id, c.categoryName, c.categoryDescription || "",
    c.parentId || "", c.parentCategory?.categoryName || "",
    String(c.isActive),
    c.createdAt ? new Date(c.createdAt).toLocaleString() : "",
    c.updatedAt ? new Date(c.updatedAt).toLocaleString() : "",
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = `categories-${new Date().toISOString().slice(0,10)}.csv`;
  link.click(); URL.revokeObjectURL(url);
}

// ─── Level colours ────────────────────────────────────────────────────────────

const LEVEL_STYLE = [
  { dot: "#D4AF37", label: "Root",  bg: "rgba(212,175,55,0.10)", color: "#9a7a1a" },
  { dot: "#6C8EBF", label: "Sub",   bg: "rgba(108,142,191,0.10)", color: "#3a5f8a" },
  { dot: "#9B7FC7", label: "L3",    bg: "rgba(155,127,199,0.10)", color: "#5c3d8f" },
  { dot: "#5DAB8E", label: "L4",    bg: "rgba(93,171,142,0.10)",  color: "#2d7a5a" },
];

function levelStyle(depth: number) {
  return LEVEL_STYLE[Math.min(depth, LEVEL_STYLE.length - 1)];
}

// ─── Tree Row ─────────────────────────────────────────────────────────────────

function TreeRow({
  node, depth, defaultOpen, copiedId,
  onCopy, onEdit, onToggle,
}: {
  node: TreeNode; depth: number; defaultOpen: boolean;
  copiedId: string | null;
  onCopy: (id: string) => void;
  onEdit: (cat: Category) => void;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = node.children.length > 0;
  const ls = levelStyle(depth);
  const indent = depth * 22;

  // sync with parent expand-all toggle
  useEffect(() => { setOpen(defaultOpen); }, [defaultOpen]);

  return (
    <>
      <tr
        className="border-b transition-colors"
        style={{ borderColor: "rgba(0,0,0,0.05)" }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(212,175,55,0.03)")}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}
      >
        {/* Name */}
        <td className="py-3 pr-4" style={{ paddingLeft: `${16 + indent}px` }}>
          <div className="flex items-center gap-2">
            {/* expand toggle */}
            {hasChildren ? (
              <button
                onClick={() => setOpen(o => !o)}
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors hover:bg-black/5"
              >
                {open
                  ? <ChevronDown  className="w-3.5 h-3.5" style={{ color: ls.dot }} />
                  : <ChevronRight className="w-3.5 h-3.5" style={{ color: ls.dot }} />}
              </button>
            ) : (
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {depth > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ls.dot, opacity: 0.4 }} />
                )}
              </span>
            )}

            {/* name */}
            <span
              style={{
                fontFamily: FONT_MONTSERRAT,
                fontWeight: depth === 0 ? 600 : 500,
                fontSize: depth === 0 ? "13px" : "12.5px",
                color: depth === 0 ? "#111" : "#222",
                letterSpacing: depth === 0 ? "0.01em" : "0",
              }}
            >
              {node.categoryName}
            </span>

            {/* child count badge */}
            {hasChildren && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none"
                style={{ backgroundColor: ls.bg, color: ls.color, fontFamily: FONT_MONTSERRAT }}
              >
                {node.children.length}
              </span>
            )}
          </div>
        </td>

        {/* Description */}
        <td className="px-4 py-3 max-w-[240px]">
          <span
            className="line-clamp-1"
            style={{ fontFamily: FONT_MONTSERRAT, fontSize: "12px", color: "#444", fontStyle: node.categoryDescription ? "normal" : "italic" }}
          >
            {node.categoryDescription || "No description"}
          </span>
        </td>

        {/* Level */}
        <td className="px-4 py-3">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: ls.bg, color: ls.color, fontFamily: FONT_MONTSERRAT }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ls.dot }} />
            {ls.label}
          </span>
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
            style={{
              fontFamily: FONT_MONTSERRAT,
              backgroundColor: node.isActive ? "rgba(34,197,94,0.10)" : "rgba(0,0,0,0.06)",
              color: node.isActive ? "#166534" : "#6B7280",
            }}
          >
            {node.isActive ? "Active" : "Inactive"}
          </span>
        </td>

        {/* ID */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span
              className="font-mono text-[10px]"
              style={{ color: "#666" }}
              title={node.id}
            >
              {node.id.slice(0, 8)}…
            </span>
            <button
              onClick={() => onCopy(node.id)}
              className="px-1.5 py-0.5 rounded border text-[10px] transition-all"
              style={{
                fontFamily: FONT_MONTSERRAT,
                borderColor: copiedId === node.id ? "#86efac" : "#D0D0D0",
                color:       copiedId === node.id ? "#166534" : "#555",
                backgroundColor: copiedId === node.id ? "#f0fdf4" : "transparent",
              }}
            >
              {copiedId === node.id ? "✓" : "copy"}
            </button>
          </div>
        </td>

        {/* Updated */}
        <td className="px-4 py-3 whitespace-nowrap">
          <span style={{ fontFamily: FONT_MONTSERRAT, fontSize: "11px", color: "#666" }}>
            {node.updatedAt
              ? new Date(node.updatedAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
              : "—"}
          </span>
        </td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => onToggle(node.id)}
              title={node.isActive ? "Hide category" : "Show category"}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors"
              style={{
                fontFamily: FONT_MONTSERRAT,
                backgroundColor: node.isActive ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                color: node.isActive ? "#dc2626" : "#16a34a",
                border: `1px solid ${node.isActive ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
              }}
            >
              {node.isActive ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  Hide
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Show
                </>
              )}
            </button>

            <button
              onClick={() => onEdit(node)}
              title="Edit category"
              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors"
              style={{
                fontFamily: FONT_MONTSERRAT,
                backgroundColor: "rgba(212,175,55,0.08)",
                color: "#b8952e",
                border: "1px solid rgba(212,175,55,0.25)",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
          </div>
        </td>
      </tr>

      {/* Children */}
      {hasChildren && open && node.children.map(child => (
        <TreeRow
          key={child.id} node={child} depth={depth + 1}
          defaultOpen={defaultOpen} copiedId={copiedId}
          onCopy={onCopy} onEdit={onEdit} onToggle={onToggle}
        />
      ))}
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProductCategoriesSection() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [activeFilter,  setActiveFilter]  = useState<boolean | undefined>(undefined);
  const [copiedId,      setCopiedId]      = useState<string | null>(null);
  const [allOpen,       setAllOpen]       = useState(false);
  const [currentPage,   setCurrentPage]   = useState(1);

  const [modalOpen,        setModalOpen]        = useState(false);
  const [editingCategory,  setEditingCategory]  = useState<Category | null>(null);
  const [formData,         setFormData]         = useState({ categoryName: "", categoryDescription: "", parentId: "", isActive: true });
  const [submitting,       setSubmitting]       = useState(false);

  const [bulkModalOpen,   setBulkModalOpen]   = useState(false);
  const [bulkFile,        setBulkFile]        = useState<File | null>(null);
  const [bulkJson,        setBulkJson]        = useState("");
  const [bulkSubmitting,  setBulkSubmitting]  = useState(false);
  const [bulkResult,      setBulkResult]      = useState<ApiResponse<any> | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}?limit=500`);
      const json: ApiResponse<Category[]> = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to fetch");
      setAllCategories(json.data || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => {
    let list = allCategories;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.categoryName.toLowerCase().includes(q));
    }
    if (activeFilter !== undefined) list = list.filter(c => c.isActive === activeFilter);
    return list;
  }, [allCategories, search, activeFilter]);

  const treeData = useMemo(() => {
    if (!search.trim() && activeFilter === undefined) return buildTree(allCategories);
    const matchedIds = new Set(filtered.map(c => c.id));
    const withAncestors = new Set<string>(matchedIds);
    filtered.forEach(c => {
      let p = c.parentId;
      while (p) {
        if (withAncestors.has(p)) break;
        withAncestors.add(p);
        p = allCategories.find(x => x.id === p)?.parentId ?? null;
      }
    });
    return buildTree(allCategories.filter(c => withAncestors.has(c.id)));
  }, [allCategories, filtered, search, activeFilter]);

  // Paginate root-level nodes only — children always expand inline
  const totalPages  = Math.ceil(treeData.length / PAGE_SIZE);
  const pagedTree   = useMemo(
    () => treeData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [treeData, currentPage]
  );

  const stats = useMemo(() => ({
    total:  allCategories.length,
    root:   allCategories.filter(c => !c.parentId).length,
    sub:    allCategories.filter(c => !!c.parentId).length,
    active: allCategories.filter(c => c.isActive).length,
  }), [allCategories]);

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      toast.success("ID copied");
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ categoryName: "", categoryDescription: "", parentId: "", isActive: true });
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({ categoryName: cat.categoryName, categoryDescription: cat.categoryDescription || "", parentId: cat.parentId || "", isActive: cat.isActive });
    setModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isEdit = !!editingCategory;
      const res = await fetch(isEdit ? `${API_BASE}/${editingCategory.id}` : API_BASE, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryName:        formData.categoryName.trim(),
          categoryDescription: formData.categoryDescription.trim() || undefined,
          parentId:            formData.parentId || null,
          isActive:            formData.isActive,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Operation failed");
      toast.success(isEdit ? "Category updated" : "Category created");
      await fetchAll();
      setModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res  = await fetch(`${API_BASE}/${id}/toggle-active`, { method: "PATCH" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Toggle failed");
      toast.success(json.message || "Status toggled");
      await fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Toggle failed");
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkSubmitting(true);
    setBulkResult(null);
    try {
      let body: FormData | string;
      let headers: HeadersInit = {};
      if (bulkFile) {
        const fd = new FormData(); fd.append("file", bulkFile); body = fd;
      } else if (bulkJson.trim()) {
        const parsed = JSON.parse(bulkJson);
        if (!Array.isArray(parsed)) throw new Error("JSON must be an array");
        body = JSON.stringify(parsed);
        headers = { "Content-Type": "application/json" };
      } else { throw new Error("Provide a file or JSON array."); }
      const res  = await fetch(`${API_BASE}/bulk`, { method: "POST", headers, body });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Bulk import failed");
      setBulkResult(json);
      toast.success(`Imported ${json.summary?.created || 0} categories`);
      await fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk import failed");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const inputCls = "w-full rounded border px-3 py-2 text-sm outline-none transition-all focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff", fontFamily: FONT_MONTSERRAT }}>
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: "#D4AF37", fontFamily: FONT_MONTSERRAT, fontWeight: 600 }}>
              Catalogue Management
            </p>
            <h1 style={{ fontFamily: FONT_HEADING, fontSize: "28px", fontWeight: 700, color: "#111", letterSpacing: "-0.01em" }}>
              Product Categories
            </h1>
            <div className="flex items-center gap-3 mt-2">
              {[
                { label: "Total",  value: stats.total  },
                { label: "Root",   value: stats.root   },
                { label: "Sub",    value: stats.sub    },
                { label: "Active", value: stats.active },
              ].map((s, i) => (
                <React.Fragment key={s.label}>
                  {i > 0 && <span style={{ color: "#CCC" }}>·</span>}
                  <span style={{ fontSize: "12px", color: "#555", fontFamily: FONT_MONTSERRAT }}>
                    <span style={{ fontWeight: 700, color: "#222" }}>{s.value}</span> {s.label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ── 3D flip button styles ── */}
            <style>{`
              .btn-flip-cat {
                opacity: 1; outline: 0;
                line-height: 36px;
                position: relative;
                text-align: center;
                letter-spacing: 0.07em;
                display: inline-block;
                text-decoration: none;
                font-family: var(--font-montserrat), 'Montserrat', sans-serif;
                font-size: 13px; font-weight: 700;
                text-transform: uppercase;
                cursor: pointer; border: none; background: transparent; padding: 0;
              }
              .btn-flip-cat:hover:after  { opacity: 1; transform: translateY(0) rotateX(0); }
              .btn-flip-cat:hover:before { opacity: 0; transform: translateY(50%) rotateX(90deg); }
              .btn-flip-cat:after {
                top: 0; left: 0; opacity: 0; width: 100%; display: block;
                transition: 0.42s cubic-bezier(0.23, 1, 0.32, 1);
                position: absolute; content: attr(data-back);
                transform: translateY(-50%) rotateX(90deg);
                padding: 0 16px; border-radius: 6px;
              }
              .btn-flip-cat:before {
                top: 0; left: 0; opacity: 1; display: block;
                padding: 0 16px; line-height: 36px;
                transition: 0.42s cubic-bezier(0.23, 1, 0.32, 1);
                position: relative; content: attr(data-front);
                transform: translateY(0) rotateX(0); border-radius: 6px;
              }
              /* Neutral gray — Export CSV */
              .btn-flip-cat-gray:before {
                background: linear-gradient(135deg, #F5F5F5 0%, #EBEBEB 100%);
                color: #555; border: 1px solid #D0D0D0;
                box-shadow: 0 1px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
              }
              .btn-flip-cat-gray:after {
                background: linear-gradient(135deg, #333 0%, #444 100%);
                color: #E5E5E5; border: 1px solid rgba(255,255,255,0.08);
                box-shadow: 0 4px 14px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06);
              }
              /* Amber outline — Bulk Import */
              .btn-flip-cat-outline:before {
                background: linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.05) 100%);
                color: #b8952e; border: 1px solid rgba(212,175,55,0.5);
                box-shadow: 0 1px 4px rgba(212,175,55,0.18), inset 0 1px 0 rgba(255,255,255,0.6);
              }
              .btn-flip-cat-outline:after {
                background: linear-gradient(135deg, #D4AF37 0%, #C9A52E 100%);
                color: #1A1A1A; border: 1px solid rgba(212,175,55,0.6);
                box-shadow: 0 4px 14px rgba(212,175,55,0.38), inset 0 1px 0 rgba(255,255,255,0.18);
              }
              /* Gold solid — Add Category */
              .btn-flip-cat-gold:before {
                background: linear-gradient(135deg, #D4AF37 0%, #C9A52E 100%);
                color: #1A1A1A; border: 1px solid rgba(212,175,55,0.6);
                box-shadow: 0 2px 8px rgba(212,175,55,0.42), 0 1px 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.2);
              }
              .btn-flip-cat-gold:after {
                background: linear-gradient(135deg, #1A1A1A 0%, #2a2a2a 100%);
                color: #D4AF37; border: 1px solid rgba(255,255,255,0.08);
                box-shadow: 0 4px 16px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06);
              }
            `}</style>

            <button
              onClick={() => exportToCSV(allCategories)}
              className="btn-flip-cat btn-flip-cat-gray active:scale-95"
              data-front="↓ Export CSV"
              data-back="↓ Export CSV"
            />
            <button
              onClick={() => { setBulkFile(null); setBulkJson(""); setBulkResult(null); setBulkModalOpen(true); }}
              className="btn-flip-cat btn-flip-cat-outline active:scale-95"
              data-front="↑ Bulk Import"
              data-back="↑ Bulk Import"
            />
            <button
              onClick={openCreateModal}
              className="btn-flip-cat btn-flip-cat-gold active:scale-95"
              data-front="+ Add Category"
              data-back="+ Add Category"
            />
          </div>
        </div>

        {/* ── Category Dashboard ────────────────────────────────────────── */}
        <CategoryDashboard />

        {/* ── Filters bar ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#BBB" }} />
            <input
              type="text"
              placeholder="Search categories…"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 pr-8 py-2 rounded border bg-white text-sm outline-none transition-all focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              style={{ borderColor: "#E5E5E5", fontFamily: FONT_MONTSERRAT, color: "#333" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5" style={{ color: "#BBB" }} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={activeFilter === undefined ? "" : String(activeFilter)}
            onChange={e => { const v = e.target.value; setActiveFilter(v === "" ? undefined : v === "true"); setCurrentPage(1); }}
            className="rounded border bg-white px-3 py-2 text-sm outline-none transition-all focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
            style={{ borderColor: "#E5E5E5", fontFamily: FONT_MONTSERRAT, color: "#555" }}
          >
            <option value="">All status</option>
            <option value="true">Active only</option>
            <option value="false">Inactive only</option>
          </select>

          {(search || activeFilter !== undefined) && (
            <button
              onClick={() => { setSearch(""); setActiveFilter(undefined); }}
              className="text-xs flex items-center gap-1 transition-colors hover:text-[#D4AF37]"
              style={{ color: "#888", fontFamily: FONT_MONTSERRAT }}
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}

          {/* Expand / collapse */}
          <button
            onClick={() => setAllOpen(o => !o)}
            className="ml-auto flex items-center gap-1.5 text-xs px-3 py-2 rounded border bg-white transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
            style={{ borderColor: "#E5E5E5", color: "#888", fontFamily: FONT_MONTSERRAT }}
          >
            {allOpen
              ? <><ChevronDown className="w-3.5 h-3.5" /> Collapse all</>
              : <><ChevronRight className="w-3.5 h-3.5" /> Expand all</>}
          </button>
        </div>

        {/* ── Tree table ────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <span style={{ fontFamily: FONT_MONTSERRAT, fontSize: "12px", color: "#AAA" }}>Loading categories…</span>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <table className="w-full" style={{ minWidth: "840px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.07)", backgroundColor: "#FAFAF8" }}>
                  {["Name", "Description", "Level", "Status", "Category ID", "Updated", "Actions"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 ${i === 6 ? "text-right" : "text-left"} whitespace-nowrap`}
                      style={{ fontFamily: FONT_MONTSERRAT, fontSize: "10px", fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {treeData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center" style={{ fontFamily: FONT_MONTSERRAT, fontSize: "13px", color: "#BBB" }}>
                      No categories found
                    </td>
                  </tr>
                ) : pagedTree.map(root => (
                  <TreeRow
                    key={root.id} node={root} depth={0}
                    defaultOpen={allOpen} copiedId={copiedId}
                    onCopy={copyId} onEdit={openEditModal} onToggle={handleToggleActive}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 py-3">
            <span style={{ fontFamily: FONT_MONTSERRAT, fontSize: "12px", color: "#666" }}>
              Showing roots&nbsp;
              <strong style={{ color: "#222" }}>{(currentPage - 1) * PAGE_SIZE + 1}</strong>
              &nbsp;–&nbsp;
              <strong style={{ color: "#222" }}>{Math.min(currentPage * PAGE_SIZE, treeData.length)}</strong>
              &nbsp;of&nbsp;
              <strong style={{ color: "#222" }}>{treeData.length}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-1.5 rounded border text-sm transition-colors hover:bg-white disabled:opacity-40"
                style={{ borderColor: "#E5E5E5", color: "#555", fontFamily: FONT_MONTSERRAT }}
              >
                ← Previous
              </button>
              <span style={{ fontFamily: FONT_MONTSERRAT, fontSize: "12px", color: "#888" }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-1.5 rounded border text-sm transition-colors hover:bg-white disabled:opacity-40"
                style={{ borderColor: "#E5E5E5", color: "#555", fontFamily: FONT_MONTSERRAT }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════ CREATE / EDIT MODAL ══════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "#D4AF37", fontFamily: FONT_MONTSERRAT, fontWeight: 600 }}>
                  {editingCategory ? "Edit" : "New"}
                </p>
                <h2 style={{ fontFamily: FONT_HEADING, fontSize: "18px", fontWeight: 700, color: "#111" }}>
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors">
                <X className="w-4 h-4" style={{ color: "#888" }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

              {editingCategory && (
                <div className="px-3 py-2.5 rounded" style={{ backgroundColor: "#FAFAF8", border: "1px solid #F0F0EE" }}>
                  <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#AAA", fontFamily: FONT_MONTSERRAT }}>ID</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs flex-1 break-all" style={{ color: "#888" }}>{editingCategory.id}</span>
                    <button type="button" onClick={() => copyId(editingCategory.id)}
                      className="shrink-0 px-2 py-1 rounded border text-[10px] transition-all"
                      style={{
                        fontFamily: FONT_MONTSERRAT,
                        borderColor: copiedId === editingCategory.id ? "#86efac" : "#E5E5E5",
                        color: copiedId === editingCategory.id ? "#166534" : "#AAA",
                      }}>
                      {copiedId === editingCategory.id ? "✓" : "Copy"}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FONT_MONTSERRAT }}>
                  Name <span className="text-red-400">*</span>
                </label>
                <input name="categoryName" type="text" required
                  value={formData.categoryName} onChange={handleFormChange}
                  placeholder="e.g. Pain Relief"
                  className={inputCls}
                  style={{ borderColor: "#E5E5E5", fontFamily: FONT_MONTSERRAT }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FONT_MONTSERRAT }}>
                  Description <span className="font-normal normal-case" style={{ color: "#AAA" }}>(optional)</span>
                </label>
                <textarea name="categoryDescription" rows={2}
                  value={formData.categoryDescription} onChange={handleFormChange}
                  placeholder="Brief description"
                  className={inputCls}
                  style={{ borderColor: "#E5E5E5", fontFamily: FONT_MONTSERRAT, resize: "vertical" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FONT_MONTSERRAT }}>
                  Parent Category <span className="font-normal normal-case" style={{ color: "#AAA" }}>(optional)</span>
                </label>
                <select name="parentId" value={formData.parentId} onChange={handleFormChange}
                  className={inputCls}
                  style={{ borderColor: "#E5E5E5", fontFamily: FONT_MONTSERRAT }}
                >
                  <option value="">None — top-level root</option>
                  {allCategories
                    .filter(c => c.id !== editingCategory?.id)
                    .sort((a, b) => a.categoryName.localeCompare(b.categoryName))
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.parentId ? "  └ " : ""}{c.categoryName}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center gap-2.5">
                <input id="isActive" name="isActive" type="checkbox"
                  checked={formData.isActive} onChange={handleFormChange}
                  className="w-4 h-4 rounded accent-[#D4AF37]"
                />
                <label htmlFor="isActive" className="text-sm select-none cursor-pointer" style={{ fontFamily: FONT_MONTSERRAT, color: "#444" }}>
                  Active — visible in store
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                <button type="button" onClick={() => setModalOpen(false)}
                  style={{
                    padding: "8px 20px", borderRadius: "6px", fontSize: "14px", fontWeight: 600,
                    background: "linear-gradient(135deg, #F5F5F5 0%, #EBEBEB 100%)",
                    color: "#444", border: "1px solid #D5D5D5", cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
                    transition: "all 0.15s ease", fontFamily: FONT_MONTSERRAT,
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(-1px)"; el.style.boxShadow="0 4px 10px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.8)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(0)"; el.style.boxShadow="0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)"; }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  style={{
                    padding: "8px 20px", borderRadius: "6px", fontSize: "14px", fontWeight: 700,
                    background: submitting ? "#9CA3AF" : "linear-gradient(135deg, #D4AF37 0%, #C9A52E 100%)",
                    color: "#1A1A1A", cursor: submitting ? "not-allowed" : "pointer",
                    border: submitting ? "1px solid #9CA3AF" : "1px solid rgba(212,175,55,0.6)",
                    boxShadow: submitting ? "none" : "0 2px 8px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                    opacity: submitting ? 0.65 : 1, transition: "all 0.15s ease", fontFamily: FONT_MONTSERRAT,
                  }}
                  onMouseEnter={e => { if (!submitting) { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(-1px)"; el.style.boxShadow="0 6px 16px rgba(212,175,55,0.40), inset 0 1px 0 rgba(255,255,255,0.18)"; }}}
                  onMouseLeave={e => { if (!submitting) { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(0)"; el.style.boxShadow="0 2px 8px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,255,255,0.18)"; }}}
                >
                  {submitting ? "Saving…" : editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ BULK IMPORT MODAL ════════════════════════════════ */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }}>

            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "#D4AF37", fontFamily: FONT_MONTSERRAT, fontWeight: 600 }}>Import</p>
                <h2 style={{ fontFamily: FONT_HEADING, fontSize: "18px", fontWeight: 700, color: "#111" }}>Bulk Import Categories</h2>
              </div>
              <button onClick={() => { setBulkModalOpen(false); setBulkResult(null); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5">
                <X className="w-4 h-4" style={{ color: "#888" }} />
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-xs mb-1.5" style={{ color: "#888", fontFamily: FONT_MONTSERRAT }}>ChatGPT prompt to generate data:</p>
              <div className="px-3 py-2.5 rounded text-xs font-mono leading-relaxed select-all mb-5" style={{ backgroundColor: "#FAFAF8", border: "1px solid #F0F0EE", color: "#555" }}>
                Give me a list of 20 UK pharmacy product categories as an Excel table with exactly these column headers: categoryName, categoryDescription, parentName. Leave parentName blank for top-level categories.
              </div>

              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FONT_MONTSERRAT }}>Upload Excel (.xlsx / .xls)</label>
                  <input type="file" accept=".xlsx,.xls" onChange={e => setBulkFile(e.target.files?.[0] || null)}
                    className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#D4AF37] file:text-white hover:file:bg-[#b8952e] transition-all"
                    style={{ color: "#888", fontFamily: FONT_MONTSERRAT }}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: "#F0F0EE" }} /></div>
                  <div className="relative flex justify-center"><span className="px-2 bg-white text-xs" style={{ color: "#BBB", fontFamily: FONT_MONTSERRAT }}>or paste JSON</span></div>
                </div>

                <textarea rows={5} value={bulkJson} onChange={e => setBulkJson(e.target.value)}
                  placeholder='[{"categoryName":"Pain Relief","parentName":""},{"categoryName":"Paracetamol","parentName":"Pain Relief"}]'
                  className={inputCls}
                  style={{ borderColor: "#E5E5E5", fontFamily: "monospace", fontSize: "11px" }}
                />

                {bulkResult && (
                  <div className="px-4 py-3 rounded" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: "#166534", fontFamily: FONT_MONTSERRAT }}>Import complete</p>
                    <p className="text-xs" style={{ color: "#166534", fontFamily: FONT_MONTSERRAT }}>
                      {bulkResult.summary?.created} created · {bulkResult.summary?.skipped} skipped · {bulkResult.summary?.invalidRows} invalid
                    </p>
                    {bulkResult.skippedNames?.length ? (
                      <p className="text-xs mt-1" style={{ color: "#888", fontFamily: FONT_MONTSERRAT }}>Skipped: {bulkResult.skippedNames.join(", ")}</p>
                    ) : null}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => { setBulkModalOpen(false); setBulkResult(null); }}
                    style={{
                      padding: "8px 20px", borderRadius: "6px", fontSize: "14px", fontWeight: 600,
                      background: "linear-gradient(135deg, #F5F5F5 0%, #EBEBEB 100%)",
                      color: "#444", border: "1px solid #D5D5D5", cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
                      transition: "all 0.15s ease", fontFamily: FONT_MONTSERRAT,
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(-1px)"; el.style.boxShadow="0 4px 10px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.8)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(0)"; el.style.boxShadow="0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)"; }}
                  >
                    Close
                  </button>
                  <button type="submit" disabled={bulkSubmitting}
                    style={{
                      padding: "8px 20px", borderRadius: "6px", fontSize: "14px", fontWeight: 700,
                      background: bulkSubmitting ? "#9CA3AF" : "linear-gradient(135deg, #D4AF37 0%, #C9A52E 100%)",
                      color: "#1A1A1A", cursor: bulkSubmitting ? "not-allowed" : "pointer",
                      border: bulkSubmitting ? "1px solid #9CA3AF" : "1px solid rgba(212,175,55,0.6)",
                      boxShadow: bulkSubmitting ? "none" : "0 2px 8px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                      opacity: bulkSubmitting ? 0.65 : 1, transition: "all 0.15s ease", fontFamily: FONT_MONTSERRAT,
                    }}
                    onMouseEnter={e => { if (!bulkSubmitting) { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(-1px)"; el.style.boxShadow="0 6px 16px rgba(212,175,55,0.40), inset 0 1px 0 rgba(255,255,255,0.18)"; }}}
                    onMouseLeave={e => { if (!bulkSubmitting) { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(0)"; el.style.boxShadow="0 2px 8px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,255,255,0.18)"; }}}
                  >
                    {bulkSubmitting ? "Importing…" : "Import"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





