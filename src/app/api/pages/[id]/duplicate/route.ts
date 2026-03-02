import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/pages/[id]/duplicate
export async function POST(request: NextRequest, { params }: Params) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const pageId = parseInt(id);
  if (isNaN(pageId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const original = await prisma.page.findUnique({
      where: { id: pageId },
      include: { contents: true, seo: true },
    });

    if (!original) {
      return NextResponse.json({ error: "Page non trouvée" }, { status: 404 });
    }

    let newSlug = `${original.slug}-copie`;
    let counter = 1;
    while (await prisma.page.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${original.slug}-copie-${counter}`;
      counter++;
    }

    const duplicate = await prisma.page.create({
      data: {
        type: original.type,
        slug: newSlug,
        status: "DRAFT",
        contents: {
          create: original.contents.map((c) => ({
            language: c.language,
            title: `${c.title} (copie)`,
            body: c.body || {},
          })),
        },
        seo: {
          create: original.seo.map((s) => ({
            language: s.language,
            metaTitle: s.metaTitle,
            metaDescription: s.metaDescription,
            ogImage: s.ogImage,
          })),
        },
      },
    });

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    console.error("Duplicate page error:", error);
    return NextResponse.json({ error: "Erreur lors de la duplication" }, { status: 500 });
  }
}
