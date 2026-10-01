"use client";

import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Package, AlertTriangle, XCircle, CheckCircle, ChevronDown } from "lucide-react";

const FM = "var(--font-montserrat), 'Montserrat', sans-serif";
const FH = "var(--font-cinzel), 'Cinzel', serif";
const BAR_COLORS = ["#D4AF37","#6C8EBF","#9B7FC7","#5DAB8E","#E8A87C","#F06292"];

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
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>
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

export default function InventoryDashboard() {
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats]   = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
  const [statusPie, setStatusPie] = useState<{ name: string; value: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; qty: number }[]>([]);
  const [expiryData, setExpiryData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    fetch("/api/inventory?limit=500")
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        const items = json.data || [];

        const inStock    = items.filter((i: { stockStatus: string }) => i.stockStatus === "in-stock").length;
        const lowStock   = items.filter((i: { stockStatus: string }) => i.stockStatus === "low-stock").length;
        const outOfStock = items.filter((i: { stockStatus: string }) => i.stockStatus === "out-of-stock").length;

        setStats({ total: items.length, inStock, lowStock, outOfStock });
        setStatusPie([
          { name: "In Stock",    value: inStock    },
          { name: "Low Stock",   value: lowStock   },
          { name: "Out of Stock", value: outOfStock },
        ]);

        // Top 6 products by total quantity
        const qtyMap = new Map<string, number>();
        items.forEach((i: { product?: { productName?: string }; quantity: number }) => {
          const name = i.product?.productName || "Unknown";
          qtyMap.set(name, (qtyMap.get(name) || 0) + i.quantity);
        });
        const top = Array.from(qtyMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, qty]) => ({ name: name.length > 18 ? name.slice(0, 18) + "…" : name, qty }));
        setTopProducts(top);

        // Expiry buckets
        const now  = new Date();
        const in30 = new Date(now); in30.setDate(now.getDate() + 30);
        const in90 = new Date(now); in90.setDate(now.getDate() + 90);
        let expired = 0, within30 = 0, within90 = 0, safe = 0;
        items.forEach((i: { expiryDate: string }) => {
          const exp = new Date(i.expiryDate);
          if (exp < now)    expired++;
          else if (exp <= in30) within30++;
          else if (exp <= in90) within90++;
          else safe++;
        });
        setExpiryData([
          { name: "Expired",    value: expired  },
          { name: "< 30 days",  value: within30 },
          { name: "< 90 days",  value: within90 },
          { name: "Safe",       value: safe     },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const PIE_STATUS_COLORS = ["#16a34a", "#D4AF37", "#dc2626"];
  const EXPIRY_COLORS     = ["#dc2626", "#f97316", "#D4AF37", "#16a34a"];

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 mb-3"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
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
            <StatCard icon={Package}       label="Total Batches"  value={stats.total}      color="#D4AF37" />
            <StatCard icon={CheckCircle}   label="In Stock"       value={stats.inStock}    sub="healthy"  color="#16a34a" />
            <StatCard icon={AlertTriangle} label="Low Stock"      value={stats.lowStock}   sub="reorder"  color="#f97316" />
            <StatCard icon={XCircle}       label="Out of Stock"   value={stats.outOfStock} sub="critical" color="#dc2626" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2"><Skeleton /></div>
              <Skeleton />
            </div>
          ) : (
            <>
              {/* Row 1: Bar chart + Stock status donut */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                <div className="lg:col-span-2 bg-white rounded-lg p-5"
                  style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Stock Levels</p>
                  <p style={{ fontFamily: FH, fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "16px" }}>Top Products by Quantity</p>
                  {topProducts.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={topProducts} margin={{ top: 0, right: 10, left: 0, bottom: 0 }} barCategoryGap="35%">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontFamily: FM, fontSize: 9, fill: "#666" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontFamily: FM, fontSize: 10, fill: "#AAA" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(212,175,55,0.05)" }} />
                        <Bar dataKey="qty" name="Units" radius={[4, 4, 0, 0]}>
                          {topProducts.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart message="No inventory data yet" />
                  )}
                </div>

                <div className="bg-white rounded-lg p-5"
                  style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Availability</p>
                  <p style={{ fontFamily: FH, fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Stock Status</p>
                  {stats.total > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie data={statusPie} cx="50%" cy="50%" innerRadius={42} outerRadius={65}
                            paddingAngle={3} dataKey="value" stroke="none">
                            {statusPie.map((_, i) => <Cell key={i} fill={PIE_STATUS_COLORS[i]} />)}
                          </Pie>
                          <Tooltip formatter={(v: number, name: string) => [`${v} batches`, name]}
                            contentStyle={{ fontFamily: FM, fontSize: "11px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-1 mt-1">
                        {statusPie.map((s, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_STATUS_COLORS[i] }} />
                              <span style={{ fontFamily: FM, fontSize: "11px", color: "#555" }}>{s.name}</span>
                            </div>
                            <span style={{ fontFamily: FM, fontSize: "11px", color: "#888", fontWeight: 600 }}>{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <EmptyChart message="No data" />
                  )}
                </div>
              </div>

              {/* Row 2: Expiry breakdown */}
              <div className="bg-white rounded-lg p-5"
                style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Expiry Watch</p>
                <p style={{ fontFamily: FH, fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "16px" }}>Batch Expiry Distribution</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {expiryData.map((e, i) => (
                    <div key={i} className="px-4 py-3 rounded-md flex items-center gap-3"
                      style={{ backgroundColor: `${EXPIRY_COLORS[i]}08`, border: `1px solid ${EXPIRY_COLORS[i]}20` }}>
                      <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: EXPIRY_COLORS[i] }} />
                      <div>
                        <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{e.name}</p>
                        <p style={{ fontFamily: FH, fontSize: "20px", fontWeight: 700, color: "#111" }}>{e.value}</p>
                        <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA" }}>batches</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}





