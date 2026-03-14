import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/faq/reorder — reorder FAQ items
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

    // Use transaction to update all positions atomically
    await prisma.$transaction(
      order.map((item: { id: number; position: number }) =>
        prisma.faqItem.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder FAQ error:", error);
    return NextResponse.json(
      { error: "Erreur lors du réordonnancement" },
      { status: 500 }
    );
  }
}
