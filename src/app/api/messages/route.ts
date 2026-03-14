export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = await prisma.contactMessage.count({
    where: { isRead: false },
  });

  return NextResponse.json({ messages, unreadCount });
}
