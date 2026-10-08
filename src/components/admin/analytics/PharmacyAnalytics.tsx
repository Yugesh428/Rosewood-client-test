"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, TrendingDown, RefreshCw, Download,
  Package, Users, ShoppingCart, AlertTriangle,
  Clock, BarChart2, PieChart, Activity, DollarSign,
  Zap, UserCheck, ArrowUpRight, ArrowDownRight,
  ChevronDown, ChevronUp, Minus,
} from "lucide-react";
import { exportToCSV } from "@/lib/utils/exportUtils";
import { toast } from "sonner";

// ---- Types ------------------------------------------------------------------

interface AnalyticsData {
  period: { from: string; to: string; label: string };
  kpi: {
    revenue:        { value: number; change: number };
    netProfit:      { value: number; change: number };
    orders:         { value: number; change: number };
    itemsSold:      { value: number; change: number };
    avgOrderValue:  { value: number; change: number };
    newCustomers:   { value: number; change: number };
    totalCustomers: number;
    inventoryValue: number;
    lowStock:       number;
    outOfStock:     number;
    expiring30:     number;
    expiring90:     number;
    expired:        number;
    taxCollected:   number;
    discountGiven:  number;
    cancelledOrders:number;
    deliveredOrders:number;
    refundedOrders: number;
  };
  dailyRevenue:   { date: string; revenue: number; profit: number; orders: number; items: number }[];
  monthlyRevenue: { month: string; revenue: number; profit: number; orders: number }[];
  ordersByStatus: { status: string; count: number; value: number }[];
  paymentMethods: { method: string; count: number; value: number }[];
  topProducts:    { name: string; category: string; qty: number; revenue: number; orders: number; profit: number }[];
  lowestProducts: { name: string; qty: number; revenue: number }[];
  categoryAnalytics: { name: string; revenue: number; qty: number; orders: number; products: number }[];
  inventoryHealth: {
    expiringSoon:    { product: string; batch: string; qty: number; expiryDate: string; value: number; supplier: string }[];
    lowStockItems:   { product: string; batch: string; qty: number; threshold: number }[];
    outOfStockItems: { product: string; batch: string; supplier: string }[];
  };
  supplierAnalytics: { name: string; batches: number; quantity: number; cost: number; expiring: number; outOfStock: number }[];
  customerAnalytics: {
    growth: { month: string; newCustomers: number }[];
    retention: {
      totalCustomers: number; repeatCustomers: number; retentionRate: number;
      avgOrdersPerCustomer: number; avgSpendPerCustomer: number;
    };
    topCustomers: { name: string; email: string; orders: number; totalSpent: number; avgOrder: number; lastOrder: string }[];
  };
  staffAnalytics: {
    summary: { totalStaff: number; activeStaff: number; pharmacists: number; totalPayroll: number };
    byRole:  { role: string; count: number; avgSalary: number }[];
  };
  profitBreakdown: {
    grossRevenue: number; taxCollected: number; discountGiven: number;
    cogsEstimate: number; netProfit: number; profitMargin: number;
  };
  returnStats: { totalRefunds: number; refundAmount: number; cancelledOrders: number; cancelRate: number };
  insights: { type: "warning" | "success" | "info" | "danger"; message: string }[];
}

// ---- Constants --------------------------------------------------------------

const FH = "var(--font-cinzel), 'Cinzel', serif";
const FM = "var(--font-montserrat), 'Montserrat', sans-serif";


const PERIODS = [
  { label: "Today",    value: "today" },
  { label: "7 Days",   value: "7d"    },
  { label: "30 Days",  value: "30d"   },
  { label: "3 Months", value: "90d"   },
  { label: "1 Year",   value: "1y"    },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B", confirmed: "#3B82F6", processing: "#8B5CF6",
  shipped: "#06B6D4", delivered: "#10B981", cancelled: "#EF4444",
};
const PAYMENT_COLORS: Record<string, string> = {
  cash: "#F59E0B", card: "#3B82F6", online: "#10B981", upi: "#8B5CF6",
};
const CAT_COLORS = [
  "#D4AF37","#3B82F6","#10B981","#8B5CF6",
  "#F59E0B","#EF4444","#06B6D4","#EC4899","#84CC16","#F97316",
];

// ---- Helpers ----------------------------------------------------------------

function gbp(v: number): string {
  return "\u00A3" + v.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function Trend({ change }: { change: number }) {
  if (change > 0)
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11,
        fontWeight: 700, color: "#059669", background: "#ECFDF5",
        padding: "2px 7px", borderRadius: 4, fontFamily: FM }}>
        <ArrowUpRight size={11} />+{change.toFixed(1)}%
      </span>
    );
  if (change < 0)
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11,
        fontWeight: 700, color: "#DC2626", background: "#FEF2F2",
        padding: "2px 7px", borderRadius: 4, fontFamily: FM }}>
        <ArrowDownRight size={11} />{change.toFixed(1)}%
      </span>
    );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11,
      color: "#6B7280", background: "#F3F4F6",
      padding: "2px 7px", borderRadius: 4, fontFamily: FM }}>
      <Minus size={11} />0%
    </span>
  );
}

function SectionTitle({ icon: Icon, children, sub }: {
  icon: React.ElementType; children: React.ReactNode; sub?: string;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8,
          background: "rgba(212,175,55,0.12)", display: "flex",
          alignItems: "center", justifyContent: "center" }}>
          <Icon size={15} style={{ color: "#D4AF37" }} />
        </div>
        <h3 style={{ fontFamily: FM, fontSize: 14, fontWeight: 700, color: "#111",
          textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
          {children}
        </h3>
      </div>
      {sub && (
        <p style={{ fontFamily: FM, fontSize: 11, color: "#9CA3AF",
          marginTop: 4, marginLeft: 40 }}>{sub}</p>
      )}
    </div>
  );
}

// ---- SVG Charts -------------------------------------------------------------

function BarChart({ data, height = 180, color = "#D4AF37" }: {
  data: { label: string; value: number }[]; height?: number; color?: string;
}) {
  if (!data.length) return <Empty />;
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 560; const PAD = 30; const innerH = height - PAD;
  const slotW = (W - PAD * 2) / data.length;
  const bw = Math.max(4, slotW - 6);
  return (
    <svg viewBox={`0 0 ${W} ${height + 20}`} style={{ width: "100%" }}>
      {[0, 0.25, 0.5, 0.75, 1].map(p => {
        const y = PAD + (1 - p) * innerH;
        return <line key={p} x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="#F3F4F6" strokeWidth={1} />;
      })}
      {data.map((d, i) => {
        const bh = Math.max(2, (d.value / max) * innerH);
        const x = PAD + i * slotW + (slotW - bw) / 2;
        const y = PAD + innerH - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} fill={color} rx={2} opacity={0.85} />
            <text x={x + bw / 2} y={height + 16} textAnchor="middle"
              fontSize={8} fill="#9CA3AF" fontFamily={FM}>
              {d.label.length > 5 ? d.label.slice(0, 5) : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function AreaChart({ data, color = "#D4AF37", height = 180 }: {
  data: { label: string; value: number; value2?: number }[];
  color?: string; height?: number;
}) {
  if (data.length < 2) return <Empty />;
  const max = Math.max(...data.map(d => Math.max(d.value, d.value2 ?? 0)), 1);
  const W = 560; const PAD = 30; const innerH = height - PAD;
  const xStep = (W - PAD * 2) / (data.length - 1);
  const xy = (i: number, v: number) => ({ x: PAD + i * xStep, y: PAD + innerH - (v / max) * innerH });
  const pts1 = data.map((d, i) => xy(i, d.value));
  const pts2 = data.filter(d => d.value2 !== undefined).map((d, i) => xy(i, d.value2!));
  const line = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = (pts: { x: number; y: number }[]) =>
    `${line(pts)} L ${pts[pts.length - 1].x} ${PAD + innerH} L ${pts[0].x} ${PAD + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${height + 20}`} style={{ width: "100%" }}>
      <defs>
        <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(p => {
        const y = PAD + (1 - p) * innerH;
        return (
          <g key={p}>
            <line x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="#F3F4F6" strokeWidth={1} />
            <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize={8} fill="#9CA3AF">
              {((p * max) / 1000).toFixed(0)}k
            </text>
          </g>
        );
      })}
      {pts1.length > 1 && <path d={area(pts1)} fill="url(#ag1)" />}
      {pts2.length > 1 && <path d={area(pts2)} fill="url(#ag2)" />}
      {pts1.length > 1 && (
        <path d={line(pts1)} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      )}
      {pts2.length > 1 && (
        <path d={line(pts2)} fill="none" stroke="#10B981"
          strokeWidth={1.5} strokeDasharray="5,3" strokeLinecap="round" />
      )}
      {data.map((d, i) => (
        <text key={i} x={pts1[i].x} y={height + 16} textAnchor="middle"
          fontSize={7.5} fill="#9CA3AF" fontFamily={FM}>
          {d.label.length > 6 ? d.label.slice(5) : d.label}
        </text>
      ))}
    </svg>
  );
}

function DonutChart({ data, size = 140 }: {
  data: { label: string; value: number; color: string }[]; size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return <Empty />;
  const r = size * 0.36; const cx = size / 2; const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={size * 0.14} />
      {data.map((d, i) => {
        const dash = (d.value / total) * circ;
        const off = -offset;
        offset += dash;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color}
            strokeWidth={size * 0.14}
            strokeDasharray={`${dash} ${circ}`}
            strokeDashoffset={off}
            transform={`rotate(-90 ${cx} ${cy})`} />
        );
      })}
    </svg>
  );
}

// ---- Reusable UI ------------------------------------------------------------

function Empty({ msg = "No data for this period" }: { msg?: string }) {
  return (
    <div style={{ padding: "32px 0", textAlign: "center",
      color: "#9CA3AF", fontFamily: FM, fontSize: 13 }}>
      {msg}
    </div>
  );
}

function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center",
      alignItems: "center", minHeight: 300 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #E5E5E5",
          borderTop: "3px solid #D4AF37", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ fontFamily: FM, fontSize: 13, color: "#9CA3AF" }}>
          Loading analytics...
        </p>
      </div>
    </div>
  );
}

function Card({ children, style }: {
  children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      background: "#FFF", borderRadius: 10, border: "1px solid #EBEBEB",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: 20, ...style,
    }}>
      {children}
    </div>
  );
}

function KPICard({ icon: Icon, label, value, change, sub, accent }: {
  icon: React.ElementType; label: string; value: string;
  change?: number; sub?: string; accent?: string;
}) {
  return (
    <Card style={{ position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: accent ?? "linear-gradient(90deg,#b8952e,#ffe87c)",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 12 }}>
        <p style={{ fontFamily: FM, fontSize: 10, color: "#9CA3AF",
          textTransform: "uppercase", letterSpacing: "0.12em",
          fontWeight: 600, margin: 0 }}>
          {label}
        </p>
        <div style={{ width: 32, height: 32, borderRadius: 8,
          background: "rgba(212,175,55,0.1)", display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={15} style={{ color: "#D4AF37" }} />
        </div>
      </div>
      <p style={{ fontFamily: FM, fontSize: 26, fontWeight: 800,
        color: "#111", margin: 0, lineHeight: 1, marginBottom: 6 }}>
        {value}
      </p>
      {change !== undefined && <Trend change={change} />}
      {sub && (
        <p style={{ fontFamily: FM, fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{sub}</p>
      )}
    </Card>
  );
}

function AlertKPI({ label, value, severity, sub }: {
  label: string; value: number; severity: "ok" | "warn" | "critical"; sub: string;
}) {
  const map = {
    ok:       { bg: "#ECFDF5", border: "#A7F3D0", text: "#059669" },
    warn:     { bg: "#FFFBEB", border: "#FCD34D", text: "#D97706" },
    critical: { bg: "#FEF2F2", border: "#FCA5A5", text: "#DC2626" },
  };
  const c = map[severity];
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 10, padding: "16px 20px", textAlign: "center" }}>
      <p style={{ fontFamily: FM, fontSize: 10, color: "#6B7280",
        textTransform: "uppercase", letterSpacing: "0.1em",
        fontWeight: 600, margin: "0 0 6px" }}>{label}</p>
      <p style={{ fontFamily: FM, fontSize: 28, fontWeight: 800,
        color: c.text, margin: "0 0 4px", lineHeight: 1 }}>{value}</p>
      <p style={{ fontFamily: FM, fontSize: 11, color: c.text, fontWeight: 600, margin: 0 }}>{sub}</p>
    </div>
  );
}

function HBarList({ rows, maxVal, color = "#D4AF37" }: {
  rows: { label: string; value: number; sub?: string }[];
  maxVal: number; color?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((r, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontFamily: FM, fontSize: 12, color: "#374151", fontWeight: 600,
              maxWidth: "65%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.label}
            </span>
            <span style={{ fontFamily: FM, fontSize: 12, color: "#111", fontWeight: 700 }}>
              {r.sub ?? r.value.toLocaleString()}
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "#F3F4F6", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, transition: "width 0.5s ease",
              width: `${maxVal > 0 ? (r.value / maxVal) * 100 : 0}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DataTable({ cols, rows }: { cols: string[]; rows: React.ReactNode[][] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th key={i} style={{
                fontFamily: FM, fontSize: 10, color: "#9CA3AF",
                textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
                padding: "0 0 10px", textAlign: i === 0 ? "left" : "right",
                borderBottom: "2px solid #F3F4F6",
              }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: "1px solid #F9FAFB" }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  fontFamily: FM, fontSize: 12, color: "#374151", fontWeight: 600,
                  padding: "10px 0", textAlign: ci === 0 ? "left" : "right",
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionHeader({ label, icon: Icon, expanded, onToggle }: {
  label: string; icon: React.ElementType; expanded: boolean; onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} style={{
      width: "100%", display: "flex", alignItems: "center",
      justifyContent: "space-between", background: "none",
      border: "none", cursor: "pointer", padding: "4px 0 0",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 4, height: 20, background: "#D4AF37", borderRadius: 2 }} />
        <span style={{ fontFamily: FM, fontSize: 12, fontWeight: 800, color: "#111",
          textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</span>
      </div>
      {expanded
        ? <ChevronUp size={16} style={{ color: "#9CA3AF" }} />
        : <ChevronDown size={16} style={{ color: "#9CA3AF" }} />}
    </button>
  );
}

// ---- Main Component ---------------------------------------------------------

export default function PharmacyAnalytics() {
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [period,  setPeriod]  = useState("30d");
  const [chartMode, setChartMode] = useState<"revenue" | "orders" | "profit">("revenue");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    sales: true, profit: true, products: true, categories: true,
    inventory: true, customers: true, payments: true,
    suppliers: true, staff: true,
  });

  const toggle = (s: string) =>
    setExpanded(prev => ({ ...prev, [s]: !prev[s] }));

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`/api/analytics/full?period=${period}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [period]);

  const handleExport = () => {
    if (!data) {
      toast.error("No data to export");
      return;
    }

    try {
      // Flatten all data for export
      const exportData = [
        ...data.topProducts.map(p => ({ type: "Top Product", ...p })),
        ...data.categoryAnalytics.map(c => ({ type: "Category", ...c })),
        ...data.ordersByStatus.map(o => ({ type: "Order Status", ...o })),
        ...data.paymentMethods.map(p => ({ type: "Payment Method", ...p })),
      ];

      const filename = `pharmacy-analytics-${period}-${new Date().toISOString().split('T')[0]}`;
      exportToCSV(exportData, filename);
      toast.success("Analytics exported successfully");
    } catch (err) {
      toast.error("Failed to export analytics");
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: FM }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Clean Header with shadcn style ── */}
      <div style={{
        background: "#FFFFFF", borderBottom: "1px solid #E5E5E5",
        position: "sticky", top: 0, zIndex: 40,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <div style={{ padding: "20px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <BarChart2 size={24} style={{ color: "#D4AF37" }} />
                <h1 style={{ fontFamily: FH, fontSize: 26, fontWeight: 600,
                  color: "#111", margin: 0, lineHeight: 1, letterSpacing: "0.01em" }}>
                  Pharmacy Analytics
                </h1>
              </div>
              <p style={{ fontFamily: FM, fontSize: 13,
                color: "#6B7280", marginTop: 2, marginLeft: 32 }}>
                Monitor performance, sales, inventory, and profitability
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button 
                onClick={fetchData} 
                disabled={loading}
                className="btn-flip-analytics btn-flip-analytics-refresh active:scale-95"
                data-front="🔄 Refresh"
                data-back="🔄 Refresh"
              />

              <button 
                onClick={handleExport}
                disabled={loading || !data}
                className="btn-flip-analytics btn-flip-analytics-export active:scale-95"
                data-front="📥 Export"
                data-back="📥 Export"
              />
              
              <style>{`
                .btn-flip-analytics {
                  opacity: 1; outline: 0; line-height: 38px;
                  position: relative; text-align: center;
                  letter-spacing: 0.05em; display: inline-block;
                  text-decoration: none;
                  font-family: var(--font-montserrat),'Montserrat',sans-serif;
                  font-size: 13px; font-weight: 700;
                  cursor: pointer; border: none; background: transparent; padding: 0;
                }
                .btn-flip-analytics:disabled {
                  cursor: not-allowed;
                  opacity: 0.6;
                }
                .btn-flip-analytics:not(:disabled):hover:after  { opacity: 1; transform: translateY(0) rotateX(0); }
                .btn-flip-analytics:not(:disabled):hover:before { opacity: 0; transform: translateY(50%) rotateX(90deg); }
                .btn-flip-analytics:after {
                  top: 0; left: 0; opacity: 0; width: 100%; display: block;
                  transition: 0.42s cubic-bezier(0.23,1,0.32,1);
                  position: absolute; content: attr(data-back);
                  transform: translateY(-50%) rotateX(90deg);
                  padding: 0 16px; border-radius: 8px;
                }
                .btn-flip-analytics:before {
                  top: 0; left: 0; opacity: 1; display: block;
                  padding: 0 16px; line-height: 38px;
                  transition: 0.42s cubic-bezier(0.23,1,0.32,1);
                  position: relative; content: attr(data-front);
                  transform: translateY(0) rotateX(0); border-radius: 8px;
                }
                
                .btn-flip-analytics-refresh:before {
                  background: linear-gradient(135deg,rgba(107,114,128,0.10) 0%,rgba(107,114,128,0.05) 100%);
                  color: #6B7280; border: 1px solid rgba(107,114,128,0.25);
                  box-shadow: 0 2px 6px rgba(0,0,0,0.05),inset 0 1px 0 rgba(255,255,255,0.6);
                }
                .btn-flip-analytics-refresh:after {
                  background: linear-gradient(135deg,#4B5563 0%,#374151 100%);
                  color: #E5E7EB; border: 1px solid rgba(255,255,255,0.1);
                  box-shadow: 0 4px 12px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.15);
                }
                
                .btn-flip-analytics-export:before {
                  background: linear-gradient(135deg,#D4AF37 0%,#C9A52E 100%);
                  color: #1A1A1A; border: 1px solid rgba(212,175,55,0.6);
                  box-shadow: 0 2px 8px rgba(212,175,55,0.42),0 1px 2px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,0.2);
                }
                .btn-flip-analytics-export:after {
                  background: linear-gradient(135deg,#1A1A1A 0%,#2a2a2a 100%);
                  color: #D4AF37; border: 1px solid rgba(255,255,255,0.08);
                  box-shadow: 0 4px 16px rgba(0,0,0,0.28),inset 0 1px 0 rgba(255,255,255,0.06);
                }
              `}</style>
            </div>
          </div>

          {/* Period selector tabs */}
          <div style={{
            display: "inline-flex", background: "#F3F4F6",
            border: "1px solid #E5E7EB", borderRadius: 8, padding: 4, gap: 2,
          }}>
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)} style={{
                fontFamily: FM, fontSize: 13, fontWeight: 600,
                padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer",
                background: period === p.value ? "#FFFFFF" : "transparent",
                color: period === p.value ? "#111" : "#6B7280",
                transition: "all 0.15s",
                boxShadow: period === p.value ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              }}>{p.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 28px" }}>
        {error && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8,
            padding: 14, marginBottom: 20, color: "#DC2626", fontFamily: FM, fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {loading ? <Loading /> : !data ? null : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── KPI Row 1 ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
              <KPICard icon={DollarSign} label="Total Revenue"
                value={gbp(data.kpi.revenue.value)} change={data.kpi.revenue.change} />
              <KPICard icon={TrendingUp} label="Net Profit (est.)"
                value={gbp(data.kpi.netProfit.value)} change={data.kpi.netProfit.change}
                accent="linear-gradient(90deg,#059669,#34D399)" />
              <KPICard icon={ShoppingCart} label="Total Orders"
                value={data.kpi.orders.value.toLocaleString()} change={data.kpi.orders.change}
                accent="linear-gradient(90deg,#3B82F6,#93C5FD)" />
              <KPICard icon={Package} label="Items Sold"
                value={data.kpi.itemsSold.value.toLocaleString()} change={data.kpi.itemsSold.change}
                accent="linear-gradient(90deg,#8B5CF6,#C4B5FD)" />
            </div>

            {/* ── KPI Row 2 ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
              <KPICard icon={Users} label="New Customers"
                value={data.kpi.newCustomers.value.toLocaleString()} change={data.kpi.newCustomers.change}
                accent="linear-gradient(90deg,#06B6D4,#67E8F9)" />
              <KPICard icon={Activity} label="Avg Order Value"
                value={gbp(data.kpi.avgOrderValue.value)} change={data.kpi.avgOrderValue.change}
                accent="linear-gradient(90deg,#F59E0B,#FCD34D)" />
              <KPICard icon={Package} label="Inventory Value"
                value={gbp(data.kpi.inventoryValue)} sub="Current stock value"
                accent="linear-gradient(90deg,#EC4899,#F9A8D4)" />
              <KPICard icon={UserCheck} label="Total Customers"
                value={data.kpi.totalCustomers.toLocaleString()}
                sub={`${data.kpi.newCustomers.value} new this period`}
                accent="linear-gradient(90deg,#14B8A6,#5EEAD4)" />
            </div>

            {/* ── Alert Row ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
              <AlertKPI label="Low Stock" value={data.kpi.lowStock}
                severity={data.kpi.lowStock > 20 ? "critical" : data.kpi.lowStock > 0 ? "warn" : "ok"}
                sub={data.kpi.lowStock > 0 ? "Action required" : "All stocked"} />
              <AlertKPI label="Out of Stock" value={data.kpi.outOfStock}
                severity={data.kpi.outOfStock > 5 ? "critical" : data.kpi.outOfStock > 0 ? "warn" : "ok"}
                sub={data.kpi.outOfStock > 0 ? "Reorder now" : "Fully stocked"} />
              <AlertKPI label="Expiring (30d)" value={data.kpi.expiring30}
                severity={data.kpi.expiring30 > 10 ? "critical" : data.kpi.expiring30 > 0 ? "warn" : "ok"}
                sub={data.kpi.expiring30 > 0 ? "Review urgently" : "All good"} />
              <AlertKPI label="Cancelled Orders" value={data.kpi.cancelledOrders}
                severity={data.kpi.cancelledOrders > 0 ? "warn" : "ok"} sub="This period" />
            </div>

            {/* ── Sales & Revenue ── */}
            <SectionHeader label="Sales & Revenue" icon={BarChart2}
              expanded={expanded.sales} onToggle={() => toggle("sales")} />
            {expanded.sales && (
              <>
                <Card>
                  <div style={{ display: "flex", alignItems: "center",
                    justifyContent: "space-between", marginBottom: 16 }}>
                    <SectionTitle icon={BarChart2} sub="Daily trend">
                      Revenue &amp; Sales Trend
                    </SectionTitle>
                    <div style={{ display: "flex", gap: 6 }}>
                      {(["revenue", "orders", "profit"] as const).map(m => (
                        <button key={m} onClick={() => setChartMode(m)} className="active:scale-95" style={{
                          fontFamily: FM, fontSize: 11, fontWeight: 700,
                          padding: "5px 12px", borderRadius: 6, cursor: "pointer",
                          background: chartMode === m 
                            ? "linear-gradient(135deg,#D4AF37 0%,#C9A52E 100%)"
                            : "linear-gradient(135deg,rgba(107,114,128,0.08) 0%,rgba(107,114,128,0.04) 100%)",
                          border: chartMode === m 
                            ? "1px solid rgba(212,175,55,0.6)"
                            : "1px solid rgba(107,114,128,0.2)",
                          color: chartMode === m ? "#1A1A1A" : "#6B7280",
                          boxShadow: chartMode === m 
                            ? "0 2px 6px rgba(212,175,55,0.3),inset 0 1px 0 rgba(255,255,255,0.2)"
                            : "0 1px 3px rgba(0,0,0,0.05),inset 0 1px 0 rgba(255,255,255,0.6)",
                          transition: "all 0.15s",
                        }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(-1px)"; el.style.boxShadow=chartMode === m ? "0 4px 10px rgba(212,175,55,0.4),inset 0 1px 0 rgba(255,255,255,0.2)" : "0 3px 8px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,0.6)"; }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="translateY(0)"; el.style.boxShadow=chartMode === m ? "0 2px 6px rgba(212,175,55,0.3),inset 0 1px 0 rgba(255,255,255,0.2)" : "0 1px 3px rgba(0,0,0,0.05),inset 0 1px 0 rgba(255,255,255,0.6)"; }}>
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {data.dailyRevenue.length > 0 ? (
                    <AreaChart
                      data={data.dailyRevenue.map(d => ({
                        label: d.date.slice(5),
                        value: chartMode === "revenue" ? d.revenue
                             : chartMode === "orders"  ? d.orders
                             : d.profit,
                        value2: chartMode === "revenue" ? d.profit : undefined,
                      }))}
                      color="#D4AF37" height={200} />
                  ) : <Empty />}
                </Card>

                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
                  <Card>
                    <SectionTitle icon={Activity} sub="Last 12 months">
                      Monthly Performance
                    </SectionTitle>
                    {data.monthlyRevenue.length > 0 ? (
                      <AreaChart
                        data={data.monthlyRevenue.map(m => ({
                          label: m.month, value: m.revenue, value2: m.profit,
                        }))}
                        color="#D4AF37" height={170} />
                    ) : <Empty />}
                  </Card>

                  <Card>
                    <SectionTitle icon={ShoppingCart} sub="Breakdown by status">
                      Orders by Status
                    </SectionTitle>
                    {data.ordersByStatus.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {data.ordersByStatus.map((s, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%",
                              flexShrink: 0, background: STATUS_COLORS[s.status] ?? "#9CA3AF" }} />
                            <span style={{ fontFamily: FM, fontSize: 12, color: "#374151",
                              flex: 1, fontWeight: 500, textTransform: "capitalize" }}>
                              {s.status}
                            </span>
                            <span style={{ fontFamily: FM, fontSize: 13, color: "#111", fontWeight: 700 }}>
                              {s.count}
                            </span>
                            <span style={{ fontFamily: FM, fontSize: 11, color: "#9CA3AF",
                              width: 70, textAlign: "right" }}>
                              {gbp(s.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : <Empty />}
                  </Card>
                </div>
              </>
            )}

            {/* ── Profit ── */}
            <SectionHeader label="Profit Analysis" icon={TrendingUp}
              expanded={expanded.profit} onToggle={() => toggle("profit")} />
            {expanded.profit && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16 }}>
                <Card>
                  <SectionTitle icon={DollarSign} sub="Estimated P&L">
                    P&amp;L Summary
                  </SectionTitle>
                  {[
                    { label: "Gross Revenue",    value: data.profitBreakdown.grossRevenue,  sign: "+", color: "#111" },
                    { label: "Tax Collected",    value: data.profitBreakdown.taxCollected,  sign: "-", color: "#EF4444" },
                    { label: "Discounts Given",  value: data.profitBreakdown.discountGiven, sign: "-", color: "#F59E0B" },
                    { label: "Est. COGS (78%)",  value: data.profitBreakdown.cogsEstimate,  sign: "-", color: "#EF4444" },
                  ].map((row, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between",
                      padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                      <span style={{ fontFamily: FM, fontSize: 13, color: "#374151", fontWeight: 500 }}>
                        {row.label}
                      </span>
                      <span style={{ fontFamily: FM, fontSize: 13, fontWeight: 700, color: row.color }}>
                        {row.sign}{gbp(row.value)}
                      </span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between",
                    padding: "14px 0 0", borderTop: "2px solid #D4AF37", marginTop: 4 }}>
                    <span style={{ fontFamily: FM, fontSize: 14, fontWeight: 800, color: "#111" }}>
                      Net Profit (est.)
                    </span>
                    <span style={{ fontFamily: FM, fontSize: 16, fontWeight: 800, color: "#059669" }}>
                      {gbp(data.profitBreakdown.netProfit)}
                    </span>
                  </div>
                  <p style={{ fontFamily: FM, fontSize: 12, color: "#9CA3AF", textAlign: "right", marginTop: 4 }}>
                    Margin: {data.profitBreakdown.profitMargin}%
                  </p>
                </Card>

                <Card>
                  <SectionTitle icon={Activity} sub="Cancellations and refunds">
                    Returns &amp; Refunds
                  </SectionTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    {[
                      { label: "Refunded Orders", value: data.returnStats.totalRefunds,                   color: "#DC2626" },
                      { label: "Refund Amount",    value: gbp(data.returnStats.refundAmount),              color: "#DC2626" },
                      { label: "Cancelled Orders", value: data.returnStats.cancelledOrders,               color: "#F59E0B" },
                      { label: "Cancel Rate",       value: `${data.returnStats.cancelRate}%`,              color: "#F59E0B" },
                    ].map((kp, i) => (
                      <div key={i} style={{ background: "#F9FAFB", borderRadius: 8, padding: "12px 14px" }}>
                        <p style={{ fontFamily: FM, fontSize: 10, color: "#9CA3AF",
                          textTransform: "uppercase", letterSpacing: "0.1em",
                          margin: "0 0 6px", fontWeight: 600 }}>{kp.label}</p>
                        <p style={{ fontFamily: FM, fontSize: 20, fontWeight: 800,
                          color: kp.color, margin: 0 }}>{kp.value}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ── Products ── */}
            <SectionHeader label="Medicine / Product Analytics" icon={Package}
              expanded={expanded.products} onToggle={() => toggle("products")} />
            {expanded.products && (
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
                <Card>
                  <SectionTitle icon={Zap} sub="Top 15 by units sold">
                    Top Selling Medicines
                  </SectionTitle>
                  {data.topProducts.length > 0 ? (
                    <DataTable
                      cols={["Medicine", "Category", "Units", "Revenue", "Profit"]}
                      rows={data.topProducts.map(p => [
                        <span key="n" style={{ maxWidth: 180, overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                          {p.name}
                        </span>,
                        <span key="c" style={{ fontFamily: FM, fontSize: 10,
                          background: "rgba(212,175,55,0.12)", color: "#92761A",
                          padding: "2px 7px", borderRadius: 4 }}>
                          {p.category}
                        </span>,
                        p.qty.toLocaleString(),
                        gbp(p.revenue),
                        <span key="pr" style={{ color: "#059669" }}>{gbp(p.profit)}</span>,
                      ])}
                    />
                  ) : <Empty />}
                </Card>

                <Card>
                  <SectionTitle icon={BarChart2} sub="Lowest selling this period">
                    Slow Movers
                  </SectionTitle>
                  {data.lowestProducts.length > 0 ? (
                    <HBarList
                      rows={data.lowestProducts.map(p => ({
                        label: p.name,
                        value: p.qty,
                        sub: `${p.qty} units \u00B7 ${gbp(p.revenue)}`,
                      }))}
                      maxVal={Math.max(...data.lowestProducts.map(p => p.qty), 1)}
                      color="#9CA3AF"
                    />
                  ) : <Empty />}
                </Card>
              </div>
            )}

            {/* ── Categories ── */}
            <SectionHeader label="Category Analytics" icon={PieChart}
              expanded={expanded.categories} onToggle={() => toggle("categories")} />
            {expanded.categories && (
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16 }}>
                <Card style={{ display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center" }}>
                  {data.categoryAnalytics.length > 0 ? (
                    <>
                      <DonutChart size={170} data={data.categoryAnalytics.map((c, i) => ({
                        label: c.name, value: c.revenue,
                        color: CAT_COLORS[i % CAT_COLORS.length],
                      }))} />
                      <p style={{ fontFamily: FM, fontSize: 11, color: "#9CA3AF", marginTop: 8 }}>
                        By Revenue
                      </p>
                    </>
                  ) : <Empty />}
                </Card>

                <Card>
                  <SectionTitle icon={PieChart} sub="Revenue and units by category">
                    Category Breakdown
                  </SectionTitle>
                  {data.categoryAnalytics.length > 0 ? (() => {
                    const totalRev = data.categoryAnalytics.reduce((s, c) => s + c.revenue, 0);
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {data.categoryAnalytics.map((c, i) => {
                          const pct = totalRev > 0 ? ((c.revenue / totalRev) * 100).toFixed(1) : "0";
                          const col = CAT_COLORS[i % CAT_COLORS.length];
                          return (
                            <div key={i}>
                              <div style={{ display: "flex", alignItems: "center",
                                justifyContent: "space-between", marginBottom: 5 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ width: 10, height: 10, borderRadius: 2,
                                    background: col, flexShrink: 0 }} />
                                  <span style={{ fontFamily: FM, fontSize: 12,
                                    color: "#374151", fontWeight: 600 }}>{c.name}</span>
                                </div>
                                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                                  <span style={{ fontFamily: FM, fontSize: 11, color: "#9CA3AF" }}>
                                    {c.qty.toLocaleString()} units
                                  </span>
                                  <span style={{ fontFamily: FM, fontSize: 12,
                                    fontWeight: 700, color: col }}>
                                    {gbp(c.revenue)}
                                  </span>
                                  <span style={{ fontFamily: FM, fontSize: 11,
                                    color: "#9CA3AF", width: 36, textAlign: "right" }}>
                                    {pct}%
                                  </span>
                                </div>
                              </div>
                              <div style={{ height: 7, borderRadius: 4,
                                background: "#F3F4F6", overflow: "hidden" }}>
                                <div style={{ height: "100%", background: col,
                                  borderRadius: 4, width: `${pct}%`,
                                  transition: "width 0.5s ease" }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })() : <Empty />}
                </Card>
              </div>
            )}

            {/* ── Inventory ── */}
            <SectionHeader label="Inventory Analytics" icon={Package}
              expanded={expanded.inventory} onToggle={() => toggle("inventory")} />
            {expanded.inventory && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                  <AlertKPI label="Low Stock" value={data.kpi.lowStock}
                    severity={data.kpi.lowStock > 10 ? "critical" : data.kpi.lowStock > 0 ? "warn" : "ok"}
                    sub="Below threshold" />
                  <AlertKPI label="Out of Stock" value={data.kpi.outOfStock}
                    severity={data.kpi.outOfStock > 0 ? "critical" : "ok"} sub="Zero quantity" />
                  <AlertKPI label="Expiring 30d" value={data.kpi.expiring30}
                    severity={data.kpi.expiring30 > 0 ? "warn" : "ok"} sub="Need attention" />
                  <AlertKPI label="Expired" value={data.kpi.expired}
                    severity={data.kpi.expired > 0 ? "critical" : "ok"} sub="Remove from shelf" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Card>
                    <SectionTitle icon={Clock} sub="Expiring within 90 days">
                      Expiring Medicines
                    </SectionTitle>
                    {data.inventoryHealth.expiringSoon.length > 0 ? (
                      <DataTable
                        cols={["Medicine", "Batch", "Qty", "Days Left", "Value"]}
                        rows={data.inventoryHealth.expiringSoon.map(item => {
                          const days = Math.ceil(
                            (new Date(item.expiryDate).getTime() - Date.now()) / 86400000
                          );
                          return [
                            <span key="n" style={{ maxWidth: 130, overflow: "hidden",
                              textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                              {item.product}
                            </span>,
                            <span key="b" style={{ fontFamily: FM, fontSize: 10, color: "#6B7280" }}>
                              {item.batch}
                            </span>,
                            item.qty,
                            <span key="d" style={{
                              color: days <= 30 ? "#DC2626" : days <= 60 ? "#D97706" : "#059669",
                              fontWeight: 700, fontSize: 11,
                            }}>
                              {days}d
                            </span>,
                            gbp(item.value),
                          ];
                        })}
                      />
                    ) : <Empty msg="No expiring items in 90 days" />}
                  </Card>

                  <Card>
                    <SectionTitle icon={AlertTriangle} sub="Below minimum stock level">
                      Low Stock Items
                    </SectionTitle>
                    {data.inventoryHealth.lowStockItems.length > 0 ? (
                      <DataTable
                        cols={["Medicine", "Batch", "Stock", "Threshold"]}
                        rows={data.inventoryHealth.lowStockItems.map(item => [
                          <span key="n" style={{ maxWidth: 150, overflow: "hidden",
                            textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                            {item.product}
                          </span>,
                          <span key="b" style={{ fontFamily: FM, fontSize: 10, color: "#6B7280" }}>
                            {item.batch}
                          </span>,
                          <span key="q" style={{ color: "#DC2626", fontWeight: 700 }}>{item.qty}</span>,
                          item.threshold,
                        ])}
                      />
                    ) : <Empty msg="All items sufficiently stocked" />}
                  </Card>
                </div>
              </>
            )}

            {/* ── Customers ── */}
            <SectionHeader label="Customer Analytics" icon={Users}
              expanded={expanded.customers} onToggle={() => toggle("customers")} />
            {expanded.customers && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                  <KPICard icon={Users} label="Total Customers"
                    value={data.customerAnalytics.retention.totalCustomers.toLocaleString()}
                    accent="linear-gradient(90deg,#06B6D4,#67E8F9)" />
                  <KPICard icon={UserCheck} label="Repeat Customers"
                    value={data.customerAnalytics.retention.repeatCustomers.toLocaleString()}
                    sub={`${data.customerAnalytics.retention.retentionRate}% retention`}
                    accent="linear-gradient(90deg,#10B981,#34D399)" />
                  <KPICard icon={Activity} label="Avg Orders / Customer"
                    value={data.customerAnalytics.retention.avgOrdersPerCustomer.toFixed(1)}
                    accent="linear-gradient(90deg,#8B5CF6,#C4B5FD)" />
                  <KPICard icon={DollarSign} label="Avg Spend / Customer"
                    value={gbp(data.customerAnalytics.retention.avgSpendPerCustomer)}
                    accent="linear-gradient(90deg,#F59E0B,#FCD34D)" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
                  <Card>
                    <SectionTitle icon={TrendingUp} sub="New registrations by month">
                      Customer Growth
                    </SectionTitle>
                    {data.customerAnalytics.growth.length > 0 ? (
                      <BarChart
                        data={data.customerAnalytics.growth.map(m => ({
                          label: m.month.slice(5), value: m.newCustomers,
                        }))}
                        color="#06B6D4" height={160} />
                    ) : <Empty />}
                  </Card>

                  <Card>
                    <SectionTitle icon={Users} sub="By total purchase value">
                      Top Customers
                    </SectionTitle>
                    {data.customerAnalytics.topCustomers.length > 0 ? (
                      <HBarList
                        rows={data.customerAnalytics.topCustomers.slice(0, 8).map(c => ({
                          label: c.name,
                          value: c.totalSpent,
                          sub: `${gbp(c.totalSpent)} \u00B7 ${c.orders} orders`,
                        }))}
                        maxVal={Math.max(...data.customerAnalytics.topCustomers.map(c => c.totalSpent), 1)}
                        color="#06B6D4"
                      />
                    ) : <Empty />}
                  </Card>
                </div>
              </>
            )}

            {/* ── Payments ── */}
            <SectionHeader label="Payment Analytics" icon={DollarSign}
              expanded={expanded.payments} onToggle={() => toggle("payments")} />
            {expanded.payments && (
              <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
                <Card style={{ display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 12 }}>
                  {data.paymentMethods.length > 0 ? (
                    <>
                      <DonutChart size={160} data={data.paymentMethods.map(p => ({
                        label: p.method, value: p.count,
                        color: PAYMENT_COLORS[p.method] ?? "#9CA3AF",
                      }))} />
                      {data.paymentMethods.map((p, i) => {
                        const total = data.paymentMethods.reduce((s, m) => s + m.count, 0);
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center",
                            gap: 8, width: "100%" }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2,
                              flexShrink: 0, background: PAYMENT_COLORS[p.method] ?? "#9CA3AF" }} />
                            <span style={{ fontFamily: FM, fontSize: 11, color: "#374151",
                              flex: 1, textTransform: "capitalize" }}>{p.method}</span>
                            <span style={{ fontFamily: FM, fontSize: 11, fontWeight: 700, color: "#111" }}>
                              {total > 0 ? Math.round((p.count / total) * 100) : 0}%
                            </span>
                          </div>
                        );
                      })}
                    </>
                  ) : <Empty />}
                </Card>

                <Card>
                  <SectionTitle icon={DollarSign} sub="Revenue by payment method">
                    Payment Method Details
                  </SectionTitle>
                  {data.paymentMethods.length > 0 ? (
                    <DataTable
                      cols={["Method", "Orders", "Revenue", "Avg Order"]}
                      rows={data.paymentMethods.map(p => [
                        <span key="m" style={{ textTransform: "capitalize", fontWeight: 700 }}>
                          {p.method}
                        </span>,
                        p.count.toLocaleString(),
                        gbp(p.value),
                        gbp(p.count > 0 ? p.value / p.count : 0),
                      ])}
                    />
                  ) : <Empty />}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12, marginTop: 20 }}>
                    {[
                      { label: "Total Collected", value: gbp(data.profitBreakdown.grossRevenue), color: "#059669" },
                      { label: "Total Refunded",  value: gbp(data.returnStats.refundAmount),     color: "#DC2626" },
                      { label: "Tax Collected",   value: gbp(data.profitBreakdown.taxCollected), color: "#3B82F6" },
                    ].map((kp, i) => (
                      <div key={i} style={{ background: "#F9FAFB", borderRadius: 8,
                        padding: "12px 14px", textAlign: "center" }}>
                        <p style={{ fontFamily: FM, fontSize: 10, color: "#9CA3AF",
                          textTransform: "uppercase", letterSpacing: "0.1em",
                          margin: "0 0 6px", fontWeight: 600 }}>{kp.label}</p>
                        <p style={{ fontFamily: FM, fontSize: 18, fontWeight: 800,
                          color: kp.color, margin: 0 }}>{kp.value}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ── Suppliers ── */}
            <SectionHeader label="Supplier Analytics" icon={Package}
              expanded={expanded.suppliers} onToggle={() => toggle("suppliers")} />
            {expanded.suppliers && (
              <Card>
                <SectionTitle icon={Package} sub="Inventory grouped by supplier">
                  Supplier Overview
                </SectionTitle>
                {data.supplierAnalytics.length > 0 ? (
                  <DataTable
                    cols={["Supplier", "Batches", "Qty in Stock", "Inventory Cost", "Expiring (90d)", "Out of Stock"]}
                    rows={data.supplierAnalytics.map(s => [
                      <span key="n" style={{ fontWeight: 700 }}>{s.name}</span>,
                      s.batches,
                      s.quantity.toLocaleString(),
                      gbp(s.cost),
                      <span key="e" style={{ color: s.expiring > 0 ? "#D97706" : "#059669", fontWeight: 700 }}>
                        {s.expiring}
                      </span>,
                      <span key="o" style={{ color: s.outOfStock > 0 ? "#DC2626" : "#059669", fontWeight: 700 }}>
                        {s.outOfStock}
                      </span>,
                    ])}
                  />
                ) : <Empty msg="No supplier data in inventory" />}
              </Card>
            )}

            {/* ── Staff ── */}
            <SectionHeader label="Staff Overview" icon={UserCheck}
              expanded={expanded.staff} onToggle={() => toggle("staff")} />
            {expanded.staff && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16 }}>
                <Card>
                  <SectionTitle icon={UserCheck} sub="Workforce summary">
                    Staff Summary
                  </SectionTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Total Staff",     value: data.staffAnalytics.summary.totalStaff,  color: "#111" },
                      { label: "Active Staff",    value: data.staffAnalytics.summary.activeStaff, color: "#059669" },
                      { label: "Pharmacists",     value: data.staffAnalytics.summary.pharmacists, color: "#3B82F6" },
                      { label: "Monthly Payroll", value: gbp(data.staffAnalytics.summary.totalPayroll), color: "#D97706" },
                    ].map((kp, i) => (
                      <div key={i} style={{ background: "#F9FAFB", borderRadius: 8, padding: "12px 14px" }}>
                        <p style={{ fontFamily: FM, fontSize: 10, color: "#9CA3AF",
                          textTransform: "uppercase", letterSpacing: "0.1em",
                          margin: "0 0 4px", fontWeight: 600 }}>{kp.label}</p>
                        <p style={{ fontFamily: FM, fontSize: 20, fontWeight: 800,
                          color: kp.color, margin: 0 }}>{kp.value}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <SectionTitle icon={BarChart2} sub="Active staff by role">
                    Staff by Role
                  </SectionTitle>
                  {data.staffAnalytics.byRole.length > 0 ? (
                    <DataTable
                      cols={["Role", "Count", "Avg Salary"]}
                      rows={data.staffAnalytics.byRole.map(r => [
                        <span key="r" style={{ textTransform: "capitalize", fontWeight: 700 }}>
                          {r.role.replace("_", " ")}
                        </span>,
                        r.count,
                        gbp(r.avgSalary),
                      ])}
                    />
                  ) : <Empty msg="No staff records found" />}
                </Card>
              </div>
            )}

            {/* ── Business Insights ── */}
            <Card style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid #FCD34D",
                }}>
                  <Zap size={18} style={{ color: "#D97706" }} />
                </div>
                <div>
                  <h3 style={{ fontFamily: FH, fontSize: 16, fontWeight: 600,
                    color: "#111", margin: 0, lineHeight: 1 }}>
                    Business Insights
                  </h3>
                  <p style={{ fontFamily: FM, fontSize: 12, color: "#9CA3AF",
                    margin: "2px 0 0" }}>
                    Auto-generated from real data
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.insights.map((ins, i) => {
                  const MAP = {
                    success: { bg: "#ECFDF5", border: "#A7F3D0", icon: "📈", text: "#059669", iconBg: "#D1FAE5" },
                    warning: { bg: "#FFFBEB", border: "#FDE68A", icon: "⚠️", text: "#D97706", iconBg: "#FEF3C7" },
                    danger:  { bg: "#FEF2F2", border: "#FECACA", icon: "🔴", text: "#DC2626", iconBg: "#FEE2E2" },
                    info:    { bg: "#EFF6FF", border: "#BFDBFE", icon: "💡", text: "#2563EB", iconBg: "#DBEAFE" },
                  };
                  const m = MAP[ins.type];
                  return (
                    <div key={i} style={{
                      background: m.bg, border: `1px solid ${m.border}`,
                      borderRadius: 10, padding: "12px 16px",
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: m.iconBg, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 14 }}>{m.icon}</span>
                      </div>
                      <p style={{ fontFamily: FM, fontSize: 13, fontWeight: 500,
                        color: m.text, margin: 0, lineHeight: 1.5 }}>
                        {ins.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}
