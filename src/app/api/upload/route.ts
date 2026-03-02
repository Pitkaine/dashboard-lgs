import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";

// Upload to the main site's public folder so images are served directly
const UPLOAD_BASE = "/var/www/lesgarssympas/public/uploads";
const MAX_WIDTH = 1200;
const QUALITY = 80;

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const uploadPath = (formData.get("path") as string) || "pages";

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Seules les images sont acceptées" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "L'image ne doit pas dépasser 10 Mo" },
        { status: 400 }
      );
    }

    // Sanitize path to prevent directory traversal
    const safePath = uploadPath.replace(/[^a-zA-Z0-9-_]/g, "");
    const uploadDir = path.join(UPLOAD_BASE, safePath);

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();
    const filename = `${safeName}-${timestamp}.webp`;
    const filepath = path.join(uploadDir, filename);

    // Process image: resize + convert to WebP
    const buffer = Buffer.from(await file.arrayBuffer());
    const image = sharp(buffer);
    const metadata = await image.metadata();

    let processedImage = image;
    if (metadata.width && metadata.width > MAX_WIDTH) {
      processedImage = image.resize(MAX_WIDTH);
    }

    const webpBuffer = await processedImage.webp({ quality: QUALITY }).toBuffer();
    await writeFile(filepath, webpBuffer);

    // Return the URL relative to the main site
    const url = `/uploads/${safePath}/${filename}`;

    return NextResponse.json({
      url,
      filename,
      size: webpBuffer.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
