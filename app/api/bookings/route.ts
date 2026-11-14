import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || "aditya.pratama@email.id";

  const bookings = await prisma.booking.findMany({
    where: { guestEmail: email },
    include: { room: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const room = await prisma.room.findUnique({
      where: { slug: body.roomSlug },
    });

    if (!room) {
      return NextResponse.json({ error: "Tipe kamar tidak ditemukan" }, { status: 404 });
    }

    const roomSubtotal = room.basePrice * body.nights;
    let discountAmount = 0;
    let promoId: string | null = null;

    if (body.promoCode) {
      const promo = await prisma.promo.findUnique({
        where: { code: body.promoCode.toUpperCase() },
      });
      if (promo && promo.isActive && body.nights >= promo.minNights) {
        discountAmount = Math.round((roomSubtotal * promo.discountPercent) / 100);
        promoId = promo.id;
      }
    }

    const afterDiscount = roomSubtotal - discountAmount;
    const taxAmount = Math.round(afterDiscount * 0.11);
    const totalAmount = afterDiscount + taxAmount;

    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `NST-${datePart}-${randomPart}`;

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        roomId: room.id,
        promoId,
        guestFirstName: body.guestFirstName,
        guestLastName: body.guestLastName,
        guestEmail: body.guestEmail,
        guestPhone: body.guestPhone,
        arrivalTime: body.arrivalTime,
        specialRequest: body.specialRequest,
        checkIn: new Date(body.checkIn),
        checkOut: new Date(body.checkOut),
        nights: body.nights,
        adults: body.adults || 2,
        roomSubtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        status: "UPCOMING",
        paymentStatus: "PAID",
        paymentMethod: body.paymentMethod,
        paymentRef: `PAY-${datePart}-${randomPart}`,
        paidAt: new Date(),
      },
      include: { room: true, promo: true },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memproses reservasi" }, { status: 500 });
  }
}