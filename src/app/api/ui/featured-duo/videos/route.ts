import { NextRequest } from "next/server";
import { listVideos, createVideo } from "@/features/Ui/featuredDuo/featuredDuoVideoController";

export async function GET(req: NextRequest) {
  return listVideos(req);
}

export async function POST(req: NextRequest) {
  return createVideo(req);
}
