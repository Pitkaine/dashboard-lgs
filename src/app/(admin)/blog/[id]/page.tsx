import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ArticleEditorClient from "./ArticleEditorClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ArticleEditorPage({ params }: Props) {
  const { id } = await params;

  if (id === "new") {
    return <ArticleEditorClient article={null} />;
  }

  const articleId = parseInt(id);
  if (isNaN(articleId)) notFound();

  const article = await prisma.article.findUnique({
    where: { id: articleId },
  });

  if (!article) notFound();

  return <ArticleEditorClient article={article} />;
}
