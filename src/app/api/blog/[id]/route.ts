import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/blog/[id]
export async function GET(request: NextRequest, { params }: Params) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const articleId = parseInt(id);
  if (isNaN(articleId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
  });

  if (!article) {
    return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
  }

  return NextResponse.json(article);
}

// PUT /api/blog/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const articleId = parseInt(id);
  if (isNaN(articleId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, description, language, type, content, thumbnail, banner, statut } = body;

    const article = await prisma.article.update({
      where: { id: articleId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(language !== undefined && { language: language as Language }),
        ...(type !== undefined && { type }),
        ...(content !== undefined && { content }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(banner !== undefined && { banner }),
        ...(statut !== undefined && { statut }),
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("Update article error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// DELETE /api/blog/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const articleId = parseInt(id);
  if (isNaN(articleId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    await prisma.article.delete({ where: { id: articleId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
