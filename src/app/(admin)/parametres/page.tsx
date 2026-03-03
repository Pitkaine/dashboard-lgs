import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const settings = await prisma.siteSetting.findMany({
    orderBy: { group: "asc" },
  });

  // Group settings by group
  const grouped: Record<string, { id: number; key: string; value: string }[]> = {};
  settings.forEach((s) => {
    if (!grouped[s.group]) grouped[s.group] = [];
    grouped[s.group].push({ id: s.id, key: s.key, value: s.value });
  });

  return <SettingsClient settings={grouped} />;
}
