/**
 * Migration: Create notifications table
 * Run: npm run migrate:notifications
 * 
 * This migration creates the notifications table if it doesn't exist.
 * Safe to run multiple times - will skip if table already exists.
 */

import sequelize from "../sequelize";
import Notification from "../../../features/notifications/notificationModel";

async function migrateNotifications() {
  try {
    console.log("🔄 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected.");

    console.log("🔄 Creating notifications table if it doesn't exist...");
    
    // Sync only the Notification model (creates table if missing)
    await Notification.sync({ alter: false });
    
    console.log("✅ Notifications table created successfully!");
    console.log("💡 The notifications system is now ready to use.");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateNotifications();
