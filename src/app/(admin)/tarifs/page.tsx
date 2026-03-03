export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import TarifsClient from "./TarifsClient";

export default async function TarifsPage() {
  const plans = await prisma.pricingPlan.findMany({
    include: {
      contents: { select: { language: true, name: true, subtitle: true } },
      features: {
        select: { language: true, text: true, included: true },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { position: "asc" },
  });

  return <TarifsClient plans={plans} />;
}
