import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const booking = await prisma.booking.findUnique({
      where: { bookingCode: code },
      include: { room: true, promo: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Reservasi tidak ditemukan" },
        { status: 404 }
      );
    }

    const roomNumber =
      booking.status === "CANCELLED"
        ? "—"
        : `${101 + (booking.nights % 4) * 100 + (booking.adults % 9) + 1}`;

    return NextResponse.json({
      id: booking.id,
      bookingCode: booking.bookingCode,
      guestName: `${booking.guestFirstName} ${
        booking.guestLastName === "-" ? "" : booking.guestLastName
      }`.trim(),
      guestFirstName: booking.guestFirstName,
      guestLastName: booking.guestLastName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      arrivalTime: booking.arrivalTime || "14.00–15.00 WIB",
      specialRequest: booking.specialRequest || "",
      roomName: booking.room.name,
      roomNumber,
      bedType: booking.room.bedType || "Ranjang besar",
      basePrice: booking.room.basePrice,
      checkIn: booking.checkIn.toISOString(),
      checkOut: booking.checkOut.toISOString(),
      nights: booking.nights,
      adults: booking.adults,
      roomSubtotal: booking.roomSubtotal,
      discountAmount: booking.discountAmount,
      taxAmount: booking.taxAmount,
      totalAmount: booking.totalAmount,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod || "Transfer / Resepsionis",
      paidAt: booking.paidAt ? booking.paidAt.toISOString() : null,
      createdAt: booking.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Detail Booking GET Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat detail reservasi" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const body = await req.json();
    const {
      status,
      paymentStatus,
      paymentMethod,
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone,
      specialRequest,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (guestFirstName !== undefined) updateData.guestFirstName = guestFirstName;
    if (guestLastName !== undefined) updateData.guestLastName = guestLastName;
    if (guestEmail !== undefined) updateData.guestEmail = guestEmail;
    if (guestPhone !== undefined) updateData.guestPhone = guestPhone;
    if (specialRequest !== undefined) updateData.specialRequest = specialRequest;

    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === "PAID") {
        updateData.paidAt = new Date();
        updateData.paymentMethod = paymentMethod || "Resepsionis / Tunai";
      }
    }

    const updated = await prisma.booking.update({
      where: { bookingCode: code },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Detail Booking PATCH Error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data reservasi" },
      { status: 500 }
    );
  }
}