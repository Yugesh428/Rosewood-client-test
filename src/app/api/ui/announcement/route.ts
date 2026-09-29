import { NextRequest } from "next/server";
import { listMessages, createMessage } from "@/features/Ui/announcementBar/announcementBarController";

export async function GET(req: NextRequest) {
  return listMessages(req);
}

export async function POST(req: NextRequest) {
  return createMessage(req);
}
