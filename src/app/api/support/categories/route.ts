import { NextResponse } from "next/server";
import { getTicketCategories } from "@/features/support/supportController";

/**
 * GET /api/support/categories
 * Get all support categories
 */
export async function GET() {
  try {
    const categories = await getTicketCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("[Support Categories] GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
