import { NextRequest } from "next/server";
import { updateMessage, deleteMessage } from "@/features/Ui/announcementBar/announcementBarController";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return updateMessage(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteMessage(req, id);
}
