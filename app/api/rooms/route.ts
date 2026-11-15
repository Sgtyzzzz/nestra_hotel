import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const maxPrice = searchParams.get("maxPrice");

  const rooms = await prisma.room.findMany({
    where: {
      ...(category && category !== "ALL" ? { category } : {}),
      ...(maxPrice ? { basePrice: { lte: Number(maxPrice) } } : {}),
    },
    include: {
      bookings: {
        where: { status: "UPCOMING" },
        select: { id: true },
      },
    },
    orderBy: { basePrice: "asc" },
  });

  const roomsWithStatus = rooms.map((room) => {
    const totalQuota = 3; // Kuota maksimal per tipe kamar
    const remainingRooms = Math.max(0, totalQuota - room.bookings.length);

    return {
      ...room,
      remainingRooms,
      isFull: remainingRooms === 0,
    };
  });

  return NextResponse.json(roomsWithStatus);
}