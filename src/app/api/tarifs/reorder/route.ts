import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/tarifs/reorder
export async function PUT(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { order } = body;

    if (!Array.isArray(order)) {
      return NextResponse.json(
        { error: "Format invalide" },
        { status: 400 }
      );
    }

    // Update positions in a transaction
    await prisma.$transaction(
      order.map(({ id, position }: { id: number; position: number }) =>
        prisma.pricingPlan.update({
          where: { id },
          data: { position },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder error:", error);
    return NextResponse.json(
      { error: "Erreur lors du réordonnancement" },
      { status: 500 }
    );
  }
}
