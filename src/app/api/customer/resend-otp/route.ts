/* eslint-disable @typescript-eslint/no-require-imports */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import PendingRegistration from "@/features/auth/pendingRegistrationModel";
import { sendMail } from "@/lib/email/mailer";
import { verificationEmailTemplate } from "@/lib/email/templates/verificationEmail";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find pending registration
    const pending = await PendingRegistration.findOne({
      where: { email: normalizedEmail },
    });

    if (!pending) {
      return NextResponse.json(
        { error: "No pending registration found for this email." },
        { status: 404 },
      );
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update pending registration with new OTP
    await pending.update({
      otpCode,
      otpExpiry,
    });

    // Send verification email
    const emailTemplate = verificationEmailTemplate({
      name: pending.name,
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
        message: "A new verification code has been sent to your email.",
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[RESEND-OTP] error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
