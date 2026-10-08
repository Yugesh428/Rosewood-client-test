/**
 * Cleanup script to remove expired pending registrations
 * Run this periodically (e.g., via cron job) to clean up the database
 * 
 * Usage: npm run cleanup:registrations
 */

import PendingRegistration from "@/features/auth/pendingRegistrationModel";
import sequelize from "./sequelize";
import { Op } from "sequelize";

async function cleanupExpiredRegistrations() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected.");

    // Delete all pending registrations where OTP has expired
    const deletedCount = await PendingRegistration.destroy({
      where: {
        otpExpiry: {
          [Op.lt]: new Date(), // OTP expired
        },
      },
    });

    console.log(`✅ Cleaned up ${deletedCount} expired pending registration(s).`);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

cleanupExpiredRegistrations();
