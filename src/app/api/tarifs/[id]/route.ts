import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";

// GET /api/tarifs/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const planId = parseInt(id, 10);
  if (isNaN(planId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const plan = await prisma.pricingPlan.findUnique({
    where: { id: planId },
    include: {
      contents: true,
      features: { orderBy: { position: "asc" } },
    },
  });

  if (!plan) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  return NextResponse.json(plan);
}

// PUT /api/tarifs/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const planId = parseInt(id, 10);
  if (isNaN(planId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { slug, price, status, isPopular, contents, features } = body;

    // Check slug uniqueness
    if (slug) {
      const existing = await prisma.pricingPlan.findFirst({
        where: { slug, NOT: { id: planId } },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Ce slug existe déjà" },
          { status: 400 }
        );
      }
    }

    // Update plan base fields
    await prisma.pricingPlan.update({
      where: { id: planId },
      data: {
        slug: slug || undefined,
        price: price !== undefined ? price : undefined,
        status: status || undefined,
        isPopular: isPopular !== undefined ? isPopular : undefined,
      },
    });

    // Upsert contents
    for (const lang of [Language.fr, Language.en]) {
      const langKey = lang as string;
      const content = contents?.[langKey];
      if (content?.name) {
        await prisma.pricingContent.upsert({
          where: { planId_language: { planId, language: lang } },
          update: {
            name: content.name,
            subtitle: content.subtitle || null,
            description: content.description || null,
          },
          create: {
            planId,
            language: lang,
            name: content.name,
            subtitle: content.subtitle || null,
            description: content.description || null,
          },
        });
      }
    }

    // Sync features: delete all existing, recreate
    if (features) {
      await prisma.pricingFeature.deleteMany({ where: { planId } });

      const featureCreates: {
        planId: number;
        language: Language;
        text: string;
        included: boolean;
        position: number;
      }[] = [];

      for (const lang of [Language.fr, Language.en]) {
        const langKey = lang as string;
        const langFeatures = features[langKey] || [];
        langFeatures.forEach(
          (f: { text: string; included: boolean; position: number }) => {
            if (f.text) {
              featureCreates.push({
                planId,
                language: lang,
                text: f.text,
                included: f.included,
                position: f.position,
              });
            }
          }
        );
      }

      if (featureCreates.length > 0) {
        await prisma.pricingFeature.createMany({ data: featureCreates });
      }
    }

    const updated = await prisma.pricingPlan.findUnique({
      where: { id: planId },
      include: {
        contents: true,
        features: { orderBy: { position: "asc" } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update plan error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// DELETE /api/tarifs/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const planId = parseInt(id, 10);
  if (isNaN(planId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    await prisma.pricingPlan.delete({ where: { id: planId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete plan error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
