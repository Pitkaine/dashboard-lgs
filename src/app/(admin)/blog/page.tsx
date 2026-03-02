import { prisma } from "@/lib/prisma";
import BlogClient from "./BlogClient";

export default async function BlogPage() {
  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return <BlogClient articles={articles} />;
}
