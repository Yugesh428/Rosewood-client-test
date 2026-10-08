import { NextRequest, NextResponse } from "next/server";
import FeaturedDuoVideo from "./featuredDuoVideoModel";
import { storage } from "@/lib/storage";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX            = "FeaturedDuoVideoController";
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_VIDEO  = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const ALLOWED_IMAGE  = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const UPLOAD_FOLDER  = "featured-duo/videos";

// ── GET /api/ui/featured-duo/videos ──────────────────────────────────────────
// Returns all videos ordered by sortOrder ASC
export async function listVideos(_req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "listVideos");
  try {
    const rows = await FeaturedDuoVideo.findAll({
      order: [["sortOrder", "ASC"], ["createdAt", "ASC"]],
    });
    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "listVideos failed", error);
    return errorResponse(error);
  }
}

// ── POST /api/ui/featured-duo/videos ─────────────────────────────────────────
// Upload a new video (file or URL) and create a DB row
export async function createVideo(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "createVideo");
  try {
    const contentType = req.headers.get("content-type") ?? "";

    let url     = "";
    let brand   = "";
    let title   = "";
    let link    = "/pharmacy";
    let sortOrder = 0;

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();

      brand     = (fd.get("brand")     as string) || "";
      title     = (fd.get("title")     as string) || "";
      link      = (fd.get("link")      as string) || "/pharmacy";
      sortOrder = parseInt((fd.get("sortOrder") as string) || "0", 10);

      const file    = fd.get("file")    as File | null;
      const urlField = fd.get("url")   as string | null;

      if (file && file.size > 0) {
        // Validate
        if (!ALLOWED_VIDEO.includes(file.type) && !ALLOWED_IMAGE.includes(file.type))
          throw new AppError(`Invalid type "${file.type}". Allowed: MP4, WebM, OGG, MOV, or images.`, 400, "INVALID_FILE_TYPE");
        if (file.size > MAX_VIDEO_SIZE)
          throw new AppError("File must be ≤ 50 MB.", 400, "FILE_TOO_LARGE");

        const result = await storage.save(file, UPLOAD_FOLDER);
        url = result.url;
      } else if (urlField?.trim()) {
        url = urlField.trim();
      }
    } else {
      const body = await req.json();
      url       = body.url       || "";
      brand     = body.brand     || "";
      title     = body.title     || "";
      link      = body.link      || "/pharmacy";
      sortOrder = body.sortOrder || 0;
    }

    if (!url) throw new AppError("No video URL or file provided.", 400, "NO_URL");

    // Count existing videos so new one goes to end by default
    if (sortOrder === 0) {
      const count = await FeaturedDuoVideo.count();
      sortOrder = count;
    }

    const row = await FeaturedDuoVideo.create({ url, brand, title, link, sortOrder });
    logger.info(CTX, "createVideo — saved", row.id);
    return NextResponse.json({ success: true, data: row }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createVideo failed", error);
    return errorResponse(error);
  }
}

// ── DELETE /api/ui/featured-duo/videos/[id] ──────────────────────────────────
// Delete video row AND the uploaded file from disk
export async function deleteVideo(
  _req: NextRequest,
  id: string
): Promise<NextResponse> {
  logger.info(CTX, "deleteVideo", id);
  try {
    const row = await FeaturedDuoVideo.findByPk(id);
    if (!row) throw new AppError("Video not found.", 404, "NOT_FOUND");

    // Delete file from disk if it's a local upload
    if (storage.isLocalUpload(row.url)) {
      await storage.delete(row.url);
      logger.info(CTX, "deleteVideo — file deleted from disk", row.url);
    }

    await row.destroy();
    logger.info(CTX, "deleteVideo — DB row deleted", id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "deleteVideo failed", error);
    return errorResponse(error);
  }
}

// ── PATCH /api/ui/featured-duo/videos/[id] ───────────────────────────────────
// Update metadata (brand, title, link, sortOrder) — no file replacement here
export async function updateVideo(
  req: NextRequest,
  id: string
): Promise<NextResponse> {
  logger.info(CTX, "updateVideo", id);
  try {
    const row = await FeaturedDuoVideo.findByPk(id);
    if (!row) throw new AppError("Video not found.", 404, "NOT_FOUND");

    const body = await req.json();
    await row.update({
      ...(body.brand     !== undefined && { brand:     body.brand     || null }),
      ...(body.title     !== undefined && { title:     body.title     || null }),
      ...(body.link      !== undefined && { link:      body.link      || null }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      ...(body.isActive  !== undefined && { isActive:  body.isActive }),
    });

    return NextResponse.json({ success: true, data: row }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateVideo failed", error);
    return errorResponse(error);
  }
}
