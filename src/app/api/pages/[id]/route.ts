import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/pages/[id]
export async function GET(request: NextRequest, { params }: Params) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const pageId = parseInt(id);
  if (isNaN(pageId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { contents: true, seo: true },
  });

  if (!page) {
    return NextResponse.json({ error: "Page non trouvée" }, { status: 404 });
  }

  return NextResponse.json(page);
}

// PUT /api/pages/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const pageId = parseInt(id);
  if (isNaN(pageId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { type, slug, status, contents, seo } = body;

    if (slug) {
      const existing = await prisma.page.findFirst({
        where: { slug, id: { not: pageId } },
      });
      if (existing) {
        return NextResponse.json({ error: "Ce slug existe déjà" }, { status: 400 });
      }
    }

    await prisma.page.update({
      where: { id: pageId },
      data: {
        ...(type && { type }),
        ...(slug && { slug }),
        ...(status && { status }),
      },
    });

    // Upsert contents
    for (const lang of [Language.fr, Language.en]) {
      const key = lang as string;
      if (contents?.[key]) {
        await prisma.pageContent.upsert({
          where: { pageId_language: { pageId, language: lang } },
          update: {
            title: contents[key].title,
            body: contents[key].body || {},
          },
          create: {
            pageId,
            language: lang,
            title: contents[key].title || "",
            body: contents[key].body || {},
          },
        });
      }
    }

    // Upsert SEO
    for (const lang of [Language.fr, Language.en]) {
      const key = lang as string;
      if (seo?.[key]) {
        await prisma.pageSeo.upsert({
          where: { pageId_language: { pageId, language: lang } },
          update: {
            metaTitle: seo[key].metaTitle || "",
            metaDescription: seo[key].metaDescription || "",
            ogImage: seo[key].ogImage || null,
          },
          create: {
            pageId,
            language: lang,
            metaTitle: seo[key].metaTitle || "",
            metaDescription: seo[key].metaDescription || "",
            ogImage: seo[key].ogImage || null,
          },
        });
      }
    }

    const updated = await prisma.page.findUnique({
      where: { id: pageId },
      include: { contents: true, seo: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update page error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// DELETE /api/pages/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const pageId = parseInt(id);
  if (isNaN(pageId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    await prisma.page.delete({ where: { id: pageId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
