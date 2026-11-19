import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Inisialisasi otomatis 60 unit kamar (101-320) sesuai desain jika belum ada
async function ensureRoomUnits() {
  const count = await prisma.roomUnit.count();
  if (count > 0) return;

  const units = [];
  for (let floor = 1; floor <= 3; floor++) {
    for (let num = 1; num <= 20; num++) {
      const roomNumber = `${floor}${String(num).padStart(2, "0")}`;
      const category =
        floor === 1 ? "Superior" : floor === 2 ? "Superior & Deluks" : "Deluks";

      let status = "OCCUPIED";
      if (["102", "301", "305"].includes(roomNumber)) status = "READY";
      if (
        ["104", "108", "112", "202", "204", "215", "307", "318"].includes(
          roomNumber
        )
      )
        status = "DIRTY";
      if (roomNumber === "312") status = "MAINTENANCE";

      units.push({ roomNumber, floor, category, status });
    }
  }

  await prisma.roomUnit.createMany({ data: units });
}

export async function GET() {
  try {
    await ensureRoomUnits();

    const [bookings, roomUnits, messages, incidents, roomTypes] =
      await Promise.all([
        prisma.booking.findMany({
          include: { room: true },
          orderBy: { checkIn: "desc" },
        }),
        prisma.roomUnit.findMany({
          orderBy: { roomNumber: "asc" },
        }),
        prisma.contactMessage.findMany({
          orderBy: { createdAt: "desc" },
        }),
        prisma.incidentReport.findMany({
          orderBy: { createdAt: "desc" },
        }),
        prisma.room.findMany({
          orderBy: { basePrice: "asc" },
        }),
      ]);

    return NextResponse.json({
      bookings,
      roomUnits,
      messages,
      incidents,
      roomTypes,
    });
  } catch (error) {
    console.error("Staff API GET error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data operasional karyawan" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Update status booking (Check-in / Check-out / Batalkan)
    if (action === "UPDATE_BOOKING") {
      const updated = await prisma.booking.update({
        where: { id: body.bookingId },
        data: { status: body.status },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    // 2. Simpan reservasi Walk-in dari lobi
    if (action === "CREATE_WALKIN") {
      const {
        guestName,
        guestPhone,
        roomId,
        roomNumber,
        checkIn,
        checkOut,
        specialRequest,
      } = body;

      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) {
        return NextResponse.json(
          { error: "Tipe kamar tidak ditemukan" },
          { status: 404 }
        );
      }

      const dIn = new Date(checkIn);
      const dOut = new Date(checkOut);
      const nights = Math.max(
        1,
        Math.ceil((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24))
      );

      const nameParts = String(guestName || "Tamu Walk-in")
        .trim()
        .split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "-";

      const sub = room.basePrice * nights;
      const tax = Math.round(sub * 0.11);
      const total = sub + tax;
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const bookingCode = `NST-WALK-${randomNum}`;

      const booking = await prisma.booking.create({
        data: {
          bookingCode,
          roomId: room.id,
          guestFirstName: firstName,
          guestLastName: lastName,
          guestEmail: "walkin@nestrahotel.id",
          guestPhone: guestPhone || "-",
          specialRequest: roomNumber
            ? `Unit #${roomNumber}${specialRequest ? ` • ${specialRequest}` : ""}`
            : specialRequest || null,
          checkIn: dIn,
          checkOut: dOut,
          nights,
          roomSubtotal: sub,
          taxAmount: tax,
          totalAmount: total,
          status: "UPCOMING",
          paymentStatus: "PAID",
          paymentMethod: "Tunai / EDC Lobi",
          paidAt: new Date(),
        },
      });

      if (roomNumber) {
        await prisma.roomUnit.updateMany({
          where: { roomNumber },
          data: { status: "OCCUPIED" },
        });
      }

      return NextResponse.json({ success: true, data: booking });
    }

    // 3. Update status kebersihan unit kamar
    if (action === "UPDATE_ROOM_UNIT") {
      const updated = await prisma.roomUnit.update({
        where: { roomNumber: body.roomNumber },
        data: { status: body.status },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    // 4. Tandai pesan tamu sudah dibaca / ditindaklanjuti
    if (action === "UPDATE_MESSAGE") {
      const updated = await prisma.contactMessage.update({
        where: { id: body.messageId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    // 5. Simpan kendala atau Eskalasi ke Manajer
    if (action === "CREATE_INCIDENT") {
      const count = await prisma.incidentReport.count();
      const ticketCode = `KDL-${String(count + 32).padStart(3, "0")}`;

      const created = await prisma.incidentReport.create({
        data: {
          ticketCode,
          title: body.title,
          roomNumber: body.roomNumber || null,
          guestName: body.guestName || null,
          description: body.description,
          priority: body.priority || "NORMAL",
          status: body.escalate ? "ESCALATED" : "OPEN",
          reportedBy: "Dimas Saputra",
        },
      });
      return NextResponse.json({ success: true, data: created });
    }

    // 5b. Manajer (/admin) menyelesaikan kendala yang dieskalasi karyawan
    if (action === "RESOLVE_INCIDENT") {
      const updated = await prisma.incidentReport.update({
        where: { id: body.incidentId },
        data: { status: "RESOLVED" },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    // 6. Simpan pesan / aduan baru dari tamu (/bantuan atau widget)
    if (action === "CREATE_CONTACT") {
      if (!body.fullName || !body.message) {
        return NextResponse.json(
          { error: "Nama dan isi pesan wajib diisi" },
          { status: 400 }
        );
      }

      const created = await prisma.contactMessage.create({
        data: {
          fullName: String(body.fullName).trim(),
          email: body.email
            ? String(body.email).trim()
            : "tamu@nestrahotel.id",
          topic: String(body.topic || "Pesan / Aduan Tamu").trim(),
          bookingCode: body.bookingCode
            ? String(body.bookingCode).trim()
            : null,
          message: String(body.message).trim(),
          isRead: false,
        },
      });
      return NextResponse.json({ success: true, data: created });
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Staff API POST error:", error);
    return NextResponse.json(
      { error: "Gagal memproses aksi karyawan" },
      { status: 500 }
    );
  }
}