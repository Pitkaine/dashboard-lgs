import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";

// GET /api/pages
export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const pages = await prisma.page.findMany({
    include: {
      contents: { select: { language: true, title: true } },
      seo: { select: { language: true, metaTitle: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(pages);
}

// POST /api/pages
export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { type, slug, status, contents, seo } = body;

    if (!slug) {
      return NextResponse.json({ error: "Le slug est requis" }, { status: 400 });
    }

    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Ce slug existe déjà" }, { status: 400 });
    }

    // Build content creates
    const contentCreates = [];
    if (contents?.fr?.title) {
      contentCreates.push({
        language: Language.fr,
        title: contents.fr.title,
        body: contents.fr.body || {},
      });
    }
    if (contents?.en?.title) {
      contentCreates.push({
        language: Language.en,
        title: contents.en.title,
        body: contents.en.body || {},
      });
    }

    const page = await prisma.page.create({
      data: {
        type: type || "SERVICE",
        slug,
        status: status || "DRAFT",
        contents: { create: contentCreates },
        seo: {
          create: [
            {
              language: Language.fr,
              metaTitle: seo?.fr?.metaTitle || "",
              metaDescription: seo?.fr?.metaDescription || "",
              ogImage: seo?.fr?.ogImage || null,
            },
            {
              language: Language.en,
              metaTitle: seo?.en?.metaTitle || "",
              metaDescription: seo?.en?.metaDescription || "",
              ogImage: seo?.en?.ogImage || null,
            },
          ],
        },
      },
      include: { contents: true, seo: true },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Create page error:", error);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
