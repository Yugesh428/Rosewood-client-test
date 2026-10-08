import { NextRequest, NextResponse } from "next/server";
import { getTicketByNumber } from "@/features/support/supportController";

/**
 * POST /api/support/track
 * Track ticket by ticket number
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketNumber } = body;

    if (!ticketNumber) {
      return NextResponse.json(
        { error: "Ticket number is required" },
        { status: 400 }
      );
    }

    const ticket = await getTicketByNumber(ticketNumber);

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error("[Support Track] POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track ticket" },
      { status: 500 }
    );
  }
}
