import { NextRequest, NextResponse } from "next/server";
import FeaturedDuo from "./featuredDuoModel";
import { storage } from "@/lib/storage";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "FeaturedDuoController";
const MAX_FILE_SIZE  = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES  = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_VIDEO_TYPES  = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const SINGLETON_ID   = 1;

async function getOrCreate(): Promise<FeaturedDuo> {
  const [row] = await FeaturedDuo.findOrCreate({
    where: { id: SINGLETON_ID },
    defaults: { id: SINGLETON_ID },
  });
  return row;
}

async function saveImage(file: File, folder: string): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type))
    throw new AppError(`Invalid file type "${file.type}".`, 400, "INVALID_FILE_TYPE");
  if (file.size > MAX_FILE_SIZE)
    throw new AppError("File must be ≤ 5 MB.", 400, "FILE_TOO_LARGE");
  const result = await storage.save(file, folder);
  return result.url;
}

async function saveVideo(file: File, folder: string): Promise<string> {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type) && !ALLOWED_IMAGE_TYPES.includes(file.type))
    throw new AppError(`Invalid file type "${file.type}". Allowed: MP4, WebM, OGG, MOV, or images.`, 400, "INVALID_FILE_TYPE");
  if (file.size > MAX_VIDEO_SIZE)
    throw new AppError("Video file must be ≤ 50 MB.", 400, "FILE_TOO_LARGE");
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

export async function updateFeaturedDuo(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "updateFeaturedDuo");
  try {
    const row = await getOrCreate();
    const contentType = req.headers.get("content-type") ?? "";

    const fields: Record<string, string> = {};
    let leftImageUrl: string | undefined;
    let videoUrlValue: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      for (const [key, value] of fd.entries()) {
        if (key !== "leftImage" && key !== "videoFile" && typeof value === "string") {
          fields[key] = value;
        }
      }

      // Left panel: file upload or URL
      const leftFile = fd.get("leftImage") as File | null;
      const leftUrl  = fd.get("leftImageUrl") as string | null;

      if (leftFile && leftFile.size > 0) {
        if (row.leftImage && storage.isLocalUpload(row.leftImage))
          await storage.delete(row.leftImage);
        leftImageUrl = await saveImage(leftFile, "featured-duo");
      } else if (leftUrl && leftUrl.trim()) {
        leftImageUrl = leftUrl.trim();
      }

      // Video panel: file upload or URL
      const videoFile = fd.get("videoFile") as File | null;
      const videoUrlField = fd.get("videoUrl") as string | null;

      if (videoFile && videoFile.size > 0) {
        if (row.videoUrl && storage.isLocalUpload(row.videoUrl))
          await storage.delete(row.videoUrl);
        videoUrlValue = await saveVideo(videoFile, "featured-duo/videos");
      } else if (videoUrlField && videoUrlField.trim()) {
        videoUrlValue = videoUrlField.trim();
      }

      // Handle videos array (for multi-video carousel)
      const videosJson = fd.get("videos") as string | null;
      if (videosJson) {
        try {
          const videosArray = JSON.parse(videosJson);
          if (Array.isArray(videosArray)) {
            fields.videos = videosJson;
          }
        } catch (e) {
          logger.warn(CTX, "Failed to parse videos JSON", e);
        }
      }

    } else {
      const body = await req.json();
      Object.assign(fields, body);
    }

    await row.update({
      ...(fields.eyebrow    !== undefined && { eyebrow:    fields.eyebrow    || null }),
      ...(fields.heading    !== undefined && { heading:    fields.heading    || null }),
      ...(fields.shopNowUrl !== undefined && { shopNowUrl: fields.shopNowUrl || null }),

      // Left photo
      ...(fields.leftBrand  !== undefined && { leftBrand:  fields.leftBrand  || null }),
      ...(fields.leftTitle  !== undefined && { leftTitle:  fields.leftTitle  || null }),
      ...(fields.leftLink   !== undefined && { leftLink:   fields.leftLink   || null }),
      ...(leftImageUrl !== undefined      && { leftImage:  leftImageUrl }),

      // Video panel
      ...(fields.videoUrl   !== undefined && { videoUrl:   fields.videoUrl   || null }),
      ...(videoUrlValue !== undefined     && { videoUrl:   videoUrlValue }),
      ...(fields.videoBrand !== undefined && { videoBrand: fields.videoBrand || null }),
      ...(fields.videoTitle !== undefined && { videoTitle: fields.videoTitle || null }),
      ...(fields.videoLink  !== undefined && { videoLink:  fields.videoLink  || null }),
      ...(fields.videos     !== undefined && { videos: JSON.parse(fields.videos) }),

      ...(fields.isActive   !== undefined && { isActive:   fields.isActive !== "false" }),
    });

    logger.info(CTX, "updateFeaturedDuo — saved");
    return NextResponse.json({ success: true, data: row }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateFeaturedDuo failed", error);
    return errorResponse(error);
  }
}
