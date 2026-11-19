import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    // 1. Hitung total kapasitas unit kamar di hotel
    const rooms = await prisma.room.findMany({
      select: { id: true, name: true, totalUnits: true, basePrice: true },
    });
    const totalRooms =
      rooms.reduce((sum, r) => sum + (r.totalUnits || 5), 0) || 60;

    // 2. Ambil semua booking aktif (bukan CANCELLED)
    const allBookings = await prisma.booking.findMany({
      where: { status: { not: "CANCELLED" } },
      include: { room: true },
      orderBy: { checkIn: "asc" },
    });

    // Kamar terisi malam ini (checkIn <= hari ini < checkOut)
    const activeTonight = allBookings.filter((b) => {
      const ci = startOfDay(new Date(b.checkIn));
      const co = startOfDay(new Date(b.checkOut));
      return ci <= dayStart && co > dayStart;
    });

    const occupiedRooms = activeTonight.length;
    const occupancyRate = Math.min(
      100,
      Math.round((occupiedRooms / totalRooms) * 100)
    );

    // Hitung okupansi kemarin untuk perbandingan
    const yesterdayStart = new Date(dayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const occupiedYesterday = allBookings.filter((b) => {
      const ci = startOfDay(new Date(b.checkIn));
      const co = startOfDay(new Date(b.checkOut));
      return ci <= yesterdayStart && co > yesterdayStart;
    }).length;
    const yesterdayRate = Math.min(
      100,
      Math.round((occupiedYesterday / totalRooms) * 100)
    );
    const occupancyDiff = occupancyRate - yesterdayRate;

    // Pendapatan kamar hari ini (sebelum pajak)
    const todayRevenue = activeTonight.reduce(
      (sum, b) => sum + Math.round((b.roomSubtotal - b.discountAmount) / Math.max(1, b.nights)),
      0
    );

    // 3. Kedatangan hari ini (checkIn pada targetDate)
    const arrivals = allBookings
      .filter((b) => {
        const ci = startOfDay(new Date(b.checkIn));
        return ci.getTime() === dayStart.getTime();
      })
      .map((b, idx) => ({
        id: b.id,
        bookingCode: b.bookingCode,
        guestName: `${b.guestFirstName} ${
          b.guestLastName === "-" ? "" : b.guestLastName
        }`.trim(),
        roomName: b.room.name,
        roomNumber: `${101 + ((idx + b.nights) % 4) * 100 + (idx + 1)}`,
        arrivalTime: b.arrivalTime?.split("–")[0]?.trim() || "14.00",
        paymentStatus: b.paymentStatus,
        status: b.status,
        totalAmount: b.totalAmount,
      }));

    // 4. Keberangkatan hari ini (checkOut pada targetDate)
    const departures = allBookings
      .filter((b) => {
        const co = startOfDay(new Date(b.checkOut));
        return co.getTime() === dayStart.getTime();
      })
      .map((b, idx) => ({
        id: b.id,
        bookingCode: b.bookingCode,
        guestName: `${b.guestFirstName} ${
          b.guestLastName === "-" ? "" : b.guestLastName
        }`.trim(),
        roomName: b.room.name,
        roomNumber: `${201 + (idx % 3) * 100 + (idx + 2)}`,
        departureTime: "12.00",
        paymentStatus: b.paymentStatus,
        status: b.status,
        unpaidBalance: b.paymentStatus === "PAID" ? 0 : b.totalAmount,
      }));

    // 5. Data 7 hari terakhir (Okupansi & Pendapatan)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(dayStart);
      d.setDate(d.getDate() - i);

      const dayActive = allBookings.filter((b) => {
        const ci = startOfDay(new Date(b.checkIn));
        const co = startOfDay(new Date(b.checkOut));
        return ci <= d && co > d;
      });

      const rate = Math.min(
        100,
        Math.round((dayActive.length / totalRooms) * 100)
      );
      const rev = dayActive.reduce(
        (sum, b) =>
          sum +
          Math.round((b.roomSubtotal - b.discountAmount) / Math.max(1, b.nights)),
        0
      );

      last7Days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        }),
        occupancyRate: rate,
        revenue: rev,
      });
    }

    const avgOccupancy7d = Math.round(
      last7Days.reduce((sum, item) => sum + item.occupancyRate, 0) / 7
    );

    return NextResponse.json({
      date: dayStart.toISOString().slice(0, 10),
      kpi: {
        occupancyRate,
        occupiedRooms,
        totalRooms,
        occupancyDiff,
        todayRevenue,
        arrivalsTotal: arrivals.length,
        arrivalsCheckedIn: arrivals.filter((a) => a.status === "COMPLETED")
          .length,
        departuresTotal: departures.length,
        departuresCheckedOut: departures.filter((d) => d.status === "COMPLETED")
          .length,
      },
      last7Days,
      avgOccupancy7d,
      arrivals,
      departures,
    });
  } catch (error) {
    console.error("Admin Overview Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat ringkasan hotel" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { bookingCode, action } = body;

    if (!bookingCode) {
      return NextResponse.json(
        { error: "Kode booking wajib diisi" },
        { status: 400 }
      );
    }

    if (action === "MARK_PAID") {
      const updated = await prisma.booking.update({
        where: { bookingCode },
        data: {
          paymentStatus: "PAID",
          paymentMethod: "Tunai / Resepsionis",
          paidAt: new Date(),
        },
      });
      return NextResponse.json(updated);
    }

    const updated = await prisma.booking.update({
      where: { bookingCode },
      data: {
        status: "COMPLETED",
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Gagal memperbarui status reservasi" },
      { status: 500 }
    );
  }
}