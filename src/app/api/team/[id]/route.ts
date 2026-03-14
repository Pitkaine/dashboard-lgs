import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/team/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const memberId = parseInt(id, 10);
  if (isNaN(memberId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, job, job2, img, imgPosition } = body;

    const member = await prisma.team.update({
      where: { id: memberId },
      data: {
        name: name || undefined,
        job: job || undefined,
        job2: job2 !== undefined ? job2 : undefined,
        img: img !== undefined ? img : undefined,
        imgPosition: imgPosition !== undefined ? imgPosition : undefined,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Update team error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise \u00e0 jour" },
      { status: 500 }
    );
  }
}

// DELETE /api/team/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const memberId = parseInt(id, 10);
  if (isNaN(memberId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    await prisma.team.delete({ where: { id: memberId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete team error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
