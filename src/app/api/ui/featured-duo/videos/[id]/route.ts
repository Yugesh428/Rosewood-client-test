import { NextRequest } from "next/server";
import { deleteVideo, updateVideo } from "@/features/Ui/featuredDuo/featuredDuoVideoController";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteVideo(req, id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return updateVideo(req, id);
}
