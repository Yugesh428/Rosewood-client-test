export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getUnreadCount } from "@/features/notifications/routes";

// GET /api/notifications/unread-count
export async function GET(req: NextRequest) {
  return getUnreadCount(req);
}
