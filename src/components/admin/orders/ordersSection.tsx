/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import OrdersDashboard from "./OrdersDashboard";

const FM = "var(--font-montserrat), 'Montserrat', sans-serif";
const FH = "var(--font-montserrat), 'Montserrat', sans-serif";

// ─── Types ─────────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
type PaymentStatus = "unpaid" | "paid" | "refunded";
type PaymentMethod = "cash" | "card" | "online" | "upi";

type OrderItem = {
  id: string; productId: string; orderId: string; inventoryId: string;
  quantity: number; unitPrice: number; taxRate: number; discountRate: number;
  taxAmount: number; discountAmount: number; lineTotal: number;
  productName: string; batchNumber: string;
};

type Customer = { id: string; name: string; email: string };

type Order = {
  id: string; customerId: string | null; isGuest: boolean;
  guestName: string | null; guestEmail: string | null; guestPhone: string | null;
  orderStatus: OrderStatus; paymentStatus: PaymentStatus; paymentMethod: PaymentMethod;
  subtotal: number; taxAmount: number; discountAmount: number; totalAmount: number;
  deliveryAddress: string; deliveryNotes: string | null;
  confirmedAt: string | null; shippedAt: string | null;
  deliveredAt: string | null; cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string; updatedAt: string;
  customer?: Customer | null; items?: OrderItem[];
};

type ApiResponse<T> = {
  success: boolean; data?: T; message?: string;
  pagination?: { total: number; page: number; limit: number; pages: number; hasNext: boolean; hasPrev: boolean };
};

type StockStatusFilter = OrderStatus | "";

const API_BASE   = "/api/orders";
const PAGE_SIZE  = 10;
const ORDER_STATUSES: OrderStatus[]    = ["pending","confirmed","processing","shipped","delivered","cancelled"];
const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid","paid","refunded"];

const inputCls = "rounded border border-[#E5E5E5] bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]";

// ─── Status styling ───────────────────────────────────────────────────────────

const ORDER_STATUS_STYLE: Record<OrderStatus, { bg: string; color: string }> = {
  pending:    { bg: "rgba(212,175,55,0.12)",  color: "#9a7a1a" },
  confirmed:  { bg: "rgba(108,142,191,0.12)", color: "#3a5f8a" },
  processing: { bg: "rgba(155,127,199,0.12)", color: "#5c3d8f" },
  shipped:    { bg: "rgba(93,171,142,0.12)",  color: "#2d7a5a" },
  delivered:  { bg: "rgba(34,197,94,0.12)",   color: "#166534" },
  cancelled:  { bg: "rgba(239,68,68,0.12)",   color: "#b91c1c" },
};

const PAYMENT_STYLE: Record<PaymentStatus, { bg: string; color: string }> = {
  unpaid:   { bg: "rgba(0,0,0,0.06)",         color: "#555" },
  paid:     { bg: "rgba(34,197,94,0.12)",      color: "#166534" },
  refunded: { bg: "rgba(249,115,22,0.12)",     color: "#c2410c" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrdersSection() {
  const [orders,     setOrders]     = useState<Order[]>([]);
  const [pagination, setPagination] = useState<ApiResponse<any>["pagination"]>(undefined);
  const [loading,    setLoading]    = useState(true);

  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState<StockStatusFilter>("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "">("");
  const [dateFrom,      setDateFrom]      = useState("");
  const [dateTo,        setDateTo]        = useState("");
  const [currentPage,   setCurrentPage]   = useState(1);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder,   setSelectedOrder]   = useState<Order | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTarget,    setStatusTarget]    = useState<Order | null>(null);
  const [newStatus,       setNewStatus]       = useState<OrderStatus>("pending");
  const [cancellationReason, setCancellationReason] = useState("");
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [paymentModalOpen,  setPaymentModalOpen]  = useState(false);
  const [paymentTarget,     setPaymentTarget]     = useState<Order | null>(null);
  const [newPaymentStatus,  setNewPaymentStatus]  = useState<PaymentStatus>("unpaid");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      p.set("page",  String(currentPage));
      p.set("limit", String(PAGE_SIZE));
      if (search)        p.set("search",        search);
      if (statusFilter)  p.set("orderStatus",   statusFilter);
      if (paymentFilter) p.set("paymentStatus", paymentFilter);
      if (dateFrom)      p.set("dateFrom",       dateFrom);
      if (dateTo)        p.set("dateTo",         dateTo);
      const res  = await fetch(`${API_BASE}?${p}`);
      const json: ApiResponse<Order[]> = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed");
      setOrders(json.data || []);
      setPagination(json.pagination ?? undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load orders");
    } finally { setLoading(false); }
  }, [currentPage, search, statusFilter, paymentFilter, dateFrom, dateTo]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ─── Detail ──────────────────────────────────────────────────────────────────

  const openDetailModal = async (order: Order) => {
    try {
      const res  = await fetch(`${API_BASE}/${order.id}`);
      const json: ApiResponse<Order> = await res.json();
      if (json.success) { setSelectedOrder(json.data || null); setDetailModalOpen(true); }
    } catch { toast.error("Failed to load details"); }
  };

  // ─── Status update ───────────────────────────────────────────────────────────

  const openStatusModal = (order: Order) => {
    setStatusTarget(order); setNewStatus(order.orderStatus);
    setCancellationReason(order.cancellationReason || "");
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusTarget) return;
    if (newStatus === statusTarget.orderStatus) { toast.info("No change"); setStatusModalOpen(false); return; }
    setStatusSubmitting(true);
    try {
      const payload: any = { status: newStatus };
      if (newStatus === "cancelled" && cancellationReason.trim()) payload.cancellationReason = cancellationReason.trim();
      const res  = await fetch(`${API_BASE}/${statusTarget.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed");
      toast.success(`Status → ${newStatus}`);
      setStatusModalOpen(false);
      await fetchOrders();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setStatusSubmitting(false); }
  };

  // ─── Payment update ──────────────────────────────────────────────────────────

  const openPaymentModal = (order: Order) => {
    setPaymentTarget(order); setNewPaymentStatus(order.paymentStatus); setPaymentModalOpen(true);
  };

  const handlePaymentUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTarget) return;
    if (newPaymentStatus === paymentTarget.paymentStatus) { toast.info("No change"); setPaymentModalOpen(false); return; }
    setPaymentSubmitting(true);
    try {
      const res  = await fetch(`${API_BASE}/${paymentTarget.id}/payment`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentStatus: newPaymentStatus }) });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed");
      toast.success(`Payment → ${newPaymentStatus}`);
      setPaymentModalOpen(false);
      await fetchOrders();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setPaymentSubmitting(false); }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const formatCurrency = (n: number) => `£${Number(n).toFixed(2)}`;
  const formatDate     = (d: string) => new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
  const formatDateTime = (d: string) => new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
  const customerDisplay = (o: Order) => o.isGuest ? `${o.guestName || "Guest"}` : (o.customer?.name || "Unknown");
  const customerEmail   = (o: Order) => o.isGuest ? (o.guestEmail || "—") : (o.customer?.email || "—");

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff", fontFamily: FM }}>
      <div className="px-6 pt-8 pb-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p style={{ fontFamily: FM, fontSize: "10px", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.25em", marginBottom: "4px" }}>
              Order Management
            </p>
            <h1 style={{ fontFamily: FH, fontSize: "28px", fontWeight: 700, color: "#111", letterSpacing: "-0.01em" }}>Orders</h1>
            {pagination && (
              <p style={{ fontFamily: FM, fontSize: "13px", color: "#666", marginTop: "4px" }}>
                <strong style={{ color: "#222" }}>{pagination.total}</strong> orders total
              </p>
            )}
          </div>
        </div>

        {/* Dashboard */}
        <OrdersDashboard />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input type="text" placeholder="Search customer name or email…"
            value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className={`flex-1 min-w-[220px] ${inputCls}`}
            style={{ fontFamily: FM, color: "#333" }}
          />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as StockStatusFilter); setCurrentPage(1); }}
            className={inputCls} style={{ fontFamily: FM, color: "#555" }}>
            <option value="">All status</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{cap(s)}</option>)}
          </select>
          <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value as PaymentStatus | ""); setCurrentPage(1); }}
            className={inputCls} style={{ fontFamily: FM, color: "#555" }}>
            <option value="">All payment</option>
            {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{cap(s)}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
            className={inputCls} style={{ fontFamily: FM, color: "#555" }} />
          <span style={{ color: "#AAA", fontFamily: FM, fontSize: "12px" }}>to</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
            className={inputCls} style={{ fontFamily: FM, color: "#555" }} />
          {(search || statusFilter || paymentFilter || dateFrom || dateTo) && (
            <button onClick={() => { setSearch(""); setStatusFilter(""); setPaymentFilter(""); setDateFrom(""); setDateTo(""); setCurrentPage(1); }}
              className="text-xs hover:text-[#D4AF37] transition-colors"
              style={{ color: "#888", fontFamily: FM }}>✕ Clear</button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <span style={{ fontFamily: FM, fontSize: "12px", color: "#AAA" }}>Loading orders…</span>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg overflow-x-auto mb-4"
              style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <table className="w-full text-sm" style={{ minWidth: "900px" }}>
                <thead style={{ backgroundColor: "#FAFAF8", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                  <tr>
                    {["Order #","Customer","Date","Order Status","Payment","Total","Actions"].map((h, i) => (
                      <th key={h} className={`px-4 py-3 whitespace-nowrap ${i === 6 ? "text-right" : "text-left"}`}
                        style={{ fontFamily: FM, fontSize: "10px", fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center"
                        style={{ fontFamily: FM, fontSize: "13px", color: "#BBB" }}>No orders found</td>
                    </tr>
                  ) : orders.map(order => {
                    const os = ORDER_STATUS_STYLE[order.orderStatus];
                    const ps = PAYMENT_STYLE[order.paymentStatus];
                    return (
                      <tr key={order.id} className="border-b transition-colors"
                        style={{ borderColor: "rgba(0,0,0,0.05)" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(212,175,55,0.03)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>

                        {/* Order # */}
                        <td className="px-4 py-2.5">
                          <span className="font-mono" style={{ fontFamily: FM, fontWeight: 600, fontSize: "12px", color: "#333" }}>
                            #{order.id.slice(0, 8)}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-2.5">
                          <p style={{ fontFamily: FM, fontWeight: 600, fontSize: "13px", color: "#111" }}>{customerDisplay(order)}</p>
                          <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA" }}>{customerEmail(order)}</p>
                          {order.isGuest && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: "rgba(212,175,55,0.10)", color: "#9a7a1a", fontFamily: FM, fontWeight: 600 }}>
                              GUEST
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-2.5 whitespace-nowrap" style={{ fontFamily: FM, fontSize: "11px", color: "#666" }}>
                          {formatDate(order.createdAt)}
                        </td>

                        {/* Order Status */}
                        <td className="px-4 py-2.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                            style={{ backgroundColor: os.bg, color: os.color, fontFamily: FM }}>
                            {cap(order.orderStatus)}
                          </span>
                        </td>

                        {/* Payment */}
                        <td className="px-4 py-2.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                            style={{ backgroundColor: ps.bg, color: ps.color, fontFamily: FM }}>
                            {cap(order.paymentStatus)}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span style={{ fontFamily: FM, fontWeight: 700, fontSize: "13px", color: "#111" }}>
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openDetailModal(order)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap"
                              style={{ fontFamily: FM, backgroundColor: "rgba(108,142,191,0.08)", color: "#3a5f8a", border: "1px solid rgba(108,142,191,0.2)" }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                              </svg>
                              View
                            </button>
                            <button onClick={() => openStatusModal(order)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap"
                              style={{ fontFamily: FM, backgroundColor: "rgba(155,127,199,0.08)", color: "#5c3d8f", border: "1px solid rgba(155,127,199,0.2)" }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                              </svg>
                              Status
                            </button>
                            <button onClick={() => openPaymentModal(order)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap"
                              style={{ fontFamily: FM, backgroundColor: "rgba(93,171,142,0.08)", color: "#2d7a5a", border: "1px solid rgba(93,171,142,0.2)" }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                <line x1="1" y1="10" x2="23" y2="10"/>
                              </svg>
                              Pay
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

      {/* ─── Detail Modal ─────────────────────────────────────────────────────── */}
      {detailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <div>
                <p style={{ fontFamily: FM, fontSize: "10px", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Order Detail</p>
                <h2 style={{ fontFamily: FH, fontSize: "18px", fontWeight: 700, color: "#111" }}>#{selectedOrder.id.slice(0, 8)}</h2>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-xl" style={{ color: "#888" }}>✕</button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Customer + order status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="px-4 py-3 rounded-md" style={{ backgroundColor: "#FAFAF8", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Customer</p>
                  <p style={{ fontFamily: FM, fontWeight: 600, color: "#111" }}>{customerDisplay(selectedOrder)}</p>
                  <p style={{ fontFamily: FM, fontSize: "12px", color: "#666" }}>{customerEmail(selectedOrder)}</p>
                  {selectedOrder.isGuest && selectedOrder.guestPhone && (
                    <p style={{ fontFamily: FM, fontSize: "12px", color: "#666" }}>{selectedOrder.guestPhone}</p>
                  )}
                </div>
                <div className="px-4 py-3 rounded-md" style={{ backgroundColor: "#FAFAF8", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(() => { const os = ORDER_STATUS_STYLE[selectedOrder.orderStatus]; return (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                        style={{ backgroundColor: os.bg, color: os.color, fontFamily: FM }}>{cap(selectedOrder.orderStatus)}</span>
                    ); })()}
                    {(() => { const ps = PAYMENT_STYLE[selectedOrder.paymentStatus]; return (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                        style={{ backgroundColor: ps.bg, color: ps.color, fontFamily: FM }}>{cap(selectedOrder.paymentStatus)}</span>
                    ); })()}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider"
                      style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#666", fontFamily: FM }}>{cap(selectedOrder.paymentMethod)}</span>
                  </div>
                  <p style={{ fontFamily: FM, fontSize: "11px", color: "#AAA", marginTop: "6px" }}>{formatDateTime(selectedOrder.createdAt)}</p>
                </div>
              </div>

              {/* Delivery */}
              <div className="px-4 py-3 rounded-md" style={{ backgroundColor: "#FAFAF8", border: "1px solid rgba(0,0,0,0.05)" }}>
                <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Delivery Address</p>
                <p style={{ fontFamily: FM, fontSize: "13px", color: "#333", whiteSpace: "pre-wrap" }}>{selectedOrder.deliveryAddress}</p>
                {selectedOrder.deliveryNotes && (
                  <p style={{ fontFamily: FM, fontSize: "12px", color: "#888", marginTop: "4px" }}>Notes: {selectedOrder.deliveryNotes}</p>
                )}
              </div>

              {/* Items table */}
              <div>
                <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Items</p>
                <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
                  <table className="w-full text-sm">
                    <thead style={{ backgroundColor: "#FAFAF8", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                      <tr>
                        {["Product","Batch","Qty","Unit Price","Total"].map((h, i) => (
                          <th key={h} className={`px-3 py-2 ${i >= 2 ? "text-right" : "text-left"} whitespace-nowrap`}
                            style={{ fontFamily: FM, fontSize: "10px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.items || []).map(item => (
                        <tr key={item.id} style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                          <td className="px-3 py-2.5">
                            <p style={{ fontFamily: FM, fontWeight: 600, fontSize: "12px", color: "#111" }}>{item.productName}</p>
                          </td>
                          <td className="px-3 py-2.5" style={{ fontFamily: FM, fontSize: "11px", color: "#888" }}>{item.batchNumber}</td>
                          <td className="px-3 py-2.5 text-right" style={{ fontFamily: FM, fontWeight: 600, color: "#333" }}>{item.quantity}</td>
                          <td className="px-3 py-2.5 text-right" style={{ fontFamily: FM, fontSize: "12px", color: "#555" }}>{formatCurrency(item.unitPrice)}</td>
                          <td className="px-3 py-2.5 text-right" style={{ fontFamily: FM, fontWeight: 700, color: "#111" }}>{formatCurrency(item.lineTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot style={{ borderTop: "1px solid rgba(0,0,0,0.07)", backgroundColor: "#FAFAF8" }}>
                      {[["Subtotal", formatCurrency(selectedOrder.subtotal)],["Tax", formatCurrency(selectedOrder.taxAmount)],["Discount", `-${formatCurrency(selectedOrder.discountAmount)}`]].map(([l, v]) => (
                        <tr key={l}>
                          <td colSpan={4} className="px-3 py-1.5 text-right" style={{ fontFamily: FM, fontSize: "12px", color: "#888" }}>{l}</td>
                          <td className="px-3 py-1.5 text-right" style={{ fontFamily: FM, fontSize: "12px", color: "#666" }}>{v}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-right" style={{ fontFamily: FM, fontWeight: 700, fontSize: "13px", color: "#111" }}>Total</td>
                        <td className="px-3 py-2 text-right" style={{ fontFamily: FM, fontWeight: 700, fontSize: "14px", color: "#D4AF37" }}>{formatCurrency(selectedOrder.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Timestamps */}
              <div className="flex flex-wrap gap-3 text-xs" style={{ color: "#AAA" }}>
                {[["Created", selectedOrder.createdAt], ["Confirmed", selectedOrder.confirmedAt], ["Shipped", selectedOrder.shippedAt], ["Delivered", selectedOrder.deliveredAt], ["Cancelled", selectedOrder.cancelledAt]].map(([l, v]) =>
                  v ? <span key={l} style={{ fontFamily: FM }}><strong style={{ color: "#888" }}>{l}:</strong> {formatDateTime(v)}</span> : null
                )}
              </div>
              {selectedOrder.cancellationReason && (
                <p style={{ fontFamily: FM, fontSize: "12px", color: "#dc2626" }}>Reason: {selectedOrder.cancellationReason}</p>
              )}
            </div>

            <div className="flex justify-end px-6 py-4 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <button onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 rounded border text-sm transition-colors hover:bg-black/3"
                style={{ borderColor: "#E5E5E5", color: "#666", fontFamily: FM }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Status Modal ─────────────────────────────────────────────────────── */}
      {statusModalOpen && statusTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-lg w-full max-w-md" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <div>
                <p style={{ fontFamily: FM, fontSize: "10px", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Update</p>
                <h2 style={{ fontFamily: FH, fontSize: "18px", fontWeight: 700, color: "#111" }}>Order Status</h2>
              </div>
              <button onClick={() => setStatusModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-xl" style={{ color: "#888" }}>✕</button>
            </div>
            <form onSubmit={handleStatusUpdate} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>New Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full rounded border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  style={{ fontFamily: FM }}>
                  {ORDER_STATUSES.map(s => (
                    <option key={s} value={s}>{cap(s)}{s === statusTarget.orderStatus ? " (current)" : ""}</option>
                  ))}
                </select>
              </div>
              {newStatus === "cancelled" && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>Cancellation Reason</label>
                  <textarea rows={3} value={cancellationReason} onChange={e => setCancellationReason(e.target.value)}
                    placeholder="Why is this being cancelled?"
                    className="w-full rounded border border-[#E5E5E5] px-3 py-2 text-sm resize-none outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    style={{ fontFamily: FM }} />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-1 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                <button type="button" onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 rounded border text-sm hover:bg-black/3"
                  style={{ borderColor: "#E5E5E5", color: "#666", fontFamily: FM }}>Cancel</button>
                <button type="submit" disabled={statusSubmitting || newStatus === statusTarget.orderStatus}
                  className="px-5 py-2 rounded text-sm text-white disabled:opacity-50 transition-colors hover:bg-[#b8952e] active:scale-95"
                  style={{ backgroundColor: "#D4AF37", fontFamily: FM, fontWeight: 600 }}>
                  {statusSubmitting ? "Updating…" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Payment Modal ────────────────────────────────────────────────────── */}
      {paymentModalOpen && paymentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-lg w-full max-w-sm" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <div>
                <p style={{ fontFamily: FM, fontSize: "10px", color: "#D4AF37", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Update</p>
                <h2 style={{ fontFamily: FH, fontSize: "18px", fontWeight: 700, color: "#111" }}>Payment Status</h2>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-xl" style={{ color: "#888" }}>✕</button>
            </div>
            <form onSubmit={handlePaymentUpdate} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "#666", fontFamily: FM }}>Payment Status</label>
                <select value={newPaymentStatus} onChange={e => setNewPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full rounded border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  style={{ fontFamily: FM }}>
                  {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{cap(s)}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                <button type="button" onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 rounded border text-sm hover:bg-black/3"
                  style={{ borderColor: "#E5E5E5", color: "#666", fontFamily: FM }}>Cancel</button>
                <button type="submit" disabled={paymentSubmitting || newPaymentStatus === paymentTarget.paymentStatus}
                  className="px-5 py-2 rounded text-sm text-white disabled:opacity-50 transition-colors hover:bg-[#b8952e] active:scale-95"
                  style={{ backgroundColor: "#D4AF37", fontFamily: FM, fontWeight: 600 }}>
                  {paymentSubmitting ? "Updating…" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}





