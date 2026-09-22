import { NextRequest } from "next/server";
import { getDiscover, updateDiscover } from "@/features/Ui/discoverSection/discoverController";

export async function GET(req: NextRequest) {
  return getDiscover(req);
}

export async function PUT(req: NextRequest) {
  return updateDiscover(req);
}
