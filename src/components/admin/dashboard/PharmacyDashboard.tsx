"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  Database,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  Download,
  RefreshCw
} from "lucide-react";

const FM = "var(--font-montserrat), 'Montserrat', sans-serif";
const FH = "var(--font-cinzel), 'Cinzel', serif";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  revenue: { current: number; change: number };
  profit: { current: number; change: number };
  orders: { current: number; change: number };
  customers: { current: number; change: number };
  products: { current: number; newThisMonth: number };
  inventoryValue: { current: number; change: number };
  lowStock: number;
  outOfStock: number;
  expiringSoon: number;
  pendingOrders: number;
}

interface TimeFilter {
  label: string;
  value: string;
}

const timeFilters: TimeFilter[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Quarter", value: "quarter" },
  { label: "This Year", value: "year" },
  { label: "Custom Range", value: "custom" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PharmacyDashboard({ userName }: { userName?: string | null }) {
  const [selectedFilter, setSelectedFilter] = useState<string>("month");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    revenue: { current: 0, change: 0 },
    profit: { current: 0, change: 0 },
    orders: { current: 0, change: 0 },
    customers: { current: 0, change: 0 },
    products: { current: 0, newThisMonth: 0 },
    inventoryValue: { current: 0, change: 0 },
    lowStock: 0,
    outOfStock: 0,
    expiringSoon: 0,
    pendingOrders: 0,
  });

  // Fetch real data from APIs
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        ordersStatsRes,
        customersStatsRes,
        productsRes,
        inventoryRes,
        lowStockRes,
        outOfStockRes,
      ] = await Promise.all([
        fetch("/api/orders/stats"),
        fetch("/api/customers/stats"),
        fetch("/api/products?page=1&limit=1"),
        fetch("/api/inventory?page=1&limit=1"),
        fetch("/api/inventory?lowStock=true&page=1&limit=1"),
        fetch("/api/inventory?outOfStock=true&page=1&limit=1"),
      ]);

      const ordersStats = await ordersStatsRes.json();
      const customersStats = await customersStatsRes.json();
      const products = await productsRes.json();
      const inventory = await inventoryRes.json();
      const lowStock = await lowStockRes.json();
      const outOfStock = await outOfStockRes.json();

      // Calculate stats from API responses
      const totalRevenue = ordersStats.data?.revenue?.total || 0;
      const totalOrders = ordersStats.data?.total || 0;
      const pendingOrdersCount = ordersStats.data?.byStatus?.pending || 0;
      
      // Estimate profit (assuming 22% margin - you can adjust this)
      const estimatedProfit = totalRevenue * 0.22;

      setStats({
        revenue: { 
          current: totalRevenue, 
          change: ordersStats.data?.revenue?.changePercent || 0 
        },
        profit: { 
          current: estimatedProfit, 
          change: ordersStats.data?.revenue?.changePercent || 0 
        },
        orders: { 
          current: totalOrders, 
          change: ordersStats.data?.changePercent || 0 
        },
        customers: { 
          current: customersStats.data?.total || 0, 
          change: customersStats.data?.changePercent || 0 
        },
        products: { 
          current: products.pagination?.total || 0, 
          newThisMonth: products.data?.newThisMonth || 0 
        },
        inventoryValue: { 
          current: inventory.data?.totalValue || 0, 
          change: 0 
        },
        lowStock: lowStock.pagination?.total || 0,
        outOfStock: outOfStock.pagination?.total || 0,
        expiringSoon: 0, // Will need expiry API endpoint
        pendingOrders: pendingOrdersCount,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-GB").format(num);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#F8F8F8" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ fontFamily: FM, color: "#666", fontSize: "14px" }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#F8F8F8", minHeight: "100vh", fontFamily: FM }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ 
        backgroundColor: "#FFFFFF", 
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        padding: "24px 32px"
      }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 style={{ 
              fontFamily: FH, 
              fontSize: "32px", 
              fontWeight: 700, 
              color: "#111", 
              marginBottom: "8px",
              letterSpacing: "-0.01em"
            }}>
              Dashboard
            </h1>
            <p style={{ 
              fontFamily: FM, 
              fontSize: "14px", 
              color: "#666",
              marginBottom: "4px"
            }}>
              {getGreeting()}, {userName || "Admin"} 👋
            </p>
            <p style={{ 
              fontFamily: FM, 
              fontSize: "13px", 
              color: "#999"
            }}>
              Here's what's happening with your pharmacy today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              style={{
                fontFamily: FM,
                fontSize: "13px",
                padding: "8px 16px",
                border: "1px solid #D5D5D5",
                borderRadius: "6px",
                backgroundColor: "#FFFFFF",
                color: "#333",
                cursor: "pointer",
                outline: "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              {timeFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            <button
              className="btn-flip-dashboard btn-flip-dashboard-export active:scale-95"
              data-front="📥 Export Report"
              data-back="📥 Export Report"
            />

            <button
              onClick={() => {
                setLastUpdated(new Date());
                fetchDashboardData();
              }}
              className="btn-flip-dashboard btn-flip-dashboard-refresh active:scale-95"
              data-front="🔄"
              data-back="🔄"
              title="Refresh"
            />
            
            <style>{`
              .btn-flip-dashboard {
                opacity: 1; outline: 0; line-height: 36px;
                position: relative; text-align: center;
                letter-spacing: 0.04em; display: inline-block;
                text-decoration: none;
                font-family: var(--font-montserrat),'Montserrat',sans-serif;
                font-size: 13px; font-weight: 600;
                cursor: pointer; border: none; background: transparent; padding: 0;
              }
              .btn-flip-dashboard:hover:after  { opacity: 1; transform: translateY(0) rotateX(0); }
              .btn-flip-dashboard:hover:before { opacity: 0; transform: translateY(50%) rotateX(90deg); }
              .btn-flip-dashboard:after {
                top: 0; left: 0; opacity: 0; width: 100%; display: block;
                transition: 0.42s cubic-bezier(0.23,1,0.32,1);
                position: absolute; content: attr(data-back);
                transform: translateY(-50%) rotateX(90deg);
                padding: 0 18px; border-radius: 6px;
              }
              .btn-flip-dashboard:before {
                top: 0; left: 0; opacity: 1; display: block;
                padding: 0 18px; line-height: 36px;
                transition: 0.42s cubic-bezier(0.23,1,0.32,1);
                position: relative; content: attr(data-front);
                transform: translateY(0) rotateX(0); border-radius: 6px;
              }
              
              .btn-flip-dashboard-export:before {
                background: linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.06) 100%);
                color: #b8952e; border: 1px solid rgba(212,175,55,0.55);
                box-shadow: 0 1px 4px rgba(212,175,55,0.18), inset 0 1px 0 rgba(255,255,255,0.6);
              }
              .btn-flip-dashboard-export:after {
                background: linear-gradient(135deg, #D4AF37 0%, #C9A52E 100%);
                color: #1A1A1A; border: 1px solid rgba(212,175,55,0.6);
                box-shadow: 0 5px 14px rgba(212,175,55,0.38), inset 0 1px 0 rgba(255,255,255,0.2);
              }
              
              .btn-flip-dashboard-refresh:before {
                background: linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%);
                color: #666; border: 1px solid #D5D5D5;
                box-shadow: 0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
                padding: 0 10px;
              }
              .btn-flip-dashboard-refresh:after {
                background: linear-gradient(135deg, #4B5563 0%, #374151 100%);
                color: #E5E7EB; border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 4px 10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15);
                padding: 0 10px;
              }
            `}</style>
          </div>
        </div>

        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "8px",
          fontSize: "12px",
          color: "#999",
          fontFamily: FM
        }}>
          <Clock className="w-3.5 h-3.5" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div style={{ padding: "24px 32px" }}>
        
        {/* ── Executive Summary - KPI Cards ─────────────────────────────────── */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ 
            fontFamily: FH, 
            fontSize: "16px", 
            fontWeight: 600, 
            color: "#111", 
            marginBottom: "16px",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            Executive Summary
          </h2>

          {/* Business KPIs */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "16px",
            marginBottom: "16px"
          }}>
            {/* Revenue */}
            <KPICard
              title="Total Revenue"
              value={formatCurrency(stats.revenue.current)}
              change={stats.revenue.change}
              icon={DollarSign}
              iconColor="#10B981"
            />

            {/* Profit */}
            <KPICard
              title="Net Profit"
              value={formatCurrency(stats.profit.current)}
              change={stats.profit.change}
              icon={TrendingUp}
              iconColor="#3B82F6"
            />

            {/* Orders */}
            <KPICard
              title="Total Orders"
              value={formatNumber(stats.orders.current)}
              change={stats.orders.change}
              icon={ShoppingCart}
              iconColor="#8B5CF6"
            />

            {/* Customers */}
            <KPICard
              title="Customers"
              value={formatNumber(stats.customers.current)}
              change={stats.customers.change}
              icon={Users}
              iconColor="#06B6D4"
            />

            {/* Products */}
            <KPICard
              title="Products"
              value={formatNumber(stats.products.current)}
              subtitle={`+${stats.products.newThisMonth} this month`}
              icon={Package}
              iconColor="#F59E0B"
            />

            {/* Inventory Value */}
            <KPICard
              title="Inventory Value"
              value={formatCurrency(stats.inventoryValue.current).replace("₹", "₹ ")}
              change={stats.inventoryValue.change}
              icon={Database}
              iconColor="#EC4899"
            />
          </div>

          {/* Operational Health */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
            gap: "16px"
          }}>
            <AlertCard
              title="Low Stock"
              value={stats.lowStock}
              subtitle="⚠ Attention Required"
              severity="warning"
            />
            <AlertCard
              title="Out of Stock"
              value={stats.outOfStock}
              subtitle="⚠ Critical"
              severity="critical"
            />
            <AlertCard
              title="Expiring Soon"
              value={stats.expiringSoon}
              subtitle="⚠ Review"
              severity="warning"
            />
            <AlertCard
              title="Pending Orders"
              value={stats.pendingOrders}
              subtitle="● Processing"
              severity="info"
            />
          </div>
        </div>

        {/* ── Revenue & Sales Analytics ─────────────────────────────────── */}
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          padding: "24px",
          border: "1px solid rgba(0,0,0,0.08)",
          marginBottom: "24px"
        }}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ 
              fontFamily: FH, 
              fontSize: "16px", 
              fontWeight: 600, 
              color: "#111", 
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Revenue & Sales Analytics
            </h2>
            <select
              style={{
                fontFamily: FM,
                fontSize: "12px",
                padding: "6px 12px",
                border: "1px solid #E5E5E5",
                borderRadius: "4px",
                backgroundColor: "#FFFFFF",
                color: "#333",
                cursor: "pointer"
              }}
            >
              <option>Revenue</option>
              <option>Orders</option>
              <option>Profit</option>
              <option>Avg Order Value</option>
            </select>
          </div>
          <RevenueTrendChart />
        </div>

        {/* ── Two Column Layout ───────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          
          {/* Revenue vs Cost vs Profit */}
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "24px",
            border: "1px solid rgba(0,0,0,0.08)"
          }}>
            <h2 style={{ 
              fontFamily: FH, 
              fontSize: "14px", 
              fontWeight: 600, 
              color: "#111", 
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Revenue vs Cost vs Profit
            </h2>
            <RevenueVsCostChart />
          </div>

          {/* Sales by Category */}
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "24px",
            border: "1px solid rgba(0,0,0,0.08)"
          }}>
            <h2 style={{ 
              fontFamily: FH, 
              fontSize: "14px", 
              fontWeight: 600, 
              color: "#111", 
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Sales by Category
            </h2>
            <SalesByCategoryChart />
          </div>
        </div>

        {/* ── Inventory Health ────────────────────────────────────────── */}
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          padding: "24px",
          border: "1px solid rgba(0,0,0,0.08)",
          marginBottom: "24px"
        }}>
          <h2 style={{ 
            fontFamily: FH, 
            fontSize: "16px", 
            fontWeight: 600, 
            color: "#111", 
            marginBottom: "16px",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            Inventory Health
          </h2>
          <InventoryHealthSection stats={stats} />
        </div>

        {/* ── Three Column Layout ─────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "24px" }}>
          
          {/* Order Analytics */}
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "24px",
            border: "1px solid rgba(0,0,0,0.08)"
          }}>
            <h2 style={{ 
              fontFamily: FH, 
              fontSize: "14px", 
              fontWeight: 600, 
              color: "#111", 
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Order Status
            </h2>
            <OrderStatusChart />
          </div>

          {/* Customer Analytics */}
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "24px",
            border: "1px solid rgba(0,0,0,0.08)"
          }}>
            <h2 style={{ 
              fontFamily: FH, 
              fontSize: "14px", 
              fontWeight: 600, 
              color: "#111", 
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Customer Growth
            </h2>
            <CustomerGrowthChart />
          </div>

          {/* Payment Methods */}
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "24px",
            border: "1px solid rgba(0,0,0,0.08)"
          }}>
            <h2 style={{ 
              fontFamily: FH, 
              fontSize: "14px", 
              fontWeight: 600, 
              color: "#111", 
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Payment Methods
            </h2>
            <PaymentMethodsChart />
          </div>
        </div>

        {/* ── Top Performing Products ─────────────────────────────────── */}
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "8px",
          padding: "24px",
          border: "1px solid rgba(0,0,0,0.08)",
          marginBottom: "24px"
        }}>
          <h2 style={{ 
            fontFamily: FH, 
            fontSize: "16px", 
            fontWeight: 600, 
            color: "#111", 
            marginBottom: "16px",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            Top Selling Products
          </h2>
          <TopProductsTable />
        </div>

        {/* ── Bottom Row: Alerts + Activity ───────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          
          {/* Action Center */}
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "24px",
            border: "1px solid rgba(0,0,0,0.08)"
          }}>
            <h2 style={{ 
              fontFamily: FH, 
              fontSize: "14px", 
              fontWeight: 600, 
              color: "#111", 
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Needs Attention
            </h2>
            <ActionCenter stats={stats} />
          </div>

          {/* Recent Activity */}
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            padding: "24px",
            border: "1px solid rgba(0,0,0,0.08)"
          }}>
            <h2 style={{ 
              fontFamily: FH, 
              fontSize: "14px", 
              fontWeight: 600, 
              color: "#111", 
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Recent Activity
            </h2>
            <RecentActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── KPI Card Component ───────────────────────────────────────────────────────

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  subtitle?: string;
  icon: React.ElementType;
  iconColor: string;
}

function KPICard({ title, value, change, subtitle, icon: Icon, iconColor }: KPICardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "8px",
      padding: "20px",
      border: "1px solid rgba(0,0,0,0.08)",
      transition: "all 0.2s ease",
      cursor: "default"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.transform = "translateY(0)";
    }}>
      <div className="flex items-start justify-between mb-3">
        <p style={{
          fontFamily: FM,
          fontSize: "12px",
          color: "#666",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.05em"
        }}>
          {title}
        </p>
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          backgroundColor: `${iconColor}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
      </div>

      <div>
        <p style={{
          fontFamily: FH,
          fontSize: "28px",
          fontWeight: 700,
          color: "#111",
          marginBottom: "4px",
          lineHeight: 1
        }}>
          {value}
        </p>

        {change !== undefined && (
          <div className="flex items-center gap-1">
            {isPositive && <TrendingUp className="w-3.5 h-3.5 text-green-600" />}
            {isNegative && <TrendingDown className="w-3.5 h-3.5 text-red-600" />}
            <span style={{
              fontFamily: FM,
              fontSize: "12px",
              fontWeight: 600,
              color: isPositive ? "#10B981" : isNegative ? "#EF4444" : "#666"
            }}>
              {isPositive ? "+" : ""}{change}%
            </span>
          </div>
        )}

        {subtitle && (
          <p style={{
            fontFamily: FM,
            fontSize: "12px",
            color: "#999",
            marginTop: "4px"
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Alert Card Component ─────────────────────────────────────────────────────

interface AlertCardProps {
  title: string;
  value: number;
  subtitle: string;
  severity: "warning" | "critical" | "info";
}

function AlertCard({ title, value, subtitle, severity }: AlertCardProps) {
  const colors = {
    warning: { bg: "#FEF3C7", text: "#D97706", border: "#FCD34D" },
    critical: { bg: "#FEE2E2", text: "#DC2626", border: "#FCA5A5" },
    info: { bg: "#DBEAFE", text: "#2563EB", border: "#93C5FD" },
  };

  const color = colors[severity];

  return (
    <div style={{
      backgroundColor: color.bg,
      borderRadius: "8px",
      padding: "20px",
      border: `1px solid ${color.border}`,
      textAlign: "center"
    }}>
      <p style={{
        fontFamily: FM,
        fontSize: "11px",
        color: "#666",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: "8px"
      }}>
        {title}
      </p>
      <p style={{
        fontFamily: FH,
        fontSize: "36px",
        fontWeight: 700,
        color: color.text,
        lineHeight: 1,
        marginBottom: "8px"
      }}>
        {value}
      </p>
      <p style={{
        fontFamily: FM,
        fontSize: "11px",
        color: color.text,
        fontWeight: 600
      }}>
        {subtitle}
      </p>
    </div>
  );
}

// ─── Revenue Trend Chart ──────────────────────────────────────────────────────

function RevenueTrendChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Generate last 7 days with mock data based on current stats
        // In production, you'd add a daily breakdown endpoint
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const baseRevenue = 15000;
        const chartData = days.map(day => ({
          day,
          revenue: Math.floor(baseRevenue + Math.random() * 10000)
        }));
        setData(chartData);
      } catch (error) {
        console.error("Failed to fetch revenue trend:", error);
        setData([
          { day: "Mon", revenue: 12500 },
          { day: "Tue", revenue: 15200 },
          { day: "Wed", revenue: 13800 },
          { day: "Thu", revenue: 18900 },
          { day: "Fri", revenue: 21500 },
          { day: "Sat", revenue: 24300 },
          { day: "Sun", revenue: 19800 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px", color: "#999", fontFamily: FM, fontSize: "13px" }}>Loading chart data...</div>;
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue || 0));

  return (
    <div style={{ padding: "20px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "200px" }}>
        {data.map((item, idx) => {
          const height = (item.revenue / maxRevenue) * 180;
          return (
            <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  height: `${height}px`,
                  width: "100%",
                  backgroundColor: "#D4AF37",
                  borderRadius: "4px 4px 0 0",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  position: "relative"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#B8941F";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#D4AF37";
                }}
                title={`£${item.revenue?.toLocaleString()}`}
              />
              <p style={{ fontFamily: FM, fontSize: "11px", color: "#666", fontWeight: 500 }}>
                {item.day}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Revenue vs Cost vs Profit Chart ──────────────────────────────────────────

function RevenueVsCostChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Mock data - replace with API call
    setData([
      { label: "Week 1", revenue: 45000, cost: 35100, profit: 9900 },
      { label: "Week 2", revenue: 52000, cost: 40560, profit: 11440 },
      { label: "Week 3", revenue: 48500, cost: 37830, profit: 10670 },
      { label: "Week 4", revenue: 58000, cost: 45240, profit: 12760 },
    ]);
  }, []);

  const maxValue = Math.max(...data.flatMap(d => [d.revenue, d.cost, d.profit]));

  return (
    <div style={{ padding: "20px 0" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {data.map((item, idx) => (
          <div key={idx}>
            <p style={{ fontFamily: FM, fontSize: "12px", color: "#666", marginBottom: "6px", fontWeight: 500 }}>
              {item.label}
            </p>
            <div style={{ display: "flex", gap: "4px", height: "24px" }}>
              <div
                style={{
                  width: `${(item.revenue / maxValue) * 100}%`,
                  backgroundColor: "#3B82F6",
                  borderRadius: "4px",
                  transition: "all 0.3s ease"
                }}
                title={`Revenue: £${item.revenue.toLocaleString()}`}
              />
              <div
                style={{
                  width: `${(item.cost / maxValue) * 100}%`,
                  backgroundColor: "#EF4444",
                  borderRadius: "4px",
                  transition: "all 0.3s ease"
                }}
                title={`Cost: £${item.cost.toLocaleString()}`}
              />
              <div
                style={{
                  width: `${(item.profit / maxValue) * 100}%`,
                  backgroundColor: "#10B981",
                  borderRadius: "4px",
                  transition: "all 0.3s ease"
                }}
                title={`Profit: £${item.profit.toLocaleString()}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", marginTop: "20px", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "12px", height: "12px", backgroundColor: "#3B82F6", borderRadius: "2px" }} />
          <span style={{ fontFamily: FM, fontSize: "11px", color: "#666" }}>Revenue</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "12px", height: "12px", backgroundColor: "#EF4444", borderRadius: "2px" }} />
          <span style={{ fontFamily: FM, fontSize: "11px", color: "#666" }}>Cost</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "12px", height: "12px", backgroundColor: "#10B981", borderRadius: "2px" }} />
          <span style={{ fontFamily: FM, fontSize: "11px", color: "#666" }}>Profit</span>
        </div>
      </div>
    </div>
  );
}

// ─── Sales by Category Chart ──────────────────────────────────────────────────

function SalesByCategoryChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/product-categories?page=1&limit=100");
        const result = await res.json();
        
        console.log("Categories API Response:", result);
        
        if (result.success && result.data && result.data.length > 0) {
          // Use real category names from database - field is 'categoryName', not 'name'
          const categories = result.data || [];
          const chartData = categories.slice(0, 6).map((cat: any) => ({
            name: cat.categoryName || "Unnamed Category",
            sales: Math.floor(Math.random() * 50000) + 10000 // Mock sales - replace with real analytics when available
          }));
          
          // Sort by sales descending
          chartData.sort((a, b) => b.sales - a.sales);
          
          console.log("Chart Data:", chartData);
          setData(chartData);
        } else {
          console.log("No categories found, using fallback data");
          // Fallback if no categories found
          setData([
            { name: "Pain Relief", sales: 45200 },
            { name: "Vitamins", sales: 38500 },
            { name: "Cold & Flu", sales: 32800 },
            { name: "First Aid", sales: 28900 },
            { name: "Skin Care", sales: 25600 },
            { name: "Digestive", sales: 21300 },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch category sales:", error);
        setData([
          { name: "Pain Relief", sales: 45200 },
          { name: "Vitamins", sales: 38500 },
          { name: "Cold & Flu", sales: 32800 },
          { name: "First Aid", sales: 28900 },
          { name: "Skin Care", sales: 25600 },
          { name: "Digestive", sales: 21300 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px", color: "#999", fontFamily: FM, fontSize: "13px" }}>Loading...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#999", fontFamily: FM, fontSize: "13px" }}>
        No categories found
      </div>
    );
  }

  const maxSales = Math.max(...data.map(d => d.sales));

  return (
    <div style={{ padding: "20px 0" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {data.map((item, idx) => (
          <div key={idx}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ 
                fontFamily: FM, 
                fontSize: "13px", 
                color: "#333", 
                fontWeight: 600,
                minWidth: "140px"
              }}>
                {item.name || "Unknown"}
              </span>
              <span style={{ 
                fontFamily: FM, 
                fontSize: "13px", 
                color: "#111", 
                fontWeight: 700,
                marginLeft: "16px"
              }}>
                £{item.sales.toLocaleString()}
              </span>
            </div>
            <div style={{ 
              width: "100%", 
              height: "10px", 
              backgroundColor: "#F3F4F6", 
              borderRadius: "5px", 
              overflow: "hidden" 
            }}>
              <div
                style={{
                  width: `${(item.sales / maxSales) * 100}%`,
                  height: "100%",
                  backgroundColor: "#D4AF37",
                  transition: "all 0.3s ease"
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Inventory Health Section ─────────────────────────────────────────────────

function InventoryHealthSection({ stats }: { stats: DashboardStats }) {
  const total = stats.products.current;
  const inStock = total - stats.outOfStock - stats.lowStock;
  
  const inventoryData = [
    { label: "In Stock", value: inStock, color: "#10B981", percentage: (inStock / total * 100).toFixed(1) },
    { label: "Low Stock", value: stats.lowStock, color: "#F59E0B", percentage: (stats.lowStock / total * 100).toFixed(1) },
    { label: "Out of Stock", value: stats.outOfStock, color: "#EF4444", percentage: (stats.outOfStock / total * 100).toFixed(1) },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "40px", alignItems: "center" }}>
      {/* Donut Chart */}
      <div style={{ position: "relative", width: "250px", height: "250px", margin: "0 auto" }}>
        <svg width="250" height="250" viewBox="0 0 250 250">
          <circle cx="125" cy="125" r="100" fill="none" stroke="#F3F4F6" strokeWidth="40" />
          {inventoryData.map((item, idx) => {
            const prevPercentages = inventoryData.slice(0, idx).reduce((sum, d) => sum + parseFloat(d.percentage), 0);
            const dashArray = (parseFloat(item.percentage) / 100) * 628.32;
            const dashOffset = 628.32 - (prevPercentages / 100) * 628.32;
            
            return (
              <circle
                key={idx}
                cx="125"
                cy="125"
                r="100"
                fill="none"
                stroke={item.color}
                strokeWidth="40"
                strokeDasharray={`${dashArray} 628.32`}
                strokeDashoffset={-dashOffset}
                transform="rotate(-90 125 125)"
              />
            );
          })}
        </svg>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center"
        }}>
          <p style={{ fontFamily: FH, fontSize: "32px", fontWeight: 700, color: "#111", lineHeight: 1 }}>
            {total}
          </p>
          <p style={{ fontFamily: FM, fontSize: "12px", color: "#666", marginTop: "4px" }}>
            Total Products
          </p>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {inventoryData.map((item, idx) => (
          <div key={idx} style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            padding: "12px 16px",
            backgroundColor: "#F9FAFB",
            borderRadius: "6px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ 
                width: "16px", 
                height: "16px", 
                backgroundColor: item.color, 
                borderRadius: "4px" 
              }} />
              <span style={{ fontFamily: FM, fontSize: "13px", color: "#666", fontWeight: 500 }}>
                {item.label}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontFamily: FM, fontSize: "14px", color: "#111", fontWeight: 600 }}>
                {item.value}
              </span>
              <span style={{ fontFamily: FM, fontSize: "13px", color: "#999", minWidth: "50px", textAlign: "right" }}>
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Order Status Chart ───────────────────────────────────────────────────────

function OrderStatusChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/orders/stats");
        const result = await res.json();
        
        const statusData = result.data?.byStatus || {};
        const chartData = [
          { status: "Pending", count: statusData.pending || 0, color: "#F59E0B" },
          { status: "Processing", count: statusData.processing || 0, color: "#3B82F6" },
          { status: "Shipped", count: statusData.shipped || 0, color: "#8B5CF6" },
          { status: "Delivered", count: statusData.delivered || 0, color: "#10B981" },
          { status: "Cancelled", count: statusData.cancelled || 0, color: "#EF4444" },
        ];
        setData(chartData);
      } catch (error) {
        console.error("Failed to fetch order status:", error);
        setData([
          { status: "Pending", count: 23, color: "#F59E0B" },
          { status: "Processing", count: 45, color: "#3B82F6" },
          { status: "Shipped", count: 67, color: "#8B5CF6" },
          { status: "Delivered", count: 189, color: "#10B981" },
          { status: "Cancelled", count: 8, color: "#EF4444" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px", color: "#999", fontFamily: FM, fontSize: "13px" }}>Loading...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {data.map((item, idx) => (
        <div key={idx} style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          padding: "10px 0",
          borderBottom: idx < data.length - 1 ? "1px solid #F3F4F6" : "none"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ 
              width: "10px", 
              height: "10px", 
              backgroundColor: item.color, 
              borderRadius: "50%" 
            }} />
            <span style={{ fontFamily: FM, fontSize: "13px", color: "#666" }}>
              {item.status}
            </span>
          </div>
          <span style={{ fontFamily: FM, fontSize: "16px", color: "#111", fontWeight: 600 }}>
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Customer Growth Chart ────────────────────────────────────────────────────

function CustomerGrowthChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all orders to analyze customer behavior
        const res = await fetch("/api/orders?page=1&limit=1000");
        const result = await res.json();
        
        if (result.success && result.data) {
          const orders = result.data;
          
          // Group orders by month and track unique customers
          const monthlyData: Record<string, { new: Set<string>; returning: Set<string>; allCustomers: Set<string> }> = {};
          const allTimeCustomers = new Set<string>();
          
          orders.forEach((order: any) => {
            const date = new Date(order.createdAt);
            const monthKey = date.toLocaleString('en-US', { month: 'short' });
            const customerId = order.customerId || order.guestEmail || 'guest';
            
            if (!monthlyData[monthKey]) {
              monthlyData[monthKey] = { 
                new: new Set(), 
                returning: new Set(),
                allCustomers: new Set()
              };
            }
            
            monthlyData[monthKey].allCustomers.add(customerId);
            
            // If customer hasn't ordered before this month, they're new
            if (!allTimeCustomers.has(customerId)) {
              monthlyData[monthKey].new.add(customerId);
              allTimeCustomers.add(customerId);
            } else {
              monthlyData[monthKey].returning.add(customerId);
            }
          });
          
          // Convert to chart format (last 6 months)
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const currentMonth = new Date().getMonth();
          const last6Months = [];
          
          for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            last6Months.push(months[monthIndex]);
          }
          
          const chartData = last6Months.map(month => ({
            month,
            new: monthlyData[month]?.new.size || 0,
            returning: monthlyData[month]?.returning.size || 0
          }));
          
          setData(chartData);
        } else {
          // Fallback data
          setData([
            { month: "Jan", new: 45, returning: 120 },
            { month: "Feb", new: 52, returning: 145 },
            { month: "Mar", new: 61, returning: 168 },
            { month: "Apr", new: 48, returning: 182 },
            { month: "May", new: 71, returning: 201 },
            { month: "Jun", new: 65, returning: 225 },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch customer growth:", error);
        setData([
          { month: "Jan", new: 45, returning: 120 },
          { month: "Feb", new: 52, returning: 145 },
          { month: "Mar", new: 61, returning: 168 },
          { month: "Apr", new: 48, returning: 182 },
          { month: "May", new: 71, returning: 201 },
          { month: "Jun", new: 65, returning: 225 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px", color: "#999", fontFamily: FM, fontSize: "13px" }}>Loading...</div>;
  }

  const maxValue = Math.max(...data.flatMap(d => [d.new || 0, d.returning || 0]), 1);

  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "150px", marginBottom: "16px" }}>
        {data.map((item, idx) => {
          const newHeight = ((item.new || 0) / maxValue) * 130;
          const returningHeight = ((item.returning || 0) / maxValue) * 130;
          
          return (
            <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", width: "100%" }}>
                <div
                  style={{
                    height: `${newHeight}px`,
                    flex: 1,
                    backgroundColor: "#3B82F6",
                    borderRadius: "3px 3px 0 0"
                  }}
                  title={`New: ${item.new}`}
                />
                <div
                  style={{
                    height: `${returningHeight}px`,
                    flex: 1,
                    backgroundColor: "#10B981",
                    borderRadius: "3px 3px 0 0"
                  }}
                  title={`Returning: ${item.returning}`}
                />
              </div>
              <p style={{ fontFamily: FM, fontSize: "10px", color: "#666" }}>
                {item.month}
              </p>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "10px", height: "10px", backgroundColor: "#3B82F6", borderRadius: "2px" }} />
          <span style={{ fontFamily: FM, fontSize: "11px", color: "#666" }}>New</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "10px", height: "10px", backgroundColor: "#10B981", borderRadius: "2px" }} />
          <span style={{ fontFamily: FM, fontSize: "11px", color: "#666" }}>Returning</span>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Methods Chart ────────────────────────────────────────────────────

function PaymentMethodsChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders and calculate payment method distribution
        const res = await fetch("/api/orders?page=1&limit=1000"); // Get all orders
        const result = await res.json();
        
        if (result.success && result.data) {
          const orders = result.data;
          
          // Count payment methods
          const methodCounts: Record<string, number> = {};
          const methodAmounts: Record<string, number> = {};
          
          orders.forEach((order: any) => {
            const method = order.paymentMethod || 'unknown';
            methodCounts[method] = (methodCounts[method] || 0) + 1;
            methodAmounts[method] = (methodAmounts[method] || 0) + (order.totalAmount || 0);
          });
          
          const total = Object.values(methodCounts).reduce((sum, count) => sum + count, 0);
          
          // Map to display format
          const methodMap: Record<string, { label: string; color: string }> = {
            card: { label: 'Card Payment', color: '#3B82F6' },
            cash: { label: 'Cash', color: '#F59E0B' },
            online: { label: 'Online Payment', color: '#10B981' },
            upi: { label: 'UPI', color: '#8B5CF6' },
          };
          
          const chartData = Object.entries(methodCounts).map(([method, count]) => ({
            method: methodMap[method]?.label || method,
            amount: Math.round(methodAmounts[method] || 0),
            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
            color: methodMap[method]?.color || '#6B7280'
          }));
          
          // Sort by percentage descending
          chartData.sort((a, b) => b.percentage - a.percentage);
          
          setData(chartData);
        } else {
          // Fallback data
          setData([
            { method: "Card Payment", amount: 145000, percentage: 45, color: "#3B82F6" },
            { method: "Cash", amount: 52000, percentage: 30, color: "#F59E0B" },
            { method: "Online Payment", amount: 98000, percentage: 16, color: "#10B981" },
            { method: "UPI", amount: 29000, percentage: 9, color: "#8B5CF6" },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch payment methods:", error);
        setData([
          { method: "Card Payment", amount: 145000, percentage: 45, color: "#3B82F6" },
          { method: "Cash", amount: 52000, percentage: 30, color: "#F59E0B" },
          { method: "Online Payment", amount: 98000, percentage: 16, color: "#10B981" },
          { method: "UPI", amount: 29000, percentage: 9, color: "#8B5CF6" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px", color: "#999", fontFamily: FM, fontSize: "13px" }}>Loading...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#999", fontFamily: FM, fontSize: "13px" }}>
        No payment data available
      </div>
    );
  }

  return (
    <div style={{ padding: "10px 0" }}>
      {/* Donut Chart */}
      <div style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto 20px" }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="50" fill="none" stroke="#F3F4F6" strokeWidth="20" />
          {data.map((item, idx) => {
            const prevPercentages = data.slice(0, idx).reduce((sum, d) => sum + d.percentage, 0);
            const dashArray = (item.percentage / 100) * 314.16;
            const dashOffset = 314.16 - (prevPercentages / 100) * 314.16;
            
            return (
              <circle
                key={idx}
                cx="70"
                cy="70"
                r="50"
                fill="none"
                stroke={item.color}
                strokeWidth="20"
                strokeDasharray={`${dashArray} 314.16`}
                strokeDashoffset={-dashOffset}
                transform="rotate(-90 70 70)"
              />
            );
          })}
        </svg>
      </div>

      {/* Payment Methods List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {data.map((item, idx) => (
          <div key={idx} style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ 
                width: "10px", 
                height: "10px", 
                backgroundColor: item.color, 
                borderRadius: "2px" 
              }} />
              <span style={{ fontFamily: FM, fontSize: "12px", color: "#666" }}>
                {item.method}
              </span>
            </div>
            <span style={{ fontFamily: FM, fontSize: "12px", color: "#111", fontWeight: 600 }}>
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Top Products Table ───────────────────────────────────────────────────────

function TopProductsTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch REAL sales analytics from new endpoint
        const res = await fetch("/api/analytics/top-products?limit=5");
        const result = await res.json();
        
        console.log("Top Products Analytics Response:", result);
        
        if (result.success && result.data && result.data.length > 0) {
          const chartData = result.data.map((p: any) => ({
            name: p.productName || "Unnamed Product",
            sales: p.sales || 0,
            revenue: Math.round(p.revenue || 0),
            trend: p.trend || 0
          }));
          
          console.log("Top Products Chart Data:", chartData);
          setData(chartData);
        } else {
          // No sales data yet - show message
          setData([]);
        }
      } catch (error) {
        console.error("Failed to fetch top products:", error);
        // Show empty state on error
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px", color: "#999", fontFamily: FM, fontSize: "13px" }}>Loading...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#999", fontFamily: FM, fontSize: "13px" }}>
        <p style={{ fontSize: "16px", marginBottom: "8px" }}>📦</p>
        <p>No sales data available yet</p>
        <p style={{ fontSize: "12px", marginTop: "8px", color: "#BBB" }}>
          Complete some orders to see top selling products
        </p>
      </div>
    );
  }

  const maxSales = Math.max(...data.map(d => d.sales), 1);

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #E5E7EB" }}>
            <th style={{ 
              fontFamily: FM, 
              fontSize: "11px", 
              color: "#666", 
              textAlign: "left", 
              padding: "12px 0",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
              width: "35%"
            }}>
              Product
            </th>
            <th style={{ 
              fontFamily: FM, 
              fontSize: "11px", 
              color: "#666", 
              textAlign: "right", 
              padding: "12px 0",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
              width: "15%"
            }}>
              Sales
            </th>
            <th style={{ 
              fontFamily: FM, 
              fontSize: "11px", 
              color: "#666", 
              textAlign: "right", 
              padding: "12px 0",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
              width: "15%"
            }}>
              Revenue
            </th>
            <th style={{ 
              fontFamily: FM, 
              fontSize: "11px", 
              color: "#666", 
              textAlign: "right", 
              padding: "12px 0",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
              width: "15%"
            }}>
              Trend
            </th>
            <th style={{ 
              fontFamily: FM, 
              fontSize: "11px", 
              color: "#666", 
              textAlign: "left", 
              padding: "12px 0 12px 16px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
              width: "20%"
            }}>
              Performance
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid #F3F4F6" }}>
              <td style={{ 
                fontFamily: FM, 
                fontSize: "13px", 
                color: "#111", 
                padding: "16px 0",
                fontWeight: 600
              }}>
                {item.name}
              </td>
              <td style={{ 
                fontFamily: FM, 
                fontSize: "13px", 
                color: "#111", 
                textAlign: "right", 
                padding: "16px 0",
                fontWeight: 600
              }}>
                {item.sales.toLocaleString()}
              </td>
              <td style={{ 
                fontFamily: FM, 
                fontSize: "13px", 
                color: "#111", 
                textAlign: "right", 
                padding: "16px 0",
                fontWeight: 600
              }}>
                £{item.revenue.toLocaleString()}
              </td>
              <td style={{ 
                textAlign: "right", 
                padding: "16px 0"
              }}>
                {item.trend !== 0 ? (
                  <span style={{
                    fontFamily: FM,
                    fontSize: "12px",
                    fontWeight: 600,
                    color: item.trend > 0 ? "#10B981" : "#EF4444",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    {item.trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {Math.abs(item.trend)}%
                  </span>
                ) : (
                  <span style={{ fontFamily: FM, fontSize: "12px", color: "#999" }}>—</span>
                )}
              </td>
              <td style={{ padding: "16px 0 16px 16px" }}>
                <div style={{ 
                  width: "120px", 
                  height: "8px", 
                  backgroundColor: "#F3F4F6", 
                  borderRadius: "4px", 
                  overflow: "hidden" 
                }}>
                  <div
                    style={{
                      width: `${(item.sales / maxSales) * 100}%`,
                      height: "100%",
                      backgroundColor: "#D4AF37",
                      transition: "all 0.3s ease"
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Action Center ────────────────────────────────────────────────────────────

function ActionCenter({ stats }: { stats: DashboardStats }) {
  const alerts = [
    {
      title: "Low Stock Alert",
      description: `${stats.lowStock} products need restocking`,
      severity: "warning" as const,
      action: "Review Inventory",
      link: "/admin/inventory?filter=lowStock"
    },
    {
      title: "Out of Stock",
      description: `${stats.outOfStock} products are unavailable`,
      severity: "critical" as const,
      action: "Restock Now",
      link: "/admin/inventory?filter=outOfStock"
    },
    {
      title: "Pending Orders",
      description: `${stats.pendingOrders} orders awaiting processing`,
      severity: "info" as const,
      action: "Process Orders",
      link: "/admin/orders?status=pending"
    },
    {
      title: "Expiring Soon",
      description: `${stats.expiringSoon} products expiring this month`,
      severity: "warning" as const,
      action: "Review Expiry",
      link: "/admin/inventory?filter=expiring"
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {alerts.filter(alert => {
        // Only show alerts with non-zero values
        if (alert.title.includes("Low Stock")) return stats.lowStock > 0;
        if (alert.title.includes("Out of Stock")) return stats.outOfStock > 0;
        if (alert.title.includes("Pending")) return stats.pendingOrders > 0;
        if (alert.title.includes("Expiring")) return stats.expiringSoon > 0;
        return false;
      }).map((alert, idx) => {
        const colors = {
          warning: { bg: "#FEF3C7", border: "#FCD34D", text: "#D97706" },
          critical: { bg: "#FEE2E2", border: "#FCA5A5", text: "#DC2626" },
          info: { bg: "#DBEAFE", border: "#93C5FD", text: "#2563EB" },
        };
        const color = colors[alert.severity];

        return (
          <div
            key={idx}
            style={{
              backgroundColor: color.bg,
              border: `1px solid ${color.border}`,
              borderRadius: "6px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div>
              <p style={{ 
                fontFamily: FM, 
                fontSize: "13px", 
                color: "#111", 
                fontWeight: 600, 
                marginBottom: "4px" 
              }}>
                {alert.title}
              </p>
              <p style={{ 
                fontFamily: FM, 
                fontSize: "12px", 
                color: "#666" 
              }}>
                {alert.description}
              </p>
            </div>
            <button
              onClick={() => window.location.href = alert.link}
              style={{
                fontFamily: FM,
                fontSize: "12px",
                padding: "6px 12px",
                backgroundColor: "#FFFFFF",
                border: `1px solid ${color.text}`,
                borderRadius: "4px",
                color: color.text,
                cursor: "pointer",
                fontWeight: 600,
                whiteSpace: "nowrap"
              }}
            >
              {alert.action}
            </button>
          </div>
        );
      })}
      
      {alerts.every(alert => {
        if (alert.title.includes("Low Stock")) return stats.lowStock === 0;
        if (alert.title.includes("Out of Stock")) return stats.outOfStock === 0;
        if (alert.title.includes("Pending")) return stats.pendingOrders === 0;
        if (alert.title.includes("Expiring")) return stats.expiringSoon === 0;
        return true;
      }) && (
        <div style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "#999",
          fontFamily: FM,
          fontSize: "13px"
        }}>
          <p style={{ fontSize: "32px", marginBottom: "8px" }}>✓</p>
          All systems operational
        </div>
      )}
    </div>
  );
}

// ─── Recent Activity Feed ─────────────────────────────────────────────────────

function RecentActivityFeed() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // Mock data - in production, fetch from activity logs API
    setActivities([
      { type: "order", message: "New order #1234 received", time: "2 min ago", icon: ShoppingCart },
      { type: "inventory", message: "Stock updated for Paracetamol", time: "15 min ago", icon: Package },
      { type: "customer", message: "New customer registered", time: "32 min ago", icon: Users },
      { type: "alert", message: "Low stock alert: Ibuprofen", time: "1 hour ago", icon: AlertTriangle },
      { type: "order", message: "Order #1230 delivered", time: "2 hours ago", icon: ShoppingCart },
    ]);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {activities.map((activity, idx) => {
        const Icon = activity.icon;
        return (
          <div
            key={idx}
            style={{
              padding: "14px 0",
              borderBottom: idx < activities.length - 1 ? "1px solid #F3F4F6" : "none",
              display: "flex",
              alignItems: "start",
              gap: "12px"
            }}
          >
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              backgroundColor: "#F3F4F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <Icon className="w-4 h-4" style={{ color: "#666" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ 
                fontFamily: FM, 
                fontSize: "13px", 
                color: "#111", 
                marginBottom: "4px",
                fontWeight: 500
              }}>
                {activity.message}
              </p>
              <p style={{ 
                fontFamily: FM, 
                fontSize: "11px", 
                color: "#999" 
              }}>
                {activity.time}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
