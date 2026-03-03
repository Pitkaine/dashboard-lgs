export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import TeamClient from "./TeamClient";

export default async function TeamPage() {
  const members = await prisma.team.findMany({
    orderBy: { id: "asc" },
  });

  return <TeamClient members={members} />;
}
