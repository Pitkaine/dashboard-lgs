export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import PagesClient from "./PagesClient";

export default async function PagesPage() {
  const pages = await prisma.page.findMany({
    include: {
      contents: {
        select: { language: true, title: true },
      },
      seo: {
        select: { language: true, metaTitle: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return <PagesClient pages={pages} />;
}
