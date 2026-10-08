export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import sequelize from "@/lib/database/sequelize";
import Product from "@/features/products/productModel";
import Category from "@/features/productCategory/productCatetgoryModel";
import { QueryTypes } from "sequelize";

/**
 * GET /api/products/top-selling?limit=4
 *
 * Returns products ranked by total units sold (sum of order_items.quantity
 * across all orders). Only active products are returned.
 *
 * Falls back to newest active products if no orders exist yet.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "4", 10), 20);

    // ── Step 1: aggregate order_items to get top product IDs ────────────────
    const ranked = await sequelize.query<{ productId: string; totalSold: string }>(
      `
      SELECT oi."productId", SUM(oi.quantity) AS "totalSold"
      FROM   order_items oi
      INNER  JOIN orders o ON o.id = oi."orderId"
      INNER  JOIN products p ON p.id = oi."productId"
      WHERE  p."isActive" = true
        AND  o."orderStatus" NOT IN ('cancelled')
      GROUP  BY oi."productId"
      ORDER  BY "totalSold" DESC
      LIMIT  :limit
      `,
      { replacements: { limit }, type: QueryTypes.SELECT }
    );

    let products: Product[] = [];

    if (ranked.length > 0) {
      // ── Step 2: fetch full product rows in ranked order ──────────────────
      const ids = ranked.map(r => r.productId);

      const rows = await Product.findAll({
        where:   { id: ids, isActive: true },
        include: [{ model: Category, as: "category", attributes: ["categoryName"] }],
      });

      // Re-sort to match ranked order
      const rowMap = new Map(rows.map(r => [r.id, r]));
      products = ids.map(id => rowMap.get(id)).filter(Boolean) as Product[];
    }

    // ── Fallback: if no orders yet, return newest active products ────────────
    if (products.length < limit) {
      const needed = limit - products.length;
      const existingIds = new Set(products.map(p => p.id));

      const fallback = await Product.findAll({
        where:   { isActive: true },
        include: [{ model: Category, as: "category", attributes: ["categoryName"] }],
        order:   [["createdAt", "DESC"]],
        limit:   needed * 3, // fetch extra to filter duplicates
      });

      for (const p of fallback) {
        if (!existingIds.has(p.id)) {
          products.push(p);
          existingIds.add(p.id);
          if (products.length >= limit) break;
        }
      }
    }

    return NextResponse.json({ success: true, data: products.slice(0, limit) }, { status: 200 });
  } catch (error) {
    console.error("top-selling failed", error);
    return NextResponse.json({ success: false, message: "Failed to load top selling products" }, { status: 500 });
  }
}
