export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { adjustStock } from "@/features/inventory/routes";

/**
 * POST /api/inventory/:id/adjust-stock
 * Manual stock adjustment — for restocking, damage write-off, expiry removal, etc.
 * NOT for order delivery (use /deduct) or cancellation (use /restore).
 *
 * Body: { type: "add" | "subtract", amount: number, reason?: string }
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return adjustStock(req, id);
}
