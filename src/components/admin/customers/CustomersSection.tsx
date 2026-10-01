"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Users, Search, X, ShoppingBag, Mail, Calendar,
  TrendingUp, UserCheck, UserX, RefreshCw, ChevronDown,
} from "lucide-react";

const FM = "var(--font-montserrat), 'Montserrat', sans-serif";
const FH = "var(--font-cinzel), 'Cinzel', serif";

// ─── Types ────────────────────────────────────────────────────────────────────

type Customer = {
  id: string; name: string; email: string; role: string;
  isActive: boolean; createdAt: string; updatedAt: string;
};

type CustomerOrder = {
  id: string; orderStatus: string; paymentStatus: string;
  totalAmount: number | string; createdAt: string;
};

type CustomerDetail = Customer & {
  orders?: CustomerOrder[];
  orderStats?: { total: number; delivered: number; pending: number; cancelled: number; totalSpent: number | string };
};

type Stats     = { total: number; active: number; inactive: number };
type Pagination = { total: number; page: number; limit: number; pages: number; hasNext: boolean; hasPrev: boolean };

const PAGE_SIZE = 15;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt      = (n: number | string) => `£${Number(n).toFixed(2)}`;
const fmtDate  = (d: string) => new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
const initials = (name: string | null | undefined) => {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).filter(Boolean).join("").slice(0, 2).toUpperCase();
};

const ORDER_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "rgba(212,175,55,0.12)",  color: "#9a7a1a" },
  confirmed:  { bg: "rgba(108,142,191,0.12)", color: "#3a5f8a" },
  processing: { bg: "rgba(155,127,199,0.12)", color: "#5c3d8f" },
  shipped:    { bg: "rgba(93,171,142,0.12)",  color: "#2d7a5a" },
  delivered:  { bg: "rgba(34,197,94,0.12)",   color: "#166534" },
  cancelled:  { bg: "rgba(239,68,68,0.12)",   color: "#b91c1c" },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomersSection() {
  const [customers,   setCustomers]   = useState<Customer[]>([]);
  const [pagination,  setPagination]  = useState<Pagination | null>(null);
  const [stats,       setStats]       = useState<Stats | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState("");
  const [activeFilter,setActiveFilter]= useState<"" | "true" | "false">("");

  const [detailOpen,    setDetailOpen]    = useState(false);
  const [detail,        setDetail]        = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [editOpen,  setEditOpen]  = useState(false);
  const [editTarget,setEditTarget]= useState<Customer | null>(null);
  const [editName,  setEditName]  = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editSaving,setEditSaving]= useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      p.set("page",  String(page));
      p.set("limit", String(PAGE_SIZE));
      if (search)            p.set("search",   search);
      if (activeFilter !== "") p.set("isActive", activeFilter);
      const res  = await fetch(`/api/customers?${p}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed");
      setCustomers(json.data || []);
      setPagination(json.pagination ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load customers");
    } finally { setLoading(false); }
  }, [page, search, activeFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch("/api/customers/stats");
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { fetchStats();     }, [fetchStats]);

  // ── Detail ─────────────────────────────────────────────────────────────────

  const openDetail = async (c: Customer) => {
    setDetailOpen(true); setDetailLoading(true); setDetail(null);
    try {
      const res  = await fetch(`/api/customers/${c.id}/orders`);
      const json = await res.json();
      setDetail(json.success ? (json.data ?? json.customer ?? c) : c);
    } catch { setDetail(c); }
    finally { setDetailLoading(false); }
  };

  // ── Toggle active ──────────────────────────────────────────────────────────

  const toggleActive = async (c: Customer) => {
    const action = c.isActive ? "deactivate" : "activate";
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} "${c.name}"?`)) return;
    try {
      const res  = await fetch(`/api/customers/${c.id}/toggle-active`, { method: "PATCH" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed");
      toast.success(`Customer ${action}d`);
      fetchCustomers(); fetchStats();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────

  const openEdit = (c: Customer) => {
    setEditTarget(c); setEditName(c.name); setEditEmail(c.email); setEditOpen(true);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditSaving(true);
    try {
      const res  = await fetch(`/api/customers/${editTarget.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), email: editEmail.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed");
      toast.success("Customer updated");
      setEditOpen(false); fetchCustomers();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Update failed"); }
    finally { setEditSaving(false); }
  };

  const inputCls = "w-full rounded border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]";

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff", fontFamily: FM }}>
      <div className="px-6 pt-8 pb-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p style={{ fontFamily: FM, fontSize: "10px", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: "4px" }}>
              Customer Management
            </p>
            <h1 style={{ fontFamily: FH, fontSize: "28px", fontWeight: 700, color: "#111", letterSpacing: "-0.01em" }}>Customers</h1>
            {pagination && (
              <p style={{ fontFamily: FM, fontSize: "13px", color: "#666", marginTop: "4px" }}>
                <strong style={{ color: "#222" }}>{pagination.total}</strong> registered customers
              </p>
            )}
          </div>
          <button
            onClick={() => { fetchCustomers(); fetchStats(); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded border text-sm transition-all duration-200"
            style={{ borderColor: "#DDD", color: "#666", fontFamily: FM }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor="#999"; el.style.color="#333"; el.style.transform="translateY(-1px)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor="#DDD"; el.style.color="#666"; el.style.transform="translateY(0)"; }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total",    value: stats?.total    ?? "—", icon: Users,     color: "#D4AF37" },
            { label: "Active",   value: stats?.active   ?? "—", icon: UserCheck, color: "#16a34a" },
            { label: "Inactive", value: stats?.inactive ?? "—", icon: UserX,     color: "#dc2626" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg px-5 py-4 flex items-center gap-4"
              style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${s.color}18` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <p style={{ fontFamily: FM, fontSize: "10px", color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</p>
                <p style={{ fontFamily: FH, fontSize: "22px", fontWeight: 700, color: "#111", lineHeight: 1.2 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex-1 min-w-[220px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#BBB" }} />
            <input type="text" placeholder="Search by name or email…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-8 py-2 rounded border bg-white text-sm outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              style={{ borderColor: "#E5E5E5", fontFamily: FM, color: "#333" }} />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5" style={{ color: "#BBB" }} />
              </button>
            )}
          </div>
          <select value={activeFilter} onChange={e => { setActiveFilter(e.target.value as typeof activeFilter); setPage(1); }}
            className="rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
            style={{ borderColor: "#E5E5E5", fontFamily: FM, color: "#555" }}>
            <option value="">All customers</option>
            <option value="true">Active only</option>
            <option value="false">Inactive only</option>
          </select>
          {(search || activeFilter) && (
            <button onClick={() => { setSearch(""); setActiveFilter(""); setPage(1); }}
              className="text-xs hover:text-[#D4AF37] transition-colors"
              style={{ color: "#888", fontFamily: FM }}>✕ Clear</button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <span style={{ fontFamily: FM, fontSize: "12px", color: "#AAA" }}>Loading customers…</span>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg overflow-hidden mb-4"
              style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: "#ffffff", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                  <tr>
                    {["Customer","Email","Joined","Status","Actions"].map((h, i) => (
                      <th key={h} className={`px-4 py-3 whitespace-nowrap ${i === 4 ? "text-right" : "text-left"}`}
                        style={{ fontFamily: FM, fontSize: "10px", fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center"
                        style={{ fontFamily: FM, fontSize: "13px", color: "#BBB" }}>No customers found</td>
                    </tr>
                  ) : customers.map(c => (
                    <tr key={c.id} className="border-b transition-colors"
                      style={{ borderColor: "rgba(0,0,0,0.05)" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(212,175,55,0.03)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>

                      {/* Avatar + Name */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ backgroundColor: c.isActive ? "#D4AF37" : "#CCC", fontFamily: FM }}>
                            {initials(c.name)}
                          </div>
                          <p style={{ fontFamily: FM, fontWeight: 600, fontSize: "13px", color: "#111" }}>{c.name || "—"}</p>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 shrink-0" style={{ color: "#CCC" }} />
                          <span style={{ fontFamily: FM, fontSize: "12px", color: "#444" }}>{c.email}</span>
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 shrink-0" style={{ color: "#CCC" }} />
                          <span style={{ fontFamily: FM, fontSize: "11px", color: "#666" }}>{fmtDate(c.createdAt)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                          style={{
                            backgroundColor: c.isActive ? "rgba(34,197,94,0.10)" : "rgba(0,0,0,0.06)",
                            color: c.isActive ? "#166534" : "#6B7280",
                            fontFamily: FM,
                          }}>
                          {c.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <button onClick={() => openDetail(c)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap"
                            style={{ fontFamily: FM, backgroundColor: "rgba(108,142,191,0.08)", color: "#3a5f8a", border: "1px solid rgba(108,142,191,0.2)" }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                            View
                          </button>
                          {/* Edit */}
                          <button onClick={() => openEdit(c)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap"
                            style={{ fontFamily: FM, backgroundColor: "rgba(212,175,55,0.08)", color: "#b8952e", border: "1px solid rgba(212,175,55,0.25)" }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                          </button>
                          {/* Hide / Show */}
                          <button onClick={() => toggleActive(c)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap"
                            style={{
                              fontFamily: FM,
                              backgroundColor: c.isActive ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                              color: c.isActive ? "#dc2626" : "#16a34a",
                              border: `1px solid ${c.isActive ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
                            }}>
                            {c.isActive ? (
                              <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg> Deactivate</>
                            ) : (
                              <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Activate</>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination.hasPrev}
                    className="px-4 py-1.5 rounded border text-sm transition-colors hover:bg-white disabled:opacity-40"
                    style={{ borderColor: "#E5E5E5", color: "#555", fontFamily: FM }}>← Previous</button>
                  <span style={{ fontFamily: FM, fontSize: "12px", color: "#888" }}>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={!pagination.hasNext}
                    className="px-4 py-1.5 rounded border text-sm transition-colors hover:bg-white disabled:opacity-40"
                    style={{ borderColor: "#E5E5E5", color: "#555", fontFamily: FM }}>Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail Modal ──────────────────────────────────────────────────── */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <div>
                <p style={{ fontFamily: FM, fontSize: "10px", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Customer Profile</p>
                <h2 style={{ fontFamily: FH, fontSize: "18px", fontWeight: 700, color: "#111" }}>
                  {detail?.name || "Loading…"}
                </h2>
              </div>
              <button onClick={() => setDetailOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-xl" style={{ color: "#888" }}>✕</button>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : detail && (
              <div className="px-6 py-5 space-y-5">
                {/* Profile row */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
                    style={{ backgroundColor: detail.isActive ? "#D4AF37" : "#CCC", fontFamily: FM }}>
                    {initials(detail.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p style={{ fontFamily: FM, fontWeight: 700, fontSize: "15px", color: "#111" }}>{detail.name}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ backgroundColor: detail.isActive ? "rgba(34,197,94,0.10)" : "rgba(0,0,0,0.06)", color: detail.isActive ? "#166534" : "#6B7280", fontFamily: FM }}>
                        {detail.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5" style={{ fontFamily: FM, fontSize: "12px", color: "#666" }}>
                      <Mail className="w-3 h-3" style={{ color: "#CCC" }} /> {detail.email}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5" style={{ fontFamily: FM, fontSize: "11px", color: "#AAA" }}>
                      <Calendar className="w-3 h-3" /> Joined {fmtDate(detail.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Order stats */}
                {detail.orderStats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Orders",       value: detail.orderStats.total,                    color: "#6C8EBF" },
                      { label: "Delivered",    value: detail.orderStats.delivered,                color: "#16a34a" },
                      { label: "Pending",      value: detail.orderStats.pending,                  color: "#D4AF37" },
                      { label: "Total Spent",  value: fmt(detail.orderStats.totalSpent ?? 0),     color: "#9B7FC7", isStr: true },
                    ].map(s => (
                      <div key={s.label} className="px-4 py-3 rounded-lg text-center"
                        style={{ backgroundColor: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                        <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{s.label}</p>
                        <p style={{ fontFamily: FH, fontSize: "20px", fontWeight: 700, color: s.color }}>
                          {s.isStr ? s.value : String(s.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent orders */}
                {detail.orders && detail.orders.length > 0 ? (
                  <div>
                    <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                      Recent Orders
                    </p>
                    <div className="space-y-2">
                      {detail.orders.slice(0, 5).map(o => {
                        const st = ORDER_STATUS_STYLE[o.orderStatus] || { bg: "rgba(0,0,0,0.05)", color: "#555" };
                        return (
                          <div key={o.id} className="flex items-center justify-between px-4 py-3 rounded-lg"
                            style={{ backgroundColor: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)" }}>
                            <div>
                              <p className="font-mono" style={{ fontFamily: FM, fontWeight: 600, fontSize: "12px", color: "#333" }}>#{o.id.slice(0, 8)}</p>
                              <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA" }}>{fmtDate(o.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                                style={{ backgroundColor: st.bg, color: st.color, fontFamily: FM }}>
                                {o.orderStatus}
                              </span>
                              <span style={{ fontFamily: FM, fontWeight: 700, fontSize: "13px", color: "#111" }}>{fmt(o.totalAmount)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8" style={{ color: "#CCC" }}>
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p style={{ fontFamily: FM, fontSize: "13px" }}>No orders yet</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end px-6 py-4 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <button onClick={() => setDetailOpen(false)}
                className="px-4 py-2 rounded border text-sm hover:bg-black/3"
                style={{ borderColor: "#E5E5E5", color: "#666", fontFamily: FM }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ────────────────────────────────────────────────────── */}
      {editOpen && editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-lg w-full max-w-md" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <div>
                <p style={{ fontFamily: FM, fontSize: "10px", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Edit</p>
                <h2 style={{ fontFamily: FH, fontSize: "18px", fontWeight: 700, color: "#111" }}>Edit Customer</h2>
              </div>
              <button onClick={() => setEditOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-xl" style={{ color: "#888" }}>✕</button>
            </div>
            <form onSubmit={saveEdit} className="px-6 py-5 space-y-4">
              {[
                { label: "Full Name", value: editName, set: setEditName, type: "text"  as const },
                { label: "Email",     value: editEmail, set: setEditEmail, type: "email" as const },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>
                    {f.label} <span className="text-red-400">*</span>
                  </label>
                  <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} required className={inputCls} style={{ fontFamily: FM }} />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                <button type="button" onClick={() => setEditOpen(false)}
                  className="px-4 py-2 rounded border text-sm hover:bg-black/3"
                  style={{ borderColor: "#E5E5E5", color: "#666", fontFamily: FM }}>Cancel</button>
                <button type="submit" disabled={editSaving}
                  className="px-5 py-2 rounded text-sm text-white disabled:opacity-50 transition-colors hover:bg-[#b8952e] active:scale-95"
                  style={{ backgroundColor: "#D4AF37", fontFamily: FM, fontWeight: 600 }}>
                  {editSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
