import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";

// GET /api/reviews
export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const reviews = await prisma.review.findMany({ orderBy: { position: "asc" } });
  return NextResponse.json(reviews);
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, note, picture, review, source, status } = body;

    if (!name || !review) {
      return NextResponse.json({ error: "Nom et avis requis" }, { status: 400 });
    }

    // Position = after last
    const lastReview = await prisma.review.findFirst({
      orderBy: { position: "desc" },
      select: { position: true },
    });
    const position = (lastReview?.position ?? -1) + 1;

    const created = await prisma.review.create({
      data: {
        name,
        note: Math.min(5, Math.max(1, note || 5)),
        picture: picture || null,
        review,
        source: source || "google",
        status: status || "PUBLISHED",
        position,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Erreur lors de la creation" }, { status: 500 });
  }
}

// PUT /api/reviews?id=X
export async function PUT(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const id = Number(request.nextUrl.searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    const body = await request.json();
    const { name, note, picture, review, source, status } = body;

    if (!name || !review) {
      return NextResponse.json({ error: "Nom et avis requis" }, { status: 400 });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        name,
        note: Math.min(5, Math.max(1, note || 5)),
        picture: picture || null,
        review,
        source: source || "google",
        status: status || "PUBLISHED",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 });
  }
}

// DELETE /api/reviews?id=X
export async function DELETE(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const id = Number(request.nextUrl.searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
