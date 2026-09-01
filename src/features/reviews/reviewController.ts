import { NextRequest, NextResponse } from "next/server";
import { Op, type Includeable } from "sequelize";
import Review from "./reviewModel";
import Product from "../products/productModel";
import User from "@/lib/models/userModel";
import Order from "../orders/orderModel";
import OrderItem from "../orderItems/orderItemModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "ReviewController";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toNum(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function parsePagination(sp: URLSearchParams) {
  const page   = Math.max(1, parseInt(sp.get("page")  ?? "1"));
  const limit  = Math.min(100, Math.max(1, parseInt(sp.get("limit") ?? "20")));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

const CUSTOMER_ATTRIBUTES = ["id", "name", "email"];
const PRODUCT_ATTRIBUTES  = ["id", "productName", "productImage"];

// ─── GET /api/reviews?productId=xxx ───────────────────────────────────────────
// List reviews for a product. ?isApproved filter.

export async function getReviewsByProduct(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getReviewsByProduct — start");

  try {
    const { searchParams } = new URL(req.url);
    const productId      = searchParams.get("productId");
    const isApprovedParam = searchParams.get("isApproved");
    const { page, limit, offset } = parsePagination(searchParams);

    if (!productId) throw new AppError("productId query param is required.", 400, "MISSING_PARAM");

    const product = await Product.findByPk(productId, { attributes: PRODUCT_ATTRIBUTES });
    if (!product) throw new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND");

    const where: Record<string, unknown> = { productId };
    if (isApprovedParam !== null) where.isApproved = isApprovedParam === "true";

    const { count, rows } = await Review.findAndCountAll({
      where,
      include: [{ model: User, as: "customer", attributes: CUSTOMER_ATTRIBUTES }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    // Quick average rating
    const allReviews = await Review.findAll({
      where: { productId, isApproved: true },
      attributes: ["rating"],
      raw: true,
    }) as Array<{ rating: number }>;

    const avgRating = allReviews.length > 0
      ? parseFloat((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(2))
      : 0;

    logger.info(CTX, `getReviewsByProduct — ${rows.length} of ${count}`, { productId });

    return NextResponse.json({
      success: true,
      product,
      stats: {
        totalReviews: count,
        averageRating: avgRating,
      },
      pagination: {
        total:   count,
        page,
        limit,
        pages:   Math.ceil(count / limit),
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1,
      },
      data: rows,
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getReviewsByProduct — failed", error);
    return errorResponse(error);
  }
}

// ─── GET /api/reviews/customer/:customerId ────────────────────────────────────

export async function getReviewsByCustomer(
  req: NextRequest,
  customerId: string,
): Promise<NextResponse> {
  logger.info(CTX, "getReviewsByCustomer — start", { customerId });

  try {
    if (!customerId) throw new AppError("Customer ID is required.", 400, "MISSING_ID");

    const customer = await User.findByPk(customerId, { attributes: CUSTOMER_ATTRIBUTES });
    if (!customer) throw new AppError("Customer not found.", 404, "CUSTOMER_NOT_FOUND");

    const { searchParams } = new URL(req.url);
    const { page, limit, offset } = parsePagination(searchParams);

    const { count, rows } = await Review.findAndCountAll({
      where: { customerId },
      include: [{ model: Product, as: "product", attributes: PRODUCT_ATTRIBUTES }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    logger.info(CTX, `getReviewsByCustomer — ${rows.length} of ${count}`, { customerId });

    return NextResponse.json({
      success: true,
      customer,
      pagination: {
        total:   count,
        page,
        limit,
        pages:   Math.ceil(count / limit),
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1,
      },
      data: rows,
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getReviewsByCustomer — failed", { customerId, error });
    return errorResponse(error);
  }
}

// ─── POST /api/reviews ────────────────────────────────────────────────────────
// Body: { customerId, productId, rating, reviewText? }
// Auto-checks if customer has a delivered order with this product → isVerifiedPurchase

export async function createReview(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "createReview — start");

  try {
    const body = await req.json();
    const { customerId, productId, rating, reviewText } = body;

    logger.debug(CTX, "createReview — payload", { customerId, productId, rating });

    if (!customerId) throw new AppError("customerId is required.", 400, "VALIDATION_ERROR");
    if (!productId)  throw new AppError("productId is required.",  400, "VALIDATION_ERROR");

    const r = toNum(rating);
    if (r < 1 || r > 5) throw new AppError("rating must be between 1 and 5.", 400, "VALIDATION_ERROR");

    const customer = await User.findByPk(customerId);
    if (!customer) throw new AppError("Customer not found.", 404, "CUSTOMER_NOT_FOUND");

    const product = await Product.findByPk(productId);
    if (!product) throw new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND");

    // Duplicate check
    const existing = await Review.findOne({ where: { customerId, productId } });
    if (existing) {
      throw new AppError("You have already reviewed this product.", 409, "DUPLICATE");
    }

    // Check verified purchase — has customer bought this product?
    const orderWithProduct = await Order.findOne({
      where: { customerId, orderStatus: "delivered" },
      include: [
        {
          model: OrderItem,
          as: "items",
          where: { productId },
          required: true,
        },
      ],
    });

    const isVerifiedPurchase = !!orderWithProduct;

    const review = await Review.create({
      customerId,
      productId,
      rating: r,
      reviewText: reviewText?.trim() || null,
      isVerifiedPurchase,
      isApproved: false, // admin must approve
    });

    const result = await Review.findByPk(review.id, {
      include: [
        { model: User,    as: "customer", attributes: CUSTOMER_ATTRIBUTES },
        { model: Product, as: "product",  attributes: PRODUCT_ATTRIBUTES  },
      ],
    });

    logger.info(CTX, "createReview — created", {
      id: review.id, customerId, productId, rating: r, isVerifiedPurchase,
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createReview — failed", error);
    return errorResponse(error);
  }
}

// ─── PUT /api/reviews/:id ─────────────────────────────────────────────────────
// Customer can update their own review (rating + reviewText only).

export async function updateReview(
  req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "updateReview — start", { id });

  try {
    if (!id) throw new AppError("Review ID is required.", 400, "MISSING_ID");

    const review = await Review.findByPk(id);
    if (!review) {
      logger.warn(CTX, "updateReview — not found", { id });
      throw new AppError("Review not found.", 404, "NOT_FOUND");
    }

    const body = await req.json();
    const { rating, reviewText } = body;

    logger.debug(CTX, "updateReview — payload", { id, rating });

    const updates: Partial<{ rating: number; reviewText: string | null }> = {};

    if (rating != null) {
      const r = toNum(rating);
      if (r < 1 || r > 5) throw new AppError("rating must be between 1 and 5.", 400, "VALIDATION_ERROR");
      updates.rating = r;
    }
    if (reviewText !== undefined) {
      updates.reviewText = reviewText?.trim() || null;
    }

    await review.update(updates);

    logger.info(CTX, "updateReview — updated", { id });

    return NextResponse.json({ success: true, data: review }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateReview — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── PATCH /api/reviews/:id/approve ───────────────────────────────────────────
// Admin approves a review

export async function approveReview(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "approveReview — start", { id });

  try {
    if (!id) throw new AppError("Review ID is required.", 400, "MISSING_ID");

    const review = await Review.findByPk(id);
    if (!review) {
      logger.warn(CTX, "approveReview — not found", { id });
      throw new AppError("Review not found.", 404, "NOT_FOUND");
    }

    await review.update({ isApproved: true });

    logger.info(CTX, "approveReview — approved", { id });

    return NextResponse.json({
      success: true,
      message: "Review approved.",
      data: { id: review.id, isApproved: review.isApproved },
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "approveReview — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── DELETE /api/reviews/:id ──────────────────────────────────────────────────

export async function deleteReview(
  _req: NextRequest,
  id: string,
): Promise<NextResponse> {
  logger.info(CTX, "deleteReview — start", { id });

  try {
    if (!id) throw new AppError("Review ID is required.", 400, "MISSING_ID");

    const review = await Review.findByPk(id);
    if (!review) {
      logger.warn(CTX, "deleteReview — not found", { id });
      throw new AppError("Review not found.", 404, "NOT_FOUND");
    }

    const { customerId, productId } = review;
    await review.destroy();

    logger.info(CTX, "deleteReview — deleted", { id, customerId, productId });

    return NextResponse.json({
      success: true,
      message: "Review deleted.",
      data: { id, customerId, productId },
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "deleteReview — failed", { id, error });
    return errorResponse(error);
  }
}
