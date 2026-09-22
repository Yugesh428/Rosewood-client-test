export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import {
  getFeaturedDuo,
  updateFeaturedDuo,
} from "@/features/Ui/featuredDuo/featuredDuoController";

export async function GET(req: NextRequest) {
  return getFeaturedDuo(req);
}

export async function PUT(req: NextRequest) {
  return updateFeaturedDuo(req);
}
