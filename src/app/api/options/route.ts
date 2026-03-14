import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";

// GET /api/options
export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const options = await prisma.pricingOption.findMany({
    include: {
      contents: true,
    },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(options);
}

// POST /api/options
export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { price, status, contents } = body;

    // Get max position
    const maxPos = await prisma.pricingOption.aggregate({
      _max: { position: true },
    });
    const nextPosition = (maxPos._max.position ?? -1) + 1;

    const contentCreates = [];
    if (contents?.fr?.name) {
      contentCreates.push({
        language: Language.fr,
        name: contents.fr.name,
        description: contents.fr.description || "",
      });
    }
    if (contents?.en?.name) {
      contentCreates.push({
        language: Language.en,
        name: contents.en.name,
        description: contents.en.description || "",
      });
    }

    const option = await prisma.pricingOption.create({
      data: {
        price: price || null,
        status: status || "PUBLISHED",
        position: nextPosition,
        contents: { create: contentCreates },
      },
      include: { contents: true },
    });

    return NextResponse.json(option, { status: 201 });
  } catch (error) {
    console.error("Create option error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}
