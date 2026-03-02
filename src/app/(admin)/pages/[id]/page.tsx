import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PageEditorClient from "./PageEditorClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PageEditorPage({ params }: Props) {
  const { id } = await params;

  // "new" = creating a fresh page
  if (id === "new") {
    return <PageEditorClient page={null} />;
  }

  const pageId = parseInt(id);
  if (isNaN(pageId)) notFound();

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      contents: true,
      seo: true,
    },
  });

  if (!page) notFound();

  return <PageEditorClient page={page} />;
}
