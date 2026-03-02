import { prisma } from "@/lib/prisma";
import PlanEditorClient from "./PlanEditorClient";

export default async function PlanEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "new") {
    return <PlanEditorClient plan={null} />;
  }

  const planId = parseInt(id, 10);
  if (isNaN(planId)) {
    return <div className="p-8 text-red-500">ID invalide</div>;
  }

  const plan = await prisma.pricingPlan.findUnique({
    where: { id: planId },
    include: {
      contents: true,
      features: { orderBy: { position: "asc" } },
    },
  });

  if (!plan) {
    return <div className="p-8 text-red-500">Formule introuvable</div>;
  }

  return <PlanEditorClient plan={plan} />;
}
