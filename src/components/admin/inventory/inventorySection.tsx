/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import InventoryDashboard from "./InventoryDashboard";

const FM = "var(--font-montserrat), 'Montserrat', sans-serif";
const FH = "var(--font-heading), 'Libre Baskerville', serif";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Product = {
  id: string;
  productName: string;
  dosageForm?: string;
  strength?: string;
  packSize?: string;
  unitType?: string;
  category?: { id: string; categoryName: string };
};

type Inventory = {
  id: string;
  productId: string;
  batchNumber: string;
  quantity: number;
  manufacturingDate: string;
  expiryDate: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  supplierName: string;
  lowStockThreshold: number;
  isActive: boolean;
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";
  product?: Product;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: { total: number; page: number; limit: number; pages: number; hasNext: boolean; hasPrev: boolean };
};

type StockStatusFilter = "in-stock" | "low-stock" | "out-of-stock" | "";

const API_BASE    = "/api/inventory";
const PRODUCTS_API = "/api/products";
const PAGE_SIZE   = 10;

const inputCls = "w-full rounded border border-[#E5E5E5] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]";

// ─── Component ────────────────────────────────────────────────────────────────

export default function InventorySection() {
  const [inventory,  setInventory]  = useState<Inventory[]>([]);
  const [pagination, setPagination] = useState<ApiResponse<any>["pagination"]>(undefined);
  const [loading,    setLoading]    = useState(true);

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<StockStatusFilter>("");
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [currentPage,  setCurrentPage]  = useState(1);

  const [products,        setProducts]        = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [formData,    setFormData]    = useState({
    productId: "", batchNumber: "", quantity: 0,
    manufacturingDate: "", expiryDate: "",
    purchasePrice: 0, sellingPrice: 0, mrp: 0,
    supplierName: "", lowStockThreshold: 10, isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      p.set("page",  String(currentPage));
      p.set("limit", String(PAGE_SIZE));
      if (search)                    p.set("search",   search);
      if (statusFilter)              p.set("status",   statusFilter);
      if (activeFilter !== undefined) p.set("isActive", String(activeFilter));
      const res  = await fetch(`${API_BASE}?${p}`);
      const json: ApiResponse<Inventory[]> = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to fetch");
      setInventory(json.data || []);
      setPagination(json.pagination ?? undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, activeFilter]);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res  = await fetch(`${PRODUCTS_API}?limit=500&isActive=true`);
      const json = await res.json();
      if (json.success) setProducts(json.data || []);
    } catch { /* non-critical */ }
    finally { setProductsLoading(false); }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);
  useEffect(() => { fetchProducts();  }, [fetchProducts]);

  // ─── Modal helpers ──────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ productId:"", batchNumber:"", quantity:0, manufacturingDate:"", expiryDate:"", purchasePrice:0, sellingPrice:0, mrp:0, supplierName:"", lowStockThreshold:10, isActive:true });
    setModalOpen(true);
  };

  const openEditModal = (item: Inventory) => {
    setEditingItem(item);
    setFormData({
      productId: item.productId, batchNumber: item.batchNumber,
      quantity: item.quantity,
      manufacturingDate: item.manufacturingDate.slice(0, 10),
      expiryDate: item.expiryDate.slice(0, 10),
      purchasePrice: Number(item.purchasePrice), sellingPrice: Number(item.sellingPrice), mrp: Number(item.mrp),
      supplierName: item.supplierName, lowStockThreshold: item.lowStockThreshold, isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  };

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isEdit = !!editingItem;
      const res = await fetch(isEdit ? `${API_BASE}/${editingItem.id}` : API_BASE, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: formData.productId,
          batchNumber: formData.batchNumber.trim(),
          quantity: Number(formData.quantity),
          manufacturingDate: formData.manufacturingDate,
          expiryDate: formData.expiryDate,
          purchasePrice: Number(formData.purchasePrice),
          sellingPrice: Number(formData.sellingPrice),
          mrp: Number(formData.mrp),
          supplierName: formData.supplierName.trim(),
          lowStockThreshold: Number(formData.lowStockThreshold),
          isActive: formData.isActive,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed");
      toast.success(isEdit ? "Batch updated" : "Batch created");
      await fetchInventory();
      setModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res  = await fetch(`${API_BASE}/${id}/toggle-active`, { method: "PATCH" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Toggle failed");
      toast.success(json.message || "Status toggled");
      await fetchInventory();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Toggle failed");
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
  const formatCurrency = (n: number) => `£${Number(n).toFixed(2)}`;

  const statusStyle = (s: Inventory["stockStatus"]) => ({
    "in-stock":    { bg: "rgba(34,197,94,0.10)",  color: "#166534" },
    "low-stock":   { bg: "rgba(249,115,22,0.10)", color: "#c2410c" },
    "out-of-stock":{ bg: "rgba(239,68,68,0.10)",  color: "#b91c1c" },
  }[s] || { bg: "rgba(0,0,0,0.06)", color: "#555" });

  const statusLabel = (s: Inventory["stockStatus"]) => ({ "in-stock":"In Stock","low-stock":"Low Stock","out-of-stock":"Out of Stock" }[s] || s);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff", fontFamily: FM }}>
      <div className="px-6 pt-8 pb-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p style={{ fontFamily: FM, fontSize: "10px", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: "4px" }}>
              Stock Management
            </p>
            <h1 style={{ fontFamily: FH, fontSize: "28px", fontWeight: 700, color: "#111", letterSpacing: "-0.01em" }}>Inventory</h1>
            {pagination && (
              <p style={{ fontFamily: FM, fontSize: "13px", color: "#666", marginTop: "4px" }}>
                <strong style={{ color: "#222" }}>{pagination.total}</strong> batches total
              </p>
            )}
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded text-sm text-white font-semibold transition-all duration-200 active:scale-95"
            style={{ backgroundColor: "#D4AF37", fontFamily: FM, fontWeight: 600, boxShadow: "0 2px 8px rgba(212,175,55,0.35)" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor="#b8952e"; el.style.transform="translateY(-1px)"; el.style.boxShadow="0 4px 16px rgba(212,175,55,0.45)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor="#D4AF37"; el.style.transform="translateY(0)"; el.style.boxShadow="0 2px 8px rgba(212,175,55,0.35)"; }}
          >
            + Add Batch
          </button>
        </div>

        {/* Dashboard */}
        <InventoryDashboard />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input type="text" placeholder="Search by product name…"
            value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="flex-1 min-w-[200px] rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            style={{ borderColor: "#E5E5E5", fontFamily: FM, color: "#333" }}
          />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as StockStatusFilter); setCurrentPage(1); }}
            className="rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
            style={{ borderColor: "#E5E5E5", fontFamily: FM, color: "#555" }}>
            <option value="">All stock status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
          <select value={activeFilter === undefined ? "" : String(activeFilter)}
            onChange={e => { const v = e.target.value; setActiveFilter(v === "" ? undefined : v === "true"); setCurrentPage(1); }}
            className="rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
            style={{ borderColor: "#E5E5E5", fontFamily: FM, color: "#555" }}>
            <option value="">All status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          {(search || statusFilter || activeFilter !== undefined) && (
            <button onClick={() => { setSearch(""); setStatusFilter(""); setActiveFilter(undefined); setCurrentPage(1); }}
              className="text-xs hover:text-[#D4AF37] transition-colors"
              style={{ color: "#888", fontFamily: FM }}>
              ✕ Clear
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <span style={{ fontFamily: FM, fontSize: "12px", color: "#AAA" }}>Loading inventory…</span>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg overflow-x-auto mb-4"
              style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <table className="w-full text-sm" style={{ minWidth: "1300px" }}>
                <thead style={{ backgroundColor: "#FAFAF8", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                  <tr>
                    {["Product","Batch","Qty","Stock Status","Mfg Date","Expiry","Purchase £","Selling £","MRP","Supplier","Low Stock Threshold","Active","Actions"].map((h, i) => (
                      <th key={h} className={`px-4 py-3 whitespace-nowrap ${i === 12 ? "text-right" : "text-left"}`}
                        style={{ fontFamily: FM, fontSize: "10px", fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="py-16 text-center"
                        style={{ fontFamily: FM, fontSize: "13px", color: "#BBB" }}>
                        No inventory records found
                      </td>
                    </tr>
                  ) : inventory.map(item => {
                    const ss = statusStyle(item.stockStatus);
                    const isExpiringSoon = new Date(item.expiryDate) < new Date(Date.now() + 30 * 86400000);
                    return (
                      <tr key={item.id} className="border-b transition-colors"
                        style={{ borderColor: "rgba(0,0,0,0.05)" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(212,175,55,0.03)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                        <td className="px-4 py-2.5">
                          <p style={{ fontFamily: FM, fontWeight: 600, fontSize: "13px", color: "#111" }} className="truncate max-w-[160px]">
                            {item.product?.productName || "—"}
                          </p>
                          <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA" }}>{item.product?.category?.categoryName || ""}</p>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap" style={{ fontFamily: FM, fontSize: "12px", color: "#444" }}>{item.batchNumber}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span style={{ fontFamily: FM, fontWeight: 700, fontSize: "13px", color: item.quantity === 0 ? "#dc2626" : "#222" }}>{item.quantity}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                            style={{ backgroundColor: ss.bg, color: ss.color, fontFamily: FM }}>
                            {statusLabel(item.stockStatus)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap" style={{ fontFamily: FM, fontSize: "11px", color: "#666" }}>{formatDate(item.manufacturingDate)}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span style={{ fontFamily: FM, fontSize: "11px", color: isExpiringSoon ? "#dc2626" : "#666", fontWeight: isExpiringSoon ? 600 : 400 }}>
                            {formatDate(item.expiryDate)}
                            {isExpiringSoon && <span className="ml-1 text-[9px]">⚠</span>}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap" style={{ fontFamily: FM, fontSize: "12px", color: "#555" }}>{formatCurrency(item.purchasePrice)}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap" style={{ fontFamily: FM, fontSize: "12px", fontWeight: 600, color: "#111" }}>{formatCurrency(item.sellingPrice)}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap" style={{ fontFamily: FM, fontSize: "12px", color: "#555" }}>{formatCurrency(item.mrp)}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap" style={{ fontFamily: FM, fontSize: "12px", color: "#444" }}>{item.supplierName}</td>
                        <td className="px-4 py-2.5 text-center" style={{ fontFamily: FM, fontSize: "12px", color: "#666" }}>{item.lowStockThreshold}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                            style={{ backgroundColor: item.isActive ? "rgba(34,197,94,0.10)" : "rgba(0,0,0,0.06)", color: item.isActive ? "#166534" : "#6B7280", fontFamily: FM }}>
                            {item.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditModal(item)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap"
                              style={{ fontFamily: FM, backgroundColor: "rgba(212,175,55,0.08)", color: "#b8952e", border: "1px solid rgba(212,175,55,0.25)" }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Edit
                            </button>
                            <button onClick={() => handleToggle(item.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap"
                              style={{
                                fontFamily: FM,
                                backgroundColor: item.isActive ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                                color: item.isActive ? "#dc2626" : "#16a34a",
                                border: `1px solid ${item.isActive ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
                              }}>
                              {item.isActive ? (
                                <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg> Hide</>
                              ) : (
                                <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Show</>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-between items-center py-2">
                <span style={{ fontFamily: FM, fontSize: "12px", color: "#666" }}>
                  Showing <strong style={{ color: "#222" }}>{(pagination.page - 1) * pagination.limit + 1}</strong>–<strong style={{ color: "#222" }}>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of <strong style={{ color: "#222" }}>{pagination.total}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={!pagination.hasPrev}
                    className="px-4 py-1.5 rounded border text-sm transition-colors hover:bg-white disabled:opacity-40"
                    style={{ borderColor: "#E5E5E5", color: "#555", fontFamily: FM }}>← Previous</button>
                  <span style={{ fontFamily: FM, fontSize: "12px", color: "#888" }}>Page {pagination.page} of {pagination.pages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))} disabled={!pagination.hasNext}
                    className="px-4 py-1.5 rounded border text-sm transition-colors hover:bg-white disabled:opacity-40"
                    style={{ borderColor: "#E5E5E5", color: "#555", fontFamily: FM }}>Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Create / Edit Modal ──────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }}>

            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <div>
                <p style={{ fontFamily: FM, fontSize: "10px", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>
                  {editingItem ? "Edit" : "New"}
                </p>
                <h2 style={{ fontFamily: FH, fontSize: "18px", fontWeight: 700, color: "#111" }}>
                  {editingItem ? "Edit Batch" : "Add Inventory Batch"}
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors text-xl"
                style={{ color: "#888" }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {[
                { name: "productId", label: "Product", type: "select" as const, required: true },
                { name: "batchNumber", label: "Batch Number", type: "text" as const, required: true, placeholder: "BATCH-001" },
                { name: "quantity", label: "Quantity", type: "number" as const, required: true, min: 0 },
                { name: "manufacturingDate", label: "Manufacturing Date", type: "date" as const, required: true },
                { name: "expiryDate", label: "Expiry Date", type: "date" as const, required: true },
                { name: "purchasePrice", label: "Purchase Price", type: "number" as const, required: true, step: "0.01", min: 0, placeholder: "0.00" },
                { name: "sellingPrice", label: "Selling Price", type: "number" as const, required: true, step: "0.01", min: 0, placeholder: "0.00" },
                { name: "mrp", label: "MRP", type: "number" as const, required: true, step: "0.01", min: 0, placeholder: "0.00" },
                { name: "supplierName", label: "Supplier Name", type: "text" as const, required: true, placeholder: "Supplier Inc." },
                { name: "lowStockThreshold", label: "Low Stock Threshold", type: "number" as const, required: false, min: 0, placeholder: "10" },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>
                    {f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  {f.type === "select" ? (
                    <select name="productId" value={formData.productId} onChange={handleFormChange} required
                      disabled={productsLoading} className={inputCls} style={{ fontFamily: FM }}>
                      <option value="">Select product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.productName}{p.strength ? ` (${p.strength})` : ""}</option>
                      ))}
                    </select>
                  ) : (
                    <input type={f.type} name={f.name}
                      value={(formData as any)[f.name]}
                      onChange={handleFormChange}
                      required={f.required}
                      min={f.min}
                      step={(f as any).step}
                      placeholder={(f as any).placeholder}
                      className={inputCls} style={{ fontFamily: FM }}
                    />
                  )}
                  {f.name === "lowStockThreshold" && (
                    <p className="text-[10px] mt-1" style={{ color: "#AAA", fontFamily: FM }}>Quantity below this triggers "Low Stock"</p>
                  )}
                </div>
              ))}

              <div className="flex items-center gap-2.5">
                <input id="isActive" name="isActive" type="checkbox"
                  checked={formData.isActive} onChange={handleFormChange}
                  className="w-4 h-4 rounded accent-[#D4AF37]" />
                <label htmlFor="isActive" className="text-sm cursor-pointer select-none" style={{ fontFamily: FM, color: "#444" }}>
                  Active — visible in stock
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                <button type="button" onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded border text-sm transition-colors hover:bg-black/3"
                  style={{ borderColor: "#E5E5E5", color: "#666", fontFamily: FM }}>Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 rounded text-sm text-white transition-all duration-200 hover:bg-[#b8952e] disabled:opacity-50 active:scale-95"
                  style={{ backgroundColor: "#D4AF37", fontFamily: FM, fontWeight: 600 }}>
                  {submitting ? "Saving…" : editingItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}





