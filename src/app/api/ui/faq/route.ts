export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getFaqs, createFaq } from "@/features/Ui/faq/routes";

// GET  /api/ui/faq  — public (active) | admin (?all=true) | filter (?category=)
export async function GET(req: NextRequest) {
  return getFaqs(req);
}

// POST /api/ui/faq  — admin: create
export async function POST(req: NextRequest) {
  return createFaq(req);
}
