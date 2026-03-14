export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import TarifsClient from "./TarifsClient";
import OptionsClient from "./OptionsClient";
import PracticalClient from "./PracticalClient";
import TarifsTabsWrapper from "./TarifsTabsWrapper";

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

  const options = await prisma.pricingOption.findMany({
    include: { contents: true },
    orderBy: { position: "asc" },
  });

  const practicalItems = await prisma.practicalInfo.findMany({
    include: { contents: true },
    orderBy: { position: "asc" },
  });

  return (
    <TarifsTabsWrapper
      formulesContent={<TarifsClient plans={plans} />}
      optionsContent={<OptionsClient options={options} />}
      practicalContent={<PracticalClient items={practicalItems} />}
    />
  );
}
