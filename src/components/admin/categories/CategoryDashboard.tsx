"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Tag, Layers, TrendingUp, EyeOff, ChevronDown } from "lucide-react";

const FM = "var(--font-montserrat), 'Montserrat', sans-serif";
const FH = "var(--font-heading), 'Libre Baskerville', serif";
const PIE_COLORS = ["#D4AF37","#6C8EBF","#9B7FC7","#5DAB8E","#E8A87C","#F06292","#4DB6AC","#FF8A65"];

type Category = { id: string; categoryName: string; parentId: string | null; isActive: boolean };

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
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 gap-2">
      <span style={{ fontSize: "24px" }}>📊</span>
      <p style={{ fontFamily: FM, fontSize: "12px", color: "#CCC" }}>{message}</p>
    </div>
  );
}

function Skeleton() {
  return <div className="bg-white rounded-lg animate-pulse" style={{ height: "220px", border: "1px solid rgba(0,0,0,0.07)" }} />;
}

export default function CategoryDashboard() {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats]         = useState({ total: 0, root: 0, sub: 0, inactive: 0 });
  const [depthData, setDepthData] = useState<{ name: string; value: number }[]>([]);
  const [topParents, setTopParents] = useState<{ name: string; children: number }[]>([]);
  const [statusData, setStatus]   = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    fetch("/api/product-categories?limit=500")
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        const cats: Category[] = json.data || [];

        const root     = cats.filter(c => !c.parentId);
        const sub      = cats.filter(c => !!c.parentId);
        const inactive = cats.filter(c => !c.isActive);

        setStats({ total: cats.length, root: root.length, sub: sub.length, inactive: inactive.length });

        setStatus([
          { name: "Active",   value: cats.filter(c => c.isActive).length },
          { name: "Inactive", value: inactive.length },
        ]);

        // Depth distribution: root / sub (child of root) / deeper
        const childrenMap = new Map<string, number>();
        sub.forEach(c => {
          if (c.parentId) childrenMap.set(c.parentId, (childrenMap.get(c.parentId) || 0) + 1);
        });
        setDepthData([
          { name: "Root",  value: root.length },
          { name: "Sub",   value: sub.length  },
        ]);

        // Top root categories by number of subcategories
        const parents = root
          .map(r => ({ name: r.categoryName, children: childrenMap.get(r.id) || 0 }))
          .filter(p => p.children > 0)
          .sort((a, b) => b.children - a.children)
          .slice(0, 8);
        setTopParents(parents);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mb-4">

      {/* Toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 mb-3 group"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <ChevronDown
          className="w-4 h-4 transition-transform duration-200"
          style={{ color: "#D4AF37", transform: open ? "rotate(180deg)" : "rotate(-90deg)" }}
        />
        <span style={{ fontFamily: FM, fontSize: "12px", fontWeight: 600, color: "#888", letterSpacing: "0.04em" }}>
          {open ? "Hide analytics" : "Show analytics"}
        </span>
      </button>

      {open && (
        <div className="space-y-4">

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Tag}       label="Total Categories" value={stats.total}    color="#D4AF37" />
            <StatCard icon={Layers}    label="Root"             value={stats.root}     sub="top-level" color="#6C8EBF" />
            <StatCard icon={TrendingUp} label="Subcategories"   value={stats.sub}      sub="nested"    color="#9B7FC7" />
            <StatCard icon={EyeOff}    label="Inactive"         value={stats.inactive} sub="hidden"    color="#dc2626" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2"><Skeleton /></div>
              <Skeleton />
            </div>
          ) : (
            <>
              {/* Row 1: Bar + Donut */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Bar chart: top parents by children count */}
                <div className="lg:col-span-2 bg-white rounded-lg p-5"
                  style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Hierarchy</p>
                  <p style={{ fontFamily: FH, fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "16px" }}>Top Categories by Subcategory Count</p>
                  {topParents.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={topParents} margin={{ top: 0, right: 10, left: 0, bottom: 0 }} barCategoryGap="35%">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontFamily: FM, fontSize: 10, fill: "#666" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontFamily: FM, fontSize: 10, fill: "#AAA" }} axisLine={false} tickLine={false}
                          allowDecimals={false} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(212,175,55,0.05)" }} />
                        <Bar dataKey="children" name="Subcategories" radius={[4, 4, 0, 0]}>
                          {topParents.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart message="No subcategories yet — add nested categories to see hierarchy" />
                  )}
                </div>

                {/* Donut: root vs sub */}
                <div className="bg-white rounded-lg p-5"
                  style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Structure</p>
                  <p style={{ fontFamily: FH, fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Root vs Sub</p>
                  {stats.total > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie data={depthData} cx="50%" cy="50%" innerRadius={42} outerRadius={65}
                            paddingAngle={3} dataKey="value" stroke="none">
                            <Cell fill="#D4AF37" />
                            <Cell fill="#6C8EBF" />
                          </Pie>
                          <Tooltip formatter={(v: number, name: string) => [`${v} categories`, name]}
                            contentStyle={{ fontFamily: FM, fontSize: "11px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-5 -mt-1">
                        {depthData.map((d, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: i === 0 ? "#D4AF37" : "#6C8EBF" }} />
                            <span style={{ fontFamily: FM, fontSize: "11px", color: "#555" }}>{d.name} ({d.value})</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <EmptyChart message="No categories yet" />
                  )}
                </div>
              </div>

              {/* Row 2: Active vs Inactive pie */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-5"
                  style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Visibility</p>
                  <p style={{ fontFamily: FH, fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Category Status</p>
                  {stats.total > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie data={statusData} cx="50%" cy="50%" innerRadius={42} outerRadius={65}
                            paddingAngle={3} dataKey="value" stroke="none">
                            <Cell fill="#16a34a" />
                            <Cell fill="#fca5a5" />
                          </Pie>
                          <Tooltip formatter={(v: number) => [`${v} categories`, ""]}
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
                    <EmptyChart message="No data" />
                  )}
                </div>

                {/* Summary text card */}
                <div className="lg:col-span-2 bg-white rounded-lg p-5"
                  style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>Summary</p>
                  <p style={{ fontFamily: FH, fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "16px" }}>Catalogue Structure</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Total Categories",   value: stats.total,    color: "#D4AF37" },
                      { label: "Root Categories",    value: stats.root,     color: "#6C8EBF" },
                      { label: "Sub Categories",     value: stats.sub,      color: "#9B7FC7" },
                      { label: "Inactive",           value: stats.inactive, color: "#dc2626" },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-md"
                        style={{ backgroundColor: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                        <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <div>
                          <p style={{ fontFamily: FM, fontSize: "10px", color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                          <p style={{ fontFamily: FH, fontSize: "20px", fontWeight: 700, color: "#111" }}>{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}





