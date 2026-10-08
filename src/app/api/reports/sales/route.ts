export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import sequelize from "@/lib/database/sequelize";
import { QueryTypes } from "sequelize";

/**
 * GET /api/reports/sales
 * Generate sales reports with various filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Filters
    const reportType = searchParams.get("type") || "daily";
    const fromDate = searchParams.get("from") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const toDate = searchParams.get("to") || new Date().toISOString();
    const staffId = searchParams.get("staffId");
    const customerId = searchParams.get("customerId");
    const paymentMethod = searchParams.get("paymentMethod");
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const productId = searchParams.get("productId");

    let query = "";
    let replacements: Record<string, any> = { fromDate, toDate };

    switch (reportType) {
      case "daily":
        query = `
          SELECT 
            TO_CHAR(DATE(o."createdAt"), 'YYYY-MM-DD') as date,
            COUNT(DISTINCT o.id) as order_count,
            COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."totalAmount" ELSE 0 END), 0) as total_sales,
            COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."taxAmount" ELSE 0 END), 0) as total_tax,
            COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."discountAmount" ELSE 0 END), 0) as total_discount,
            COUNT(CASE WHEN o."orderStatus" = 'cancelled' THEN 1 END) as cancelled_count,
            COUNT(CASE WHEN o."orderStatus" = 'delivered' THEN 1 END) as delivered_count
          FROM orders o
          WHERE o."createdAt" >= :fromDate AND o."createdAt" <= :toDate
          GROUP BY DATE(o."createdAt")
          ORDER BY date DESC
        `;
        break;

      case "detailed":
        // Build dynamic WHERE clause
        let whereConditions = ['o."createdAt" >= :fromDate', 'o."createdAt" <= :toDate'];
        
        if (staffId) {
          whereConditions.push('o."staffId" = :staffId');
          replacements.staffId = staffId;
        }
        if (customerId) {
          whereConditions.push('o."customerId" = :customerId');
          replacements.customerId = customerId;
        }
        if (paymentMethod) {
          whereConditions.push('o."paymentMethod" = :paymentMethod');
          replacements.paymentMethod = paymentMethod;
        }
        if (status) {
          whereConditions.push('o."orderStatus" = :status');
          replacements.status = status;
        }

        query = `
          SELECT 
            o.id,
            SUBSTRING(o.id::text, 1, 8) as order_number,
            TO_CHAR(o."createdAt", 'YYYY-MM-DD HH24:MI') as order_date,
            COALESCE(u.name, o."guestName", 'Guest') as customer_name,
            o."totalAmount",
            o."taxAmount",
            o."discountAmount",
            o."paymentMethod",
            o."paymentStatus",
            o."orderStatus",
            COUNT(oi.id) as item_count
          FROM orders o
          LEFT JOIN users u ON u.id = o."customerId"
          LEFT JOIN order_items oi ON oi."orderId" = o.id
          WHERE ${whereConditions.join(' AND ')}
          GROUP BY o.id, u.name, o."guestName", o."createdAt", 
                   o."totalAmount", o."taxAmount", o."discountAmount", 
                   o."paymentMethod", o."paymentStatus", o."orderStatus"
          ORDER BY o."createdAt" DESC
          LIMIT 500
        `;
        break;

      case "by-product":
        query = `
          SELECT 
            oi."productName" as product_name,
            SUBSTRING(p.id::text, 1, 8) as product_id,
            c."categoryName" as category_name,
            SUM(oi.quantity) as total_quantity,
            COUNT(DISTINCT oi."orderId") as order_count,
            COALESCE(SUM(oi."lineTotal"), 0) as total_revenue,
            COALESCE(SUM(oi."discountAmount"), 0) as total_discount,
            COALESCE(AVG(oi."unitPrice"), 0) as avg_price
          FROM order_items oi
          JOIN orders o ON o.id = oi."orderId"
          LEFT JOIN products p ON p.id = oi."productId"
          LEFT JOIN categories c ON c.id = p."categoryId"
          WHERE o."createdAt" >= :fromDate AND o."createdAt" <= :toDate
            AND o."orderStatus" != 'cancelled'
          GROUP BY oi."productName", p.id, c."categoryName"
          ORDER BY total_revenue DESC
          LIMIT 100
        `;
        break;

      case "by-category":
        query = `
          SELECT 
            c."categoryName" as category_name,
            c.id as category_id,
            COUNT(DISTINCT oi."orderId") as order_count,
            COUNT(DISTINCT oi."productId") as product_count,
            SUM(oi.quantity) as total_quantity,
            COALESCE(SUM(oi."lineTotal"), 0) as total_revenue,
            COALESCE(SUM(oi."discountAmount"), 0) as total_discount
          FROM order_items oi
          JOIN orders o ON o.id = oi."orderId"
          JOIN products p ON p.id = oi."productId"
          JOIN categories c ON c.id = p."categoryId"
          WHERE o."createdAt" >= :fromDate AND o."createdAt" <= :toDate
            AND o."orderStatus" != 'cancelled'
          GROUP BY c."categoryName", c.id
          ORDER BY total_revenue DESC
        `;
        break;

      case "by-payment":
        query = `
          SELECT 
            o."paymentMethod" as payment_method,
            COUNT(*) as order_count,
            COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."totalAmount" ELSE 0 END), 0) as total_amount,
            COALESCE(AVG(CASE WHEN o."orderStatus" != 'cancelled' THEN o."totalAmount" END), 0) as avg_amount,
            COUNT(CASE WHEN o."paymentStatus" = 'paid' THEN 1 END) as paid_count,
            COUNT(CASE WHEN o."paymentStatus" = 'unpaid' THEN 1 END) as pending_count,
            COUNT(CASE WHEN o."paymentStatus" = 'refunded' THEN 1 END) as refunded_count
          FROM orders o
          WHERE o."createdAt" >= :fromDate AND o."createdAt" <= :toDate
          GROUP BY o."paymentMethod"
          ORDER BY total_amount DESC
        `;
        break;

      case "cancelled":
        query = `
          SELECT 
            o.id,
            SUBSTRING(o.id::text, 1, 8) as order_number,
            TO_CHAR(o."createdAt", 'YYYY-MM-DD HH24:MI') as order_date,
            COALESCE(u.name, o."guestName", 'Guest') as customer_name,
            o."totalAmount",
            o."paymentMethod",
            o."cancellationReason",
            TO_CHAR(o."cancelledAt", 'YYYY-MM-DD HH24:MI') as cancelled_date
          FROM orders o
          LEFT JOIN users u ON u.id = o."customerId"
          WHERE o."createdAt" >= :fromDate AND o."createdAt" <= :toDate
            AND o."orderStatus" = 'cancelled'
          ORDER BY o."cancelledAt" DESC
          LIMIT 200
        `;
        break;

      case "discount":
        query = `
          SELECT 
            o.id,
            SUBSTRING(o.id::text, 1, 8) as order_number,
            TO_CHAR(o."createdAt", 'YYYY-MM-DD') as order_date,
            COALESCE(u.name, o."guestName", 'Guest') as customer_name,
            o."totalAmount",
            o."discountAmount",
            ROUND((o."discountAmount" / NULLIF(o."totalAmount" + o."discountAmount", 0)) * 100, 2) as discount_percentage
          FROM orders o
          LEFT JOIN users u ON u.id = o."customerId"
          WHERE o."createdAt" >= :fromDate AND o."createdAt" <= :toDate
            AND o."discountAmount" > 0
            AND o."orderStatus" != 'cancelled'
          ORDER BY o."discountAmount" DESC
          LIMIT 200
        `;
        break;

      case "refund":
        query = `
          SELECT 
            o.id,
            SUBSTRING(o.id::text, 1, 8) as order_number,
            TO_CHAR(o."createdAt", 'YYYY-MM-DD') as order_date,
            COALESCE(u.name, o."guestName", 'Guest') as customer_name,
            o."totalAmount",
            o."paymentMethod",
            TO_CHAR(o."updatedAt", 'YYYY-MM-DD') as refund_date
          FROM orders o
          LEFT JOIN users u ON u.id = o."customerId"
          WHERE o."createdAt" >= :fromDate AND o."createdAt" <= :toDate
            AND o."paymentStatus" = 'refunded'
          ORDER BY o."updatedAt" DESC
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
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."totalAmount" ELSE 0 END), 0) as total_sales,
        COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."taxAmount" ELSE 0 END), 0) as total_tax,
        COALESCE(SUM(CASE WHEN o."orderStatus" != 'cancelled' THEN o."discountAmount" ELSE 0 END), 0) as total_discount,
        COALESCE(AVG(CASE WHEN o."orderStatus" != 'cancelled' THEN o."totalAmount" END), 0) as avg_order_value,
        COUNT(CASE WHEN o."orderStatus" = 'cancelled' THEN 1 END) as cancelled_count,
        COUNT(CASE WHEN o."orderStatus" = 'delivered' THEN 1 END) as delivered_count,
        COUNT(CASE WHEN o."paymentStatus" = 'refunded' THEN 1 END) as refunded_count
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
        filters: {
          staffId, customerId, paymentMethod, status, categoryId, productId
        },
        summary: {
          totalOrders: parseInt(summary?.total_orders || "0"),
          totalSales: parseFloat(summary?.total_sales || "0"),
          totalTax: parseFloat(summary?.total_tax || "0"),
          totalDiscount: parseFloat(summary?.total_discount || "0"),
          avgOrderValue: parseFloat(summary?.avg_order_value || "0"),
          cancelledCount: parseInt(summary?.cancelled_count || "0"),
          deliveredCount: parseInt(summary?.delivered_count || "0"),
          refundedCount: parseInt(summary?.refunded_count || "0"),
        },
        records: results,
        recordCount: results.length,
      },
    });

  } catch (error) {
    console.error("Sales report error:", error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate sales report",
    }, { status: 500 });
  }
}
