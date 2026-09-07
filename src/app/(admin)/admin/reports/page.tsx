"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, TrendingDown, ShoppingCart, DollarSign,
  Package, Clock, Download, RefreshCw, Calendar, CreditCard, Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportData {
  period: { from: string; to: string; label: string };
  summary: {
    totalOrders: number; totalRevenue: number; avgOrderValue: number;
    paidOrders: number; refundedOrders: number; cancelledOrders: number;
    deliveredOrders: number; fulfillmentHours: number;
  };
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; qty: number; revenue: number; orders: number }[];
  topCategories: { name: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number; value: number }[];
  ordersByPayment: { method: string; count: number; value: number }[];
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  customerStats: { guestOrders: number; registeredOrders: number };
}

const PERIOD_OPTIONS = [
  { value: "7d",  label: "7 Days"  },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "1y",  label: "1 Year"  },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B", confirmed: "#3B82F6", processing: "#8B5CF6",
  shipped: "#06B6D4", delivered: "#10B981", cancelled: "#EF4444",
};

const METHOD_COLORS: Record<string, string> = {
  cash: "#D4AF37", card: "#3B82F6", online: "#8B5CF6", upi: "#10B981",
};

// ─── Bar chart (SVG-free, CSS only) ──────────────────────────────────────────

function BarChart({ data, valueKey, labelKey, color = "#D4AF37", height = 120 }:
  { data: Record<string, unknown>[]; valueKey: string; labelKey: string; color?: string; height?: number }) {
  const values = data.map(d => Number(d[valueKey]) || 0);
  const max = Math.max(...values) || 1;
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {data.map((d, i) => {
        const val = values[i];
        const barH = Math.max((val / max) * (height - 24), 2);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div className="absolute bottom-full mb-1 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded hidden group-hover:block whitespace-nowrap z-10 pointer-events-none shadow-lg">
              {String(d[labelKey])}
              <br />£{val.toLocaleString()}
            </div>
            <div className="w-full rounded-t-sm transition-all duration-300 opacity-80 hover:opacity-100"
              style={{ height: barH, backgroundColor: color }} />
          </div>
        );
      })}
    </div>
  );
}

// ─── Donut chart ─────────────────────────────────────────────────────────────

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const r = 36; const cx = 50; const cy = 50;
  const circumference = 2 * Math.PI * r;

  const segments = data.map(d => {
    const pct = d.value / total;
    const offset = cumulative;
    cumulative += pct;
    return { ...d, pct, offset };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width="100" height="100" viewBox="0 0 100 100" className="flex-shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="14" />
        {segments.map((seg, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth="14"
            strokeDasharray={`${seg.pct * circumference} ${circumference}`}
            strokeDashoffset={-seg.offset * circumference}
            transform={`rotate(-90 ${cx} ${cy})`} />
        ))}
      </svg>
      <div className="space-y-1.5 flex-1 min-w-0">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-gray-600 font-sans truncate flex-1 capitalize">{seg.label}</span>
            <span className="text-gray-900 font-semibold font-sans flex-shrink-0">{(seg.pct * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ title, value, subtitle, icon: Icon, iconColor = "text-gray-400", trend }:
  { title: string; value: string; subtitle?: string; icon: React.ElementType; iconColor?: string; trend?: number }) {
  return (
    <Card className="p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <p className="text-[10px] tracking-[0.15em] uppercase text-gray-500 font-sans">{title}</p>
        <div className={`p-2 rounded-sm bg-gray-50 ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <h3 className="text-3xl font-heading text-gray-900 mb-1">{value}</h3>
      {subtitle && <p className="text-xs text-gray-500 font-sans">{subtitle}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend).toFixed(1)}% vs last period
        </div>
      )}
    </Card>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] tracking-[0.2em] uppercase text-gray-500 font-sans font-semibold mb-4">
      {children}
    </h3>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ period });
      if (period === "custom" && customFrom && customTo) {
        params.set("from", customFrom); params.set("to", customTo);
      }
      const res  = await fetch(`/api/admin/reports?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [period, customFrom, customTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const exportCSV = () => {
    if (!data) return;
    const rows = [["Date","Revenue","Orders"], ...data.dailyRevenue.map(d => [d.date, d.revenue.toFixed(2), d.orders])];
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.map(r => r.join(",")).join("\n"));
    a.download = `rosewood-report-${period}.csv`;
    a.click();
  };

  return (
    <div className="bg-[#F8F8F8] min-h-screen">
      {/* Page header — matches DashboardHeader style */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-heading text-gray-900">Sales Reports</h1>
              <p className="text-sm text-gray-500 mt-1 font-sans">Revenue, orders, product & customer breakdown</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={fetchData} disabled={loading}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-sm text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors font-sans">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button onClick={exportCSV} disabled={!data}
                className="flex items-center gap-2 px-4 py-2 text-black text-sm font-semibold rounded-sm transition-all hover:opacity-90 disabled:opacity-40 font-sans"
                style={{ background: "linear-gradient(135deg,#D4AF37 0%,#ffe87c 50%,#b8952e 100%)", boxShadow: "0 2px 10px rgba(212,175,55,0.35)" }}>
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Period selector */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1 p-1 bg-white rounded-sm border border-gray-200">
            {PERIOD_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setPeriod(o.value)}
                className="px-3 py-1.5 text-xs rounded-sm transition-all font-sans"
                style={period === o.value ? { backgroundColor: "#D4AF37", color: "#000", fontWeight: 700 } : { color: "#6B7280" }}>
                {o.label}
              </button>
            ))}
            <button onClick={() => setPeriod("custom")}
              className="px-3 py-1.5 text-xs rounded-sm transition-all font-sans flex items-center gap-1"
              style={period === "custom" ? { backgroundColor: "#D4AF37", color: "#000", fontWeight: 700 } : { color: "#6B7280" }}>
              <Calendar className="w-3 h-3" /> Custom
            </button>
          </div>
          {period === "custom" && (
            <div className="flex items-center gap-2">
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                className="px-2 py-1.5 text-xs rounded-sm border border-gray-200 bg-white text-gray-700 font-sans" />
              <span className="text-gray-400 text-xs font-sans">to</span>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                className="px-2 py-1.5 text-xs rounded-sm border border-gray-200 bg-white text-gray-700 font-sans" />
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-sm border border-red-200 bg-red-50 text-red-700 text-sm font-sans">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-6">

            {/* ── Summary Stats ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Revenue" value={`£${data.summary.totalRevenue.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`}
                subtitle={`${data.summary.totalOrders} orders placed`} icon={DollarSign} iconColor="text-green-600" />
              <StatCard title="Avg Order Value" value={`£${data.summary.avgOrderValue.toFixed(2)}`}
                subtitle="Per completed order" icon={ShoppingCart} iconColor="text-blue-600" />
              <StatCard title="Delivered Orders" value={data.summary.deliveredOrders.toString()}
                subtitle={`${data.summary.cancelledOrders} cancelled`} icon={Package} iconColor="text-purple-600" />
              <StatCard title="Avg Fulfillment" value={`${data.summary.fulfillmentHours.toFixed(1)}h`}
                subtitle="Pending → Delivered" icon={Clock} iconColor="text-orange-600" />
            </div>

            {/* ── Financial Summary ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Paid Orders",   value: data.summary.paidOrders,     color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
                { label: "Refunds",       value: data.summary.refundedOrders,  color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200"   },
                { label: "Cancellations", value: data.summary.cancelledOrders, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200"},
                { label: "Total Orders",  value: data.summary.totalOrders,     color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200"  },
              ].map((item, i) => (
                <Card key={i} className={`p-4 border ${item.border} ${item.bg}`}>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-sans mb-1">{item.label}</p>
                  <p className={`text-2xl font-heading ${item.color}`}>{item.value}</p>
                </Card>
              ))}
            </div>

            {/* ── Daily Revenue Chart ── */}
            <Card className="p-6 border border-gray-200">
              <SectionTitle>Daily Revenue — {period}</SectionTitle>
              {data.dailyRevenue.length > 0 ? (
                <>
                  <BarChart data={data.dailyRevenue as unknown as Record<string,unknown>[]} valueKey="revenue" labelKey="date" height={150} />
                  <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-sans">
                    <span>{data.dailyRevenue[0]?.date}</span>
                    <span>{data.dailyRevenue[data.dailyRevenue.length - 1]?.date}</span>
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-sm text-center py-10 font-sans">No orders in this period</p>
              )}
            </Card>

            {/* ── Monthly Revenue ── */}
            <Card className="p-6 border border-gray-200">
              <SectionTitle>Monthly Revenue — Last 12 Months</SectionTitle>
              {data.revenueByMonth.length > 0 ? (
                <>
                  <BarChart data={data.revenueByMonth as unknown as Record<string,unknown>[]} valueKey="revenue" labelKey="month" color="#3B82F6" height={130} />
                  <div className="flex items-center gap-3 mt-3 overflow-x-auto pb-1">
                    {data.revenueByMonth.map((m, i) => (
                      <div key={i} className="text-center flex-shrink-0">
                        <p className="text-[9px] text-gray-400 font-sans">{m.month.slice(5)}</p>
                        <p className="text-[10px] text-gray-600 font-semibold font-sans">£{(m.revenue/1000).toFixed(1)}k</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-sm text-center py-10 font-sans">No monthly data yet</p>
              )}
            </Card>

            {/* ── Donut Charts Row ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border border-gray-200">
                <SectionTitle>Orders by Status</SectionTitle>
                {data.ordersByStatus.length > 0 ? (
                  <DonutChart data={data.ordersByStatus.map(s => ({ label: s.status, value: s.count, color: STATUS_COLORS[s.status] || "#9CA3AF" }))} />
                ) : <p className="text-gray-400 text-xs text-center py-6 font-sans">No data</p>}
              </Card>

              <Card className="p-6 border border-gray-200">
                <SectionTitle>Payment Methods</SectionTitle>
                {data.ordersByPayment.length > 0 ? (
                  <DonutChart data={data.ordersByPayment.map(p => ({ label: p.method, value: p.count, color: METHOD_COLORS[p.method] || "#9CA3AF" }))} />
                ) : <p className="text-gray-400 text-xs text-center py-6 font-sans">No data</p>}
              </Card>

              <Card className="p-6 border border-gray-200">
                <SectionTitle>Customer Type</SectionTitle>
                <DonutChart data={[
                  { label: "Registered", value: data.customerStats.registeredOrders, color: "#D4AF37" },
                  { label: "Guest",      value: data.customerStats.guestOrders,      color: "#3B82F6" },
                ]} />
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {[
                    { label: "Registered", value: data.customerStats.registeredOrders, icon: Users,       color: "text-[#D4AF37]" },
                    { label: "Guest",      value: data.customerStats.guestOrders,       icon: CreditCard,  color: "text-blue-500"  },
                  ].map((item, i) => (
                    <div key={i} className="text-center p-2 rounded-sm bg-gray-50 border border-gray-100">
                      <p className={`text-xl font-heading ${item.color}`}>{item.value}</p>
                      <p className="text-[10px] text-gray-500 font-sans">{item.label}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* ── Top Products & Categories ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border border-gray-200">
                <SectionTitle>Top Products by Revenue</SectionTitle>
                {data.topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {data.topProducts.slice(0, 8).map((p, i) => {
                      const max = data.topProducts[0].revenue || 1;
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-700 font-sans truncate flex-1 mr-2">{p.name}</span>
                            <span className="text-xs font-semibold text-[#D4AF37] flex-shrink-0 font-sans">£{p.revenue.toFixed(0)}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-gray-100">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${(p.revenue / max) * 100}%`, backgroundColor: "#D4AF37" }} />
                          </div>
                          <p className="text-[10px] text-gray-400 font-sans mt-0.5">{p.qty} units · {p.orders} orders</p>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-gray-400 text-sm text-center py-8 font-sans">No product data</p>}
              </Card>

              <Card className="p-6 border border-gray-200">
                <SectionTitle>Top Categories</SectionTitle>
                {data.topCategories.length > 0 ? (
                  <div className="space-y-4">
                    {data.topCategories.map((c, i) => {
                      const max = data.topCategories[0].revenue || 1;
                      const colors = ["#D4AF37","#3B82F6","#8B5CF6","#10B981","#F59E0B","#EF4444","#06B6D4","#EC4899"];
                      const col = colors[i % colors.length];
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-700 font-sans truncate flex-1 mr-2">{c.name}</span>
                            <span className="text-xs font-semibold font-sans flex-shrink-0" style={{ color: col }}>£{c.revenue.toFixed(0)}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-gray-100">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${(c.revenue / max) * 100}%`, backgroundColor: col }} />
                          </div>
                          <p className="text-[10px] text-gray-400 font-sans mt-0.5">{c.orders} orders</p>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-gray-400 text-sm text-center py-8 font-sans">No category data</p>}
              </Card>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
}
