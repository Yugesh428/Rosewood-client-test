/**
 * Notification Service - Helper functions to create notifications
 * Use these throughout the app to trigger automatic notifications
 */

import Notification from "./notificationModel";
import { logger } from "@/lib/logger";
import User from "@/lib/models/userModel";

const CTX = "NotificationService";

/**
 * Create notification for all admin users
 */
export async function notifyAdmins(params: {
  type: "order" | "inventory" | "customer" | "system" | "promo" | "support";
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}) {
  try {
    // Get all admin users
    const admins = await User.findAll({
      where: { role: "ADMIN", isActive: true },
      attributes: ["id"],
    });

    if (admins.length === 0) {
      logger.warn(CTX, "notifyAdmins — no active admins found");
      return;
    }

    // Create notification for each admin
    const notifications = admins.map((admin) => ({
      userId: admin.id,
      type: params.type,
      priority: params.priority,
      title: params.title,
      message: params.message,
      actionUrl: params.actionUrl || null,
      actionLabel: params.actionLabel || null,
      metadata: params.metadata || {},
    }));

    await Notification.bulkCreate(notifications);
    logger.info(CTX, `notifyAdmins — created ${notifications.length} notifications`, {
      type: params.type,
      title: params.title,
    });
  } catch (error) {
    logger.error(CTX, "notifyAdmins — failed", error);
  }
}

/**
 * Create notification for specific user
 */
export async function notifyUser(
  userId: string,
  params: {
    type: "order" | "inventory" | "customer" | "system" | "promo" | "support";
    priority: "low" | "medium" | "high" | "urgent";
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
    metadata?: Record<string, any>;
  }
) {
  try {
    await Notification.create({
      userId,
      type: params.type,
      priority: params.priority,
      title: params.title,
      message: params.message,
      actionUrl: params.actionUrl || null,
      actionLabel: params.actionLabel || null,
      metadata: params.metadata || {},
    });

    logger.info(CTX, "notifyUser — created", { userId, type: params.type, title: params.title });
  } catch (error) {
    logger.error(CTX, "notifyUser — failed", { userId, error });
  }
}

/**
 * Create broadcast notification (visible to all users)
 */
export async function notifyBroadcast(params: {
  type: "order" | "inventory" | "customer" | "system" | "promo" | "support";
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}) {
  try {
    await Notification.create({
      userId: null, // null = broadcast
      type: params.type,
      priority: params.priority,
      title: params.title,
      message: params.message,
      actionUrl: params.actionUrl || null,
      actionLabel: params.actionLabel || null,
      metadata: params.metadata || {},
      expiresAt: params.expiresAt || null,
    });

    logger.info(CTX, "notifyBroadcast — created", { type: params.type, title: params.title });
  } catch (error) {
    logger.error(CTX, "notifyBroadcast — failed", error);
  }
}

// ── Specific Event Helpers ────────────────────────────────────────────────────

/**
 * Notify admins when new order is placed
 */
export async function notifyNewOrder(orderId: string, customerName: string, totalAmount: number) {
  await notifyAdmins({
    type: "order",
    priority: "high",
    title: `New Order #${orderId.slice(0, 8)}`,
    message: `${customerName} placed an order worth £${totalAmount.toFixed(2)}. Review and confirm.`,
    actionUrl: `/admin/orders/${orderId}`,
    actionLabel: "View Order",
    metadata: { orderId, customerName, totalAmount },
  });
}

/**
 * Notify customer when order status changes
 */
export async function notifyOrderStatusChange(
  customerId: string,
  orderId: string,
  newStatus: string
) {
  const statusMessages: Record<string, string> = {
    confirmed: "Your order has been confirmed and is being prepared.",
    processing: "Your order is now being processed.",
    shipped: "Good news! Your order has been shipped and is on its way.",
    delivered: "Your order has been delivered. Thank you for shopping with us!",
    cancelled: "Your order has been cancelled.",
  };

  const message = statusMessages[newStatus] || `Your order status has been updated to ${newStatus}.`;

  await notifyUser(customerId, {
    type: "order",
    priority: newStatus === "shipped" || newStatus === "delivered" ? "high" : "medium",
    title: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    message,
    actionUrl: `/orders/${orderId}`,
    actionLabel: "View Order",
    metadata: { orderId, status: newStatus },
  });
}

/**
 * Notify admins when inventory is low
 */
export async function notifyLowStock(productName: string, stockLevel: number, productId: string) {
  await notifyAdmins({
    type: "inventory",
    priority: stockLevel <= 5 ? "urgent" : "high",
    title: "Low Stock Alert",
    message: `${productName} is running low (${stockLevel} units remaining). Reorder stock soon.`,
    actionUrl: `/admin/inventory?productId=${productId}`,
    actionLabel: "Manage Inventory",
    metadata: { productId, productName, stockLevel },
  });
}

/**
 * Notify admins when product is out of stock
 */
export async function notifyOutOfStock(productName: string, productId: string) {
  await notifyAdmins({
    type: "inventory",
    priority: "urgent",
    title: "Out of Stock Alert",
    message: `${productName} is now out of stock. Reorder immediately to avoid lost sales.`,
    actionUrl: `/admin/inventory?productId=${productId}`,
    actionLabel: "Reorder Now",
    metadata: { productId, productName, stockLevel: 0 },
  });
}

/**
 * Notify admins when new customer registers
 */
export async function notifyNewCustomer(customerId: string, customerName: string, customerEmail: string) {
  await notifyAdmins({
    type: "customer",
    priority: "low",
    title: "New Customer Registration",
    message: `${customerName} (${customerEmail}) has registered. Welcome them to Rosewood Pharmacy!`,
    actionUrl: `/admin/customers/${customerId}`,
    actionLabel: "View Profile",
    metadata: { customerId, customerName, customerEmail },
  });
}

/**
 * Notify admins when new support ticket is created
 */
export async function notifyNewSupportTicket(
  ticketId: string,
  ticketNumber: string,
  customerName: string,
  subject: string
) {
  await notifyAdmins({
    type: "support",
    priority: "high",
    title: `New Support Ticket ${ticketNumber}`,
    message: `${customerName} needs help: "${subject}". Response required within 24 hours.`,
    actionUrl: `/admin/support-tickets/${ticketId}`,
    actionLabel: "View Ticket",
    metadata: { ticketId, ticketNumber, customerName, subject },
  });
}

/**
 * Notify customer when their support ticket gets a response
 */
export async function notifySupportResponse(
  customerId: string,
  ticketNumber: string,
  ticketId: string
) {
  await notifyUser(customerId, {
    type: "support",
    priority: "medium",
    title: "Support Ticket Updated",
    message: `Our team has responded to your ticket ${ticketNumber}. Check the latest update.`,
    actionUrl: `/support/tickets/${ticketId}`,
    actionLabel: "View Response",
    metadata: { ticketId, ticketNumber },
  });
}

/**
 * Notify admins when inventory batch is expiring soon
 */
export async function notifyExpiringStock(
  productName: string,
  batchNumber: string,
  expiryDate: Date,
  quantity: number
) {
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  await notifyAdmins({
    type: "inventory",
    priority: daysUntilExpiry <= 30 ? "urgent" : "high",
    title: "Expiring Stock Alert",
    message: `${productName} (Batch: ${batchNumber}) expires in ${daysUntilExpiry} days. ${quantity} units remaining.`,
    actionUrl: `/admin/inventory`,
    actionLabel: "Review Inventory",
    metadata: { productName, batchNumber, expiryDate, quantity, daysUntilExpiry },
  });
}

/**
 * Send promotional notification to all customers
 */
export async function notifyPromotion(
  title: string,
  message: string,
  actionUrl: string,
  expiresAt?: Date
) {
  await notifyBroadcast({
    type: "promo",
    priority: "low",
    title,
    message,
    actionUrl,
    actionLabel: "View Offer",
    expiresAt,
  });
}

/**
 * System maintenance or important announcement
 */
export async function notifySystemMessage(
  title: string,
  message: string,
  priority: "low" | "medium" | "high" | "urgent" = "medium",
  actionUrl?: string
) {
  await notifyBroadcast({
    type: "system",
    priority,
    title,
    message,
    actionUrl: actionUrl || undefined,
    actionLabel: actionUrl ? "Learn More" : undefined,
  });
}
