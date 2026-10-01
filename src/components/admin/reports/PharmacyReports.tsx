"use client";

import { useState, useEffect } from "react";
import {
  FileText, Download, Printer, Calendar, Filter,
  DollarSign, Package, ShoppingCart, Users, TrendingUp,
  AlertTriangle, RefreshCw, FileSpreadsheet,
  Clock, CheckCircle, XCircle,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface ReportSummary {
  totalOrders?: number;
  totalSales?: number;
  totalTax?: number;
  totalDiscount?: number;
  avgOrderValue?: number;
  cancelledCount?: number;
  deliveredCount?: number;
  refundedCount?: number;
  totalProducts?: number;
  totalBatches?: number;
  totalQuantity?: number;
  totalPurchaseValue?: number;
  totalSellingValue?: number;
  outOfStockCount?: number;
  lowStockCount?: number;
  expiredCount?: number;
  expiring30Days?: number;
  expiring90Days?: number;
  totalRevenue?: number;
  estimatedProfit?: number;
  totalCollected?: number;
  totalPending?: number;
  totalRefunded?: number;
  pendingPaymentCount?: number;
}

interface ReportData {
  reportType: string;
  period?: { from: string; to: string };
  summary: ReportSummary;
  records: any[];
  recordCount: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const FH = "var(--font-heading),'Libre Baskerville',serif";
const FM = "var(--font-montserrat),'Montserrat',sans-serif";

const REPORT_CATEGORIES = [
  {
    id: "sales",
    name: "Sales Reports",
    icon: DollarSign,
    color: "#059669",
    reports: [
      { id: "daily", name: "Daily Sales Report", api: "sales" },
      { id: "detailed", name: "Detailed Sales Report", api: "sales" },
      { id: "by-product", name: "Sales by Product", api: "sales" },
      { id: "by-category", name: "Sales by Category", api: "sales" },
      { id: "by-payment", name: "Sales by Payment Method", api: "sales" },
      { id: "cancelled", name: "Cancelled Sales", api: "sales" },
      { id: "discount", name: "Discount Report", api: "sales" },
      { id: "refund", name: "Refund Report", api: "sales" },
    ],
  },
  {
    id: "inventory",
    name: "Inventory Reports",
    icon: Package,
    color: "#3B82F6",
    reports: [
      { id: "current-stock", name: "Current Stock Report", api: "inventory" },
      { id: "stock-valuation", name: "Stock Valuation Report", api: "inventory" },
      { id: "low-stock", name: "Low Stock Report", api: "inventory" },
      { id: "out-of-stock", name: "Out of Stock Report", api: "inventory" },
      { id: "expiry", name: "Expiry Report", api: "inventory" },
      { id: "batch-wise", name: "Batch-wise Stock Report", api: "inventory" },
    ],
  },
  {
    id: "financial",
    name: "Financial Reports",
    icon: TrendingUp,
    color: "#D4AF37",
    reports: [
      { id: "revenue", name: "Revenue Report", api: "financial" },
      { id: "profit", name: "Profit Report", api: "financial" },
      { id: "payment-collection", name: "Payment Collection Report", api: "financial" },
      { id: "tax", name: "Tax Report", api: "financial" },
      { id: "pending-payments", name: "Pending Payments Report", api: "financial" },
    ],
  },
];

const DATE_PRESETS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last Month", value: "last-month" },
  { label: "This Year", value: "year" },
];

// ── Helper Functions ─────────────────────────────────────────────────────────

function getDateRange(preset: string): { from: string; to: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (preset) {
    case "today":
      return { 
        from: today.toISOString(), 
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString() 
      };
    case "yesterday":
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return { 
        from: yesterday.toISOString(), 
        to: today.toISOString() 
      };
    case "week":
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return { from: weekStart.toISOString(), to: now.toISOString() };
    case "month":
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: monthStart.toISOString(), to: now.toISOString() };
    case "last-month":
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { from: lastMonthStart.toISOString(), to: lastMonthEnd.toISOString() };
    case "year":
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return { from: yearStart.toISOString(), to: now.toISOString() };
    default:
      const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { from: defaultStart.toISOString(), to: now.toISOString() };
  }
}

function formatCurrency(value: number): string {
  return "£" + value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function PharmacyReports() {
  const [selectedCategory, setSelectedCategory] = useState("sales");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState("month");
  const [dateRange, setDateRange] = useState(getDateRange("month"));
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentCategory = REPORT_CATEGORIES.find(c => c.id === selectedCategory);

  const generateReport = async (reportId: string, api: string) => {
    setLoading(true);
    setError(null);
    setSelectedReport(reportId);

    try {
      const params = new URLSearchParams({
        type: reportId,
        from: dateRange.from,
        to: dateRange.to,
      });

      const res = await fetch(`/api/reports/${api}?${params.toString()}`);
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || "Failed to generate report");
      }

      setReportData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    setDateRange(getDateRange(preset));
  };

  const exportReport = (format: "csv" | "pdf") => {
    alert(`Export to ${format.toUpperCase()} - Feature coming soon!`);
  };

  return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", fontFamily: FM }}>
      
      {/* ── Header ── */}
      <div style={{
        background: "#FFFFFF", borderBottom: "1px solid #E5E5E5",
        position: "sticky", top: 0, zIndex: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <div style={{ padding: "20px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <FileText size={24} style={{ color: "#D4AF37" }} />
                <h1 style={{ fontFamily: FH, fontSize: 26, fontWeight: 600,
                  color: "#111", margin: 0, lineHeight: 1 }}>
                  Reports
                </h1>
              </div>
              <p style={{ fontFamily: FM, fontSize: 13, color: "#6B7280",
                marginTop: 2, marginLeft: 32 }}>
                Generate, view and export detailed pharmacy reports
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => exportReport("pdf")}
                disabled={!reportData}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                  background: reportData ? "#FFFFFF" : "#F9FAFB",
                  border: "1px solid #E5E5E5", borderRadius: 8,
                  color: reportData ? "#374151" : "#9CA3AF",
                  fontSize: 13, fontFamily: FM, cursor: reportData ? "pointer" : "not-allowed",
                  fontWeight: 600, transition: "all 0.15s",
                }}
                onMouseEnter={(e) => reportData && (e.currentTarget.style.background = "#F9FAFB")}
                onMouseLeave={(e) => reportData && (e.currentTarget.style.background = "#FFFFFF")}>
                <Download size={14} />
                Export PDF
              </button>

              <button
                onClick={() => exportReport("csv")}
                disabled={!reportData}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                  background: reportData ? "#D4AF37" : "#E5E5E5",
                  border: "none", borderRadius: 8,
                  color: reportData ? "#1A1A1A" : "#9CA3AF",
                  fontSize: 13, fontFamily: FM,
                  cursor: reportData ? "pointer" : "not-allowed",
                  fontWeight: 600, transition: "all 0.15s",
                }}
                onMouseEnter={(e) => reportData && (e.currentTarget.style.background = "#C9A532")}
                onMouseLeave={(e) => reportData && (e.currentTarget.style.background = "#D4AF37")}>
                <FileSpreadsheet size={14} />
                Export Excel
              </button>
            </div>
          </div>

          {/* Date Range Selector */}
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={16} style={{ color: "#9CA3AF" }} />
              <span style={{ fontFamily: FM, fontSize: 13, color: "#6B7280", fontWeight: 600 }}>
                Date Range:
              </span>
            </div>
            <div style={{
              display: "inline-flex", background: "#F3F4F6",
              border: "1px solid #E5E7EB", borderRadius: 8, padding: 4, gap: 2,
            }}>
              {DATE_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => handleDatePresetChange(preset.value)}
                  style={{
                    fontFamily: FM, fontSize: 12, fontWeight: 600,
                    padding: "5px 12px", borderRadius: 6, border: "none",
                    cursor: "pointer",
                    background: datePreset === preset.value ? "#FFFFFF" : "transparent",
                    color: datePreset === preset.value ? "#111" : "#6B7280",
                    transition: "all 0.15s",
                    boxShadow: datePreset === preset.value ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  }}>
                  {preset.label}
                </button>
              ))}
            </div>
            <span style={{ fontFamily: FM, fontSize: 12, color: "#9CA3AF" }}>
              {formatDate(dateRange.from)} → {formatDate(dateRange.to)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Report Categories - Horizontal Tabs ── */}
      <div style={{
        width: "100%", background: "#FFFFFF", borderBottom: "1px solid #E5E5E5",
        padding: "16px 28px", display: "flex", gap: 12, overflowX: "auto",
      }}>
        {REPORT_CATEGORIES.map(category => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 8,
                background: isActive ? category.color + "15" : "transparent",
                border: isActive ? `2px solid ${category.color}` : "2px solid transparent",
                cursor: "pointer", transition: "all 0.15s",
                fontFamily: FM, fontSize: 14, fontWeight: isActive ? 600 : 500,
                color: isActive ? category.color : "#6B7280",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = "#F9FAFB")}
              onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = "transparent")}>
              <Icon size={18} style={{ color: category.color }} />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* ── Report Selection Dropdown ── */}
      <div style={{ padding: "0 28px 20px" }}>
        <div style={{ background: "#FFFFFF", borderRadius: 10, border: "1px solid #E5E5E5", padding: 20 }}>
          <label style={{ fontFamily: FM, fontSize: 12, color: "#6B7280", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
            Select Report
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10 }}>
            {currentCategory?.reports.map(report => (
              <button
                key={report.id}
                onClick={() => generateReport(report.id, report.api)}
                disabled={loading}
                style={{
                  textAlign: "left", padding: "12px 16px",
                  background: selectedReport === report.id ? "#F3F4F6" : "#FAFAFA",
                  border: selectedReport === report.id ? "2px solid #D4AF37" : "1px solid #E5E5E5",
                  borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: FM, fontSize: 13, fontWeight: 500,
                  color: selectedReport === report.id ? "#111" : "#374151",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#F3F4F6")}
                onMouseLeave={(e) => selectedReport !== report.id && (e.currentTarget.style.background = "#FAFAFA")}>
                {report.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div style={{ padding: "0 28px 28px" }}>
          {error && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10,
              padding: "16px 20px", marginBottom: 20, display: "flex",
              alignItems: "center", gap: 12,
            }}>
              <XCircle size={20} style={{ color: "#DC2626", flexShrink: 0 }} />
              <p style={{ fontFamily: FM, fontSize: 14, color: "#DC2626", margin: 0 }}>
                {error}
              </p>
            </div>
          )}

          {loading ? (
            <div style={{
              display: "flex", justifyContent: "center", alignItems: "center",
              minHeight: 400,
            }}>
              <div style={{ textAlign: "center" }}>
                <RefreshCw size={40} style={{ color: "#D4AF37",
                  animation: "spin 1s linear infinite" }} />
                <p style={{ fontFamily: FM, fontSize: 14, color: "#6B7280", marginTop: 12 }}>
                  Generating report...
                </p>
              </div>
            </div>
          ) : reportData ? (
            <ReportDisplay data={reportData} />
          ) : (
            <EmptyState />
          )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Report Display Component ─────────────────────────────────────────────────

function ReportDisplay({ data }: { data: ReportData }) {
  const reportName = REPORT_CATEGORIES
    .flatMap(cat => cat.reports)
    .find(r => r.id === data.reportType)?.name || data.reportType;

  return (
    <div>
      {/* Report Header */}
      <div style={{
        background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E5E5",
        padding: 24, marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: FH, fontSize: 20, fontWeight: 600,
              color: "#111", margin: 0, marginBottom: 6 }}>
              {reportName}
            </h2>
            {data.period && (
              <p style={{ fontFamily: FM, fontSize: 13, color: "#6B7280", margin: 0 }}>
                Period: {formatDate(data.period.from)} to {formatDate(data.period.to)}
              </p>
            )}
          </div>
          <div style={{
            background: "#F3F4F6", borderRadius: 8, padding: "8px 14px",
          }}>
            <p style={{ fontFamily: FM, fontSize: 12, color: "#6B7280", margin: 0 }}>
              <strong style={{ color: "#111" }}>{data.recordCount}</strong> records
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12, marginTop: 16 }}>
          {data.summary.totalSales !== undefined && (
            <SummaryCard
              icon={DollarSign}
              label="Total Sales"
              value={formatCurrency(data.summary.totalSales)}
              color="#059669"
            />
          )}
          {data.summary.totalRevenue !== undefined && (
            <SummaryCard
              icon={DollarSign}
              label="Total Revenue"
              value={formatCurrency(data.summary.totalRevenue)}
              color="#059669"
            />
          )}
          {data.summary.totalOrders !== undefined && (
            <SummaryCard
              icon={ShoppingCart}
              label="Total Orders"
              value={data.summary.totalOrders.toLocaleString()}
              color="#3B82F6"
            />
          )}
          {data.summary.avgOrderValue !== undefined && (
            <SummaryCard
              icon={TrendingUp}
              label="Avg Order Value"
              value={formatCurrency(data.summary.avgOrderValue)}
              color="#8B5CF6"
            />
          )}
          {data.summary.estimatedProfit !== undefined && (
            <SummaryCard
              icon={TrendingUp}
              label="Estimated Profit"
              value={formatCurrency(data.summary.estimatedProfit)}
              color="#10B981"
            />
          )}
          {data.summary.totalCollected !== undefined && (
            <SummaryCard
              icon={CheckCircle}
              label="Collected"
              value={formatCurrency(data.summary.totalCollected)}
              color="#059669"
            />
          )}
          {data.summary.totalPending !== undefined && data.summary.totalPending > 0 && (
            <SummaryCard
              icon={Clock}
              label="Pending"
              value={formatCurrency(data.summary.totalPending)}
              color="#F59E0B"
            />
          )}
          {data.summary.totalSellingValue !== undefined && (
            <SummaryCard
              icon={Package}
              label="Stock Value"
              value={formatCurrency(data.summary.totalSellingValue)}
              color="#D4AF37"
            />
          )}
          {data.summary.lowStockCount !== undefined && data.summary.lowStockCount > 0 && (
            <SummaryCard
              icon={AlertTriangle}
              label="Low Stock Items"
              value={data.summary.lowStockCount.toString()}
              color="#F59E0B"
            />
          )}
        </div>
      </div>

      {/* Report Table */}
      <div style={{
        background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E5E5",
        overflow: "hidden",
      }}>
        <div style={{ overflowX: "auto" }}>
          <ReportTable records={data.records} reportType={data.reportType} />
        </div>
      </div>
    </div>
  );
}

// ── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <div style={{
      background: "#F9FAFB", borderRadius: 10, padding: "14px 16px",
      border: "1px solid #F3F4F6",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${color}15`, display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={16} style={{ color }} />
        </div>
        <p style={{ fontFamily: FM, fontSize: 11, color: "#9CA3AF",
          textTransform: "uppercase", letterSpacing: "0.05em",
          fontWeight: 600, margin: 0 }}>
          {label}
        </p>
      </div>
      <p style={{ fontFamily: FH, fontSize: 22, fontWeight: 700,
        color: "#111", margin: 0, letterSpacing: "-0.02em" }}>
        {value}
      </p>
    </div>
  );
}

// ── Report Table ─────────────────────────────────────────────────────────────

function ReportTable({ records, reportType }: { records: any[]; reportType: string }) {
  if (!records.length) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <p style={{ fontFamily: FM, fontSize: 14, color: "#9CA3AF" }}>
          No records found for this report
        </p>
      </div>
    );
  }

  // Get table columns based on report type
  const columns = Object.keys(records[0]);

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead style={{ background: "#F9FAFB", borderBottom: "2px solid #E5E5E5" }}>
        <tr>
          {columns.map(col => (
            <th key={col} style={{
              fontFamily: FM, fontSize: 11, color: "#6B7280",
              textTransform: "uppercase", letterSpacing: "0.05em",
              fontWeight: 700, padding: "12px 16px", textAlign: "left",
            }}>
              {col.replace(/_/g, " ")}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((record, idx) => (
          <tr key={idx} style={{
            borderBottom: "1px solid #F3F4F6",
            transition: "background 0.15s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            {columns.map(col => (
              <td key={col} style={{
                fontFamily: FM, fontSize: 13, color: "#374151",
                fontWeight: 500, padding: "12px 16px",
              }}>
                {formatCellValue(record[col], col)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function formatCellValue(value: any, columnName: string): string {
  if (value === null || value === undefined) return "—";
  
  // Currency columns
  if (columnName.includes("amount") || columnName.includes("price") || 
      columnName.includes("value") || columnName.includes("revenue") ||
      columnName.includes("sales") || columnName.includes("discount") ||
      columnName.includes("profit") || columnName.includes("cost")) {
    return formatCurrency(parseFloat(value));
  }
  
  // Date columns
  if (columnName.includes("date") && typeof value === "string" && value.includes("-")) {
    return formatDate(value);
  }
  
  return String(value);
}

// ── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: 400, textAlign: "center",
    }}>
      <FileText size={64} style={{ color: "#E5E5E5", marginBottom: 16 }} />
      <h3 style={{ fontFamily: FH, fontSize: 18, fontWeight: 600,
        color: "#374151", margin: "0 0 8px" }}>
        No Report Selected
      </h3>
      <p style={{ fontFamily: FM, fontSize: 14, color: "#9CA3AF", margin: 0,
        maxWidth: 400 }}>
        Select a report type from the sidebar to generate detailed records.
        Choose your date range and filters, then click on any report to view the data.
      </p>
    </div>
  );
}
