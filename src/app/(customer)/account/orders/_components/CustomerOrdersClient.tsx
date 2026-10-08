"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Package, ChevronRight, Loader2, AlertCircle, CheckCircle2, Star, MessageSquarePlus } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  productId?: string;
  product?: { productImage: string | null; id?: string };
}

interface Order {
  id: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

interface ReviewState {
  orderId: string;
  productId: string;
  productName: string;
  rating: number;
  text: string;
  submitting: boolean;
  done: boolean;
}

interface CustomerOrdersClientProps {
  customerId: string;
  email: string;
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110">
          <Star className="w-7 h-7"
            fill={(hover || value) >= n ? "#D4AF37" : "none"}
            stroke={(hover || value) >= n ? "#D4AF37" : "#D1D5DB"}
            strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

export default function CustomerOrdersClient({ customerId, email }: CustomerOrdersClientProps) {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [reviews, setReviews]       = useState<Record<string, ReviewState>>({});
  const [openReview, setOpenReview] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      // Pass email as fallback in case JWT has a stale customerId (after DB migration)
      const params = new URLSearchParams();
      if (email) params.set("email", email);
      const res = await fetch(`/api/orders/customer/${customerId}?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || json.message || "Failed to load orders");
      setOrders(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [customerId, email]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleConfirmDelivery = async (orderId: string) => {
    setConfirming(orderId);
    try {
      const res = await fetch("/api/orders/confirm-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, customerId, email }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to confirm delivery");
      toast.success("Delivery confirmed! Thank you.");
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: "delivered" } : o));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to confirm delivery");
    } finally {
      setConfirming(null);
    }
  };

  const openReviewForm = (orderId: string, item: OrderItem) => {
    const pid = item.product?.id || item.productId || "";
    const key = `${orderId}:${pid}`;
    if (!reviews[key]) {
      setReviews(prev => ({
        ...prev,
        [key]: { orderId, productId: pid, productName: item.productName, rating: 5, text: "", submitting: false, done: false },
      }));
    }
    setOpenReview(openReview === key ? null : key);
  };

  const submitReview = async (key: string) => {
    const r = reviews[key];
    if (!r || r.rating < 1) return toast.error("Please select a star rating.");
    setReviews(prev => ({ ...prev, [key]: { ...prev[key], submitting: true } }));
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, productId: r.productId, rating: r.rating, reviewText: r.text.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || json.message || "Failed to submit review");
      toast.success("Review submitted! Thank you.");
      setReviews(prev => ({ ...prev, [key]: { ...prev[key], done: true, submitting: false } }));
      setOpenReview(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
      setReviews(prev => ({ ...prev, [key]: { ...prev[key], submitting: false } }));
    }
  };

  const statusColors: Record<string, string> = {
    pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
    confirmed:  "bg-blue-50 text-blue-700 border-blue-200",
    processing: "bg-purple-50 text-purple-700 border-purple-200",
    shipped:    "bg-indigo-50 text-indigo-700 border-indigo-200",
    delivered:  "bg-green-50 text-green-700 border-green-200",
    cancelled:  "bg-red-50 text-red-700 border-red-200",
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg border border-red-200 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-heading text-[#1A1A1A] mb-2">Error Loading Orders</h2>
        <p className="text-sm text-[#6B6B6B]">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <header className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] mb-2 inline-block">← Back to Home</Link>
          <h1 className="font-heading text-2xl text-[#1A1A1A]">My Orders</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-12 text-center">
            <Package className="w-16 h-16 text-[#E5E5E5] mx-auto mb-4" />
            <h2 className="text-xl font-heading text-[#1A1A1A] mb-2">No Orders Yet</h2>
            <p className="text-sm text-[#6B6B6B] mb-6">You haven&apos;t placed any orders yet.</p>
            <Link href="/pharmacy" className="inline-block px-6 py-2.5 bg-[#D4AF37] text-white font-semibold rounded-md hover:bg-[#b8952e] transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">

                {/* Order Header */}
                <div className="p-4 bg-[#F9F9F9] border-b border-[#E5E5E5]">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-[#374151] mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[order.orderStatus] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                      <span className="text-lg font-heading text-[#1A1A1A]">£{Number(order.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <div className="space-y-3">
                    {order.items.slice(0, 3).map((item) => {
                      const pid    = item.product?.id || item.productId || "";
                      const key    = `${order.id}:${pid}`;
                      const rev    = reviews[key];
                      const isOpen = openReview === key;

                      return (
                        <div key={item.id}>
                          <div className="flex gap-3 items-start">
                            <div className="w-16 h-16 flex-shrink-0 bg-[#F9F9F9] rounded border border-[#E5E5E5] overflow-hidden">
                              <ProductImage src={item.product?.productImage || ""} alt={item.productName} width={64} height={64} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#1A1A1A] line-clamp-1">{item.productName}</p>
                              <p className="text-xs text-[#6B6B6B] mt-0.5">Qty: {item.quantity}</p>
                              <p className="text-sm font-semibold text-[#1A1A1A] mt-1">£{Number(item.lineTotal).toFixed(2)}</p>
                            </div>

                            {order.orderStatus === "delivered" && pid && (
                              <div className="flex-shrink-0">
                                {rev?.done ? (
                                  <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                                  </span>
                                ) : (
                                  <button onClick={() => openReviewForm(order.id, item)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all hover:scale-105"
                                    style={{ borderColor: isOpen ? "#D4AF37" : "#E5E5E5", color: isOpen ? "#D4AF37" : "#6B6B6B", background: isOpen ? "rgba(212,175,55,0.06)" : "#fff" }}>
                                    <MessageSquarePlus className="w-3.5 h-3.5" />
                                    {isOpen ? "Close" : "Write a Review"}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Inline Review Form */}
                          {isOpen && !rev?.done && (
                            <div className="mt-3 ml-[76px] p-4 rounded-lg border border-[#E8E4DC] bg-[#FDFCF9]">
                              <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">
                                Your review for <span className="text-[#1A1A1A]">{item.productName}</span>
                              </p>
                              <div className="mb-3">
                                <p className="text-xs text-[#888] mb-1.5">Rating <span className="text-red-400">*</span></p>
                                <StarPicker value={rev?.rating ?? 5} onChange={v => setReviews(prev => ({ ...prev, [key]: { ...prev[key], rating: v } }))} />
                              </div>
                              <div className="mb-3">
                                <p className="text-xs text-[#888] mb-1.5">Comment (optional)</p>
                                <textarea rows={3} placeholder="Share your experience…"
                                  value={rev?.text ?? ""}
                                  onChange={e => setReviews(prev => ({ ...prev, [key]: { ...prev[key], text: e.target.value } }))}
                                  className="w-full rounded border border-[#E5E5E5] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none" />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setOpenReview(null)}
                                  className="px-3 py-1.5 rounded text-xs font-semibold border border-[#E5E5E5] text-[#888] hover:border-[#ccc] transition-colors">
                                  Cancel
                                </button>
                                <button type="button" disabled={rev?.submitting} onClick={() => submitReview(key)}
                                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold transition-all active:scale-95 disabled:opacity-60"
                                  style={{ background: "linear-gradient(135deg,#D4AF37 0%,#C9A52E 100%)", color: "#1A1A1A", border: "1px solid rgba(212,175,55,0.6)", boxShadow: "0 2px 6px rgba(212,175,55,0.3)" }}>
                                  {rev?.submitting
                                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting…</>
                                    : <><Star className="w-3.5 h-3.5" fill="#1A1A1A" /> Submit Review</>}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {order.items.length > 3 && (
                      <p className="text-xs text-[#6B6B6B] text-center pt-2">
                        +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="p-4 bg-[#F9F9F9] border-t border-[#E5E5E5] flex flex-wrap justify-between items-center gap-3">
                  {order.orderStatus === "shipped" && (
                    <button onClick={() => handleConfirmDelivery(order.id)} disabled={confirming === order.id}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all active:scale-95 disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg,#D4AF37 0%,#C9A52E 100%)", color: "#1A1A1A", border: "1px solid rgba(212,175,55,0.6)", boxShadow: "0 2px 8px rgba(212,175,55,0.35)", cursor: confirming === order.id ? "not-allowed" : "pointer" }}>
                      {confirming === order.id
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</>
                        : <><CheckCircle2 className="w-4 h-4" /> I Received My Order</>}
                    </button>
                  )}
                  {order.orderStatus === "delivered" && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700">
                      <CheckCircle2 className="w-4 h-4" /> Delivered
                    </span>
                  )}
                  {order.orderStatus !== "shipped" && order.orderStatus !== "delivered" && <span />}
                  <Link href={`/order-confirmation/${order.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1A1A1A] border border-[#E5E5E5] rounded-md hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors">
                    View Details <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
