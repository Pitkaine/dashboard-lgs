export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import GeoClient from "./GeoClient";

export default async function GeoPage() {
  const pages = await prisma.page.findMany({
    where: { type: "GEO" },
    include: {
      contents: { select: { language: true, title: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return <GeoClient pages={pages} />;
}
