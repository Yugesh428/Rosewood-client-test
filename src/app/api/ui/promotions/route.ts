import { NextRequest } from "next/server";
import {
  getPromotions,
  createPromotion,
} from "@/features/Ui/promotions/promotionsController";

export async function GET(req: NextRequest) {
  return getPromotions(req);
}

export async function POST(req: NextRequest) {
  return createPromotion(req);
}
