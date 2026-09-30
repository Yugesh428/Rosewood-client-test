import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/userModel";

/**
 * POST /api/auth/check-account
 * Check if account exists and its status
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

    const user = await User.findOne({
      where: { email: normalizedEmail },
      attributes: ["id", "email", "isActive", "role"],
    });

    if (!user) {
      return NextResponse.json(
        { exists: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      exists: true,
      isActive: user.isActive,
      role: user.role,
      needsVerification: !user.isActive,
    });
  } catch (error) {
    console.error("[Check Account] Error:", error);
    return NextResponse.json(
      { error: "Failed to check account" },
      { status: 500 }
    );
  }
}
