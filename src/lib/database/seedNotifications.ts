/**
 * Seed test notifications for demonstration
 * Run: npx tsx --env-file=.env src/lib/database/seedNotifications.ts
 */

import sequelize from "./sequelize";
import Notification from "../../features/notifications/notificationModel";
import User from "../models/userModel";

async function seedNotifications() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected.");

    // Find an admin user (or use null for broadcast)
    const adminUser = await User.findOne({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      console.log("⚠️  No admin user found. Creating broadcast notifications only.");
    }

    // Create test notifications
    const notifications = [
      {
        userId: adminUser?.id || null,
        type: "order" as const,
        priority: "high" as const,
        title: "New Order #1234 Received",
        message: "A new order worth £145.50 has been placed by John Smith. Review and confirm the order.",
        actionUrl: "/admin/orders/1234",
        actionLabel: "View Order",
        metadata: { orderId: "1234", customerName: "John Smith", amount: 145.50 },
      },
      {
        userId: adminUser?.id || null,
        type: "inventory" as const,
        priority: "urgent" as const,
        title: "Low Stock Alert",
        message: "Paracetamol 500mg is running low (5 units remaining). Reorder stock immediately.",
        actionUrl: "/admin/inventory",
        actionLabel: "Manage Inventory",
        metadata: { productName: "Paracetamol 500mg", stockLevel: 5 },
      },
      {
        userId: adminUser?.id || null,
        type: "customer" as const,
        priority: "medium" as const,
        title: "New Customer Registration",
        message: "Emma Wilson has registered as a new customer. Welcome them to Rosewood Pharmacy!",
        actionUrl: "/admin/customers",
        actionLabel: "View Customers",
        metadata: { customerName: "Emma Wilson" },
      },
      {
        userId: adminUser?.id || null,
        type: "support" as const,
        priority: "high" as const,
        title: "New Support Ticket #TK-789",
        message: "Customer needs help with prescription upload. Response required within 24 hours.",
        actionUrl: "/admin/support-tickets",
        actionLabel: "View Ticket",
        metadata: { ticketNumber: "TK-789" },
      },
      {
        userId: adminUser?.id || null,
        type: "promo" as const,
        priority: "low" as const,
        title: "Spring Sale Campaign Active",
        message: "Your Spring Sale promotion is now live! Track performance in the analytics dashboard.",
        actionUrl: "/admin/dashboard",
        actionLabel: "View Analytics",
        metadata: { campaignName: "Spring Sale 2026" },
      },
      {
        userId: adminUser?.id || null,
        type: "system" as const,
        priority: "medium" as const,
        title: "Weekly Report Ready",
        message: "Your weekly sales and inventory report for 23-30 Sep 2026 is now available.",
        actionUrl: "/admin/reports",
        actionLabel: "View Report",
        metadata: { reportType: "weekly", period: "23-30 Sep 2026" },
      },
    ];

    for (const notif of notifications) {
      await Notification.create(notif);
      console.log(`✅ Created notification: ${notif.title}`);
    }

    console.log("\n🎉 Seeded 6 test notifications successfully!");
    console.log(`📧 Notifications assigned to: ${adminUser ? `Admin User (${adminUser.email})` : "Broadcast (all users)"}`);
    
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedNotifications();
