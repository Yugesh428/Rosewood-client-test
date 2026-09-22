import { NextRequest, NextResponse } from "next/server";
import FeaturedDuo from "./featuredDuoModel";
import { storage } from "@/lib/storage";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "FeaturedDuoController";
const MAX_FILE_SIZE  = 5 * 1024 * 1024;
const ALLOWED_TYPES  = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const SINGLETON_ID   = 1;

// ── helpers ───────────────────────────────────────────────────────────────────

async function getOrCreate(): Promise<FeaturedDuo> {
  const [row] = await FeaturedDuo.findOrCreate({
    where: { id: SINGLETON_ID },
    defaults: { id: SINGLETON_ID },
  });
  return row;
}

async function saveImage(file: File, folder: string): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type))
    throw new AppError(`Invalid file type "${file.type}".`, 400, "INVALID_FILE_TYPE");
  if (file.size > MAX_FILE_SIZE)
    throw new AppError("File must be ≤ 5 MB.", 400, "FILE_TOO_LARGE");
  const result = await storage.save(file, folder);
  return result.url;
}

// ── GET /api/ui/featured-duo ──────────────────────────────────────────────────

export async function getFeaturedDuo(_req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getFeaturedDuo");
  try {
    const row = await getOrCreate();
    return NextResponse.json({ success: true, data: row }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getFeaturedDuo failed", error);
    return errorResponse(error);
  }
}

// ── PUT /api/ui/featured-duo ──────────────────────────────────────────────────
// Accepts multipart/form-data with optional leftImage / rightImage file uploads.

export async function updateFeaturedDuo(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "updateFeaturedDuo");
  try {
    const row = await getOrCreate();
    const contentType = req.headers.get("content-type") ?? "";

    const fields: Record<string, string> = {};
    let leftImageUrl:  string | undefined;
    let rightImageUrl: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      for (const [key, value] of fd.entries()) {
        if (key !== "leftImage" && key !== "rightImage" && typeof value === "string") {
          fields[key] = value;
        }
      }

      const leftFile  = fd.get("leftImage")  as File | null;
      const rightFile = fd.get("rightImage") as File | null;
      const leftUrl   = fd.get("leftImageUrl")  as string | null;
      const rightUrl  = fd.get("rightImageUrl") as string | null;

      // Handle left image: file upload takes precedence, otherwise use URL
      if (leftFile && leftFile.size > 0) {
        if (row.leftImage && storage.isLocalUpload(row.leftImage))
          await storage.delete(row.leftImage);
        leftImageUrl = await saveImage(leftFile, "featured-duo");
      } else if (leftUrl && leftUrl.trim()) {
        // Use the provided URL directly (Google Drive, external URL, etc.)
        leftImageUrl = leftUrl.trim();
      }
      
      // Handle right image: file upload takes precedence, otherwise use URL
      if (rightFile && rightFile.size > 0) {
        if (row.rightImage && storage.isLocalUpload(row.rightImage))
          await storage.delete(row.rightImage);
        rightImageUrl = await saveImage(rightFile, "featured-duo");
      } else if (rightUrl && rightUrl.trim()) {
        // Use the provided URL directly (Google Drive, external URL, etc.)
        rightImageUrl = rightUrl.trim();
      }
    } else {
      const body = await req.json();
      Object.assign(fields, body);
    }

    await row.update({
      ...(fields.eyebrow    !== undefined && { eyebrow:    fields.eyebrow    || null }),
      ...(fields.heading    !== undefined && { heading:    fields.heading    || null }),
      ...(fields.shopNowUrl !== undefined && { shopNowUrl: fields.shopNowUrl || null }),
      ...(fields.leftBrand  !== undefined && { leftBrand:  fields.leftBrand  || null }),
      ...(fields.leftTitle  !== undefined && { leftTitle:  fields.leftTitle  || null }),
      ...(fields.leftLink   !== undefined && { leftLink:   fields.leftLink   || null }),
      ...(fields.rightBrand !== undefined && { rightBrand: fields.rightBrand || null }),
      ...(fields.rightTitle !== undefined && { rightTitle: fields.rightTitle || null }),
      ...(fields.rightLink  !== undefined && { rightLink:  fields.rightLink  || null }),
      ...(fields.isActive   !== undefined && { isActive:   fields.isActive !== "false" }),
      ...(leftImageUrl  !== undefined && { leftImage:  leftImageUrl  }),
      ...(rightImageUrl !== undefined && { rightImage: rightImageUrl }),
    });

    logger.info(CTX, "updateFeaturedDuo — saved");
    return NextResponse.json({ success: true, data: row }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateFeaturedDuo failed", error);
    return errorResponse(error);
  }
}
