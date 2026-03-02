import { prisma } from "@/lib/prisma";
import PortfolioClient from "./PortfolioClient";

export default async function PortfolioPage() {
  const weddings = await prisma.wedding.findMany({
    include: {
      details: { select: { language: true, title: true, location: true } },
      media: {
        where: { isCover: true },
        take: 1,
        select: { url: true, type: true },
      },
    },
    orderBy: { date: "desc" },
  });

  return <PortfolioClient weddings={weddings} />;
}
