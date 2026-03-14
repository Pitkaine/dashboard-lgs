import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";

// PUT /api/faq/[id] — update a FAQ item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    const numId = parseInt(id);
    if (isNaN(numId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const body = await request.json();
    const { status, fr, en } = body;

    // Update FAQ item status
    await prisma.faqItem.update({
      where: { id: numId },
      data: { status: status || "PUBLISHED" },
    });

    // Upsert FR content
    if (fr?.question?.trim()) {
      await prisma.faqContent.upsert({
        where: {
          faqItemId_language: { faqItemId: numId, language: Language.fr },
        },
        update: {
          question: fr.question.trim(),
          answer: (fr.answer || "").trim(),
        },
        create: {
          faqItemId: numId,
          language: Language.fr,
          question: fr.question.trim(),
          answer: (fr.answer || "").trim(),
        },
      });
    }

    // Upsert EN content
    if (en?.question?.trim()) {
      await prisma.faqContent.upsert({
        where: {
          faqItemId_language: { faqItemId: numId, language: Language.en },
        },
        update: {
          question: en.question.trim(),
          answer: (en.answer || "").trim(),
        },
        create: {
          faqItemId: numId,
          language: Language.en,
          question: en.question.trim(),
          answer: (en.answer || "").trim(),
        },
      });
    } else {
      // Remove EN content if empty
      await prisma.faqContent.deleteMany({
        where: { faqItemId: numId, language: Language.en },
      });
    }

    // Return updated item
    const updated = await prisma.faqItem.findUnique({
      where: { id: numId },
      include: { contents: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update FAQ error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// DELETE /api/faq/[id] — delete a FAQ item
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    const numId = parseInt(id);
    if (isNaN(numId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    await prisma.faqItem.delete({ where: { id: numId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete FAQ error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
