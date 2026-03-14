import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/reviews/reorder
export async function PUT(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs requis" }, { status: 400 });
    }

    // Transactional update
    await prisma.$transaction(
      ids.map((id: number, index: number) =>
        prisma.review.update({
          where: { id },
          data: { position: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder reviews error:", error);
    return NextResponse.json({ error: "Erreur lors du reorder" }, { status: 500 });
  }
}
