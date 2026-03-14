import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";

// GET /api/faq — list all FAQ items
export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const items = await prisma.faqItem.findMany({
    include: { contents: true },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(items);
}

// POST /api/faq — create new FAQ item
export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { status, fr, en } = body;

    if (!fr?.question?.trim()) {
      return NextResponse.json(
        { error: "La question FR est requise" },
        { status: 400 }
      );
    }

    // Get max position
    const maxPos = await prisma.faqItem.aggregate({
      _max: { position: true },
    });
    const nextPosition = (maxPos._max.position ?? -1) + 1;

    // Build content creates
    const contentCreates = [];
    if (fr?.question) {
      contentCreates.push({
        language: Language.fr,
        question: fr.question.trim(),
        answer: (fr.answer || "").trim(),
      });
    }
    if (en?.question?.trim()) {
      contentCreates.push({
        language: Language.en,
        question: en.question.trim(),
        answer: (en.answer || "").trim(),
      });
    }

    const item = await prisma.faqItem.create({
      data: {
        status: status || "PUBLISHED",
        position: nextPosition,
        contents: { create: contentCreates },
      },
      include: { contents: true },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Create FAQ error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}
