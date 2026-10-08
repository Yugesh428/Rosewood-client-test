/* eslint-disable @typescript-eslint/no-require-imports */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import PendingRegistration from "@/features/auth/pendingRegistrationModel";
import { Op } from "sequelize";

export async function POST(req: NextRequest) {
  try {
    const { email, otpCode } = await req.json();

    if (!email?.trim() || !otpCode?.trim()) {
      return NextResponse.json(
        { error: "Email and OTP code are required." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find pending registration
    const pending = await PendingRegistration.findOne({
      where: {
        email: normalizedEmail,
        otpCode: otpCode.trim(),
        otpExpiry: {
          [Op.gt]: new Date(), // OTP not expired
        },
      },
    });

    if (!pending) {
      return NextResponse.json(
        { error: "Invalid or expired OTP code." },
        { status: 400 },
      );
    }

    // OTP is valid - now create the user in the database
    const { Pool } = require("pg") as typeof import("pg");
    const { v4: uuidv4 } = require("uuid") as typeof import("uuid");

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 2,
    });

    const id = uuidv4();
    const now = new Date();

    try {
      // Create user with isActive = true (verified user)
      await pool.query(
        `INSERT INTO users (id, name, email, password, role, "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 'CUSTOMER', true, $5, $6)`,
        [id, pending.name, pending.email, pending.passwordHash, now, now],
      );

      // Delete the pending registration
      await PendingRegistration.destroy({ where: { id: pending.id } });

      await pool.end();

      return NextResponse.json(
        {
          success: true,
          message: "Email verified successfully! Your account has been created.",
        },
        { status: 201 },
      );
    } catch (dbError: unknown) {
      await pool.end();
      
      // Check if it's a duplicate email error
      if (dbError && typeof dbError === 'object' && 'code' in dbError && dbError.code === '23505') {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 },
        );
      }
      throw dbError;
    }
  } catch (err) {
    console.error("[VERIFY-OTP] error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
