export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import {
  getBlog,
  updateBlog,
  toggleBlogPublish,
  deleteBlog,
} from "@/features/Ui/blog/blogController";

// GET    /api/ui/blog/:id        — get single blog by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return getBlog(req, id);
}

// PUT    /api/ui/blog/:id        — admin: update blog
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return updateBlog(req, id);
}

// PATCH  /api/ui/blog/:id — admin: toggle publish status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return toggleBlogPublish(req, id);
}

// DELETE /api/ui/blog/:id        — admin: delete blog
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return deleteBlog(req, id);
}
