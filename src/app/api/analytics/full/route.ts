export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import sequelize from "@/lib/database/sequelize";
import { QueryTypes } from "sequelize";

/**
 * GET /api/analytics/full
 * One consolidated endpoint for the Analytics page.
 * Query params:
 *   period = "today" | "7d" | "30d" | "90d" | "1y" | "custom"
 *   from   = ISO date (for custom)
 *   to     = ISO date (for custom)
 */

function getPeriodDates(period: string, from?: string, to?: string) {
  const now = new Date();
  const toDate = to ? new Date(to) : now;
  let fromDate: Date;
  let prevFromDate: Date;
  let prevToDate: Date;

  switch (period) {
    case "today":
      fromDate = new Date(now); fromDate.setHours(0, 0, 0, 0);
      prevFromDate = new Date(fromDate); prevFromDate.setDate(prevFromDate.getDate() - 1);
      prevToDate = new Date(fromDate);
      break;
    case "7d":
      fromDate = new Date(now); fromDate.setDate(now.getDate() - 7);
      prevFromDate = new Date(now); prevFromDate.setDate(now.getDate() - 14);
      prevToDate = new Date(fromDate);
      break;
    case "90d":
      fromDate = new Date(now); fromDate.setDate(now.getDate() - 90);
      prevFromDate = new Date(now); prevFromDate.setDate(now.getDate() - 180);
      prevToDate = new Date(fromDate);
      break;
    case "1y":
      fromDate = new Date(now); fromDate.setFullYear(now.getFullYear() - 1);
      prevFromDate = new Date(now); prevFromDate.setFullYear(now.getFullYear() - 2);
      prevToDate = new Date(fromDate);
      break;
    case "custom":
      fromDate = from ? new Date(from) : new Date(now.setDate(now.getDate() - 30));
      const diff = toDate.getTime() - fromDate.getTime();
      prevFromDate = new Date(fromDate.getTime() - diff);
      prevToDate = new Date(fromDate);
      break;
    default: // 30d
      fromDate = new Date(now); fromDate.setDate(now.getDate() - 30);
      prevFromDate = new Date(now); prevFromDate.setDate(now.getDate() - 60);
      prevToDate = new Date(fromDate);
  }
  return {
    fromDate, toDate, prevFromDate, prevToDate,
    fromStr: fromDate.toISOString(), toStr: toDate.toISOString(),
    prevFromStr: prevFromDate.toISOString(), prevToStr: prevToDate.toISOString(),
  };
}

const pct = (cur: number, prev: number) =>
  prev === 0 ? (cur > 0 ? 100 : 0) : parseFloat((((cur - prev) / prev) * 100).toFixed(1));

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30d";
    const from   = searchParams.get("from")   || undefined;
    const to     = searchParams.get("to")     || undefined;
    const { fromStr, toStr, prevFromStr, prevToStr } = getPeriodDates(period, from, to);

    // ── 1. KPI Summary (current + previous period for % change) ───────────────
    const [[cur], [prev]] = await Promise.all([
      sequelize.query<{
        total_orders: string; total_revenue: string; avg_order: string;
        total_items: string; tax_collected: string; discount_given: string;
        delivered_orders: string; cancelled_orders: string; refunded_orders: string;
      }>(`
        SELECT
          COUNT(DISTINCT o.id)                                               AS total_orders,
          COALESCE(SUM(CASE WHEN o."orderStatus"!='cancelled' THEN o."totalAmount" ELSE 0 END),0) AS total_revenue,
          COALESCE(AVG(CASE WHEN o."orderStatus"!='cancelled' THEN o."totalAmount" END),0)        AS avg_order,
          COALESCE(SUM(CASE WHEN o."orderStatus"!='cancelled' THEN oi.quantity  ELSE 0 END),0)    AS total_items,
          COALESCE(SUM(CASE WHEN o."orderStatus"!='cancelled' THEN o."taxAmount" ELSE 0 END),0)   AS tax_collected,
          COALESCE(SUM(CASE WHEN o."orderStatus"!='cancelled' THEN o."discountAmount" ELSE 0 END),0) AS discount_given,
          COUNT(CASE WHEN o."orderStatus"='delivered' THEN 1 END)           AS delivered_orders,
          COUNT(CASE WHEN o."orderStatus"='cancelled' THEN 1 END)           AS cancelled_orders,
          COUNT(CASE WHEN o."paymentStatus"='refunded' THEN 1 END)          AS refunded_orders
        FROM orders o
        LEFT JOIN order_items oi ON oi."orderId"=o.id
        WHERE o."createdAt">=:from AND o."createdAt"<=:to
      `, { replacements: { from: fromStr, to: toStr }, type: QueryTypes.SELECT }),

      sequelize.query<{
        total_orders: string; total_revenue: string; avg_order: string; total_items: string;
      }>(`
        SELECT
          COUNT(DISTINCT o.id) AS total_orders,
          COALESCE(SUM(CASE WHEN o."orderStatus"!='cancelled' THEN o."totalAmount" ELSE 0 END),0) AS total_revenue,
          COALESCE(AVG(CASE WHEN o."orderStatus"!='cancelled' THEN o."totalAmount" END),0)        AS avg_order,
          COALESCE(SUM(CASE WHEN o."orderStatus"!='cancelled' THEN oi.quantity  ELSE 0 END),0)    AS total_items
        FROM orders o
        LEFT JOIN order_items oi ON oi."orderId"=o.id
        WHERE o."createdAt">=:from AND o."createdAt"<=:to
      `, { replacements: { from: prevFromStr, to: prevToStr }, type: QueryTypes.SELECT }),
    ]);

    // Customer KPIs
    const [[custCur], [custPrev]] = await Promise.all([
      sequelize.query<{ total: string; new_customers: string }>(
        `SELECT COUNT(*) AS total,
                COUNT(CASE WHEN "createdAt">=:from AND "createdAt"<=:to THEN 1 END) AS new_customers
         FROM users WHERE role='CUSTOMER'`,
        { replacements: { from: fromStr, to: toStr }, type: QueryTypes.SELECT }
      ),
      sequelize.query<{ new_customers: string }>(
        `SELECT COUNT(CASE WHEN "createdAt">=:from AND "createdAt"<=:to THEN 1 END) AS new_customers
         FROM users WHERE role='CUSTOMER'`,
        { replacements: { from: prevFromStr, to: prevToStr }, type: QueryTypes.SELECT }
      ),
    ]);

    // Inventory KPIs
    const [invStats] = await sequelize.query<{
      total_products: string; total_batches: string;
      in_stock: string; low_stock: string; out_of_stock: string;
      expiring_30: string; expiring_90: string; expired: string;
      inventory_value: string; inventory_cost: string;
    }>(`
      SELECT
        COUNT(DISTINCT "productId")                     AS total_products,
        COUNT(*)                                         AS total_batches,
        COUNT(CASE WHEN quantity > "lowStockThreshold" THEN 1 END)  AS in_stock,
        COUNT(CASE WHEN quantity > 0 AND quantity <= "lowStockThreshold" THEN 1 END) AS low_stock,
        COUNT(CASE WHEN quantity = 0 THEN 1 END)         AS out_of_stock,
        COUNT(CASE WHEN "expiryDate"<=NOW()+INTERVAL '30 days' AND "expiryDate">NOW() THEN 1 END) AS expiring_30,
        COUNT(CASE WHEN "expiryDate"<=NOW()+INTERVAL '90 days' AND "expiryDate">NOW() THEN 1 END) AS expiring_90,
        COUNT(CASE WHEN "expiryDate"<=NOW() THEN 1 END) AS expired,
        COALESCE(SUM(quantity*"sellingPrice"),0)         AS inventory_value,
        COALESCE(SUM(quantity*"purchasePrice"),0)        AS inventory_cost
      FROM inventories WHERE "isActive"=true
    `, { type: QueryTypes.SELECT });

    const curRevenue  = parseFloat(cur?.total_revenue  || "0");
    const prevRevenue = parseFloat(prev?.total_revenue || "0");
    const curOrders   = parseInt(cur?.total_orders  || "0");
    const prevOrders  = parseInt(prev?.total_orders || "0");
    const curItems    = parseInt(cur?.total_items   || "0");
    const prevItems   = parseInt(prev?.total_items  || "0");
    const curAvg      = parseFloat(cur?.avg_order   || "0");
    const prevAvg     = parseFloat(prev?.avg_order  || "0");
    const curNewCust  = parseInt(custCur?.new_customers  || "0");
    const prevNewCust = parseInt(custPrev?.new_customers || "0");
    const grossProfit = curRevenue - (parseFloat(invStats?.inventory_cost || "0") * 0.1);
    const netProfit   = curRevenue * 0.22; // ~22% margin

    const kpi = {
      revenue:         { value: curRevenue, change: pct(curRevenue, prevRevenue) },
      netProfit:       { value: netProfit,  change: pct(curRevenue, prevRevenue) },
      orders:          { value: curOrders,  change: pct(curOrders, prevOrders) },
      itemsSold:       { value: curItems,   change: pct(curItems, prevItems) },
      avgOrderValue:   { value: curAvg,     change: pct(curAvg, prevAvg) },
      newCustomers:    { value: curNewCust, change: pct(curNewCust, prevNewCust) },
      totalCustomers:  parseInt(custCur?.total || "0"),
      inventoryValue:  parseFloat(invStats?.inventory_value || "0"),
      lowStock:        parseInt(invStats?.low_stock    || "0"),
      outOfStock:      parseInt(invStats?.out_of_stock || "0"),
      expiring30:      parseInt(invStats?.expiring_30  || "0"),
      expiring90:      parseInt(invStats?.expiring_90  || "0"),
      expired:         parseInt(invStats?.expired      || "0"),
      taxCollected:    parseFloat(cur?.tax_collected  || "0"),
      discountGiven:   parseFloat(cur?.discount_given || "0"),
      cancelledOrders: parseInt(cur?.cancelled_orders || "0"),
      deliveredOrders: parseInt(cur?.delivered_orders || "0"),
      refundedOrders:  parseInt(cur?.refunded_orders  || "0"),
    };

    // ── 2. Daily Revenue Trend ─────────────────────────────────────────────────
    const dailyRevenue = await sequelize.query<{ date: string; revenue: string; orders: string; items: string }>(`
      SELECT
        TO_CHAR(DATE(o."createdAt"),'YYYY-MM-DD')                  AS date,
        COALESCE(SUM(CASE WHEN o."orderStatus"!='cancelled' THEN o."totalAmount" ELSE 0 END),0) AS revenue,
        COUNT(DISTINCT o.id)                                        AS orders,
        COALESCE(SUM(oi.quantity),0)                                AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi."orderId"=o.id
      WHERE o."createdAt">=:from AND o."createdAt"<=:to
      GROUP BY DATE(o."createdAt")
      ORDER BY date ASC
    `, { replacements: { from: fromStr, to: toStr }, type: QueryTypes.SELECT });

    // ── 3. Monthly Revenue (last 12 months always) ────────────────────────────
    const monthlyRevenue = await sequelize.query<{ month: string; revenue: string; orders: string; profit: string }>(`
      SELECT
        TO_CHAR(DATE_TRUNC('month',"createdAt"),'YYYY-MM') AS month,
        COALESCE(SUM(CASE WHEN "orderStatus"!='cancelled' THEN "totalAmount" ELSE 0 END),0) AS revenue,
        COUNT(*)  AS orders,
        COALESCE(SUM(CASE WHEN "orderStatus"!='cancelled' THEN "totalAmount"*0.22 ELSE 0 END),0) AS profit
      FROM orders
      WHERE "createdAt">=NOW()-INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month',"createdAt")
      ORDER BY month ASC
    `, { type: QueryTypes.SELECT });

    // ── 4. Orders by status ───────────────────────────────────────────────────
    const ordersByStatus = await sequelize.query<{ status: string; count: string; value: string }>(`
      SELECT "orderStatus" AS status, COUNT(*) AS count,
             COALESCE(SUM("totalAmount"),0) AS value
      FROM orders
      WHERE "createdAt">=:from AND "createdAt"<=:to
      GROUP BY "orderStatus" ORDER BY count DESC
    `, { replacements: { from: fromStr, to: toStr }, type: QueryTypes.SELECT });

    // ── 5. Payment method breakdown ───────────────────────────────────────────
    const paymentMethods = await sequelize.query<{ method: string; count: string; value: string }>(`
      SELECT "paymentMethod" AS method, COUNT(*) AS count,
             COALESCE(SUM("totalAmount"),0) AS value
      FROM orders
      WHERE "createdAt">=:from AND "createdAt"<=:to
      GROUP BY "paymentMethod" ORDER BY count DESC
    `, { replacements: { from: fromStr, to: toStr }, type: QueryTypes.SELECT });

    // ── 6. Top selling products ───────────────────────────────────────────────
    const topProducts = await sequelize.query<{
      product_name: string; category_name: string; total_qty: string;
      total_revenue: string; total_orders: string; total_discount: string;
    }>(`
      SELECT
        oi."productName"                     AS product_name,
        COALESCE(c."categoryName",'Uncategorised') AS category_name,
        SUM(oi.quantity)                     AS total_qty,
        SUM(oi."lineTotal")                  AS total_revenue,
        COUNT(DISTINCT oi."orderId")         AS total_orders,
        SUM(oi."discountAmount")             AS total_discount
      FROM order_items oi
      JOIN orders o ON o.id=oi."orderId"
      LEFT JOIN products p ON p.id=oi."productId"
      LEFT JOIN categories c ON c.id=p."categoryId"
      WHERE o."createdAt">=:from AND o."createdAt"<=:to
        AND o."orderStatus"!='cancelled'
      GROUP BY oi."productName", c."categoryName"
      ORDER BY total_qty DESC LIMIT 15
    `, { replacements: { from: fromStr, to: toStr }, type: QueryTypes.SELECT });

    // Lowest selling products
    const lowestProducts = await sequelize.query<{ product_name: string; total_qty: string; total_revenue: string }>(`
      SELECT oi."productName" AS product_name, SUM(oi.quantity) AS total_qty, SUM(oi."lineTotal") AS total_revenue
      FROM order_items oi
      JOIN orders o ON o.id=oi."orderId"
      WHERE o."createdAt">=:from AND o."createdAt"<=:to AND o."orderStatus"!='cancelled'
      GROUP BY oi."productName"
      ORDER BY total_qty ASC LIMIT 10
    `, { replacements: { from: fromStr, to: toStr }, type: QueryTypes.SELECT });

    // ── 7. Category analytics ─────────────────────────────────────────────────
    const categoryAnalytics = await sequelize.query<{
      category_name: string; total_revenue: string; total_qty: string;
      order_count: string; product_count: string;
    }>(`
      SELECT
        c."categoryName"                  AS category_name,
        COALESCE(SUM(oi."lineTotal"),0)   AS total_revenue,
        COALESCE(SUM(oi.quantity),0)      AS total_qty,
        COUNT(DISTINCT o.id)              AS order_count,
        COUNT(DISTINCT oi."productId")    AS product_count
      FROM order_items oi
      JOIN products p  ON p.id=oi."productId"
      JOIN categories c ON c.id=p."categoryId"
      JOIN orders o    ON o.id=oi."orderId"
      WHERE o."createdAt">=:from AND o."createdAt"<=:to
        AND o."orderStatus"!='cancelled'
      GROUP BY c."categoryName"
      ORDER BY total_revenue DESC
    `, { replacements: { from: fromStr, to: toStr }, type: QueryTypes.SELECT });

    // ── 8. Inventory details ──────────────────────────────────────────────────
    const inventoryHealth = await sequelize.query<{
      product_name: string; batch_number: string; quantity: string;
      expiry_date: string; selling_price: string; low_stock_threshold: string;
      supplier_name: string; purchase_price: string;
    }>(`
      SELECT p."productName" AS product_name, i."batchNumber" AS batch_number,
             i.quantity, i."expiryDate" AS expiry_date, i."sellingPrice" AS selling_price,
             i."lowStockThreshold" AS low_stock_threshold, i."supplierName" AS supplier_name,
             i."purchasePrice" AS purchase_price
      FROM inventories i
      JOIN products p ON p.id=i."productId"
      WHERE i."isActive"=true AND i."expiryDate"<=NOW()+INTERVAL '90 days'
      ORDER BY i."expiryDate" ASC LIMIT 20
    `, { type: QueryTypes.SELECT });

    const lowStockItems = await sequelize.query<{
      product_name: string; batch_number: string; quantity: string;
      low_stock_threshold: string; expiry_date: string;
    }>(`
      SELECT p."productName" AS product_name, i."batchNumber" AS batch_number,
             i.quantity, i."lowStockThreshold" AS low_stock_threshold, i."expiryDate" AS expiry_date
      FROM inventories i
      JOIN products p ON p.id=i."productId"
      WHERE i."isActive"=true AND i.quantity>0 AND i.quantity<=i."lowStockThreshold"
      ORDER BY i.quantity ASC LIMIT 15
    `, { type: QueryTypes.SELECT });

    const outOfStockItems = await sequelize.query<{
      product_name: string; batch_number: string; expiry_date: string; supplier_name: string;
    }>(`
      SELECT p."productName" AS product_name, i."batchNumber" AS batch_number,
             i."expiryDate" AS expiry_date, i."supplierName" AS supplier_name
      FROM inventories i
      JOIN products p ON p.id=i."productId"
      WHERE i."isActive"=true AND i.quantity=0
      ORDER BY i."updatedAt" DESC LIMIT 10
    `, { type: QueryTypes.SELECT });

    // ── 9. Supplier analytics ─────────────────────────────────────────────────
    const supplierAnalytics = await sequelize.query<{
      supplier_name: string; total_batches: string; total_quantity: string;
      total_cost: string; expiring_count: string; out_of_stock_count: string;
    }>(`
      SELECT
        "supplierName"                                        AS supplier_name,
        COUNT(*)                                              AS total_batches,
        SUM(quantity)                                         AS total_quantity,
        COALESCE(SUM(quantity*"purchasePrice"),0)             AS total_cost,
        COUNT(CASE WHEN "expiryDate"<=NOW()+INTERVAL '90 days' AND "expiryDate">NOW() THEN 1 END) AS expiring_count,
        COUNT(CASE WHEN quantity=0 THEN 1 END)               AS out_of_stock_count
      FROM inventories
      WHERE "isActive"=true
      GROUP BY "supplierName"
      ORDER BY total_cost DESC LIMIT 10
    `, { type: QueryTypes.SELECT });

    // ── 10. Customer analytics ────────────────────────────────────────────────
    const customerGrowth = await sequelize.query<{ month: string; new_customers: string; total_orders: string }>(`
      SELECT
        TO_CHAR(DATE_TRUNC('month',"createdAt"),'YYYY-MM') AS month,
        COUNT(*) AS new_customers,
        0 AS total_orders
      FROM users
      WHERE role='CUSTOMER' AND "createdAt">=NOW()-INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month',"createdAt")
      ORDER BY month ASC
    `, { type: QueryTypes.SELECT });

    const [retentionStats] = await sequelize.query<{
      total_customers: string; repeat_customers: string; avg_orders: string; avg_spend: string;
    }>(`
      SELECT
        COUNT(DISTINCT customer_id)                          AS total_customers,
        COUNT(DISTINCT CASE WHEN order_count>1 THEN customer_id END) AS repeat_customers,
        AVG(order_count)                                     AS avg_orders,
        AVG(total_spent)                                     AS avg_spend
      FROM (
        SELECT "customerId" AS customer_id, COUNT(*) AS order_count, SUM("totalAmount") AS total_spent
        FROM orders
        WHERE "isGuest"=false AND "customerId" IS NOT NULL AND "orderStatus"!='cancelled'
        GROUP BY "customerId"
      ) sub
    `, { type: QueryTypes.SELECT });

    const topCustomers = await sequelize.query<{
      customer_name: string; customer_email: string; order_count: string;
      total_spent: string; avg_order: string; last_order: string;
    }>(`
      SELECT u.name AS customer_name, u.email AS customer_email,
             COUNT(o.id) AS order_count, SUM(o."totalAmount") AS total_spent,
             AVG(o."totalAmount") AS avg_order, MAX(o."createdAt") AS last_order
      FROM orders o
      JOIN users u ON u.id=o."customerId"
      WHERE o."isGuest"=false AND o."orderStatus"!='cancelled'
        AND o."createdAt">=:from AND o."createdAt"<=:to
      GROUP BY u.id, u.name, u.email
      ORDER BY total_spent DESC LIMIT 10
    `, { replacements: { from: fromStr, to: toStr }, type: QueryTypes.SELECT });

    // ── 11. Staff analytics ───────────────────────────────────────────────────
    const staffStats = await sequelize.query<{
      total_staff: string; active_staff: string; pharmacists: string;
      total_payroll: string;
    }>(`
      SELECT
        COUNT(*)                                    AS total_staff,
        COUNT(CASE WHEN "isActive"=true THEN 1 END) AS active_staff,
        COUNT(CASE WHEN role='pharmacist' THEN 1 END) AS pharmacists,
        COALESCE(SUM(CASE WHEN "isActive"=true THEN salary ELSE 0 END),0) AS total_payroll
      FROM staff
    `, { type: QueryTypes.SELECT });

    const staffByRole = await sequelize.query<{ role: string; count: string; avg_salary: string }>(`
      SELECT role, COUNT(*) AS count, AVG(salary) AS avg_salary
      FROM staff WHERE "isActive"=true
      GROUP BY role ORDER BY count DESC
    `, { type: QueryTypes.SELECT });

    // ── 12. Profit breakdown ──────────────────────────────────────────────────
    const [profitBreakdown] = await sequelize.query<{
      gross_revenue: string; total_tax: string; total_discount: string;
      cogs_estimate: string; net_revenue: string;
    }>(`
      SELECT
        COALESCE(SUM(CASE WHEN "orderStatus"!='cancelled' THEN "totalAmount" ELSE 0 END),0)      AS gross_revenue,
        COALESCE(SUM(CASE WHEN "orderStatus"!='cancelled' THEN "taxAmount" ELSE 0 END),0)         AS total_tax,
        COALESCE(SUM(CASE WHEN "orderStatus"!='cancelled' THEN "discountAmount" ELSE 0 END),0)    AS total_discount,
        COALESCE(SUM(CASE WHEN "orderStatus"!='cancelled' THEN "totalAmount"*0.78 ELSE 0 END),0)  AS cogs_estimate,
        COALESCE(SUM(CASE WHEN "orderStatus"!='cancelled' THEN "totalAmount"*0.22 ELSE 0 END),0)  AS net_revenue
      FROM orders
      WHERE "createdAt">=:from AND "createdAt"<=:to
    `, { replacements: { from: fromStr, to: toStr }, type: QueryTypes.SELECT });

    // ── 13. Returns / Refunds ─────────────────────────────────────────────────
    const returnStats = await sequelize.query<{
      total_refunds: string; refund_amount: string; cancelled_orders: string;
    }>(`
      SELECT
        COUNT(CASE WHEN "paymentStatus"='refunded' THEN 1 END) AS total_refunds,
        COALESCE(SUM(CASE WHEN "paymentStatus"='refunded' THEN "totalAmount" ELSE 0 END),0) AS refund_amount,
        COUNT(CASE WHEN "orderStatus"='cancelled' THEN 1 END) AS cancelled_orders
      FROM orders
      WHERE "createdAt">=:from AND "createdAt"<=:to
    `, { replacements: { from: fromStr, to: toStr }, type: QueryTypes.SELECT });

    // ── 14. Business Insights (auto-generated) ────────────────────────────────
    const insights: { type: "warning" | "success" | "info" | "danger"; message: string }[] = [];
    const lsi = parseInt(invStats?.low_stock    || "0");
    const osi = parseInt(invStats?.out_of_stock || "0");
    const exp = parseInt(invStats?.expiring_30  || "0");
    const revChange = pct(curRevenue, prevRevenue);
    const ordChange = pct(curOrders, prevOrders);

    if (osi  > 0)          insights.push({ type: "danger",  message: `${osi} products are completely out of stock. Reorder immediately.` });
    if (lsi  > 0)          insights.push({ type: "warning", message: `${lsi} medicines are below their minimum stock level.` });
    if (exp  > 0)          insights.push({ type: "warning", message: `${exp} products will expire within 30 days — review and action required.` });
    if (revChange > 10)    insights.push({ type: "success", message: `Revenue increased by ${revChange}% compared with the previous period.` });
    if (revChange < -10)   insights.push({ type: "danger",  message: `Revenue dropped by ${Math.abs(revChange)}% compared with the previous period.` });
    if (ordChange > 15)    insights.push({ type: "success", message: `Order volume is up ${ordChange}% — strong demand signal.` });
    if (curAvg > prevAvg && prevAvg > 0)
      insights.push({ type: "info", message: `Average order value rose from £${prevAvg.toFixed(2)} to £${curAvg.toFixed(2)}.` });
    if (parseInt(cur?.cancelled_orders || "0") > curOrders * 0.1)
      insights.push({ type: "warning", message: `Cancellation rate is high (${parseInt(cur?.cancelled_orders || "0")} orders cancelled). Review order workflow.` });
    if (insights.length === 0)
      insights.push({ type: "success", message: "All metrics look healthy for the selected period." });

    // ── Assemble response ─────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      data: {
        period: { from: fromStr, to: toStr, label: period },
        kpi,
        dailyRevenue: dailyRevenue.map(r => ({
          date:    r.date,
          revenue: parseFloat(r.revenue),
          profit:  parseFloat(r.revenue) * 0.22,
          orders:  parseInt(r.orders),
          items:   parseInt(r.items),
        })),
        monthlyRevenue: monthlyRevenue.map(m => ({
          month:   m.month,
          revenue: parseFloat(m.revenue),
          profit:  parseFloat(m.profit),
          orders:  parseInt(m.orders),
        })),
        ordersByStatus: ordersByStatus.map(s => ({
          status: s.status, count: parseInt(s.count), value: parseFloat(s.value),
        })),
        paymentMethods: paymentMethods.map(p => ({
          method: p.method, count: parseInt(p.count), value: parseFloat(p.value),
        })),
        topProducts: topProducts.map(p => ({
          name:         p.product_name,
          category:     p.category_name,
          qty:          parseInt(p.total_qty),
          revenue:      parseFloat(p.total_revenue),
          orders:       parseInt(p.total_orders),
          discount:     parseFloat(p.total_discount),
          profit:       parseFloat(p.total_revenue) * 0.22,
        })),
        lowestProducts: lowestProducts.map(p => ({
          name:    p.product_name,
          qty:     parseInt(p.total_qty),
          revenue: parseFloat(p.total_revenue),
        })),
        categoryAnalytics: categoryAnalytics.map(c => ({
          name:     c.category_name,
          revenue:  parseFloat(c.total_revenue),
          qty:      parseInt(c.total_qty),
          orders:   parseInt(c.order_count),
          products: parseInt(c.product_count),
        })),
        inventoryHealth: {
          expiringSoon: inventoryHealth.map(i => ({
            product:    i.product_name,
            batch:      i.batch_number,
            qty:        parseInt(i.quantity),
            expiryDate: i.expiry_date,
            value:      parseInt(i.quantity) * parseFloat(i.selling_price),
            supplier:   i.supplier_name,
          })),
          lowStockItems: lowStockItems.map(i => ({
            product:   i.product_name,
            batch:     i.batch_number,
            qty:       parseInt(i.quantity),
            threshold: parseInt(i.low_stock_threshold),
            expiryDate: i.expiry_date,
          })),
          outOfStockItems: outOfStockItems.map(i => ({
            product:  i.product_name,
            batch:    i.batch_number,
            expiry:   i.expiry_date,
            supplier: i.supplier_name,
          })),
        },
        supplierAnalytics: supplierAnalytics.map(s => ({
          name:         s.supplier_name,
          batches:      parseInt(s.total_batches),
          quantity:     parseInt(s.total_quantity),
          cost:         parseFloat(s.total_cost),
          expiring:     parseInt(s.expiring_count),
          outOfStock:   parseInt(s.out_of_stock_count),
        })),
        customerAnalytics: {
          growth: customerGrowth.map(c => ({
            month:       c.month,
            newCustomers: parseInt(c.new_customers),
          })),
          retention: {
            totalCustomers:  parseInt(retentionStats?.total_customers  || "0"),
            repeatCustomers: parseInt(retentionStats?.repeat_customers || "0"),
            retentionRate:   (() => {
              const t = parseInt(retentionStats?.total_customers  || "0");
              const r = parseInt(retentionStats?.repeat_customers || "0");
              return t > 0 ? parseFloat(((r / t) * 100).toFixed(1)) : 0;
            })(),
            avgOrdersPerCustomer: parseFloat(parseFloat(retentionStats?.avg_orders || "0").toFixed(1)),
            avgSpendPerCustomer:  parseFloat(parseFloat(retentionStats?.avg_spend  || "0").toFixed(2)),
          },
          topCustomers: topCustomers.map(c => ({
            name:       c.customer_name,
            email:      c.customer_email,
            orders:     parseInt(c.order_count),
            totalSpent: parseFloat(c.total_spent),
            avgOrder:   parseFloat(c.avg_order),
            lastOrder:  c.last_order,
          })),
        },
        staffAnalytics: {
          summary: {
            totalStaff:    parseInt((staffStats[0] as any)?.total_staff   || "0"),
            activeStaff:   parseInt((staffStats[0] as any)?.active_staff  || "0"),
            pharmacists:   parseInt((staffStats[0] as any)?.pharmacists   || "0"),
            totalPayroll:  parseFloat((staffStats[0] as any)?.total_payroll || "0"),
          },
          byRole: staffByRole.map(r => ({
            role:      r.role,
            count:     parseInt(r.count),
            avgSalary: parseFloat(r.avg_salary || "0"),
          })),
        },
        profitBreakdown: {
          grossRevenue:  parseFloat(profitBreakdown?.gross_revenue  || "0"),
          taxCollected:  parseFloat(profitBreakdown?.total_tax      || "0"),
          discountGiven: parseFloat(profitBreakdown?.total_discount || "0"),
          cogsEstimate:  parseFloat(profitBreakdown?.cogs_estimate  || "0"),
          netProfit:     parseFloat(profitBreakdown?.net_revenue    || "0"),
          profitMargin:  curRevenue > 0
            ? parseFloat(((parseFloat(profitBreakdown?.net_revenue || "0") / curRevenue) * 100).toFixed(1))
            : 0,
        },
        returnStats: {
          totalRefunds:     parseInt((returnStats[0] as any)?.total_refunds   || "0"),
          refundAmount:     parseFloat((returnStats[0] as any)?.refund_amount || "0"),
          cancelledOrders:  parseInt((returnStats[0] as any)?.cancelled_orders || "0"),
          cancelRate: curOrders > 0
            ? parseFloat(((parseInt((returnStats[0] as any)?.cancelled_orders || "0") / curOrders) * 100).toFixed(1))
            : 0,
        },
        insights,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Analytics Full API] Error:", msg);
    return NextResponse.json({ success: false, message: `Failed: ${msg}` }, { status: 500 });
  }
}
