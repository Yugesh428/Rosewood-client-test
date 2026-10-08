export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import sequelize from "@/lib/database/sequelize";
import { QueryTypes } from "sequelize";

/**
 * GET /api/reports/inventory
 * Generate inventory reports
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type") || "current-stock";
    const productId = searchParams.get("productId");
    const categoryId = searchParams.get("categoryId");
    const supplierId = searchParams.get("supplierId");

    let query = "";
    let replacements: Record<string, any> = {};

    switch (reportType) {
      case "current-stock":
        query = `
          SELECT 
            p."productName",
            SUBSTRING(p.id::text, 1, 8) as product_id,
            c."categoryName",
            i."batchNumber",
            i.quantity,
            i."lowStockThreshold",
            i."sellingPrice",
            i."purchasePrice",
            TO_CHAR(i."expiryDate", 'YYYY-MM-DD') as expiry_date,
            i."supplierName",
            i.quantity * i."sellingPrice" as stock_value,
            CASE 
              WHEN i.quantity = 0 THEN 'Out of Stock'
              WHEN i.quantity <= i."lowStockThreshold" THEN 'Low Stock'
              ELSE 'In Stock'
            END as status
          FROM inventories i
          JOIN products p ON p.id = i."productId"
          LEFT JOIN categories c ON c.id = p."categoryId"
          WHERE i."isActive" = true
          ORDER BY i.quantity ASC, p."productName" ASC
        `;
        break;

      case "stock-valuation":
        query = `
          SELECT 
            p."productName",
            SUBSTRING(p.id::text, 1, 8) as product_id,
            c."categoryName",
            SUM(i.quantity) as total_quantity,
            AVG(i."purchasePrice") as avg_purchase_price,
            AVG(i."sellingPrice") as avg_selling_price,
            SUM(i.quantity * i."purchasePrice") as purchase_value,
            SUM(i.quantity * i."sellingPrice") as selling_value,
            SUM(i.quantity * i."sellingPrice") - SUM(i.quantity * i."purchasePrice") as potential_profit
          FROM inventories i
          JOIN products p ON p.id = i."productId"
          LEFT JOIN categories c ON c.id = p."categoryId"
          WHERE i."isActive" = true AND i.quantity > 0
          GROUP BY p.id, p."productName", c."categoryName"
          ORDER BY selling_value DESC
        `;
        break;

      case "low-stock":
        query = `
          SELECT 
            p."productName",
            SUBSTRING(p.id::text, 1, 8) as product_id,
            c."categoryName",
            i."batchNumber",
            i.quantity,
            i."lowStockThreshold",
            i."supplierName",
            TO_CHAR(i."expiryDate", 'YYYY-MM-DD') as expiry_date,
            i."sellingPrice"
          FROM inventories i
          JOIN products p ON p.id = i."productId"
          LEFT JOIN categories c ON c.id = p."categoryId"
          WHERE i."isActive" = true 
            AND i.quantity > 0 
            AND i.quantity <= i."lowStockThreshold"
          ORDER BY i.quantity ASC
        `;
        break;

      case "out-of-stock":
        query = `
          SELECT 
            p."productName",
            SUBSTRING(p.id::text, 1, 8) as product_id,
            c."categoryName",
            i."batchNumber",
            i."supplierName",
            TO_CHAR(i."updatedAt", 'YYYY-MM-DD HH24:MI') as last_updated
          FROM inventories i
          JOIN products p ON p.id = i."productId"
          LEFT JOIN categories c ON c.id = p."categoryId"
          WHERE i."isActive" = true AND i.quantity = 0
          ORDER BY i."updatedAt" DESC
        `;
        break;

      case "expiry":
        const daysParam = searchParams.get("days") || "90";
        const days = parseInt(daysParam);
        
        query = `
          SELECT 
            p."productName",
            SUBSTRING(p.id::text, 1, 8) as product_id,
            i."batchNumber",
            i.quantity,
            TO_CHAR(i."expiryDate", 'YYYY-MM-DD') as expiry_date,
            EXTRACT(DAY FROM i."expiryDate" - NOW()) as days_to_expiry,
            i."sellingPrice",
            i.quantity * i."sellingPrice" as stock_value,
            i."supplierName",
            CASE 
              WHEN i."expiryDate" <= NOW() THEN 'Expired'
              WHEN i."expiryDate" <= NOW() + INTERVAL '30 days' THEN 'Critical'
              WHEN i."expiryDate" <= NOW() + INTERVAL '90 days' THEN 'Warning'
              ELSE 'OK'
            END as status
          FROM inventories i
          JOIN products p ON p.id = i."productId"
          WHERE i."isActive" = true 
            AND i.quantity > 0
            AND i."expiryDate" <= NOW() + CAST(:days || ' days' AS INTERVAL)
          ORDER BY i."expiryDate" ASC
        `;
        replacements.days = days;
        break;

      case "batch-wise":
        query = `
          SELECT 
            p."productName",
            i."batchNumber",
            TO_CHAR(i."manufacturingDate", 'YYYY-MM-DD') as mfg_date,
            TO_CHAR(i."expiryDate", 'YYYY-MM-DD') as expiry_date,
            i.quantity,
            i."purchasePrice",
            i."sellingPrice",
            i."supplierName",
            TO_CHAR(i."createdAt", 'YYYY-MM-DD') as received_date,
            i.quantity * i."sellingPrice" as stock_value
          FROM inventories i
          JOIN products p ON p.id = i."productId"
          WHERE i."isActive" = true
          ORDER BY p."productName", i."batchNumber"
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
        COUNT(DISTINCT "productId") as total_products,
        COUNT(*) as total_batches,
        SUM(quantity) as total_quantity,
        SUM(quantity * "purchasePrice") as total_purchase_value,
        SUM(quantity * "sellingPrice") as total_selling_value,
        COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock_count,
        COUNT(CASE WHEN quantity > 0 AND quantity <= "lowStockThreshold" THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN "expiryDate" <= NOW() THEN 1 END) as expired_count,
        COUNT(CASE WHEN "expiryDate" <= NOW() + INTERVAL '30 days' AND "expiryDate" > NOW() THEN 1 END) as expiring_30_days,
        COUNT(CASE WHEN "expiryDate" <= NOW() + INTERVAL '90 days' AND "expiryDate" > NOW() THEN 1 END) as expiring_90_days
      FROM inventories
      WHERE "isActive" = true
    `;

    const [summary] = await sequelize.query(summaryQuery, {
      type: QueryTypes.SELECT,
    }) as any[];

    return NextResponse.json({
      success: true,
      data: {
        reportType,
        summary: {
          totalProducts: parseInt(summary?.total_products || "0"),
          totalBatches: parseInt(summary?.total_batches || "0"),
          totalQuantity: parseInt(summary?.total_quantity || "0"),
          totalPurchaseValue: parseFloat(summary?.total_purchase_value || "0"),
          totalSellingValue: parseFloat(summary?.total_selling_value || "0"),
          outOfStockCount: parseInt(summary?.out_of_stock_count || "0"),
          lowStockCount: parseInt(summary?.low_stock_count || "0"),
          expiredCount: parseInt(summary?.expired_count || "0"),
          expiring30Days: parseInt(summary?.expiring_30_days || "0"),
          expiring90Days: parseInt(summary?.expiring_90_days || "0"),
        },
        records: results,
        recordCount: results.length,
      },
    });

  } catch (error) {
    console.error("Inventory report error:", error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate inventory report",
    }, { status: 500 });
  }
}
