/* eslint-disable @typescript-eslint/no-require-imports */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/email/mailer";
import { verificationEmailTemplate } from "@/lib/email/templates/verificationEmail";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, skipVerification } = await req.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const bcrypt = require("bcryptjs") as typeof import("bcryptjs");
    const { Pool } = require("pg") as typeof import("pg");
    const { v4: uuidv4 } = require("uuid") as typeof import("uuid");

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 2,
    });

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [normalizedEmail],
    );
    if (existing.rows.length > 0) {
      await pool.end();
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = uuidv4();
    const now = new Date();

    // Generate OTP for email verification (unless skipped)
    let otpCode = null;
    let otpExpiry = null;
    let otpPurpose = null;
    let isActive = true;

    if (!skipVerification) {
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      otpPurpose = "EMAIL_VERIFICATION";
      isActive = false; // Require verification before activation
    }

    await pool.query(
      `INSERT INTO users (id, name, email, password, role, "isActive", "otpCode", "otpExpiry", "otpPurpose", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'CUSTOMER', $5, $6, $7, $8, $9, $10)`,
      [id, name.trim(), normalizedEmail, hashedPassword, isActive, otpCode, otpExpiry, otpPurpose, now, now],
    );
    await pool.end();

    // Send verification email
    if (!skipVerification && otpCode) {
      const emailTemplate = verificationEmailTemplate({
        name: name.trim(),
        verificationCode: otpCode,
        expiryMinutes: 15,
      });

      await sendMail({
        to: normalizedEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });

      return NextResponse.json(
        { 
          message: "Account created successfully. Please verify your email.",
          requiresVerification: true,
          email: normalizedEmail,
        },
        { status: 201 },
      );
    }

    return NextResponse.json(
      { message: "Account created successfully." },
      { status: 201 },
    );
  } catch (err) {
    console.error("[REGISTER] error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
