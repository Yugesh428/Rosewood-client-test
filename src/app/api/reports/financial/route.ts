export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import sequelize from "@/lib/database/sequelize";
import { QueryTypes } from "sequelize";

/**
 * GET /api/reports/financial
 * Generate financial reports - revenue, profit, payments, tax
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type") || "revenue";
    const fromDate = searchParams.get("from") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const toDate = searchParams.get("to") || new Date().toISOString();

    let query = "";
    const replacements: Record<string, any> = { fromDate, toDate };

    switch (reportType) {
      case "revenue":
        query = `
          SELECT 
            TO_CHAR(DATE(o."createdAt"), 'YYYY-MM-DD') as date,
            COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."totalAmount" ELSE 0 END), 0) as gross_revenue,
            COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."taxAmount" ELSE 0 END), 0) as tax_collected,
            COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."discountAmount" ELSE 0 END), 0) as discount_given,
            COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."totalAmount" - o."taxAmount" - o."discountAmount" ELSE 0 END), 0) as net_revenue,
            COUNT(DISTINCT o.id) as order_count
          FROM orders o
          WHERE o."createdAt" >= :fromDate AND o."createdAt" <= :toDate
          GROUP BY DATE(o."createdAt")
          ORDER BY date DESC
        `;
        break;

      case "profit":
        query = `
          SELECT 
            TO_CHAR(DATE(o."createdAt"), 'YYYY-MM-DD') as date,
            COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."totalAmount" ELSE 0 END), 0) as revenue,
            COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."totalAmount" * 0.78 ELSE 0 END), 0) as estimated_cogs,
            COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."totalAmount" * 0.22 ELSE 0 END), 0) as estimated_profit,
            ROUND(22.0, 2) as profit_margin_percent
          FROM orders o
          WHERE o."createdAt" >= :fromDate AND o."createdAt" <= :toDate
          GROUP BY DATE(o."createdAt")
          ORDER BY date DESC
        `;
        break;

      case "payment-collection":
        query = `
          SELECT 
            o."paymentMethod" as payment_method,
            COUNT(*) as transaction_count,
            COALESCE(SUM(CASE WHEN o."paymentStatus" = 'paid' AND o."orderStatus" != 'cancelled' THEN o."totalAmount" ELSE 0 END), 0) as collected,
            COALESCE(SUM(CASE WHEN o."paymentStatus" = 'unpaid' THEN o."totalAmount" ELSE 0 END), 0) as pending,
            COALESCE(SUM(CASE WHEN o."paymentStatus" = 'refunded' THEN o."totalAmount" ELSE 0 END), 0) as refunded,
            COALESCE(AVG(CASE WHEN o."paymentStatus" = 'paid' THEN o."totalAmount" END), 0) as avg_transaction
          FROM orders o
          WHERE o."createdAt" >= :fromDate AND o."createdAt" <= :toDate
          GROUP BY o."paymentMethod"
          ORDER BY collected DESC
        `;
        break;

      case "tax":
        query = `
          SELECT 
            TO_CHAR(DATE(o."createdAt"), 'YYYY-MM-DD') as date,
            COUNT(DISTINCT o.id) as order_count,
            COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."totalAmount" - o."taxAmount" ELSE 0 END), 0) as taxable_amount,
            COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."taxAmount" ELSE 0 END), 0) as tax_collected,
            ROUND(COALESCE(AVG(CASE WHEN o."orderStatus" != 'cancelled' AND o."totalAmount" > 0 
              THEN (o."taxAmount" / o."totalAmount") * 100 END), 0), 2) as avg_tax_rate
          FROM orders o
          WHERE o."createdAt" >= :fromDate AND o."createdAt" <= :toDate
          GROUP BY DATE(o."createdAt")
          ORDER BY date DESC
        `;
        break;

      case "pending-payments":
        query = `
          SELECT 
            o.id,
            SUBSTRING(o.id::text, 1, 8) as order_number,
            TO_CHAR(o."createdAt", 'YYYY-MM-DD HH24:MI') as order_date,
            COALESCE(u.name, o."guestName", 'Guest') as customer_name,
            COALESCE(u.email, o."guestEmail", 'N/A') as customer_email,
            o."totalAmount",
            o."paymentMethod",
            o."orderStatus",
            EXTRACT(DAY FROM NOW() - o."createdAt") as days_pending
          FROM orders o
          LEFT JOIN users u ON u.id = o."customerId"
          WHERE o."createdAt" >= :fromDate AND o."createdAt" <= :toDate
            AND o."paymentStatus" = 'unpaid'
            AND o."orderStatus" != 'cancelled'
          ORDER BY o."createdAt" ASC
          LIMIT 200
        `;
        break;

      default:
        return NextResponse.json({
          success: false,
          message: "Invalid report type",
        }, { status: 400 });
    }

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."totalAmount" ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."taxAmount" ELSE 0 END), 0) as total_tax,
        COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."discountAmount" ELSE 0 END), 0) as total_discount,
        COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."totalAmount" * 0.22 ELSE 0 END), 0) as estimated_profit,
        COALESCE(SUM(CASE WHEN o."paymentStatus" = 'paid' AND o."orderStatus" != 'cancelled' THEN o."totalAmount" ELSE 0 END), 0) as total_collected,
        COALESCE(SUM(CASE WHEN o."paymentStatus" = 'unpaid' THEN o."totalAmount" ELSE 0 END), 0) as total_pending,
        COALESCE(SUM(CASE WHEN o."paymentStatus" = 'refunded' THEN o."totalAmount" ELSE 0 END), 0) as total_refunded,
        COUNT(CASE WHEN o."paymentStatus" = 'unpaid' AND o."orderStatus" != 'cancelled' THEN 1 END) as pending_payment_count
      FROM orders o
      WHERE o."createdAt" >= :fromDate AND o."createdAt" <= :toDate
    `;

    const [summary] = await sequelize.query(summaryQuery, {
      replacements: { fromDate, toDate },
      type: QueryTypes.SELECT,
    }) as any[];

    return NextResponse.json({
      success: true,
      data: {
        reportType,
        period: { from: fromDate, to: toDate },
        summary: {
          totalRevenue: parseFloat(summary?.total_revenue || "0"),
          totalTax: parseFloat(summary?.total_tax || "0"),
          totalDiscount: parseFloat(summary?.total_discount || "0"),
          estimatedProfit: parseFloat(summary?.estimated_profit || "0"),
          totalCollected: parseFloat(summary?.total_collected || "0"),
          totalPending: parseFloat(summary?.total_pending || "0"),
          totalRefunded: parseFloat(summary?.total_refunded || "0"),
          pendingPaymentCount: parseInt(summary?.pending_payment_count || "0"),
        },
        records: results,
        recordCount: results.length,
      },
    });

  } catch (error) {
    console.error("Financial report error:", error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate financial report",
    }, { status: 500 });
  }
}
