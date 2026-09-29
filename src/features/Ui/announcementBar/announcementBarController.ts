import { NextRequest, NextResponse } from "next/server";
import AnnouncementMessage from "./announcementBarModel";
import { logger } from "@/lib/logger";
import { AppError, errorResponse } from "@/lib/apiError";

const CTX = "AnnouncementBarController";

// ── GET /api/ui/announcement — list all (active only for public, all for admin)
export async function listMessages(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "listMessages");
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true"; // admin passes ?all=true

    const where = all ? {} : { isActive: true };

    const rows = await AnnouncementMessage.findAll({
      where,
      order: [["sortOrder", "ASC"], ["createdAt", "ASC"]],
    });
    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "listMessages failed", error);
    return errorResponse(error);
  }
}

// ── POST /api/ui/announcement — create a new message
export async function createMessage(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "createMessage");
  try {
    const body = await req.json();
    const { text, cta, link, isActive, sortOrder } = body;

    if (!text?.trim()) throw new AppError("text is required.", 400, "VALIDATION");

    // Auto-assign sortOrder to end of list
    const count = await AnnouncementMessage.count();

    const row = await AnnouncementMessage.create({
      text:      text.trim(),
      cta:       cta?.trim()  || null,
      link:      link?.trim() || "/pharmacy",
      isActive:  isActive  !== undefined ? Boolean(isActive)  : true,
      sortOrder: sortOrder !== undefined ? Number(sortOrder)  : count,
    });

    logger.info(CTX, "createMessage saved", row.id);
    return NextResponse.json({ success: true, data: row }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createMessage failed", error);
    return errorResponse(error);
  }
}

// ── PATCH /api/ui/announcement/[id] — update text/cta/link/isActive/sortOrder
export async function updateMessage(req: NextRequest, id: string): Promise<NextResponse> {
  logger.info(CTX, "updateMessage", id);
  try {
    const row = await AnnouncementMessage.findByPk(id);
    if (!row) throw new AppError("Message not found.", 404, "NOT_FOUND");

    const body = await req.json();
    await row.update({
      ...(body.text      !== undefined && { text:      body.text.trim()       }),
      ...(body.cta       !== undefined && { cta:       body.cta?.trim() || null }),
      ...(body.link      !== undefined && { link:      body.link?.trim() || null }),
      ...(body.isActive  !== undefined && { isActive:  Boolean(body.isActive)  }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder)  }),
    });

    return NextResponse.json({ success: true, data: row }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "updateMessage failed", error);
    return errorResponse(error);
  }
}

// ── DELETE /api/ui/announcement/[id]
export async function deleteMessage(req: NextRequest, id: string): Promise<NextResponse> {
  logger.info(CTX, "deleteMessage", id);
  try {
    const row = await AnnouncementMessage.findByPk(id);
    if (!row) throw new AppError("Message not found.", 404, "NOT_FOUND");

    await row.destroy();
    logger.info(CTX, "deleteMessage done", id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "deleteMessage failed", error);
    return errorResponse(error);
  }
}
