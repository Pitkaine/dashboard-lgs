import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const itemId = parseInt(id);

  try {
    const body = await request.json();
    const { status, contents } = body;

    await prisma.practicalInfo.update({
      where: { id: itemId },
      data: { status: status ?? undefined },
    });

    for (const lang of [Language.fr, Language.en]) {
      const langData = contents?.[lang];
      if (langData?.text) {
        await prisma.practicalInfoContent.upsert({
          where: { practicalInfoId_language: { practicalInfoId: itemId, language: lang } },
          update: { text: langData.text },
          create: { practicalInfoId: itemId, language: lang, text: langData.text },
        });
      }
    }

    const updated = await prisma.practicalInfo.findUnique({
      where: { id: itemId },
      include: { contents: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update practical info error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;

  try {
    await prisma.practicalInfo.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete practical info error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
