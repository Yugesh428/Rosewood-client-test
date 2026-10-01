"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Package, TrendingUp, Tag, ShoppingBag, ChevronDown } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";

const FM = "var(--font-montserrat), 'Montserrat', sans-serif";
const FH = "var(--font-cinzel), 'Cinzel', serif";
const BAR_COLORS = ["#D4AF37","#6C8EBF","#9B7FC7","#5DAB8E","#E8A87C","#F06292"];

type TopSellingProduct = {
  id: string;
  productName: string;
  productImage: string | null;
  sellingPrice: number;
  category?: { categoryName: string };
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
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg px-3 py-2 shadow-lg"
      style={{ border: "1px solid rgba(0,0,0,0.08)", fontFamily: FM, fontSize: "12px" }}>
      {label && <p style={{ color: "#888", marginBottom: "4px" }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: £{typeof p.value === "number" ? p.value.toFixed(0) : p.value}
        </p>
      ))}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-44 gap-2">
      <span style={{ fontSize: "24px" }}>📊</span>
      <p style={{ fontFamily: FM, fontSize: "12px", color: "#CCC" }}>{message}</p>
    </div>
  );
}

function Skeleton({ h = "220px" }: { h?: string }) {
  return (
    <div className="bg-white rounded-lg animate-pulse"
      style={{ height: h, border: "1px solid rgba(0,0,0,0.07)" }} />
  );
}

export default function ProductDashboard() {
  const [open, setOpen]             = useState(false); // collapsed by default — click to open
  const [stats, setStats]           = useState({ total: 0, active: 0, inactive: 0, categories: 0 });
  const [monthlyData, setMonthly]   = useState<{ month: string; revenue: number }[]>([]);
  const [topCats, setTopCats]       = useState<{ name: string; revenue: number }[]>([]);
  const [statusData, setStatus]     = useState<{ name: string; value: number }[]>([]);
  const [topSelling, setTopSelling] = useState<TopSellingProduct[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/products?limit=500").then(r => r.json()),
      fetch("/api/product-categories?limit=500").then(r => r.json()),
      fetch("/api/admin/reports?period=1y").then(r => r.json()),
      fetch("/api/products/top-selling?limit=5").then(r => r.json()),
    ]).then(([allRes, catRes, reportRes, topRes]) => {
      const all  = allRes.status  === "fulfilled" && allRes.value.success  ? allRes.value.data  || [] : [];
      const cats = catRes.status  === "fulfilled" && catRes.value.success  ? catRes.value.data  || [] : [];
      const active   = all.filter((p: { isActive: boolean }) => p.isActive).length;
      const inactive = all.length - active;
      setStats({ total: all.length, active, inactive, categories: cats.filter((c: { parentId: string | null }) => !c.parentId).length });
      setStatus([{ name: "Active", value: active }, { name: "Inactive", value: inactive }]);

      if (topRes.status === "fulfilled" && topRes.value.success)
        setTopSelling(topRes.value.data || []);

      if (reportRes.status === "fulfilled" && reportRes.value.success) {
        const data = reportRes.value.data;
        setMonthly((data.revenueByMonth || []).map((m: { month: string; revenue: number }) => ({
          month: new Date(m.month + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
          revenue: Math.round(m.revenue),
        })));
        setTopCats((data.topCategories || []).slice(0, 6).map((c: { name: string; revenue: number }) => ({
          name: c.name, revenue: Math.round(c.revenue),
        })));
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mb-4">

      {/* ── Toggle bar ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 mb-3 group"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <ChevronDown
          className="w-4 h-4 transition-transform duration-200"
          style={{
            color: "#D4AF37",
            transform: open ? "rotate(180deg)" : "rotate(-90deg)",
          }}
        />
        <span style={{ fontFamily: FM, fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.04em" }}>
          {open ? "Hide analytics" : "Show analytics"}
        </span>
      </button>

      {/* ── Dashboard content ──────────────────────────────────────────────── */}
      {open && (
        <div className="space-y-4">

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Package}     label="Total Products"  value={stats.total}      color="#D4AF37" />
            <StatCard icon={TrendingUp}  label="Active"          value={stats.active}     sub="visible in store" color="#16a34a" />
            <StatCard icon={ShoppingBag} label="Hidden"          value={stats.inactive}   sub="not visible"      color="#dc2626" />
            <StatCard icon={Tag}         label="Root Categories" value={stats.categories} color="#6C8EBF" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2"><Skeleton /></div>
              <Skeleton />
            </div>
          ) : (
            <>
              {/* Row 1: Area + Donut */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                <div className="lg:col-span-2 bg-white rounded-lg p-5"
                  style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Revenue Trend</p>
                  <p style={{ fontFamily: FH, fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "16px" }}>Monthly Revenue (Last 12 Months)</p>
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
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
                          stroke="#D4AF37" strokeWidth={2.5} fill="url(#revGrad)"
                          dot={false} activeDot={{ r: 5, fill: "#D4AF37" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart message="No revenue data yet — orders will appear here" />
                  )}
                </div>

                <div className="bg-white rounded-lg p-5"
                  style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Visibility</p>
                  <p style={{ fontFamily: FH, fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Product Status</p>
                  {stats.total > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie data={statusData} cx="50%" cy="50%" innerRadius={42} outerRadius={65}
                            paddingAngle={3} dataKey="value" stroke="none">
                            <Cell fill="#16a34a" />
                            <Cell fill="#fca5a5" />
                          </Pie>
                          <Tooltip formatter={(v: number) => [`${v} products`, ""]}
                            contentStyle={{ fontFamily: FM, fontSize: "11px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-5 -mt-1">
                        {statusData.map((s, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: i === 0 ? "#16a34a" : "#fca5a5" }} />
                            <span style={{ fontFamily: FM, fontSize: "11px", color: "#555" }}>{s.name} ({s.value})</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <EmptyChart message="No products yet" />
                  )}
                </div>
              </div>

              {/* Row 2: Bar + Top Selling */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                <div className="lg:col-span-2 bg-white rounded-lg p-5"
                  style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Category Performance</p>
                  <p style={{ fontFamily: FH, fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "16px" }}>Top Categories by Revenue (30 Days)</p>
                  {topCats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={topCats} margin={{ top: 0, right: 10, left: 0, bottom: 0 }} barCategoryGap="35%">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontFamily: FM, fontSize: 10, fill: "#666" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontFamily: FM, fontSize: 10, fill: "#AAA" }} axisLine={false} tickLine={false}
                          tickFormatter={v => `£${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(212,175,55,0.05)" }} />
                        <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                          {topCats.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart message="No category sales data yet — will populate as orders come in" />
                  )}
                </div>

                <div className="bg-white rounded-lg p-5"
                  style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Most Purchased</p>
                  <p style={{ fontFamily: FH, fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "12px" }}>Top Selling Products</p>
                  {topSelling.length > 0 ? (
                    <div className="space-y-3">
                      {topSelling.map((p, i) => (
                        <div key={p.id} className="flex items-center gap-3">
                          <span className="w-5 shrink-0 text-center"
                            style={{ fontFamily: FM, fontSize: "11px", color: "#CCC", fontWeight: 700 }}>{i + 1}</span>
                          <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: "#F9F9F7", border: "1px solid rgba(0,0,0,0.06)" }}>
                            <ProductImage src={p.productImage} alt={p.productName}
                              width={36} height={36} className="w-full h-full object-contain p-0.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate" style={{ fontFamily: FM, fontSize: "12px", color: "#222", fontWeight: 600 }}>{p.productName}</p>
                            <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA" }}>{p.category?.categoryName || "—"}</p>
                          </div>
                          <span style={{ fontFamily: FM, fontSize: "12px", color: "#D4AF37", fontWeight: 700, flexShrink: 0 }}>
                            £{Number(p.sellingPrice).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyChart message="No sales data yet" />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}





