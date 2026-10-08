export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getBlogBySlug } from "@/features/Ui/blog/blogController";

// GET /api/ui/blog/slug/:slug — get blog by slug for detail page
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return getBlogBySlug(req, slug);
}
