import { NextRequest, NextResponse } from "next/server";
import {
  getJobPostingById,
  updateJobPosting,
  toggleJobPosting,
  deleteJobPosting,
} from "@/features/careers/careerController";

/**
 * GET /api/careers/:id
 * Get single job posting
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await getJobPostingById(id);

    if (!job) {
      return NextResponse.json(
        { error: "Job posting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error: any) {
    console.error("[Careers] GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch job posting" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/careers/:id
 * Update job posting
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const job = await updateJobPosting(id, body);

    return NextResponse.json(job);
  } catch (error: any) {
    console.error("[Careers] PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update job posting" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/careers/:id
 * Toggle job posting active status
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await toggleJobPosting(id);

    return NextResponse.json(job);
  } catch (error: any) {
    console.error("[Careers] PATCH error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to toggle job posting" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/careers/:id
 * Delete job posting
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteJobPosting(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Careers] DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete job posting" },
      { status: 500 }
    );
  }
}
