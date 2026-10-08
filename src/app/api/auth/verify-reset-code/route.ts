import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/userModel";

/**
 * POST /api/auth/verify-reset-code
 * Verify the password reset code
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
        otpPurpose: "PASSWORD_RESET",
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset code" },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      // Clear expired OTP
      await user.update({
        otpCode: null,
        otpExpiry: null,
        otpPurpose: null,
      });
      return NextResponse.json(
        { error: "Reset code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Code verified successfully",
    });
  } catch (error) {
    console.error("[Verify Reset Code] Error:", error);
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    );
  }
}
