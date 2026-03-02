import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";

// GET /api/portfolio
export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const weddings = await prisma.wedding.findMany({
    include: {
      details: { select: { language: true, title: true, location: true } },
      media: {
        where: { isCover: true },
        take: 1,
        select: { url: true, type: true, thumbnail: true },
      },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(weddings);
}

// POST /api/portfolio
export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { slug, date, status, details, media } = body;

    if (!slug) {
      return NextResponse.json(
        { error: "Le slug est requis" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await prisma.wedding.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Ce slug existe déjà" },
        { status: 400 }
      );
    }

    // Build detail creates
    const detailCreates = [];
    if (details?.fr?.title) {
      detailCreates.push({
        language: Language.fr,
        title: details.fr.title,
        location: details.fr.location || "",
        venue: details.fr.venue || null,
        description: details.fr.description || "",
        body: details.fr.body || undefined,
      });
    }
    if (details?.en?.title) {
      detailCreates.push({
        language: Language.en,
        title: details.en.title,
        location: details.en.location || "",
        venue: details.en.venue || null,
        description: details.en.description || "",
        body: details.en.body || undefined,
      });
    }

    // Build media creates
    const mediaCreates = (media || []).map(
      (m: {
        type: string;
        url: string;
        thumbnail?: string;
        caption?: string;
        position: number;
        isCover: boolean;
      }) => ({
        type: m.type as "PHOTO" | "VIDEO" | "YOUTUBE",
        url: m.url,
        thumbnail: m.thumbnail || null,
        caption: m.caption || null,
        position: m.position,
        isCover: m.isCover,
      })
    );

    const wedding = await prisma.wedding.create({
      data: {
        slug,
        date: new Date(date),
        status: status || "DRAFT",
        details: { create: detailCreates },
        media: { create: mediaCreates },
      },
      include: {
        details: true,
        media: { orderBy: { position: "asc" } },
      },
    });

    return NextResponse.json(wedding, { status: 201 });
  } catch (error) {
    console.error("Create wedding error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}
