import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";

// GET /api/options/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const option = await prisma.pricingOption.findUnique({
    where: { id: parseInt(id) },
    include: { contents: true },
  });

  if (!option) {
    return NextResponse.json({ error: "Option introuvable" }, { status: 404 });
  }

  return NextResponse.json(option);
}

// PUT /api/options/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const optionId = parseInt(id);

  try {
    const body = await request.json();
    const { price, status, contents } = body;

    // Update main option
    await prisma.pricingOption.update({
      where: { id: optionId },
      data: {
        price: price ?? undefined,
        status: status ?? undefined,
      },
    });

    // Upsert contents
    for (const lang of [Language.fr, Language.en]) {
      const langData = contents?.[lang];
      if (langData?.name) {
        await prisma.pricingOptionContent.upsert({
          where: { optionId_language: { optionId, language: lang } },
          update: {
            name: langData.name,
            description: langData.description || "",
          },
          create: {
            optionId,
            language: lang,
            name: langData.name,
            description: langData.description || "",
          },
        });
      }
    }

    const updated = await prisma.pricingOption.findUnique({
      where: { id: optionId },
      include: { contents: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update option error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// DELETE /api/options/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;

  try {
    await prisma.pricingOption.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete option error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
