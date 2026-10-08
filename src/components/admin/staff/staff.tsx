/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Upload, Plus } from "lucide-react";

const FM = "var(--font-montserrat), 'Montserrat', sans-serif";
const FH = "var(--font-cinzel), 'Cinzel', serif";

// ─── Types ─────────────────────────────────────────────────────────────────────

type StaffRole = "pharmacist" | "cashier" | "store_manager" | "delivery" | "inventory_clerk" | "other";

type Staff = {
  id: string; fullName: string; employeeCode: string; role: StaffRole;
  phone: string; email: string | null; address: string | null;
  dateOfJoining: string; salary: number; isActive: boolean;
  notes: string | null; createdAt: string; updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean; data?: T; message?: string;
  pagination?: { total: number; page: number; limit: number; pages: number; hasNext: boolean; hasPrev: boolean };
  summary?: { total: number; created: number; skipped: number; failed: number };
  skippedCodes?: string[];
  errors?: { row: number; reason: string }[];
};

const API_BASE = "/api/staff";
const PAGE_SIZE = 10;
const ROLES: StaffRole[] = ["pharmacist","cashier","store_manager","delivery","inventory_clerk","other"];

const cap = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

const ROLE_STYLE: Record<StaffRole, { bg: string; color: string }> = {
  pharmacist:     { bg: "rgba(108,142,191,0.12)", color: "#3a5f8a" },
  cashier:        { bg: "rgba(93,171,142,0.12)",  color: "#2d7a5a" },
  store_manager:  { bg: "rgba(212,175,55,0.12)",  color: "#9a7a1a" },
  delivery:       { bg: "rgba(155,127,199,0.12)", color: "#5c3d8f" },
  inventory_clerk:{ bg: "rgba(93,171,142,0.12)",  color: "#2d5a4a" },
  other:          { bg: "rgba(0,0,0,0.06)",        color: "#555" },
};

const inputCls = "w-full rounded border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]";

// ─── Component ────────────────────────────────────────────────────────────────

export default function StaffSection() {
  const [staff,       setStaff]       = useState<Staff[]>([]);
  const [pagination,  setPagination]  = useState<ApiResponse<any>["pagination"]>(undefined);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [roleFilter,  setRoleFilter]  = useState<string>("");
  const [activeFilter,setActiveFilter]= useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen,    setModalOpen]    = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData,     setFormData]     = useState({
    fullName:"", employeeCode:"", role:"other" as StaffRole,
    phone:"", email:"", address:"", dateOfJoining:"",
    salary:0, isActive:true, notes:"",
  });
  const [submitting, setSubmitting] = useState(false);

  const [bulkModalOpen,  setBulkModalOpen]  = useState(false);
  const [bulkFile,       setBulkFile]       = useState<File | null>(null);
  const [bulkJson,       setBulkJson]       = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkResult,     setBulkResult]     = useState<ApiResponse<any> | null>(null);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      p.set("page",  String(currentPage));
      p.set("limit", String(PAGE_SIZE));
      if (search)                    p.set("search",   search);
      if (roleFilter)                p.set("role",     roleFilter);
      if (activeFilter !== undefined) p.set("isActive", String(activeFilter));
      const res  = await fetch(`${API_BASE}?${p}`);
      const json: ApiResponse<Staff[]> = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed");
      setStaff(json.data || []);
      setPagination(json.pagination ?? undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load staff");
    } finally { setLoading(false); }
  }, [currentPage, search, roleFilter, activeFilter]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  // ─── Modal helpers ──────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setEditingStaff(null);
    setFormData({ fullName:"", employeeCode:"", role:"other", phone:"", email:"", address:"", dateOfJoining:"", salary:0, isActive:true, notes:"" });
    setModalOpen(true);
  };

  const openEditModal = (s: Staff) => {
    setEditingStaff(s);
    setFormData({
      fullName: s.fullName, employeeCode: s.employeeCode, role: s.role,
      phone: s.phone, email: s.email || "", address: s.address || "",
      dateOfJoining: s.dateOfJoining.slice(0, 10),
      salary: s.salary, isActive: s.isActive, notes: s.notes || "",
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
    const toastId = toast.loading(editingStaff ? "Updating staff…" : "Creating staff…");
    try {
      const isEdit = !!editingStaff;
      const res = await fetch(isEdit ? `${API_BASE}/${editingStaff.id}` : API_BASE, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName:      formData.fullName.trim(),
          employeeCode:  formData.employeeCode.trim(),
          role:          formData.role,
          phone:         formData.phone.trim(),
          email:         formData.email.trim()   || undefined,
          address:       formData.address.trim() || undefined,
          dateOfJoining: formData.dateOfJoining,
          salary:        Number(formData.salary),
          isActive:      formData.isActive,
          notes:         formData.notes.trim()   || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed");
      toast.success(isEdit ? "Staff updated" : "Staff created", { id: toastId });
      await fetchStaff();
      setModalOpen(false);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed", { id: toastId }); }
    finally { setSubmitting(false); }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res  = await fetch(`${API_BASE}/${id}/toggle-active`, { method: "PATCH" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed");
      toast.success(json.message || "Status toggled");
      await fetchStaff();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Toggle failed"); }
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>("");

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    setConfirmDeleteName("");
    try {
      const res  = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed");
      setStaff(prev => prev.filter(s => s.id !== id));
      toast.success("Staff member deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
      fetchStaff();
    }
  };

  // ─── Bulk import ────────────────────────────────────────────────────────────

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkSubmitting(true); setBulkResult(null);
    try {
      let body: FormData | string; let headers: HeadersInit = {};
      if (bulkFile) { const fd = new FormData(); fd.append("file", bulkFile); body = fd; }
      else if (bulkJson.trim()) {
        const parsed = JSON.parse(bulkJson);
        if (!Array.isArray(parsed)) throw new Error("JSON must be an array");
        body = JSON.stringify(parsed); headers["Content-Type"] = "application/json";
      } else throw new Error("Provide a file or JSON array");
      const res  = await fetch(`${API_BASE}/bulk`, { method: "POST", headers, body });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed");
      setBulkResult(json);
      toast.success(`Imported ${json.summary?.created || 0} staff members`);
      await fetchStaff();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Import failed"); }
    finally { setBulkSubmitting(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff", fontFamily: FM }}>
      <div className="px-6 pt-8 pb-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p style={{ fontFamily: FM, fontSize: "10px", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: "4px" }}>
              HR Management
            </p>
            <h1 style={{ fontFamily: FH, fontSize: "28px", fontWeight: 700, color: "#111", letterSpacing: "-0.01em" }}>
              Staff
            </h1>
            {pagination && (
              <p style={{ fontFamily: FM, fontSize: "13px", color: "#666", marginTop: "4px" }}>
                <strong style={{ color: "#222" }}>{pagination.total}</strong> staff members
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setBulkFile(null); setBulkJson(""); setBulkResult(null); setBulkModalOpen(true); }}
              className="btn-flip-staff btn-flip-staff-bulk active:scale-95"
              data-front="📤 Bulk Import"
              data-back="📤 Bulk Import"
            />
            <button 
              onClick={openCreateModal}
              className="btn-flip-staff btn-flip-staff-add active:scale-95"
              data-front="➕ Add Staff"
              data-back="➕ Add Staff"
            />
            
            <style>{`
              .btn-flip-staff {
                opacity: 1; outline: 0; line-height: 38px;
                position: relative; text-align: center;
                letter-spacing: 0.04em; display: inline-block;
                text-decoration: none;
                font-family: var(--font-montserrat),'Montserrat',sans-serif;
                font-size: 13px; font-weight: 700;
                cursor: pointer; border: none; background: transparent; padding: 0;
              }
              .btn-flip-staff:hover:after  { opacity: 1; transform: translateY(0) rotateX(0); }
              .btn-flip-staff:hover:before { opacity: 0; transform: translateY(50%) rotateX(90deg); }
              .btn-flip-staff:after {
                top: 0; left: 0; opacity: 0; width: 100%; display: block;
                transition: 0.42s cubic-bezier(0.23,1,0.32,1);
                position: absolute; content: attr(data-back);
                transform: translateY(-50%) rotateX(90deg);
                padding: 0 16px; border-radius: 6px;
              }
              .btn-flip-staff:before {
                top: 0; left: 0; opacity: 1; display: block;
                padding: 0 16px; line-height: 38px;
                transition: 0.42s cubic-bezier(0.23,1,0.32,1);
                position: relative; content: attr(data-front);
                transform: translateY(0) rotateX(0); border-radius: 6px;
              }
              
              .btn-flip-staff-bulk:before {
                background: linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.05) 100%);
                color: #D4AF37; border: 1px solid #D4AF37;
                box-shadow: 0 1px 3px rgba(212,175,55,0.2), inset 0 1px 0 rgba(255,255,255,0.6);
              }
              .btn-flip-staff-bulk:after {
                background: linear-gradient(135deg, #D4AF37 0%, #C9A52E 100%);
                color: #fff; border: 1px solid rgba(212,175,55,0.6);
                box-shadow: 0 4px 16px rgba(212,175,55,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
              }
              
              .btn-flip-staff-add:before {
                background: linear-gradient(135deg, #D4AF37 0%, #C9A52E 100%);
                color: #fff; border: 1px solid rgba(212,175,55,0.6);
                box-shadow: 0 2px 8px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
              }
              .btn-flip-staff-add:after {
                background: linear-gradient(135deg, #1A1A1A 0%, #2a2a2a 100%);
                color: #D4AF37; border: 1px solid rgba(255,255,255,0.08);
                box-shadow: 0 4px 16px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06);
              }
            `}</style>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input type="text" placeholder="Search by name, code, or phone…"
            value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="flex-1 min-w-[200px] rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            style={{ borderColor: "#E5E5E5", fontFamily: FM, color: "#333" }}
          />
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
            style={{ borderColor: "#E5E5E5", fontFamily: FM, color: "#555" }}>
            <option value="">All roles</option>
            {ROLES.map(r => <option key={r} value={r}>{cap(r)}</option>)}
          </select>
          <select value={activeFilter === undefined ? "" : String(activeFilter)}
            onChange={e => { const v = e.target.value; setActiveFilter(v === "" ? undefined : v === "true"); setCurrentPage(1); }}
            className="rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
            style={{ borderColor: "#E5E5E5", fontFamily: FM, color: "#555" }}>
            <option value="">All status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          {(search || roleFilter || activeFilter !== undefined) && (
            <button onClick={() => { setSearch(""); setRoleFilter(""); setActiveFilter(undefined); setCurrentPage(1); }}
              className="text-xs hover:text-[#D4AF37] transition-colors"
              style={{ color: "#888", fontFamily: FM }}>✕ Clear</button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <span style={{ fontFamily: FM, fontSize: "12px", color: "#AAA" }}>Loading staff…</span>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg overflow-x-auto mb-4"
              style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <table className="w-full text-sm" style={{ minWidth: "1100px" }}>
                <thead style={{ backgroundColor: "#ffffff", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                  <tr>
                    {["Name","Code","Role","Phone","Email","Address","Joining","Salary","Status","Actions"].map((h, i) => (
                      <th key={h} className={`px-4 py-3 whitespace-nowrap ${i === 9 ? "text-right" : "text-left"}`}
                        style={{ fontFamily: FM, fontSize: "10px", fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {staff.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center"
                        style={{ fontFamily: FM, fontSize: "13px", color: "#BBB" }}>No staff members found</td>
                    </tr>
                  ) : staff.map(s => {
                    const rs = ROLE_STYLE[s.role];
                    return (
                      <tr key={s.id} className="border-b transition-colors"
                        style={{ borderColor: "rgba(0,0,0,0.05)" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(212,175,55,0.03)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>

                        <td className="px-4 py-2.5">
                          <p style={{ fontFamily: FM, fontWeight: 600, fontSize: "13px", color: "#111" }}>{s.fullName}</p>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className="font-mono" style={{ fontFamily: FM, fontSize: "11px", color: "#666" }}>{s.employeeCode}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                            style={{ backgroundColor: rs.bg, color: rs.color, fontFamily: FM }}>
                            {cap(s.role)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap" style={{ fontFamily: FM, fontSize: "12px", color: "#444" }}>{s.phone}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap" style={{ fontFamily: FM, fontSize: "12px", color: "#666" }}>{s.email || "—"}</td>
                        <td className="px-4 py-2.5 max-w-[130px]">
                          <span className="line-clamp-1" style={{ fontFamily: FM, fontSize: "12px", color: "#666" }}>{s.address || "—"}</span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap" style={{ fontFamily: FM, fontSize: "11px", color: "#666" }}>{formatDate(s.dateOfJoining)}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap" style={{ fontFamily: FM, fontWeight: 600, fontSize: "12px", color: "#222" }}>
                          £{Number(s.salary).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                            style={{
                              backgroundColor: s.isActive ? "rgba(34,197,94,0.10)" : "rgba(0,0,0,0.06)",
                              color: s.isActive ? "#166534" : "#6B7280",
                              fontFamily: FM,
                            }}>
                            {s.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit */}
                            <button onClick={() => openEditModal(s)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap"
                              style={{ fontFamily: FM, backgroundColor: "rgba(212,175,55,0.08)", color: "#b8952e", border: "1px solid rgba(212,175,55,0.25)" }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Edit
                            </button>
                            {/* Hide / Show */}
                            <button onClick={() => handleToggleActive(s.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap"
                              style={{
                                fontFamily: FM,
                                backgroundColor: s.isActive ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                                color: s.isActive ? "#dc2626" : "#16a34a",
                                border: `1px solid ${s.isActive ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
                              }}>
                              {s.isActive ? (
                                <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg> Hide</>
                              ) : (
                                <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Show</>
                              )}
                            </button>
                            {/* Delete */}
                            <button onClick={() => { setConfirmDeleteId(s.id); setConfirmDeleteName(s.fullName); }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap"
                              style={{ fontFamily: FM, backgroundColor: "rgba(239,68,68,0.06)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.15)" }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                              </svg>
                              Delete
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <div>
                <p style={{ fontFamily: FM, fontSize: "10px", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>
                  {editingStaff ? "Edit" : "New"}
                </p>
                <h2 style={{ fontFamily: FH, fontSize: "18px", fontWeight: 700, color: "#111" }}>
                  {editingStaff ? "Edit Staff Member" : "Add Staff Member"}
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-xl" style={{ color: "#888" }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

              {/* Row 1: Full Name + Employee Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>Full Name <span className="text-red-400">*</span></label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleFormChange} required placeholder="John Doe" className={inputCls} style={{ fontFamily: FM }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>Employee Code <span className="text-red-400">*</span></label>
                  <input type="text" name="employeeCode" value={formData.employeeCode} onChange={handleFormChange} required placeholder="EMP-001" className={inputCls} style={{ fontFamily: FM }} />
                </div>
              </div>

              {/* Row 2: Phone + Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>Phone <span className="text-red-400">*</span></label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleFormChange} required placeholder="+44 7700 900000" className={inputCls} style={{ fontFamily: FM }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="john@example.com" className={inputCls} style={{ fontFamily: FM }} />
                </div>
              </div>

              {/* Row 3: Role + Date of Joining + Salary */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>Role <span className="text-red-400">*</span></label>
                  <select name="role" value={formData.role} onChange={handleFormChange} required className={inputCls} style={{ fontFamily: FM }}>
                    {ROLES.map(r => <option key={r} value={r}>{cap(r)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>Date of Joining <span className="text-red-400">*</span></label>
                  <input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleFormChange} required className={inputCls} style={{ fontFamily: FM }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>Salary</label>
                  <input type="number" name="salary" value={formData.salary} onChange={handleFormChange} min={0} step="0.01" placeholder="0.00" className={inputCls} style={{ fontFamily: FM }} />
                </div>
              </div>

              {/* Row 4: Address + Notes side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>Address</label>
                  <textarea name="address" rows={2} value={formData.address} onChange={handleFormChange}
                    placeholder="123 Main St, City" className={inputCls} style={{ fontFamily: FM, resize: "vertical" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>Notes</label>
                  <textarea name="notes" rows={2} value={formData.notes} onChange={handleFormChange}
                    placeholder="Any additional information…" className={inputCls} style={{ fontFamily: FM, resize: "vertical" }} />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-2.5">
                <input id="isActive" name="isActive" type="checkbox"
                  checked={formData.isActive} onChange={handleFormChange}
                  className="w-4 h-4 rounded accent-[#D4AF37]" />
                <label htmlFor="isActive" className="text-sm cursor-pointer select-none" style={{ fontFamily: FM, color: "#444" }}>
                  Active staff member
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                <button type="button" onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded text-sm active:scale-95"
                  style={{ fontFamily: FM, fontWeight: 600, background: "linear-gradient(135deg,rgba(107,114,128,0.10) 0%,rgba(107,114,128,0.05) 100%)", color: "#6B7280", border: "1px solid rgba(107,114,128,0.25)", boxShadow: "0 2px 6px rgba(0,0,0,0.05),inset 0 1px 0 rgba(255,255,255,0.6)", transition: "all 0.15s ease" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(-1px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(0)"; }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 rounded text-sm font-bold active:scale-95"
                  style={{ fontFamily: FM, background: "linear-gradient(135deg,#D4AF37 0%,#C9A52E 100%)", color: "#1A1A1A", border: "1px solid rgba(212,175,55,0.6)", boxShadow: "0 2px 8px rgba(212,175,55,0.42),inset 0 1px 0 rgba(255,255,255,0.2)", opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer", transition: "all 0.15s ease" }}
                  onMouseEnter={e => { if (!submitting) { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(-2px)"; } }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(0)"; }}>
                  {submitting ? "Saving…" : editingStaff ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Bulk Import Modal ────────────────────────────────────────────────── */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <div>
                <p style={{ fontFamily: FM, fontSize: "10px", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Import</p>
                <h2 style={{ fontFamily: FH, fontSize: "18px", fontWeight: 700, color: "#111" }}>Bulk Import Staff</h2>
              </div>
              <button onClick={() => { setBulkModalOpen(false); setBulkResult(null); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-xl" style={{ color: "#888" }}>✕</button>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm mb-4" style={{ fontFamily: FM, color: "#666" }}>
                Required columns: <strong>fullName</strong>, <strong>employeeCode</strong>, <strong>phone</strong>, <strong>dateOfJoining</strong> (YYYY-MM-DD).
                Optional: role, email, address, salary, isActive, notes.
              </p>
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>Upload Excel (.xlsx / .xls)</label>
                  <input type="file" accept=".xlsx,.xls" onChange={e => setBulkFile(e.target.files?.[0] || null)}
                    className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#D4AF37] file:text-white hover:file:bg-[#b8952e]"
                    style={{ color: "#888", fontFamily: FM }} />
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: "#F0F0EE" }} /></div>
                  <div className="relative flex justify-center"><span className="px-2 bg-white text-xs" style={{ color: "#BBB", fontFamily: FM }}>or paste JSON</span></div>
                </div>
                <textarea rows={5} value={bulkJson} onChange={e => setBulkJson(e.target.value)}
                  placeholder='[{"fullName":"John Doe","employeeCode":"EMP-001","role":"pharmacist","phone":"+44 7700 900000","dateOfJoining":"2024-01-01"}]'
                  className={inputCls} style={{ fontFamily: "monospace", fontSize: "11px" }} />

                {bulkResult && (
                  <div className="px-4 py-3 rounded" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: "#166534", fontFamily: FM }}>Import complete</p>
                    <p className="text-xs" style={{ color: "#166534", fontFamily: FM }}>
                      {bulkResult.summary?.created} created · {bulkResult.summary?.skipped} skipped · {bulkResult.summary?.failed} failed
                    </p>
                    {bulkResult.skippedCodes?.length ? <p className="text-xs mt-1" style={{ color: "#888", fontFamily: FM }}>Skipped: {bulkResult.skippedCodes.join(", ")}</p> : null}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => { setBulkModalOpen(false); setBulkResult(null); }}
                    className="px-4 py-2 rounded border text-sm hover:bg-black/3"
                    style={{ borderColor: "#E5E5E5", color: "#666", fontFamily: FM }}>Close</button>
                  <button type="submit" disabled={bulkSubmitting}
                    className="px-5 py-2 rounded text-sm text-white disabled:opacity-50 transition-colors hover:bg-[#b8952e] active:scale-95"
                    style={{ backgroundColor: "#D4AF37", fontFamily: FM, fontWeight: 600 }}>
                    {bulkSubmitting ? "Importing…" : "Import"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal — centered like Windows alert */}
      {confirmDeleteId && (
        <div
          onClick={() => { setConfirmDeleteId(null); setConfirmDeleteName(""); }}
          style={{
            position: "fixed", inset: 0, zIndex: 60,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px", backdropFilter: "blur(2px)",
          }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: "8px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
              padding: "30px", maxWidth: "420px", width: "100%",
              fontFamily: FM,
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>Delete Staff Member?</h3>
                <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.4 }}>Are you sure you want to delete <strong>{confirmDeleteName}</strong>? This action cannot be undone.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button
                onClick={() => { setConfirmDeleteId(null); setConfirmDeleteName(""); }}
                style={{
                  flex: 1, padding: "10px 16px",
                  backgroundColor: "#F3F4F6", color: "#374151",
                  border: "1px solid #D1D5DB", borderRadius: "6px",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  fontFamily: FM, transition: "background-color 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#E5E7EB"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#F3F4F6"; }}>
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                style={{
                  flex: 1, padding: "10px 16px",
                  backgroundColor: "#DC2626", color: "#fff",
                  border: "1px solid #DC2626", borderRadius: "6px",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  fontFamily: FM, transition: "background-color 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#B91C1C"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#DC2626"; }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
