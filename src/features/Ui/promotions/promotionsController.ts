import { NextRequest, NextResponse } from "next/server";
import PromotionSlide from "./promotionsModel";
import { storage } from "@/lib/storage";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "PromotionsController";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

// ── Helpers ───────────────────────────────────────────────────────────────────

async function saveImage(file: File, folder: string): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type))
    throw new AppError(`Invalid file type "${file.type}".`, 400, "INVALID_FILE_TYPE");
  if (file.size > MAX_FILE_SIZE)
    throw new AppError("File must be ≤ 5 MB.", 400, "FILE_TOO_LARGE");
  const result = await storage.save(file, folder);
  return result.url;
}

// ── GET /api/ui/promotions ────────────────────────────────────────────────────

export async function getPromotions(_req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getPromotions");
  try {
    const slides = await PromotionSlide.findAll({
      where: { isActive: true },
      order: [["order", "ASC"], ["createdAt", "ASC"]],
    });
    return NextResponse.json({ success: true, data: slides }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getPromotions failed", error);
    return errorResponse(error);
  }
}

// ── GET /api/ui/promotions/all ────────────────────────────────────────────────

export async function getAllPromotions(_req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getAllPromotions (admin)");
  try {
    const slides = await PromotionSlide.findAll({
      order: [["order", "ASC"], ["createdAt", "ASC"]],
    });
    return NextResponse.json({ success: true, data: slides }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getAllPromotions failed", error);
    return errorResponse(error);
  }
}

// ── POST /api/ui/promotions ───────────────────────────────────────────────────

export async function createPromotion(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "createPromotion");
  try {
    const contentType = req.headers.get("content-type") ?? "";
    const fields: Record<string, string> = {};
    let bgImageUrl: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      for (const [key, value] of fd.entries()) {
        if (key !== "bgImage" && typeof value === "string") {
          fields[key] = value;
        }
      }

      const bgFile = fd.get("bgImage") as File | null;
      const bgUrl = fd.get("bgImageUrl") as string | null;

      if (bgFile && bgFile.size > 0) {
        bgImageUrl = await saveImage(bgFile, "promotions");
      } else if (bgUrl && bgUrl.trim()) {
        bgImageUrl = bgUrl.trim();
      }
    } else {
      const body = await req.json();
      Object.assign(fields, body);
    }

    const slide = await PromotionSlide.create({
      eyebrow: fields.eyebrow || null,
      brand: fields.brand || null,
      title: fields.title || null,
      description: fields.description || null,
      ctaText: fields.ctaText || null,
      ctaLink: fields.ctaLink || null,
      bgImage: bgImageUrl || null,
      order: fields.order ? parseInt(fields.order, 10) : 0,
      isActive: fields.isActive !== "false",
    });

    logger.info(CTX, `createPromotion — created slide ${slide.id}`);
    return NextResponse.json({ success: true, data: slide }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createPromotion failed", error);
    return errorResponse(error);
  }
}

// ── PUT /api/ui/promotions/:id ────────────────────────────────────────────────

export async function updatePromotion(
  req: NextRequest,
  id: string
): Promise<NextResponse> {
  logger.info(CTX, `updatePromotion — id=${id}`);
  try {
    const slide = await PromotionSlide.findByPk(id);
    if (!slide) throw new AppError("Promotion not found", 404, "NOT_FOUND");

    const contentType = req.headers.get("content-type") ?? "";
    const fields: Record<string, string> = {};
    let bgImageUrl: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      for (const [key, value] of fd.entries()) {
        if (key !== "bgImage" && typeof value === "string") {
          fields[key] = value;
        }
      }

      const bgFile = fd.get("bgImage") as File | null;
      const bgUrl = fd.get("bgImageUrl") as string | null;

      if (bgFile && bgFile.size > 0) {
        if (slide.bgImage && storage.isLocalUpload(slide.bgImage))
          await storage.delete(slide.bgImage);
        bgImageUrl = await saveImage(bgFile, "promotions");
      } else if (bgUrl && bgUrl.trim()) {
        bgImageUrl = bgUrl.trim();
      }
    } else {
      const body = await req.json();
      Object.assign(fields, body);
    }

    await slide.update({
      ...(fields.eyebrow !== undefined && { eyebrow: fields.eyebrow || null }),
      ...(fields.brand !== undefined && { brand: fields.brand || null }),
      ...(fields.title !== undefined && { title: fields.title || null }),
      ...(fields.description !== undefined && { description: fields.description || null }),
      ...(fields.ctaText !== undefined && { ctaText: fields.ctaText || null }),
      ...(fields.ctaLink !== undefined && { ctaLink: fields.ctaLink || null }),
      ...(fields.order !== undefined && { order: parseInt(fields.order, 10) }),
      ...(fields.isActive !== undefined && { isActive: fields.isActive !== "false" }),
      ...(bgImageUrl !== undefined && { bgImage: bgImageUrl }),
    });

    logger.info(CTX, `updatePromotion — updated slide ${id}`);
    return NextResponse.json({ success: true, data: slide }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updatePromotion failed", error);
    return errorResponse(error);
  }
}

// ── DELETE /api/ui/promotions/:id ─────────────────────────────────────────────

export async function deletePromotion(
  _req: NextRequest,
  id: string
): Promise<NextResponse> {
  logger.info(CTX, `deletePromotion — id=${id}`);
  try {
    const slide = await PromotionSlide.findByPk(id);
    if (!slide) throw new AppError("Promotion not found", 404, "NOT_FOUND");

    if (slide.bgImage && storage.isLocalUpload(slide.bgImage)) {
      await storage.delete(slide.bgImage);
    }

    await slide.destroy();
    logger.info(CTX, `deletePromotion — deleted slide ${id}`);
    return NextResponse.json({ success: true, message: "Promotion deleted" }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "deletePromotion failed", error);
    return errorResponse(error);
  }
}
