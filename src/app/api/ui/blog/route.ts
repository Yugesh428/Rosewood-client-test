export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import {
  getBlogs,
  createBlog,
  reorderBlogs,
} from "@/features/Ui/blog/blogController";

// GET   /api/ui/blog          — public (published) | admin (?all=true)
export async function GET(req: NextRequest) {
  return getBlogs(req);
}

// POST  /api/ui/blog          — admin: create (multipart or JSON)
export async function POST(req: NextRequest) {
  return createBlog(req);
}

// PATCH /api/ui/blog/reorder  — admin: reorder (body: [{id, displayOrder}])
export async function PATCH(req: NextRequest) {
  return reorderBlogs(req);
}
