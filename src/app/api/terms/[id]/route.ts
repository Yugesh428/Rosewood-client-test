import { NextRequest, NextResponse } from "next/server";
import {
  getTermsSectionById,
  updateTermsSection,
  toggleTermsSection,
  deleteTermsSection,
} from "@/features/legal/termsController";

/**
 * GET /api/terms/:id
 * Get single terms section
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const section = await getTermsSectionById(id);

    if (!section) {
      return NextResponse.json(
        { error: "Terms section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(section);
  } catch (error: any) {
    console.error("[Terms] GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch terms section" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/terms/:id
 * Update terms section
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const section = await updateTermsSection(id, body);

    return NextResponse.json(section);
  } catch (error: any) {
    console.error("[Terms] PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update terms section" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/terms/:id
 * Toggle terms section active status
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const section = await toggleTermsSection(id);

    return NextResponse.json(section);
  } catch (error: any) {
    console.error("[Terms] PATCH error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to toggle terms section" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/terms/:id
 * Delete terms section
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteTermsSection(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Terms] DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete terms section" },
      { status: 500 }
    );
  }
}
