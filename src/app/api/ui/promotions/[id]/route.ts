import { NextRequest } from "next/server";
import {
  updatePromotion,
  deletePromotion,
} from "@/features/Ui/promotions/promotionsController";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return updatePromotion(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deletePromotion(req, id);
}
