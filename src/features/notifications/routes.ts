/**
 * Notification Routes
 * Base: /api/notifications
 */

export {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
} from "./notificationController";

export const NOTIFICATION_ROUTES = {
  list: "GET    /api/notifications",
  unreadCount: "GET    /api/notifications/unread-count",
  create: "POST   /api/notifications",
  markRead: "PATCH  /api/notifications/:id/read",
  markAllRead: "PATCH  /api/notifications/mark-all-read",
  delete: "DELETE /api/notifications/:id",
} as const;
