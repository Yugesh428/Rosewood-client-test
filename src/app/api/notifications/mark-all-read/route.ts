export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { markAllAsRead } from "@/features/notifications/routes";

// PATCH /api/notifications/mark-all-read
export async function PATCH(req: NextRequest) {
  return markAllAsRead(req);
}
