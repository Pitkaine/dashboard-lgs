import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";

// GET /api/portfolio/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const weddingId = parseInt(id, 10);
  if (isNaN(weddingId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    include: {
      details: true,
      media: { orderBy: { position: "asc" } },
    },
  });

  if (!wedding) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  return NextResponse.json(wedding);
}

// PUT /api/portfolio/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const weddingId = parseInt(id, 10);
  if (isNaN(weddingId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { slug, date, status, details, media } = body;

    // Check slug uniqueness (excluding current)
    if (slug) {
      const existing = await prisma.wedding.findFirst({
        where: { slug, NOT: { id: weddingId } },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Ce slug existe déjà" },
          { status: 400 }
        );
      }
    }

    // Update wedding base fields
    await prisma.wedding.update({
      where: { id: weddingId },
      data: {
        slug: slug || undefined,
        date: date ? new Date(date) : undefined,
        status: status || undefined,
      },
    });

    // Upsert details for each language
    for (const lang of [Language.fr, Language.en]) {
      const langKey = lang as string;
      const detail = details?.[langKey];
      if (detail?.title) {
        await prisma.weddingContent.upsert({
          where: { weddingId_language: { weddingId, language: lang } },
          update: {
            title: detail.title,
            location: detail.location || "",
            venue: detail.venue || null,
            description: detail.description || "",
            body: detail.body || undefined,
          },
          create: {
            weddingId,
            language: lang,
            title: detail.title,
            location: detail.location || "",
            venue: detail.venue || null,
            description: detail.description || "",
            body: detail.body || undefined,
          },
        });
      }
    }

    // Sync media: delete all existing, recreate from payload
    // This is simpler than diffing and handles reorder + add + delete in one pass
    if (media) {
      await prisma.weddingMedia.deleteMany({ where: { weddingId } });

      if (media.length > 0) {
        await prisma.weddingMedia.createMany({
          data: media.map(
            (m: {
              type: string;
              url: string;
              thumbnail?: string;
              caption?: string;
              position: number;
              isCover: boolean;
            }) => ({
              weddingId,
              type: m.type as "PHOTO" | "VIDEO" | "YOUTUBE",
              url: m.url,
              thumbnail: m.thumbnail || null,
              caption: m.caption || null,
              position: m.position,
              isCover: m.isCover,
            })
          ),
        });
      }
    }

    // Return updated wedding
    const updated = await prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        details: true,
        media: { orderBy: { position: "asc" } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update wedding error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// DELETE /api/portfolio/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const weddingId = parseInt(id, 10);
  if (isNaN(weddingId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    await prisma.wedding.delete({ where: { id: weddingId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete wedding error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
