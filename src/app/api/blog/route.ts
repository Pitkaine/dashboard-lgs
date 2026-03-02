import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";

// GET /api/blog
export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(articles);
}

// POST /api/blog
export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, description, language, type, content, thumbnail, banner, statut } = body;

    if (!title) {
      return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
    }

    const article = await prisma.article.create({
      data: {
        title,
        description: description || "",
        language: language as Language,
        type: type || "guide",
        content: content || "",
        contentImg: {},
        thumbnail: thumbnail || "",
        banner: banner || "",
        statut: statut || "0",
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Create article error:", error);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
