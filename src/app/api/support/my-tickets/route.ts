import { NextRequest, NextResponse } from "next/server";
import { getTickets } from "@/features/support/supportController";
import { auth } from "@/lib/auth/auth";

/**
 * GET /api/support/my-tickets
 * Get tickets for logged-in customer
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const customerEmail = session.user.email;

    if (!customerEmail) {
      return NextResponse.json(
        { error: "No email found" },
        { status: 400 }
      );
    }

    // Get all tickets for this customer
    const allTickets = await getTickets({ search: customerEmail });

    // Filter by exact email match
    const tickets = allTickets.filter(
      (t) => t.customerEmail.toLowerCase() === customerEmail.toLowerCase()
    );

    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error("[My Tickets] GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
