import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH — toggle read status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const message = await prisma.contactMessage.update({
    where: { id: parseInt(id) },
    data: { isRead: body.isRead },
  });

  return NextResponse.json(message);
}

// DELETE — remove message
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.contactMessage.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ success: true });
}
