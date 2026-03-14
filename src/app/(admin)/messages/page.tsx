export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const rawMessages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Serialize Date to string for client component
  const messages = rawMessages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  const unreadCount = await prisma.contactMessage.count({
    where: { isRead: false },
  });

  return <MessagesClient initialMessages={messages} initialUnread={unreadCount} />;
}
