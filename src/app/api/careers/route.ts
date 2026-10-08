import { NextRequest, NextResponse } from "next/server";
import { getJobPostings, createJobPosting, getJobStats } from "@/features/careers/careerController";

/**
 * GET /api/careers
 * Get all job postings (public gets active only, admin gets all)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "stats") {
      const stats = await getJobStats();
      return NextResponse.json(stats);
    }

    const activeOnly = searchParams.get("activeOnly") === "true";
    const department = searchParams.get("department") || undefined;
    const employmentType = searchParams.get("employmentType") || undefined;

    const jobs = await getJobPostings({
      activeOnly: activeOnly || false,
      department,
      employmentType,
    });

    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error("[Careers] GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch job postings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/careers
 * Create a new job posting (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      department,
      location,
      employmentType,
      salaryRange,
      description,
      requirements,
      responsibilities,
      benefits,
      applicationEmail,
      displayOrder,
    } = body;

    // Validation
    if (
      !title ||
      !department ||
      !location ||
      !employmentType ||
      !description ||
      !requirements ||
      !responsibilities ||
      !applicationEmail
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const job = await createJobPosting({
      title,
      department,
      location,
      employmentType,
      salaryRange,
      description,
      requirements,
      responsibilities,
      benefits,
      applicationEmail,
      displayOrder,
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error: any) {
    console.error("[Careers] POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create job posting" },
      { status: 500 }
    );
  }
}
