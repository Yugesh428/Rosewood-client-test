import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/userModel";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/reset-password
 * Reset password with verified code
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Email, code, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
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

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    await user.update({
      password: hashedPassword,
      otpCode: null,
      otpExpiry: null,
      otpPurpose: null,
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("[Reset Password] Error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
