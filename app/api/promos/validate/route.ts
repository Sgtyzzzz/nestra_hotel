import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { code, nights = 1 } = await request.json();

  const promo = await prisma.promo.findUnique({
    where: { code: String(code).toUpperCase() },
  });

  if (!promo || !promo.isActive || promo.validUntil < new Date()) {
    return NextResponse.json(
      { error: "Kode promo tidak valid atau sudah kedaluwarsa" },
      { status: 400 }
    );
  }

  if (nights < promo.minNights) {
    return NextResponse.json(
      { error: `Kode promo ini minimal untuk ${promo.minNights} malam` },
      { status: 400 }
    );
  }

  return NextResponse.json(promo);
}