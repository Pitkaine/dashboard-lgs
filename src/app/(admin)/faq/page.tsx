export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import FaqClient from "./FaqClient";

export default async function FaqPage() {
  const items = await prisma.faqItem.findMany({
    include: {
      contents: {
        select: { id: true, language: true, question: true, answer: true },
      },
    },
    orderBy: { position: "asc" },
  });

  return <FaqClient items={items} />;
}
