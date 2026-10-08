export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getNotifications, createNotification } from "@/features/notifications/routes";

// GET /api/notifications → list notifications for user
export async function GET(req: NextRequest) {
  return getNotifications(req);
}

// POST /api/notifications → create new notification (admin)
export async function POST(req: NextRequest) {
  return createNotification(req);
}
