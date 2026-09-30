import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import Notification from "./notificationModel";
import { AppError, errorResponse } from "@/lib/apiError";
import { logger } from "@/lib/logger";

const CTX = "NotificationController";

/**
 * GET /api/notifications
 * Get notifications for the authenticated user
 * Query: ?unreadOnly=true&limit=20&page=1&type=order
 */
export async function getNotifications(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getNotifications — start");

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const type = searchParams.get("type");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const offset = (page - 1) * limit;

    if (!userId) {
      throw new AppError("userId is required", 400, "MISSING_USER_ID");
    }

    const where: Record<string, any> = {
      [Op.or]: [
        { userId },
        { userId: null }, // Broadcast notifications
      ],
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    if (type) {
      where.type = type;
    }

    // Don't show expired notifications
    where[Op.or] = [
      { expiresAt: null },
      { expiresAt: { [Op.gt]: new Date() } },
    ];

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [
        ["isRead", "ASC"],
        ["createdAt", "DESC"],
      ],
      limit,
      offset,
    });

    logger.info(CTX, `getNotifications — ${rows.length} of ${count}`);

    return NextResponse.json({
      success: true,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1,
      },
      data: rows,
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getNotifications — failed", error);
    return errorResponse(error);
  }
}

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications for a user
 */
export async function getUnreadCount(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "getUnreadCount — start");

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      throw new AppError("userId is required", 400, "MISSING_USER_ID");
    }

    const count = await Notification.count({
      where: {
        [Op.or]: [
          { userId },
          { userId: null },
        ],
        isRead: false,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } },
        ],
      },
    });

    logger.info(CTX, `getUnreadCount — ${count}`);

    return NextResponse.json({
      success: true,
      data: { count },
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "getUnreadCount — failed", error);
    return errorResponse(error);
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
export async function markAsRead(
  req: NextRequest,
  id: string
): Promise<NextResponse> {
  logger.info(CTX, "markAsRead — start", { id });

  try {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      throw new AppError("Notification not found", 404, "NOT_FOUND");
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    logger.info(CTX, "markAsRead — success");

    return NextResponse.json({
      success: true,
      data: notification,
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "markAsRead — failed", { id, error });
    return errorResponse(error);
  }
}

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "markAllAsRead — start");

  try {
    const { userId } = await req.json();

    if (!userId) {
      throw new AppError("userId is required", 400, "MISSING_USER_ID");
    }

    const [count] = await Notification.update(
      {
        isRead: true,
        readAt: new Date(),
      },
      {
        where: {
          [Op.or]: [
            { userId },
            { userId: null },
          ],
          isRead: false,
        },
      }
    );

    logger.info(CTX, `markAllAsRead — ${count} notifications marked as read`);

    return NextResponse.json({
      success: true,
      data: { count },
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "markAllAsRead — failed", error);
    return errorResponse(error);
  }
}

/**
 * POST /api/notifications
 * Create a new notification (admin only)
 */
export async function createNotification(req: NextRequest): Promise<NextResponse> {
  logger.info(CTX, "createNotification — start");

  try {
    const body = await req.json();
    const {
      userId,
      type,
      priority,
      title,
      message,
      actionUrl,
      actionLabel,
      metadata,
      expiresAt,
    } = body;

    if (!title || !message) {
      throw new AppError("title and message are required", 400, "VALIDATION_ERROR");
    }

    const notification = await Notification.create({
      userId: userId || null,
      type: type || "system",
      priority: priority || "medium",
      title,
      message,
      actionUrl: actionUrl || null,
      actionLabel: actionLabel || null,
      metadata: metadata || {},
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    logger.info(CTX, "createNotification — success", { id: notification.id });

    return NextResponse.json({
      success: true,
      data: notification,
    }, { status: 201 });
  } catch (error) {
    logger.error(CTX, "createNotification — failed", error);
    return errorResponse(error);
  }
}

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
export async function deleteNotification(
  req: NextRequest,
  id: string
): Promise<NextResponse> {
  logger.info(CTX, "deleteNotification — start", { id });

  try {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      throw new AppError("Notification not found", 404, "NOT_FOUND");
    }

    await notification.destroy();

    logger.info(CTX, "deleteNotification — success");

    return NextResponse.json({
      success: true,
      message: "Notification deleted",
    }, { status: 200 });
  } catch (error) {
    logger.error(CTX, "deleteNotification — failed", { id, error });
    return errorResponse(error);
  }
}
