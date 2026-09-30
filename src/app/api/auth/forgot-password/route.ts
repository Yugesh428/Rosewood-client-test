import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/userModel";
import { sendMail } from "@/lib/email/mailer";
import { passwordResetEmailTemplate } from "@/lib/email/templates/passwordReset";

/**
 * POST /api/auth/forgot-password
 * Request a password reset code
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ where: { email: normalizedEmail } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a reset code has been sent.",
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save OTP to database
    await user.update({
      otpCode,
      otpExpiry,
      otpPurpose: "PASSWORD_RESET",
    });

    // Send email
    const emailTemplate = passwordResetEmailTemplate({
      name: user.name,
      resetCode: otpCode,
      expiryMinutes: 15,
    });

    await sendMail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a reset code has been sent.",
    });
  } catch (error) {
    console.error("[Forgot Password] Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
