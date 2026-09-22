import { NextRequest } from "next/server";
import { getAllPromotions } from "@/features/Ui/promotions/promotionsController";

export async function GET(req: NextRequest) {
  return getAllPromotions(req);
}
