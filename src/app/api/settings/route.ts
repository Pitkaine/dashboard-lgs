import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";

// GET /api/settings
export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  const settings = await prisma.siteSetting.findMany();
  return NextResponse.json(settings);
}

// PUT /api/settings — bulk update
export async function PUT(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Format invalide" },
        { status: 400 }
      );
    }

    // Upsert each setting
    const updates = Object.entries(settings as Record<string, string>).map(
      ([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, group: inferGroup(key) },
        })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

function inferGroup(key: string): string {
  if (key.startsWith("hero_") || key.startsWith("footer_badge_")) return "appearance";
  if (key.startsWith("contact_")) return "contact";
  if (key.includes("_url") || key.includes("social")) return "social";
  if (key.startsWith("ga_") || key.startsWith("gsc_") || key.includes("seo"))
    return "seo";
  return "general";
}
