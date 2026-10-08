export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { toggleStaffActive } from "@/features/staff/routes";

// PATCH /api/staff/:id/toggle-active
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return toggleStaffActive(req, id);
}
