import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const booking = await prisma.booking.findUnique({
      where: { bookingCode: code },
      include: { room: true, promo: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Nomor reservasi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil detail reservasi" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const updated = await prisma.booking.update({
      where: { bookingCode: code },
      data: {
        status: "CANCELLED",
        paymentStatus: "REFUNDED",
      },
      include: { room: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membatalkan reservasi" },
      { status: 500 }
    );
  }
}