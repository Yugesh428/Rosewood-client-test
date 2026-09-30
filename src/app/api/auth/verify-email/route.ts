import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/userModel";

/**
 * POST /api/auth/verify-email
 * Verify email with code
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user with valid OTP
    const user = await User.findOne({
      where: {
        email: normalizedEmail,
        otpCode: code.trim(),
        otpPurpose: "EMAIL_VERIFICATION",
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      await user.update({
        otpCode: null,
        otpExpiry: null,
        otpPurpose: null,
      });
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark email as verified and clear OTP
    await user.update({
      isActive: true,
      otpCode: null,
      otpExpiry: null,
      otpPurpose: null,
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("[Verify Email] Error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
