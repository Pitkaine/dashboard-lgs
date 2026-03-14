import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const items = await prisma.practicalInfo.findMany({
    include: { contents: true },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { status, contents } = body;

    const maxPos = await prisma.practicalInfo.aggregate({
      _max: { position: true },
    });
    const nextPosition = (maxPos._max.position ?? -1) + 1;

    const contentCreates = [];
    if (contents?.fr?.text) {
      contentCreates.push({ language: Language.fr, text: contents.fr.text });
    }
    if (contents?.en?.text) {
      contentCreates.push({ language: Language.en, text: contents.en.text });
    }

    const item = await prisma.practicalInfo.create({
      data: {
        status: status || "PUBLISHED",
        position: nextPosition,
        contents: { create: contentCreates },
      },
      include: { contents: true },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Create practical info error:", error);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
