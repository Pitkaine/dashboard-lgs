import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { order } = await request.json();

    await prisma.$transaction(
      order.map((item: { id: number; position: number }) =>
        prisma.practicalInfo.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder practical info error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
