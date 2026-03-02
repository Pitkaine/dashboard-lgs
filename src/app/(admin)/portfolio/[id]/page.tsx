import { prisma } from "@/lib/prisma";
import WeddingEditorClient from "./WeddingEditorClient";

export default async function WeddingEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "new") {
    return <WeddingEditorClient wedding={null} />;
  }

  const weddingId = parseInt(id, 10);
  if (isNaN(weddingId)) {
    return <div className="p-8 text-red-500">ID invalide</div>;
  }

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    include: {
      details: true,
      media: { orderBy: { position: "asc" } },
    },
  });

  if (!wedding) {
    return <div className="p-8 text-red-500">Mariage introuvable</div>;
  }

  return <WeddingEditorClient wedding={wedding} />;
}
