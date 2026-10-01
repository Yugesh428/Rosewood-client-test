"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const FM = "var(--font-montserrat), 'Montserrat', sans-serif";
const FH = "var(--font-cinzel), 'Cinzel', serif";

type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const API_BASE = "/api/ui/faq";

const inputCls =
  "w-full rounded border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]";

// ─── Component ────────────────────────────────────────────────────────────────
export default function FaqSection() {
  const [faqs, setFaqs]             = useState<Faq[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingFaq,  setEditingFaq]  = useState<Faq | null>(null);
  const [form, setForm] = useState({
    question: "", answer: "", category: "", displayOrder: 0, isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ all: "true" });
      if (catFilter) p.set("category", catFilter);
      const res  = await fetch(`${API_BASE}?${p}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed");
      setFaqs(json.data || []);

      // Derive unique categories from results
      const cats = Array.from(
        new Set<string>(
          (json.data as Faq[])
            .map((f) => f.category)
            .filter((c): c is string => !!c),
        ),
      ).sort();
      setCategories(cats);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }, [catFilter]);

  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  // ─── Filtered list ────────────────────────────────────────────────────────
  const filtered = faqs.filter((f) => {
    const q = search.toLowerCase();
    return (
      !q ||
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q) ||
      (f.category ?? "").toLowerCase().includes(q)
    );
  });

  // ─── Modal helpers ────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingFaq(null);
    setForm({ question: "", answer: "", category: "", displayOrder: faqs.length + 1, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (f: Faq) => {
    setEditingFaq(f);
    setForm({
      question:     f.question,
      answer:       f.answer,
      category:     f.category ?? "",
      displayOrder: f.displayOrder,
      isActive:     f.isActive,
    });
    setModalOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isEdit = !!editingFaq;
      const res = await fetch(isEdit ? `${API_BASE}/${editingFaq!.id}` : API_BASE, {
        method:  isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          question:     form.question.trim(),
          answer:       form.answer.trim(),
          category:     form.category.trim() || null,
          displayOrder: Number(form.displayOrder),
          isActive:     form.isActive,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed");
      toast.success(isEdit ? "FAQ updated" : "FAQ created");
      await fetchFaqs();
      setModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Toggle ───────────────────────────────────────────────────────────────
  const handleToggle = async (id: string) => {
    try {
      const res  = await fetch(`${API_BASE}/${id}`, { method: "PATCH" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed");
      toast.success(json.message || "Status updated");
      await fetchFaqs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Toggle failed");
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: string, question: string) => {
    toast.error(`Delete this FAQ?`, {
      description: question.slice(0, 80) + (question.length > 80 ? "…" : ""),
      action: {
        label: "Yes, Delete",
        onClick: async () => {
          try {
            const res  = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Failed");
            setFaqs((prev) => prev.filter((f) => f.id !== id));
            toast.success("FAQ deleted");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Delete failed");
            fetchFaqs();
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
      actionButtonStyle: { backgroundColor: "#dc2626", color: "#fff" },
      cancelButtonStyle: { backgroundColor: "transparent", color: "#6b7280", border: "1px solid #e5e7eb" },
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: FM }}>
      <div className="px-6 pt-8 pb-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p style={{ fontFamily: FM, fontSize: "10px", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: "4px" }}>
              Content Management
            </p>
            <h1 style={{ fontFamily: FH, fontSize: "28px", fontWeight: 700, color: "#111", letterSpacing: "-0.01em" }}>
              FAQs
            </h1>
            <p style={{ fontFamily: FM, fontSize: "13px", color: "#666", marginTop: "4px" }}>
              <strong style={{ color: "#222" }}>{faqs.length}</strong> questions total ·{" "}
              <strong style={{ color: "#22c55e" }}>{faqs.filter((f) => f.isActive).length}</strong> active
            </p>
          </div>
        <button
          onClick={openCreate}
          className="btn-flip-faq btn-flip-faq-add active:scale-95"
          data-front="❓ Add FAQ"
          data-back="❓ Add FAQ"
        />
        
        <style>{`
          .btn-flip-faq {
            opacity: 1; outline: 0; line-height: 38px;
            position: relative; text-align: center;
            letter-spacing: 0.04em; display: inline-block;
            text-decoration: none;
            font-family: var(--font-montserrat),'Montserrat',sans-serif;
            font-size: 13px; font-weight: 700;
            cursor: pointer; border: none; background: transparent; padding: 0;
          }
          .btn-flip-faq:hover:after  { opacity: 1; transform: translateY(0) rotateX(0); }
          .btn-flip-faq:hover:before { opacity: 0; transform: translateY(50%) rotateX(90deg); }
          .btn-flip-faq:after {
            top: 0; left: 0; opacity: 0; width: 100%; display: block;
            transition: 0.42s cubic-bezier(0.23,1,0.32,1);
            position: absolute; content: attr(data-back);
            transform: translateY(-50%) rotateX(90deg);
            padding: 0 16px; border-radius: 6px;
          }
          .btn-flip-faq:before {
            top: 0; left: 0; opacity: 1; display: block;
            padding: 0 16px; line-height: 38px;
            transition: 0.42s cubic-bezier(0.23,1,0.32,1);
            position: relative; content: attr(data-front);
            transform: translateY(0) rotateX(0); border-radius: 6px;
          }
          
          .btn-flip-faq-add:before {
            background: linear-gradient(135deg, #D4AF37 0%, #C9A52E 100%);
            color: #1A1A1A; border: 1px solid rgba(212,175,55,0.6);
            box-shadow: 0 2px 8px rgba(212,175,55,0.4), 0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.15);
          }
          .btn-flip-faq-add:after {
            background: linear-gradient(135deg, #1A1A1A 0%, #2a2a2a 100%);
            color: #D4AF37; border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 6px 16px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06);
          }
        `}</style>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <input
            type="text"
            placeholder="Search questions or answers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            style={{ borderColor: "#E5E5E5", fontFamily: FM, color: "#333" }}
          />
          {categories.length > 0 && (
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
              style={{ borderColor: "#E5E5E5", fontFamily: FM, color: "#555" }}
            >
              <option value="">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {(search || catFilter) && (
            <button
              onClick={() => { setSearch(""); setCatFilter(""); }}
              className="text-xs hover:text-[#D4AF37] transition-colors"
              style={{ color: "#888", fontFamily: FM }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <span style={{ fontFamily: FM, fontSize: "12px", color: "#AAA" }}>Loading FAQs…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span style={{ fontSize: "40px" }}>❓</span>
            <p style={{ fontFamily: FH, fontSize: "18px", color: "#999" }}>No FAQs found</p>
            <p style={{ fontFamily: FM, fontSize: "12px", color: "#BBB" }}>
              {search ? "Try a different search term" : "Click Add FAQ to create your first one"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((faq, idx) => (
              <div
                key={faq.id}
                className="rounded-lg border bg-white transition-all"
                style={{ borderColor: "rgba(0,0,0,0.07)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                {/* Row header */}
                <div className="flex items-start gap-4 px-5 py-4">
                  {/* Number */}
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{ backgroundColor: "rgba(212,175,55,0.12)", color: "#b8952e", fontFamily: FM }}
                  >
                    {idx + 1}
                  </span>

                  {/* Question + answer + category */}
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: FM, fontWeight: 600, fontSize: "14px", color: "#111", marginBottom: "4px" }}>
                      {faq.question}
                    </p>
                    <p className="line-clamp-2" style={{ fontFamily: FM, fontSize: "13px", color: "#666", lineHeight: 1.5 }}>
                      {faq.answer}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      {faq.category && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ backgroundColor: "rgba(212,175,55,0.10)", color: "#b8952e", fontFamily: FM }}
                        >
                          {faq.category}
                        </span>
                      )}
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          backgroundColor: faq.isActive ? "rgba(34,197,94,0.10)" : "rgba(0,0,0,0.06)",
                          color: faq.isActive ? "#166534" : "#6B7280",
                          fontFamily: FM,
                        }}
                      >
                        {faq.isActive ? "Active" : "Hidden"}
                      </span>
                      <span style={{ fontFamily: FM, fontSize: "11px", color: "#ABABAB" }}>
                        Order: {faq.displayOrder}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => openEdit(faq)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all duration-150 active:scale-95"
                      style={{
                        fontFamily: FM,
                        background: "linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.06) 100%)",
                        color: "#b8952e",
                        border: "1px solid rgba(212,175,55,0.35)",
                        boxShadow: "0 1px 3px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.5)",
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = "linear-gradient(135deg, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.12) 100%)";
                        el.style.transform = "translateY(-1px)";
                        el.style.boxShadow = "0 3px 8px rgba(212,175,55,0.25), inset 0 1px 0 rgba(255,255,255,0.5)";
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = "linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.06) 100%)";
                        el.style.transform = "translateY(0)";
                        el.style.boxShadow = "0 1px 3px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.5)";
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggle(faq.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all duration-150 active:scale-95"
                      style={{
                        fontFamily: FM,
                        background: faq.isActive
                          ? "linear-gradient(135deg, rgba(107,114,128,0.10) 0%, rgba(107,114,128,0.05) 100%)"
                          : "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.06) 100%)",
                        color: faq.isActive ? "#6B7280" : "#16a34a",
                        border: `1px solid ${faq.isActive ? "rgba(107,114,128,0.25)" : "rgba(34,197,94,0.3)"}`,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)",
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = "translateY(-1px)";
                        el.style.boxShadow = "0 3px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.5)";
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = "translateY(0)";
                        el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)";
                      }}
                    >
                      {faq.isActive ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id, faq.question)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all duration-150 active:scale-95"
                      style={{
                        fontFamily: FM,
                        background: "linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(239,68,68,0.05) 100%)",
                        color: "#dc2626",
                        border: "1px solid rgba(239,68,68,0.25)",
                        boxShadow: "0 1px 3px rgba(239,68,68,0.12), inset 0 1px 0 rgba(255,255,255,0.5)",
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = "linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.10) 100%)";
                        el.style.transform = "translateY(-1px)";
                        el.style.boxShadow = "0 3px 8px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.5)";
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = "linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(239,68,68,0.05) 100%)";
                        el.style.transform = "translateY(0)";
                        el.style.boxShadow = "0 1px 3px rgba(239,68,68,0.12), inset 0 1px 0 rgba(255,255,255,0.5)";
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Create / Edit Modal ──────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <div>
                <p style={{ fontFamily: FM, fontSize: "10px", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>
                  {editingFaq ? "Edit" : "New"}
                </p>
                <h2 style={{ fontFamily: FH, fontSize: "18px", fontWeight: 700, color: "#111" }}>
                  {editingFaq ? "Edit FAQ" : "Add FAQ"}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-xl"
                style={{ color: "#888" }}
              >
                ✕
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Question */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>
                  Question <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="question"
                  value={form.question}
                  onChange={handleChange}
                  required
                  placeholder="e.g. What are your opening hours?"
                  className={inputCls}
                  style={{ fontFamily: FM }}
                />
              </div>

              {/* Answer */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>
                  Answer <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="answer"
                  value={form.answer}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Provide a clear and helpful answer…"
                  className={inputCls}
                  style={{ fontFamily: FM, resize: "vertical" }}
                />
              </div>

              {/* Category + Order row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g. Delivery, Ordering"
                    list="cat-suggestions"
                    className={inputCls}
                    style={{ fontFamily: FM }}
                  />
                  <datalist id="cat-suggestions">
                    {categories.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={form.displayOrder}
                    onChange={handleChange}
                    min={0}
                    className={inputCls}
                    style={{ fontFamily: FM }}
                  />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-2.5">
                <input
                  id="faq-isActive"
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-[#D4AF37]"
                />
                <label htmlFor="faq-isActive" className="text-sm cursor-pointer select-none" style={{ fontFamily: FM, color: "#444" }}>
                  Active — visible on the public FAQ page
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded border text-sm hover:bg-black/3"
                  style={{ borderColor: "#E5E5E5", color: "#666", fontFamily: FM }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded text-sm text-white disabled:opacity-50 transition-colors hover:bg-[#b8952e] active:scale-95"
                  style={{ backgroundColor: "#D4AF37", fontFamily: FM, fontWeight: 600 }}
                >
                  {submitting ? "Saving…" : editingFaq ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
