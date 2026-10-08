import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import Faq from "./faqModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "FaqController";

// ─── GET /api/ui/faq ─────────────────────────────────────────────────────────
// Public: active only  |  Admin: ?all=true  |  Filter: ?category=
export async function getFaqs(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getFaqs — start");
  try {
    const { searchParams } = new URL(req.url);
    const showAll  = searchParams.get("all") === "true";
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};
    if (!showAll) where.isActive = true;
    if (category)  where.category = category;

    const faqs = await Faq.findAll({
      where,
      order: [
        ["displayOrder", "ASC"],
        ["createdAt",    "ASC"],
      ],
    });

    logger.info(CTX, `getFaqs — ${faqs.length} items`);
    return NextResponse.json({ success: true, data: faqs }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getFaqs — failed", error);
    return errorResponse(error);
  }
}

// ─── GET /api/ui/faq/:id ──────────────────────────────────────────────────────
export async function getFaqById(_req: NextRequest, id: string): Promise<NextResponse> {
  logger.info(CTX, "getFaqById — start", { id });
  try {
    if (!id) throw new AppError("FAQ ID is required.", 400, "MISSING_ID");
    const faq = await Faq.findByPk(id);
    if (!faq) throw new AppError("FAQ not found.", 404, "NOT_FOUND");
    return NextResponse.json({ success: true, data: faq }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getFaqById — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── POST /api/ui/faq ─────────────────────────────────────────────────────────
export async function createFaq(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "createFaq — start");
  try {
    const body = await req.json();
    const { question, answer, category, displayOrder, isActive } = body;

    if (!question?.trim()) throw new AppError("question is required.", 400, "MISSING_QUESTION");
    if (!answer?.trim())   throw new AppError("answer is required.",   400, "MISSING_ANSWER");

    const faq = await Faq.create({
      question:     question.trim(),
      answer:       answer.trim(),
      category:     category?.trim()  || null,
      displayOrder: displayOrder != null ? Number(displayOrder) : 0,
      isActive:     isActive    != null ? Boolean(isActive)    : true,
    });

    logger.info(CTX, "createFaq — created", { id: faq.id });
    return NextResponse.json({ success: true, data: faq }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createFaq — failed", error);
    return errorResponse(error);
  }
}

// ─── PUT /api/ui/faq/:id ──────────────────────────────────────────────────────
export async function updateFaq(req: NextRequest, id: string): Promise<NextResponse> {
  logger.info(CTX, "updateFaq — start", { id });
  try {
    if (!id) throw new AppError("FAQ ID is required.", 400, "MISSING_ID");
    const faq = await Faq.findByPk(id);
    if (!faq) throw new AppError("FAQ not found.", 404, "NOT_FOUND");

    const body = await req.json();
    const { question, answer, category, displayOrder, isActive } = body;

    await faq.update({
      ...(question     !== undefined && { question:     question.trim() }),
      ...(answer       !== undefined && { answer:       answer.trim() }),
      ...(category     !== undefined && { category:     category?.trim() || null }),
      ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
      ...(isActive     !== undefined && { isActive:     Boolean(isActive) }),
    });

    logger.info(CTX, "updateFaq — updated", { id });
    return NextResponse.json({ success: true, data: faq }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateFaq — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── PATCH /api/ui/faq/:id/toggle ────────────────────────────────────────────
export async function toggleFaq(_req: NextRequest, id: string): Promise<NextResponse> {
  logger.info(CTX, "toggleFaq — start", { id });
  try {
    if (!id) throw new AppError("FAQ ID is required.", 400, "MISSING_ID");
    const faq = await Faq.findByPk(id);
    if (!faq) throw new AppError("FAQ not found.", 404, "NOT_FOUND");

    await faq.update({ isActive: !faq.isActive });
    logger.info(CTX, "toggleFaq — toggled", { id, isActive: faq.isActive });

    return NextResponse.json({
      success: true,
      message: `FAQ is now ${faq.isActive ? "active" : "inactive"}.`,
      data: { id: faq.id, isActive: faq.isActive },
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "toggleFaq — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── DELETE /api/ui/faq/:id ───────────────────────────────────────────────────
export async function deleteFaq(_req: NextRequest, id: string): Promise<NextResponse> {
  logger.info(CTX, "deleteFaq — start", { id });
  try {
    if (!id) throw new AppError("FAQ ID is required.", 400, "MISSING_ID");
    const faq = await Faq.findByPk(id);
    if (!faq) throw new AppError("FAQ not found.", 404, "NOT_FOUND");

    await faq.destroy();
    logger.info(CTX, "deleteFaq — deleted", { id });
    return NextResponse.json({ success: true, message: "FAQ deleted." }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "deleteFaq — failed", { id, error });
    return errorResponse(error);
  }
}

// ─── GET /api/ui/faq/categories ──────────────────────────────────────────────
// Returns distinct categories for filter tabs
export async function getFaqCategories(_req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getFaqCategories — start");
  try {
    const results = await Faq.findAll({
      attributes: ["category"],
      where: { isActive: true, category: { [Op.ne]: null } },
      group: ["category"],
      order: [["category", "ASC"]],
    });
    const categories = results.map(r => r.category).filter(Boolean);
    return NextResponse.json({ success: true, data: categories }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getFaqCategories — failed", error);
    return errorResponse(error);
  }
}
