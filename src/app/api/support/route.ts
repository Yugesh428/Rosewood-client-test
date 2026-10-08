import { NextRequest, NextResponse } from "next/server";
import { getTickets, createTicket, getTicketStats } from "@/features/support/supportController";

/**
 * GET /api/support
 * Get all tickets (admin) or stats
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "stats") {
      const stats = await getTicketStats();
      return NextResponse.json(stats);
    }

    // Get tickets with filters
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const tickets = await getTickets({ status, category, search });

    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error("[Support] GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/support
 * Create a new support ticket
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      subject,
      category,
      message,
    } = body;

    // Validation
    if (!customerName || !customerEmail || !subject || !category || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const ticket = await createTicket({
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      subject,
      category,
      message,
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error: any) {
    console.error("[Support] POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create ticket" },
      { status: 500 }
    );
  }
}
