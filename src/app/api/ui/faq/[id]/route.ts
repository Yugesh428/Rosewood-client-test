export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getFaqById, updateFaq, toggleFaq, deleteFaq } from "@/features/Ui/faq/routes";

// GET /api/ui/faq/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return getFaqById(req, id);
}

// PUT /api/ui/faq/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return updateFaq(req, id);
}

// PATCH /api/ui/faq/:id  (toggle isActive)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return toggleFaq(req, id);
}

// DELETE /api/ui/faq/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return deleteFaq(req, id);
}
