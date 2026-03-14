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
    const { name, job, job2, img, imgPosition } = body;

    if (!name || !job) {
      return NextResponse.json(
        { error: "Nom et m\u00e9tier requis" },
        { status: 400 }
      );
    }

    const member = await prisma.team.create({
      data: {
        name,
        job,
        job2: job2 || "",
        img: img || "",
        imgPosition: imgPosition || "center",
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Create team error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la cr\u00e9ation" },
      { status: 500 }
    );
  }
}
