import { NextRequest, NextResponse } from "next/server";
import { getTermsSections, createTermsSection } from "@/features/legal/termsController";

/**
 * GET /api/terms
 * Get all terms sections (public gets active only)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const sections = await getTermsSections(activeOnly);

    return NextResponse.json(sections);
  } catch (error: any) {
    console.error("[Terms] GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch terms sections" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/terms
 * Create a new terms section (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { title, content, displayOrder } = body;

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const section = await createTermsSection({
      title,
      content,
      displayOrder,
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error: any) {
    console.error("[Terms] POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create terms section" },
      { status: 500 }
    );
  }
}
