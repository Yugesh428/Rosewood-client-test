"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ShoppingBag, TrendingUp, Clock, CheckCircle, ChevronDown, XCircle } from "lucide-react";

const FM = "var(--font-montserrat), 'Montserrat', sans-serif";
const FH = "var(--font-heading), 'Libre Baskerville', serif";

const STATUS_COLORS_MAP: Record<string, string> = {
  pending:    "#D4AF37",
  confirmed:  "#6C8EBF",
  processing: "#9B7FC7",
  shipped:    "#5DAB8E",
  delivered:  "#16a34a",
  cancelled:  "#dc2626",
};

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-lg px-5 py-4 flex items-center gap-4"
      style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}18` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p style={{ fontFamily: FM, fontSize: "10px", color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
        <p style={{ fontFamily: FH, fontSize: "22px", fontWeight: 700, color: "#111", lineHeight: 1.2 }}>{value}</p>
        {sub && <p style={{ fontFamily: FM, fontSize: "11px", color: "#AAA", marginTop: "2px" }}>{sub}</p>}
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg px-3 py-2 shadow-lg"
      style={{ border: "1px solid rgba(0,0,0,0.08)", fontFamily: FM, fontSize: "12px" }}>
      {label && <p style={{ color: "#888", marginBottom: "4px" }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.name.toLowerCase().includes("revenue") || p.name.toLowerCase().includes("£")
            ? `£${p.value.toFixed(0)}` : p.value}
        </p>
      ))}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 gap-2">
      <span style={{ fontSize: "24px" }}>📦</span>
      <p style={{ fontFamily: FM, fontSize: "12px", color: "#CCC" }}>{message}</p>
    </div>
  );
}

function Skeleton() {
  return <div className="bg-white rounded-lg animate-pulse"
    style={{ height: "220px", border: "1px solid rgba(0,0,0,0.07)" }} />;
}

export default function OrdersDashboard() {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats]         = useState({ total: 0, pending: 0, delivered: 0, cancelled: 0, revenue: 0, avgOrder: 0 });
  const [statusPie, setStatusPie] = useState<{ name: string; value: number }[]>([]);
  const [monthlyData, setMonthly] = useState<{ month: string; revenue: number; orders: number }[]>([]);
  const [statusBar, setStatusBar] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/orders/stats").then(r => r.json()),
      fetch("/api/admin/reports?period=1y").then(r => r.json()),
    ]).then(([statsRes, reportRes]) => {

      if (statsRes.status === "fulfilled" && statsRes.value.success) {
        const d = statsRes.value.data;
        setStats({
          total:     d.total || 0,
          pending:   d.byStatus?.pending   || 0,
          delivered: d.byStatus?.delivered || 0,
          cancelled: d.byStatus?.cancelled || 0,
          revenue:   d.revenue?.total      || 0,
          avgOrder:  d.revenue?.avgOrder   || 0,
        });

        const byStatus = d.byStatus || {};
        const pie = Object.entries(byStatus)
          .filter(([, v]) => (v as number) > 0)
          .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v as number }));
        setStatusPie(pie);

        const bar = Object.entries(byStatus).map(([k, v]) => ({
          name: k.charAt(0).toUpperCase() + k.slice(1),
          value: v as number,
          color: STATUS_COLORS_MAP[k] || "#AAA",
        }));
        setStatusBar(bar);
      }

      if (reportRes.status === "fulfilled" && reportRes.value.success) {
        const data = reportRes.value.data;
        setMonthly((data.revenueByMonth || []).map((m: { month: string; revenue: number; orders: number }) => ({
          month: new Date(m.month + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
          revenue: Math.round(m.revenue),
          orders: m.orders,
        })));
      }
    }).finally(() => setLoading(false));
  }, []);

  const PIE_COLORS = Object.values(STATUS_COLORS_MAP);

  return (
    <div className="mb-4">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 mb-3"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
        <ChevronDown className="w-4 h-4 transition-transform duration-200"
          style={{ color: "#D4AF37", transform: open ? "rotate(180deg)" : "rotate(-90deg)" }} />
        <span style={{ fontFamily: FM, fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.04em" }}>
          {open ? "Hide analytics" : "Show analytics"}
        </span>
      </button>

      {open && (
        <div className="space-y-4">

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={ShoppingBag} label="Total Orders"    value={stats.total}                                                        color="#D4AF37" />
            <StatCard icon={Clock}       label="Pending"         value={stats.pending}    sub="awaiting action"                             color="#f97316" />
            <StatCard icon={CheckCircle} label="Revenue"         value={`£${Math.round(stats.revenue).toLocaleString()}`} sub="all time"    color="#16a34a" />
            <StatCard icon={XCircle}     label="Avg Order Value" value={`£${Math.round(stats.avgOrder)}`}                sub="per order"   color="#6C8EBF" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2"><Skeleton /></div>
              <Skeleton />
            </div>
          ) : (
            <>
              {/* Row 1: Area chart + Pie */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                <div className="lg:col-span-2 bg-white rounded-lg p-5"
                  style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Revenue Trend</p>
                  <p style={{ fontFamily: FH, fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "16px" }}>Monthly Revenue (Last 12 Months)</p>
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="orderRevGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="month" tick={{ fontFamily: FM, fontSize: 10, fill: "#AAA" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontFamily: FM, fontSize: 10, fill: "#AAA" }} axisLine={false} tickLine={false}
                          tickFormatter={v => `£${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="revenue" name="Revenue"
                          stroke="#D4AF37" strokeWidth={2.5} fill="url(#orderRevGrad)"
                          dot={false} activeDot={{ r: 5, fill: "#D4AF37" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart message="No revenue data yet" />
                  )}
                </div>

                <div className="bg-white rounded-lg p-5"
                  style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Breakdown</p>
                  <p style={{ fontFamily: FH, fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Orders by Status</p>
                  {statusPie.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie data={statusPie} cx="50%" cy="50%" innerRadius={38} outerRadius={60}
                            paddingAngle={3} dataKey="value" stroke="none">
                            {statusPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v: number, n: string) => [`${v} orders`, n]}
                            contentStyle={{ fontFamily: FM, fontSize: "11px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-1 mt-1">
                        {statusPie.slice(0, 4).map((s, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span style={{ fontFamily: FM, fontSize: "11px", color: "#555" }}>{s.name}</span>
                            </div>
                            <span style={{ fontFamily: FM, fontSize: "11px", color: "#888", fontWeight: 600 }}>{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <EmptyChart message="No orders yet" />
                  )}
                </div>
              </div>

              {/* Row 2: Bar chart */}
              {statusBar.length > 0 && (
                <div className="bg-white rounded-lg p-5"
                  style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Status Distribution</p>
                  <p style={{ fontFamily: FH, fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "16px" }}>Order Count by Status</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={statusBar} margin={{ top: 0, right: 10, left: 0, bottom: 0 }} barCategoryGap="40%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontFamily: FM, fontSize: 11, fill: "#666" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontFamily: FM, fontSize: 10, fill: "#AAA" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(212,175,55,0.05)" }} />
                      <Bar dataKey="value" name="Orders" radius={[4, 4, 0, 0]}>
                        {statusBar.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}





