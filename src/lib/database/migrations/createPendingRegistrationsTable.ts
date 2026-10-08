/**
 * Migration: Create pending_registrations table
 * Run: npm run migrate:pending-registrations
 */

import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function createPendingRegistrationsTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 2,
  });

  try {
    console.log("🔄 Creating pending_registrations table...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_registrations (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        "passwordHash" VARCHAR(255) NOT NULL,
        "otpCode" VARCHAR(10) NOT NULL,
        "otpExpiry" TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    console.log("✅ Table pending_registrations created successfully!");

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_pending_registrations_email 
      ON pending_registrations(email);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_pending_registrations_otp_expiry 
      ON pending_registrations("otpExpiry");
    `);

    console.log("✅ Indexes created successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createPendingRegistrationsTable();
