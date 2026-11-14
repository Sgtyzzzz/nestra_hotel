import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const room = await prisma.room.findUnique({ where: { slug } });

  if (!room) {
    return NextResponse.json({ error: "Kamar tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json(room);
}