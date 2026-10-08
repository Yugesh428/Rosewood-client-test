import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/userModel";
import { sendMail } from "@/lib/email/mailer";
import { verificationEmailTemplate } from "@/lib/email/templates/verificationEmail";

/**
 * POST /api/auth/send-verification
 * Send email verification code
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

    if (!user) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save OTP to database
    await user.update({
      otpCode,
      otpExpiry,
      otpPurpose: "EMAIL_VERIFICATION",
    });

    // Send email
    const emailTemplate = verificationEmailTemplate({
      name: user.name,
      verificationCode: otpCode,
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
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("[Send Verification] Error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
