/* eslint-disable @typescript-eslint/no-require-imports */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/email/mailer";
import { verificationEmailTemplate } from "@/lib/email/templates/verificationEmail";
import PendingRegistration from "@/features/auth/pendingRegistrationModel";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

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

    // Check if email already exists in users table (completed registrations)
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [normalizedEmail],
    );
    if (existingUser.rows.length > 0) {
      await pool.end();
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing pending registration for this email (allow re-registration)
    await PendingRegistration.destroy({ where: { email: normalizedEmail } });

    // Store in pending registrations table (NOT in users table yet)
    await PendingRegistration.create({
      id: uuidv4(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashedPassword,
      otpCode,
      otpExpiry,
    });

    await pool.end();

    // Send verification email
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
        success: true,
        message: "Verification code sent to your email. Please verify to complete registration.",
        email: normalizedEmail,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[REGISTER] error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
