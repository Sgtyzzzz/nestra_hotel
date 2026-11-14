import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const promos = await prisma.promo.findMany({
    where: { isActive: true },
  });
  return NextResponse.json(promos);
}