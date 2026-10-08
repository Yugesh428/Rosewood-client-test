export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { confirmDeliveryByToken, confirmDeliveryByCustomer } from "@/features/orders/orderController";

// POST /api/orders/confirm-delivery
// Body: { token } for guests  OR  { orderId, customerId, email? } for logged-in customers
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  if (body.token) {
    return confirmDeliveryByToken(body.token);
  }

  if (body.orderId && body.customerId) {
    return confirmDeliveryByCustomer(body.orderId, body.customerId, body.email);
  }

  return NextResponse.json(
    { success: false, message: "Provide either a token (guest) or orderId + customerId (customer)." },
    { status: 400 }
  );
}
