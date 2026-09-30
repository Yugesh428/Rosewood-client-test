export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OrderItem from "@/features/orderItems/orderItemModel";
import Order from "@/features/orders/orderModel";
import Product from "@/features/products/productModel";
import { Op } from "sequelize";
import sequelize from "@/lib/database/sequelize";

/**
 * GET /api/analytics/top-products
 * Returns top selling products with real sales data
 * Query params: ?limit=5 (default 5)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "5")));

    // Get top products by sales quantity from delivered orders
    const topProducts = await OrderItem.findAll({
      attributes: [
        "productId",
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalSales"],
        [sequelize.fn("SUM", sequelize.literal("quantity * \"OrderItem\".\"price\"")), "totalRevenue"],
        [sequelize.fn("COUNT", sequelize.col("OrderItem.id")), "orderCount"],
      ],
      include: [
        {
          model: Order,
          as: "order",
          attributes: [],
          where: {
            orderStatus: "delivered",
            paymentStatus: "paid",
          },
        },
        {
          model: Product,
          as: "product",
          attributes: ["id", "productName", "productImage"],
        },
      ],
      group: ["OrderItem.productId", "product.id"],
      order: [[sequelize.literal('"totalSales"'), "DESC"]],
      limit,
      raw: false,
    });

    // Calculate trends (compare last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Format response with trend calculation
    const productsWithTrends = await Promise.all(
      topProducts.map(async (item: any) => {
        const productId = item.productId;
        const product = item.product;

        // Get current period sales (last 30 days)
        const currentPeriodResult = await OrderItem.findOne({
          attributes: [[sequelize.fn("SUM", sequelize.col("quantity")), "sales"]],
          include: [
            {
              model: Order,
              as: "order",
              attributes: [],
              where: {
                orderStatus: "delivered",
                paymentStatus: "paid",
                createdAt: { [Op.gte]: thirtyDaysAgo },
              },
            },
          ],
          where: { productId },
          raw: true,
        }) as any;

        // Get previous period sales (30-60 days ago)
        const previousPeriodResult = await OrderItem.findOne({
          attributes: [[sequelize.fn("SUM", sequelize.col("quantity")), "sales"]],
          include: [
            {
              model: Order,
              as: "order",
              attributes: [],
              where: {
                orderStatus: "delivered",
                paymentStatus: "paid",
                createdAt: {
                  [Op.gte]: sixtyDaysAgo,
                  [Op.lt]: thirtyDaysAgo,
                },
              },
            },
          ],
          where: { productId },
          raw: true,
        }) as any;

        const currentSales = parseFloat(currentPeriodResult?.sales || "0");
        const previousSales = parseFloat(previousPeriodResult?.sales || "0");

        // Calculate trend percentage
        let trend = 0;
        if (previousSales > 0) {
          trend = Math.round(((currentSales - previousSales) / previousSales) * 100);
        } else if (currentSales > 0) {
          trend = 100; // New product or 100% increase from zero
        }

        return {
          productId,
          productName: product?.productName || "Unknown Product",
          productImage: product?.productImage || null,
          sales: parseInt(item.getDataValue("totalSales") || "0"),
          revenue: parseFloat(item.getDataValue("totalRevenue") || "0"),
          orderCount: parseInt(item.getDataValue("orderCount") || "0"),
          trend,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: productsWithTrends,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Failed to fetch top products:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch top products",
      },
      { status: 500 }
    );
  }
}
