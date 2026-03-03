import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";

// GET /api/team
export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const members = await prisma.team.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(members);
}

// POST /api/team
export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, job, job2, img } = body;

    if (!name || !job) {
      return NextResponse.json(
        { error: "Nom et métier requis" },
        { status: 400 }
      );
    }

    const member = await prisma.team.create({
      data: { name, job, job2: job2 || "", img: img || "" },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Create team error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}
