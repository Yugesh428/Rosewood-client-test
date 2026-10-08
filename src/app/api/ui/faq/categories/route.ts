export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getFaqCategories } from "@/features/Ui/faq/routes";

// GET /api/ui/faq/categories — distinct active categories
export async function GET(req: NextRequest) {
  return getFaqCategories(req);
}
