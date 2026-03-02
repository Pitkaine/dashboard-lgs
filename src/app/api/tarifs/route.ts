import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";

// GET /api/tarifs
export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const plans = await prisma.pricingPlan.findMany({
    include: {
      contents: true,
      features: { orderBy: { position: "asc" } },
    },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(plans);
}

// POST /api/tarifs
export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { slug, price, status, isPopular, contents, features } = body;

    if (!slug) {
      return NextResponse.json(
        { error: "Le slug est requis" },
        { status: 400 }
      );
    }

    const existing = await prisma.pricingPlan.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Ce slug existe déjà" },
        { status: 400 }
      );
    }

    // Get max position
    const maxPos = await prisma.pricingPlan.aggregate({
      _max: { position: true },
    });
    const nextPosition = (maxPos._max.position ?? -1) + 1;

    // Build content creates
    const contentCreates = [];
    if (contents?.fr?.name) {
      contentCreates.push({
        language: Language.fr,
        name: contents.fr.name,
        subtitle: contents.fr.subtitle || null,
        description: contents.fr.description || null,
      });
    }
    if (contents?.en?.name) {
      contentCreates.push({
        language: Language.en,
        name: contents.en.name,
        subtitle: contents.en.subtitle || null,
        description: contents.en.description || null,
      });
    }

    // Build feature creates
    const featureCreates: {
      language: Language;
      text: string;
      included: boolean;
      position: number;
    }[] = [];

    for (const lang of [Language.fr, Language.en]) {
      const langKey = lang as string;
      const langFeatures = features?.[langKey] || [];
      langFeatures.forEach(
        (f: { text: string; included: boolean; position: number }) => {
          if (f.text) {
            featureCreates.push({
              language: lang,
              text: f.text,
              included: f.included,
              position: f.position,
            });
          }
        }
      );
    }

    const plan = await prisma.pricingPlan.create({
      data: {
        slug,
        price: price || "",
        status: status || "DRAFT",
        isPopular: isPopular || false,
        position: nextPosition,
        contents: { create: contentCreates },
        features: { create: featureCreates },
      },
      include: { contents: true, features: true },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("Create plan error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}
