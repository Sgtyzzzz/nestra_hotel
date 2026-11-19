import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: { room: true, promo: true },
      orderBy: { createdAt: "desc" },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const formatted = bookings.map((b, idx) => {
      const ci = new Date(b.checkIn);
      ci.setHours(0, 0, 0, 0);

      const co = new Date(b.checkOut);
      co.setHours(0, 0, 0, 0);

      // Tentukan status aktual berdasarkan tanggal menginap
      let computedStatus: string = b.status;
      if (b.status === "UPCOMING" || b.status === "PENDING") {
        if (co < todayStart) {
          computedStatus = "OVERDUE"; // Lewat tanggal check-out tapi belum diproses keluar
        } else if (ci <= todayStart && co >= todayStart) {
          computedStatus = "CHECKED_IN"; // Sedang dalam masa menginap
        } else {
          computedStatus = "UPCOMING"; // Belum datang (check-in masih di masa depan)
        }
      }

      return {
        id: b.id,
        bookingCode: b.bookingCode,
        guestName: `${b.guestFirstName} ${
          b.guestLastName === "-" ? "" : b.guestLastName
        }`.trim(),
        guestEmail: b.guestEmail,
        guestPhone: b.guestPhone,
        arrivalTime: b.arrivalTime || "14.00–15.00 WIB",
        specialRequest: b.specialRequest || "-",
        roomId: b.roomId,
        roomName: b.room.name,
        roomNumber:
          b.status === "CANCELLED"
            ? "—"
            : `${101 + ((idx + b.nights) % 4) * 100 + (idx % 9) + 1}`,
        checkIn: b.checkIn.toISOString().slice(0, 10),
        checkOut: b.checkOut.toISOString().slice(0, 10),
        nights: b.nights,
        adults: b.adults,
        roomSubtotal: b.roomSubtotal,
        discountAmount: b.discountAmount,
        taxAmount: b.taxAmount,
        totalAmount: b.totalAmount,
        status: computedStatus,
        rawStatus: b.status,
        paymentStatus: b.paymentStatus,
        paymentMethod: b.paymentMethod || "Belum dipilih",
        createdAt: b.createdAt.toISOString(),
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Admin Bookings GET Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar reservasi" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      guestName,
      guestEmail,
      guestPhone,
      roomId,
      checkIn,
      checkOut,
      adults = 2,
      paymentStatus = "PENDING",
      paymentMethod = "Resepsionis / Tunai",
    } = body;

    if (!guestName || !guestEmail || !roomId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Data tamu, kamar, dan tanggal wajib diisi" },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json(
        { error: "Tipe kamar tidak ditemukan" },
        { status: 404 }
      );
    }

    const parts = String(guestName).trim().split(/\s+/);
    const guestFirstName = parts[0] || "Tamu";
    const guestLastName = parts.slice(1).join(" ") || "-";

    const ciDate = new Date(checkIn);
    const coDate = new Date(checkOut);
    const nights = Math.max(
      1,
      Math.ceil(
        Math.abs(coDate.getTime() - ciDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    const roomSubtotal = room.basePrice * nights;
    const taxAmount = Math.round(roomSubtotal * 0.11);
    const totalAmount = roomSubtotal + taxAmount;

    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `NST-${datePart}-${randomPart}`;

    const created = await prisma.booking.create({
      data: {
        bookingCode,
        roomId: room.id,
        guestFirstName,
        guestLastName,
        guestEmail: String(guestEmail).trim().toLowerCase(),
        guestPhone: guestPhone || "-",
        checkIn: ciDate,
        checkOut: coDate,
        nights,
        adults: Number(adults),
        roomSubtotal,
        discountAmount: 0,
        taxAmount,
        totalAmount,
        status: "UPCOMING",
        paymentStatus: paymentStatus === "PAID" ? "PAID" : "PENDING",
        paymentMethod: paymentStatus === "PAID" ? paymentMethod : null,
        paidAt: paymentStatus === "PAID" ? new Date() : null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Admin Bookings POST Error:", error);
    return NextResponse.json(
      { error: "Gagal menambah reservasi baru" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { bookingCode, status, paymentStatus, paymentMethod } = body;

    if (!bookingCode) {
      return NextResponse.json(
        { error: "Kode booking wajib diisi" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === "PAID") {
        updateData.paidAt = new Date();
        updateData.paymentMethod = paymentMethod || "Resepsionis / Tunai";
      }
    }

    const updated = await prisma.booking.update({
      where: { bookingCode },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin Bookings PATCH Error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui reservasi" },
      { status: 500 }
    );
  }
}