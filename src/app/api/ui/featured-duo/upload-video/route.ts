import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { AppError, errorResponse } from "@/lib/apiError";

const MAX_VIDEO_SIZE   = 50 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * POST /api/ui/featured-duo/upload-video
 *
 * Uploads a video (or image) file and returns its persistent URL.
 * Does NOT touch the database — caller decides when/where to persist the URL.
 * This avoids the blob-URL problem where the DB gets a URL from a previous
 * upload that was already overwritten by a second upload.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      throw new AppError("Expected multipart/form-data", 400, "BAD_REQUEST");
    }

    const fd = await req.formData();
    const file = fd.get("file") as File | null;

    if (!file || file.size === 0) {
      throw new AppError("No file provided", 400, "NO_FILE");
    }

    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

    if (!isVideo && !isImage) {
      throw new AppError(
        `Invalid file type "${file.type}". Allowed: MP4, WebM, OGG, MOV, or images.`,
        400,
        "INVALID_FILE_TYPE"
      );
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      throw new AppError("Video must be ≤ 50 MB.", 400, "FILE_TOO_LARGE");
    }

    const result = await storage.save(file, "featured-duo/videos");
    return NextResponse.json({ success: true, url: result.url }, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  }
}
