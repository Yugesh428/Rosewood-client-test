import { NextRequest, NextResponse } from "next/server";
import DiscoverSection from "./discoverModel";
import { storage } from "@/lib/storage";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX          = "DiscoverController";
const SINGLETON_ID = 1;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg","image/png","image/webp","image/avif"];

// ── helpers ───────────────────────────────────────────────────────────────────

async function getOrCreate(): Promise<DiscoverSection> {
  const [row] = await DiscoverSection.findOrCreate({
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

// ── GET /api/ui/discover ──────────────────────────────────────────────────────

export async function getDiscover(_req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getDiscover");
  try {
    const row = await getOrCreate();
    return NextResponse.json({ success: true, data: row }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getDiscover failed", error);
    return errorResponse(error);
  }
}

// ── PUT /api/ui/discover ──────────────────────────────────────────────────────
// Accepts multipart/form-data with optional image file uploads.

export async function updateDiscover(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "updateDiscover");
  try {
    const row = await getOrCreate();
    const contentType = req.headers.get("content-type") ?? "";
    const fields: Record<string, string> = {};

    // image url overrides
    let mainImageUrl:    string | undefined;
    let expandImageUrl:  string | undefined;
    let videoImageUrl:   string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();

      for (const [key, value] of fd.entries()) {
        const imageKeys = ["mainImage","expandImage","videoImage"];
        if (!imageKeys.includes(key) && typeof value === "string") {
          fields[key] = value;
        }
      }

      // ── handle each image field (file > url fallback) ────────────────────
      const mainFile    = fd.get("mainImage")   as File | null;
      const expandFile  = fd.get("expandImage") as File | null;
      const videoFile   = fd.get("videoImage")  as File | null;

      const mainUrlRaw    = fd.get("mainImageUrl")    as string | null;
      const expandUrlRaw  = fd.get("expandImageUrl")  as string | null;
      const videoUrlRaw   = fd.get("videoImageUrl")   as string | null;

      if (mainFile && mainFile.size > 0) {
        if (row.mainImage && storage.isLocalUpload(row.mainImage))
          await storage.delete(row.mainImage);
        mainImageUrl = await saveImage(mainFile, "discover");
      } else if (mainUrlRaw?.trim()) {
        mainImageUrl = mainUrlRaw.trim();
      }

      if (expandFile && expandFile.size > 0) {
        if (row.expandImage && storage.isLocalUpload(row.expandImage))
          await storage.delete(row.expandImage);
        expandImageUrl = await saveImage(expandFile, "discover");
      } else if (expandUrlRaw?.trim()) {
        expandImageUrl = expandUrlRaw.trim();
      }

      if (videoFile && videoFile.size > 0) {
        if (row.videoImage && storage.isLocalUpload(row.videoImage))
          await storage.delete(row.videoImage);
        videoImageUrl = await saveImage(videoFile, "discover");
      } else if (videoUrlRaw?.trim()) {
        videoImageUrl = videoUrlRaw.trim();
      }

    } else {
      const body = await req.json();
      Object.assign(fields, body);
    }

    const str = (k: string) =>
      fields[k] !== undefined ? (fields[k] || null) : undefined;

    await row.update({
      ...(str("eyebrow")           !== undefined && { eyebrow:           str("eyebrow")           }),
      ...(str("heading")           !== undefined && { heading:           str("heading")           }),
      ...(str("description")       !== undefined && { description:       str("description")       }),
      ...(str("ctaText")           !== undefined && { ctaText:           str("ctaText")           }),
      ...(str("expandTitle")       !== undefined && { expandTitle:       str("expandTitle")       }),
      ...(str("expandDescription") !== undefined && { expandDescription: str("expandDescription") }),
      ...(str("expandBtn1Text")    !== undefined && { expandBtn1Text:    str("expandBtn1Text")    }),
      ...(str("expandBtn1Link")    !== undefined && { expandBtn1Link:    str("expandBtn1Link")    }),
      ...(str("expandBtn2Text")    !== undefined && { expandBtn2Text:    str("expandBtn2Text")    }),
      ...(str("expandBtn2Link")    !== undefined && { expandBtn2Link:    str("expandBtn2Link")    }),
      ...(str("expandImageLabel")  !== undefined && { expandImageLabel:  str("expandImageLabel")  }),
      ...(str("diveInto")          !== undefined && { diveInto:          str("diveInto")          }),
      ...(str("diveHeading")       !== undefined && { diveHeading:       str("diveHeading")       }),
      ...(str("diveDescription")   !== undefined && { diveDescription:   str("diveDescription")   }),
      ...(str("videoLabel")        !== undefined && { videoLabel:        str("videoLabel")        }),
      ...(str("videoTitle")        !== undefined && { videoTitle:        str("videoTitle")        }),
      ...(str("videoUrl")          !== undefined && { videoUrl:          str("videoUrl")          }),
      ...(fields.isActive !== undefined && { isActive: fields.isActive !== "false" }),
      ...(mainImageUrl   !== undefined && { mainImage:    mainImageUrl   }),
      ...(expandImageUrl !== undefined && { expandImage:  expandImageUrl }),
      ...(videoImageUrl  !== undefined && { videoImage:   videoImageUrl  }),
    });

    logger.info(CTX, "updateDiscover — saved");
    return NextResponse.json({ success: true, data: row }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateDiscover failed", error);
    return errorResponse(error);
  }
}
