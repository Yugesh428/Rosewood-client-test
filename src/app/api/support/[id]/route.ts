import { NextRequest, NextResponse } from "next/server";
import { getTicketById, updateTicket, deleteTicket } from "@/features/support/supportController";

/**
 * GET /api/support/:id
 * Get single ticket by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = await getTicketById(id);

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error("[Support] GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/support/:id
 * Update ticket
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const ticket = await updateTicket(id, body);

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error("[Support] PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update ticket" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/support/:id
 * Delete ticket
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteTicket(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Support] DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
